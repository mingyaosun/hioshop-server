const qiniu = require('qiniu');
module.exports = class extends think.Service {
    async getQiniuToken() {
        // let secretKey = think.config('qiniu.secret_key');
        // let bucket = think.config('qiniu.bucket');
        let domain = think.config('qiniu.domain');
        // let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        // let currentTime = parseInt(new Date().getTime() / 1000) + 600;
        //let key = think.uuid(32);
        // let options = {
        //     scope: bucket,
        //     deadline: currentTime,
        //     saveKey: key
        // };
        // let putPolicy = new qiniu.rs.PutPolicy(options);
        // let uploadToken = putPolicy.uploadToken(mac);
        let uploadToken = think.config('qiniu.token');
        let data = {
            uploadToken: uploadToken,
            domain: domain,
        };
        return data;
    }

    async deleteimg(key) {
        const options = {
            method: 'POST',
            url: think.config('qiniu.domain')+'delete.php',
            form: {
                token: think.config('qiniu.token'),
                key: key,
            }
        };
        let sessionData = await rp(options);
        sessionData = JSON.parse(sessionData);
        let result = sessionData.result;
        console.log(result);
        return result;
    }
};
