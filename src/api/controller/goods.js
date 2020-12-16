const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');
module.exports = class extends Base {
    async indexAction() {
        const model = this.model('goods');
        const goodsList = await model.select();
        return this.success(goodsList);
    }

    /**
     * 商品详情页数据
     * @returns {Promise.<Promise|PreventPromise|void>}
     */
    async detailAction() {
        const goodsId = this.get('id');
        const model = this.model('goods');
        let info = await model.where({
            id: goodsId,
            is_delete: 0
        }).find();
        if (think.isEmpty(info)) {
            return this.fail('该商品不存在或已下架');
        }
        const gallery = await this.model('goods_gallery').where({
            goods_id: goodsId,
            is_delete: 0,
        }).order('sort_order').limit(6).select();
        await this.model('footprint').addFootprint(think.userId, goodsId);
        let productList = await model.getProductList(goodsId);
        let goodsNumber = 0;
        for (const item of productList) {
            if (item.goods_number > 0) {
                goodsNumber = goodsNumber + item.goods_number;
            }
        }
        let specificationList = await model.getSpecificationList(goodsId);
        //评论查分页
        const page = this.get('page') || 1;
        const size = this.get('size') || 1;
        let commentList = await this.model('comment').where({
            //父id为0，该商品的第一级评论
            parent_id: '0',
            goods_id: goodsId,
            is_delete: 0
        }).page(page, size).order('time desc').countSelect();
        commentList.otherCount = await this.model('comment').where({
            //父id为0，该商品的第一级评论
            parent_id: ['!=', '0'],
            goods_id: goodsId,
            is_delete: 0
        }).page(page, size).order('time desc').count('parent_id');
        for (const item of commentList.data) {
            item.time = moment.unix(item.time).format('YYYY-MM-DD HH:mm:ss');
        }
        if (commentList.data.length > 0) {
            for (const item of commentList.data) {
                item.list = await this.model('goods_comment_img').where({
                    cid: item.id,
                    is_delete: 0
                }).select();
                //当前评论的子评论条数
                item.childrenCount = await this.model('comment').where({
                    parent_id: ['like', `%${item.id}%`],
                    goods_id: goodsId,
                    is_delete: 0
                }).count('id');
                //当前评论的点赞数据
                item.thumbsUpInfo = await this.model('thumbs_up_view').where({
                    goods_id: goodsId,
                    com_id: item.id,
                    is_delete: 0
                }).find();
                if (_.includes(item.thumbsUpInfo.publish_user_id, think.userId)) {
                    item.thumbsUpInfo.isUp = true;
                }
            }
        }
        info.goods_number = goodsNumber;
        info.goodsThumbsInfo = await this.model('goods_thumbs_view').where({goods_id:goodsId,is_delete:0}).find();
        if (_.includes(info.goodsThumbsInfo.publish_id, think.userId)) {
            info.goodsThumbsInfo.isUp = true;
        }
        return this.success({
            info: info,
            gallery: gallery,
            specificationList: specificationList,
            commentList: commentList,
            productList: productList
        });
    }

    async goodsShareAction() {
        const goodsId = this.get('id');
        const info = await this.model('goods').where({
            id: goodsId
        }).field('name,retail_price').find();
        return this.success(info);
    }

    /**
     * 获取商品列表
     * @returns {Promise.<*>}
     */
    async listAction() {
        const keyword = this.get('keyword');
        const sort = this.get('sort');
        const order = this.get('order');
        const sales = this.get('sales');
        const model = this.model('goods');
        const whereMap = {
            is_on_sale: 1,
            is_delete: 0,
        };
        if (!think.isEmpty(keyword)) {
            whereMap.name = ['like', `%${keyword}%`];
            // 添加到搜索历史
            await this.model('search_history').add({
                keyword: keyword,
                user_id: think.userId,
                add_time: parseInt(new Date().getTime() / 1000)
            });
            //    TODO 之后要做个判断，这个词在搜索记录中的次数，如果大于某个值，则将他存入keyword
        }
        // 排序
        let orderMap = {};
        if (sort === 'price') {
            // 按价格
            orderMap = {
                retail_price: order
            };
        } else if (sort === 'sales') {
            // 按价格
            orderMap = {
                sell_volume: sales
            };
        } else {
            // 按商品添加时间
            orderMap = {
                sort_order: 'asc'
            };
        }
        const goodsData = await model.where(whereMap).order(orderMap).select();
        return this.success(goodsData);
    }

    /**
     * 在售的商品总数
     * @returns {Promise.<Promise|PreventPromise|void>}
     */
    async countAction() {
        const goodsCount = await this.model('goods').where({
            is_delete: 0,
            is_on_sale: 1
        }).count('id');
        return this.success({
            goodsCount: goodsCount
        });
    }

    /**
     * 添加评论
     * @returns {Promise<void>}
     */
    async addCommentsAction() {
        //昵称
        const niname = this.post('niname') || '';
        //头像
        const avatar = this.post('avatar') || '';
        //当前评论的商品id
        const goodsId = this.post('cardId') || 0;
        //评论人id
        const publishId = this.post('publishId') || 0;
        //被评论人id
        const recipientId = this.post('recipientId') || 0;
        //被评论人昵称
        const recipientName = this.post('recipientName') || '';
        //被评论的评论的id
        const comId = this.post('comId') || 0;
        //这条评论的父评论id
        let parentId = this.post('parentId') || '0';
        //评论所属图片的链接
        const comImgList = this.post('comImgList') || [];
        //评论内容
        const comContext = this.post('comContext') || '';
        console.log('comImgList============== ', comImgList);
        if (comId != 0) {
            //说明不是新增的评论，是被评论的评论
            //父id拼接0
            parentId = parentId + ',' + comId;
        }
        //返回入库后的记录id
        let comment_id = await this.model('comment').add({
            goods_id: goodsId,
            parent_id: parentId,
            body: comContext,
            publish_id: publishId,
            recipient_id: recipientId,
            time: parseInt(new Date().getTime() / 1000),
            niname: niname,
            recipient_name: recipientName,
            avatar: avatar
        });
        for (const comImgUrl of comImgList) {
            await this.model('goods_comment_img').add({
                cid: comment_id,
                goods_id: goodsId,
                publish_id: publishId,
                recipient_id: recipientId,
                url: comImgUrl
            })
        }
        let addedComment = await this.model('comment').where({
            id: comment_id,
            is_delete: 0
        }).select();
        for (const item of addedComment) {
            item.time = moment.unix(item.time).format('YYYY-MM-DD HH:mm:ss');
            //评论父id的个数，如果大于等于3，说明是子评论的评论
            item.parentIdLength = item.parent_id.split(',').length;
        }
        return this.success({
            addedComment: addedComment
        });
    }

    /**
     * 删除评论
     * @returns {Promise<*>}
     */
    async deleteCommnetsAction() {
        const publishId = this.post('publishId');
        const commentId = this.post('cardId');
        let commentInfo = await this.model('comment').where({publish_id: publishId, id: commentId}).find();
        if (commentInfo.parent_id == '0') {
            //父评论，删除当前评论和子评论
            await this.model('comment').where({
                publish_id: publishId,
                _complex: {
                    parent_id: ['like', `%${commentId}%`],
                    id: commentId,
                    _logic: 'or'
                },
            }).update({
                is_delete: 1
            });
        } else {
            //子评论，删单条
            await this.model('comment').where({publish_id: publishId, id: commentId}).update({is_delete: 1});
        }

        //评论图片表
        const commentImgs = await this.model('goods_comment_img').where({
            cid: commentId,
            is_delete: 0
        }).select();
        if (commentImgs.length > 0) {
            for (const imgItem of commentImgs) {
                //删除表单数据
                await this.model('goods_comment_img').where({
                    cid: imgItem.cid
                }).update({
                    is_delete: 1
                });
                //删除服务器上的图片
                await this.service('token').deleteimg(imgItem.url);
            }
        }
        return this.success('评论删除成功');
    }

    /**
     * 单独删掉评论照片
     * @returns {Promise<*>}
     */
    async deletecomimgFileAction() {
        const id = this.post('id');
        const url = this.post('url');
        await this.model('goods_comment_img').where({
            id: id
        }).limit(1).update({
            is_delete: 1
        });
        await this.service('token').deleteimg(url);
        return this.success('文件删除成功');
    }

    /**
     * 获得某条评论的子评论
     * @returns {Promise<void>}
     */
    async childrenCommentsAction() {
        const goodsId = this.get('goodsId');
        const comId = this.get('comId');
        let childrenCommentsList = await this.model('comment').where({
            goods_id: goodsId,
            parent_id: ['like', `%${comId}%`],
            is_delete: 0
        }).order('time asc').select();
        for (const item of childrenCommentsList) {
            item.time = moment.unix(item.time).format('YYYY-MM-DD HH:mm:ss');
            //评论父id的个数，如果大于等于3，说明是子评论的评论
            item.parentIdLength = item.parent_id.split(',').length;
            //当前评论的点赞数据
            item.thumbsUpInfo = await this.model('thumbs_up_view').where({
                goods_id: goodsId,
                com_id: item.id,
                is_delete: 0
            }).find();
            if (_.includes(item.thumbsUpInfo.publish_user_id, think.userId)) {
                item.thumbsUpInfo.isUp = true;
            }
        }
        return this.success({
            childrenCommentsList: childrenCommentsList
        });
    }

    /**
     * 评论点赞功能
     * @returns {Promise<void>}
     */
    async addThumbsUpAction() {
        let type = this.post('type');//点赞类型，2为评论赞
        let comId = this.post('comId');//評論id
        let goodsId = this.post('goodsId')//商品id
        let userId = this.post('currentUserId');
        let isUp = this.post('isUp');//点赞状态，true点赞，false取消点赞
        let thumbsId = this.post('thumbsId') || '';
        let thumbsUpInfo = await this.model('thumbs_up').where({
            id: thumbsId
        }).find();
        if (think.isEmpty(thumbsUpInfo)) {
            //如果不存在，说明是新增的点赞
            thumbsId = await this.model('thumbs_up').add({
                com_id: comId,
                type: type,
                goods_id: goodsId,
                publish_user_id: userId,
                time: parseInt(new Date().getTime() / 1000)
            });
        } else {
            if (isUp) {
                //取消点赞之后又点赞
                await this.model('thumbs_up').where({id: thumbsId}).update({is_delete: 0});
            } else {
                //取消点赞
                await this.model('thumbs_up').where({id: thumbsId}).update({is_delete: 1});
            }
        }
        return this.success({
            thumbsId: thumbsId
        })
    }

    /**
     * 商品点赞操作
     * @returns {Promise<void>}
     */
    async goodsThumbsAction() {
        let publishId = think.userId;
        let goodsId = this.post('goodsId');
        let isUp = this.post('isUp');//点赞状态，true点赞，false取消点赞
        let goodsThumbsId = this.post('goodsThumbsId') || '';
        let goodsThumbsInfo = await this.model('goods_thumbs').where({
            id: publishId,
            goods_id:goodsId
        }).find();
        if (think.isEmpty(goodsThumbsInfo)) {
            //如果不存在，说明是新增的点赞
            goodsThumbsId = await this.model('goods_thumbs').add({
                goods_id: goodsId,
                publish_id: publishId,
                time: parseInt(new Date().getTime() / 1000)
            });
        } else {
            if (isUp) {
                //取消点赞之后又点赞
                await this.model('goods_thumbs').where({id: goodsThumbsId}).update({is_delete: 0});
            } else {
                //取消点赞
                await this.model('goods_thumbs').where({id: goodsThumbsId}).update({is_delete: 1});
            }
        }
        return this.success({
            goodsThumbsId: goodsThumbsId
        })
    }
};
