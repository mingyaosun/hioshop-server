// default config
module.exports = {
    default_module: 'api',
    weixin: {
        appid: 'wxfd7957b1acc1b450', // (必填)小程序 appid
        secret: '493d635c9312e299b304eabc35991da7', // (必填)小程序密钥
        mch_id: '15988888888', // (线上支付必填)商户帐号ID
        partner_key: 'asdasdasdasdasdasdasd', // (线上支付必填)微信支付密钥
        notify_url: 'https://XXX.XXX.XXX/api/pay/notify' // (线上支付必填)微信支付异步通知地址，前面就是该server的域名，不能加端口，http还是https看server本身，建议https
    },
    express: {
        // 已废弃，之后考虑改回来，做成和阿里云的物流查询可以切换，方便大家的使用
        // 免费的，但是顺丰的话，要配合快递鸟的电子面单
        // 快递物流信息查询使用的是快递鸟接口，申请地址：http://www.kdniao.com/
        appid: '12312312', // 对应快递鸟用户后台 用户ID
        appkey: '123123123123123123123123', // 对应快递鸟用户后台 API key
        request_url: 'http://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx'
    },
   mianexpress:{
        appid: '123123', // 对应快递鸟用户后台 用户ID
        appkey: '123123-4e61236-94cb5297309a', // 对应快递鸟用户后台 API key
        request_url: 'http://testapi.kdniao.com:8081/api/EOrderService',
        print_url: 'http://sandboxapi.kdniao.com:8080/kdniaosandbox/gateway/exterfaceInvoke.json',
        ip_server_url:'http://www.kdniao.com/External/GetIp.aspx'
    },
    qiniu: {
        token: 'token123456',                // 请填自己的token,和服务器index.php中的该值保持一致
        domain: 'http://xxx.xxx.xxx/'   // 请填自己的图片存放站点,也是index.php的根目录,直接访问会显示测试通过，末尾的/不能省略
    },
    // 在七牛新建一个https的空间，这个是用来存储分享图片的https图片，对应的是goods表中的https_pic_url
    //着重强调，https是用来存储分享图片的，即点击分享按钮后无图片说明是这里配置的问题
    qiniuHttps: {
        access_key: 'asdlakjsdlajlajsdlasasdla', // 同上
        secret_key: 'aaaaaaaaaaasdasdasdasd', // 同上
        bucket: 'bucketname', // 同上
        domain: 'https://xxx.xxx.xxx/', // 自己设置，例如：'http://img.你的域名.com/',别忘了这个”/“
        // https://developer.qiniu.com/kodo/manual/1671/region-endpoint
        zoneNum: 2  // 这个自己根据地区设置：华东 0；华北 1；华南 2； 北美 3；东南亚 4
        //在创建空间时有选择地区，请留意
    },
    aliexpress:{
        //
        url:'http://wuliu.market.alicloudapi.com/kdi', //阿里云的物流查询api，收费的
        appcode: 'xxxxa0be99af406987659b1833ddf3a7' ,// 阿里云后台获取,
		sfLastNo:'7930', // 顺丰寄件人后四位，这个根据自己的寄件人手机设置，如果寄件人是不固定的，那么需要在order_express自己写代码了。
    },
	templateId:{
		// deliveryTemplate:
	},
    //以下为改良版新增
    port:8360,
        //server启动的端口，默认8360，http建议80，https建议443，请确保端口未被占用
    ishttps:false,
        //是否开启https，默认否，如果是，请确保以下证书配置正确
    httpskey:'D:/111.key',
        //https证书的key文件的路径
    httpspem:'D:/111.pem',
        //https证书的pem文件或crt文件的路径
    isemail:false,
        //是否开启邮件提醒，如果是，请确保以下配置正确，开启后，用户下单会收到邮件提醒；如果配置有误，会在server命令行看到报错信息；
    email: {
        service: 'QQ',//支持的邮箱列表:'1und1','AOL','DebugMail.io','DynectEmail','FastMail','GandiMail','Gmail','Godaddy','GodaddyAsia','GodaddyEurope','hot.ee','Hotmail','iCloud','mail.ee','Mail.ru','Mailgun','Mailjet','Mandrill','Naver','OpenMailBox','Postmark','QQ','QQex','SendCloud','SendGrid','SES','SES-US-EAST-1','SES-US-WEST-1','SES-EU-WEST-1','Sparkpost','Yahoo','Yandex','Zoho'
        user: '1234567890@qq.com',//邮箱用户名
        pass: 'abcdefghijklmn',//邮箱授权码，以qq为例，要开启POP3/SMTP服务，获得授权码，自行百度
        recipient: '987654321@qq.com'//收件人邮箱地址，多个收件人以英文逗号隔开
    }
};
