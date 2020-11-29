const jwt = require('jsonwebtoken');
const secret = 'SLDLKKDS323ssdd@#@@gf';
const rp = require('request-promise');
module.exports = class extends think.Service {
    /**
     * 根据header中的X-Nideshop-Token值获取用户id
     */
    async getUserId() {
        const token = think.token;
        if (!token) {
            return 0;
        }
        const result = await this.parse();
        if (think.isEmpty(result) || result.user_id <= 0) {
            return 0;
        }
        return result.user_id;
    }
    /**
     * 根据值获取用户信息
     */
    async getUserInfo() {
        const userId = await this.getUserId();
        if (userId <= 0) {
            return null;
        }
        const userInfo = await this.model('user').field(['id', 'username', 'nickname', 'gender', 'avatar', 'birthday']).where({
            id: userId
        }).find();
        return think.isEmpty(userInfo) ? null : userInfo;
    }
    async create(userInfo) {
        const token = jwt.sign(userInfo, secret);
        return token;
    }
    async parse() {
        if (think.token) {
            try {
                return jwt.verify(think.token, secret);
            } catch (err) {
                return null;
            }
        }
        return null;
    }
    async verify() {
        const result = await this.parse();
        if (think.isEmpty(result)) {
            return false;
        }
        return true;
    }
    async deleteimg(key) {
        const domain = think.config('qiniu.domain');
        const fileName = key.replace(domain,'');
        const options = {
            method: 'POST',
            url: domain+'delete.php',
            form: {
                token: think.config('qiniu.token'),
                key: fileName,
            }
        };
        let sessionData = await rp(options);
        sessionData = JSON.parse(sessionData);
        let result = sessionData.result;
        console.log(result);
        return result;
    }
};
