const Base = require('./base.js');
const moment = require('moment');
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
                item.childrenCount = await this.model('comment').where({
                    parent_id: ['like', `%${item.id}%`],
                    goods_id: goodsId,
                    is_delete: 0
                }).count('id');
            }
        }
        info.goods_number = goodsNumber;
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
            parentId = '0,' + comId;
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
        return this.success('保存评论成功');
    }

    /**
     * 删除评论
     * @returns {Promise<*>}
     */
    async deleteCommnetsAction() {
        const publishId = this.post('publishId');
        const commentId = this.post('cardId');
        //评论表
        await this.model('comment').where({
            id: commentId,
            publish_id: publishId
        }).limit(1).update({
            is_delete: 1
        });
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
            goods_id:goodsId,
            parent_id:['like',`%${comId}%`]
        }).order('time desc').select();
        for (const item of childrenCommentsList) {
            item.time = moment.unix(item.time).format('YYYY-MM-DD HH:mm:ss');
        }
        return this.success({
            childrenCommentsList:childrenCommentsList
        });
    }
};
