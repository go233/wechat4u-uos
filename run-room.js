'use strict'
require('babel-register')
const Wechat = require('./src/wechat.js')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const request = require('request')


async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
let bot
/**
 * 尝试获取本地登录数据，免扫码
 * 这里演示从本地文件中获取数据
 */
try {
  bot = new Wechat(require('./sync-data.json'))
} catch (e) {
  bot = new Wechat()
}
/**
 * 启动机器人
 */
if (bot.PROP.uin) {
  // 存在登录数据时，可以随时调用restart进行重启
  bot.restart()
} else {
  bot.start()
}
/**
 * uuid事件，参数为uuid，根据uuid生成二维码
 */
bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  })
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})
/**
 * 登录用户头像事件，手机扫描后可以得到登录用户头像的Data URL
 */
bot.on('user-avatar', avatar => {
  console.log('登录用户头像事件')
  //console.log('登录用户头像Data URL：', avatar)
})
/**
 * 登录成功事件
 */
bot.on('login', async () => {
  console.log('登录成功事件',Object.keys(bot.contacts).length)
  // 保存数据，将数据序列化之后保存到任意位置
  fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData))


  let room = bot.Room.find({topic:'测试群'})

  console.info(room)

  await room.sendMsg("hello world")
  await delay(2000)
  //console.info("-------eoom2---------", room)


  await room.sendMsg('发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])')
  await delay(2000)

  /**
   * 发送图片
   */
  await room.sendMsg({
      file: request('https://pic3.zhimg.com/50/v2-99190b68adc1df866ea2e21d70b3ed4e_720w.gif'),
      filename: 'bot-qrcode.jpg'
    })
  
  await delay(2000)

  /**
   * 发送表情
   */
  room.sendMsg({
      file: fs.createReadStream('./media/test.gif'),
      filename: 'test.gif'
    })

  await delay(2000)
  /**
   * 发送视频
   */
  room.sendMsg({
      file: fs.createReadStream('./media/test.mp4'),
      filename: 'test.mp4'
    })
  await delay(2000)
  

  /**
   * 发送文件
   */
  room.sendMsg({
      file: fs.createReadStream('./media/test.txt'),
      filename: 'test.txt'
    })

  await delay(2000)

  
    /**
   * 发送撤回消息请求
   */
  let sendMsg = await room.sendMsg('测试撤回6')
  if(sendMsg){
    // 需要取得待撤回消息的MsgID
    console.info("撤回id-----------", sendMsg)
    await delay(2000)
    bot.revokeMsg(sendMsg.MsgID, room.UserName)
  }
})
/**
 * 登出成功事件
 */
bot.on('logout', () => {
  console.log('登出成功')
  // 清除数据
  fs.unlinkSync('./sync-data.json')
})
/**
 * 联系人更新事件，参数为被更新的联系人列表
 */
bot.on('contacts-updated', contacts => {
  //console.log(contacts)
  console.log('联系人数量：', Object.keys(bot.contacts).length)
})
/**
 * 错误事件，参数一般为Error对象
 */
bot.on('error', err => {
  console.error('错误：', err)
})

/**
 * 如何处理会话消息
 */
bot.on('message', async msg => {


  /**
   * 获取消息时间
   */
  console.log(`----------${msg.getDisplayTime()}----------`)
  
  //bot.Room.findAll({topic:'测试群'})
  
  console.log(`----------${msg.getDisplayTime()}----------end`)
  

  //console.info(msg.from())
  /**
   * 获取消息发送者的显示名
   */
  //console.log(bot.contacts[msg.FromUserName].getDisplayName())


  /**
   * 判断消息类型
   */
  switch (msg.MsgType) {
    case bot.CONF.MSGTYPE_TEXT:
      /**
       * 文本消息
       */
      console.log(msg.Content)
      if(msg.room()){
        console.log("群消息", msg.room().getRoomName(), msg.getPeerUserName(), msg.FromUserName, msg.OriginalUserName)
        //console.info("say@-------------------------------")
        //console.info(msg.room().MemberList)
        //await delay(20000)
        //msg.room().sendMsg("明天叫我起床吧" +Date.now(), msg.from())
      }
      break
    case bot.CONF.MSGTYPE_IMAGE:
      /**
       * 图片消息
       */
      console.log('图片消息，保存到本地')
      
      break
    case bot.CONF.MSGTYPE_VOICE:
      /**
       * 语音消息
       */
      console.log('语音消息，保存到本地')
      
      break
    case bot.CONF.MSGTYPE_EMOTICON:
      /**
       * 表情消息
       */
      console.log('表情消息，保存到本地')
      
      break
    case bot.CONF.MSGTYPE_VIDEO:
    case bot.CONF.MSGTYPE_MICROVIDEO:
      /**
       * 视频消息
       */
      console.log('视频消息，保存到本地')
      
      break
    case bot.CONF.MSGTYPE_APP:
      if (msg.AppMsgType == 6) {
        /**
         * 文件消息
         */
        console.log('文件消息，保存到本地')
        
      }
      break
    default:
      break
  }
})


