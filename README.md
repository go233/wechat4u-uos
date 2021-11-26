# wechat4u-uos.js

## 本项目fork自 [https://github.com/nodeWechat/wechat4u](https://github.com/nodeWechat/wechat4u) 

- 在原来项目的基础上增加了uos web协议适配
- 为了更好的自定义我所想要的功能，没有在原项目上pr而是新开了项目
- 本项目仅供个人研究所用，如对您有帮助，那么纯属巧合

## Announcing wechat4u-uos v0.0.2



### Changes

- 增加room 群组的操作 方法见 run-room.js
- 增加uos web协议适配让web协议重新可用


## 安装使用

```
npm install --save wechat4u-uos@latest
```

```javascript
const Wechat = require('wechat4u-uos')
let bot = new Wechat()
bot.start()
// 或使用核心API
// const WechatCore = require('wechat4u-uos/lib/core')
```

## 开发测试

```shell
git clone https://github.com/go233/wechat4u-uos.git
cd wechat4u-uos
npm install
npm run core // 命令行模式
npm run compile // babel编译
```

## 使用范例

`node run-core.js`

逻辑见[代码](https://github.com/go233/wechat4u-uos/blob/master/run-core.js)，简明完整，一定要看

## 实例化Wechat类

```javascript
let bot = new Wechat([botData])
```

若传入`botData`，则使用此机器人信息，重新开始之前的同步

## 实例属性

所有属性均只读

### bot.botData

可导出的实例基本信息，在下次new新bot时，可以填入此信息，重新同步

### bot.PROP

保持登录状态的必要信息

### bot.CONF

配置信息，包括当前服务器地址，API路径和一些常量

程序中需要使用CONF中的常量来判断当前状态的新消息类型

```javascript
bot.state == bot.CONF.STATE.init // 初始化状态
bot.state == bot.CONF.STATE.uuid // 已获取 UUID
bot.state == bot.CONF.STATE.login // 已登录
bot.state == bot.CONF.STATE.logout // 已退出登录
msg.MsgType == bot.CONF.MSGTYPE_TEXT // 文本消息
msg.MsgType == bot.CONF.MSGTYPE_IMAGE // 图片消息
msg.MsgType == bot.CONF.MSGTYPE_VOICE // 语音消息
msg.MsgType == bot.CONF.MSGTYPE_EMOTICON // 自定义表情消息
msg.MsgType == bot.CONF.MSGTYPE_MICROVIDEO // 小视频消息
msg.MsgType == bot.CONF.MSGTYPE_VIDEO // 视频消息
```

### bot.state

当前状态

### bot.user

当前登录用户信息

### bot.contacts

所有联系人，包括通讯录联系人，近期联系群，公众号

key为联系人UserName，UserName是本次登录时每个联系人的UUID，不过下次登录会改变

value为`Contact`对象，具体属性方法见`src/interface/contact.js`

### msg

登录后接受到的所有消息

msg为`Message`对象，具体属性方法见`src/interface/message.js`

## 实例API

### bot.start()

启动实例，登录和保持同步

调用该方法后，通过监听事件来处理消息

### bot.restart()

利用实例已获取的必要信息，重新登录和进行同步

### bot.stop()

停止实例，退出登录

调用该方法后，通过监听`logout`事件来登出

### bot.setPollingMessageGetter(getter)

自定义心跳消息内容

`getter` 函数返回心跳消息内容

`typeof(getter())` 应为 `"string"`

```javascript
bot.setRollingMessageGetter(function () {
  //
  return (new Date()).toJSON();
});
```

### bot.setPollingIntervalGetter(getter)

自定义心跳间隔

`getter` 函数返回心跳间隔（以毫秒为单位）

`typeof(getter())` 应为 `"number"`

```javascript
bot.setRollingIntervalGetter(function () {
  return 2 * 60 * 1000;
});
```

### bot.setPollingTargetGetter(getter)

自定义心跳目标用户

`getter` 函数返回目标用户的 `UserName` （形如 `@xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` ）

`typeof(getter())` 应为 `"string"`

注： 如要使用 `bot.user.UserName` ，需在 `login` 事件后定义目标用户

```javascript
bot.setRollingmeGetter(function () {
  return bot.user.UserName;
});
```

> 以下方法均返回Promise

### bot.sendText(msgString, toUserName)

发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])

### bot.uploadMedia(Buffer | Stream | File, filename, toUserName)

上传媒体文件

返回

```javascript
{
  name: name,
  size: size,
  ext: ext,
  mediatype: mediatype,
  mediaId: mediaId
}
```

### bot.sendPic(mediaId, toUserName)

发送图片，mediaId为uploadMedia返回的mediaId

```javascript
bot.uploadMedia(fs.createReadStream('test.png'))
  .then(res => {
    return bot.sendPic(res.mediaId, ToUserName)
  })
  .catch(err => {
    console.log(err)
  })
```

### bot.sendEmoticon(md5 | mediaId, toUserName)

发送表情，可是是表情的MD5或者uploadMedia返回的mediaId

表情的MD5，可以自己计算但是可能不存在在微信服务器中，也可以从微信返回的表情消息中获得

### bot.sendVideo(mediaId, toUserName)

发送视频

### bot.sendDoc(mediaId, name, size, ext, toUserName)

以应用卡片的形式发送文件，可以通过这个API发送语音

### bot.sendMsg(msg, toUserName)

对以上发送消息的方法的封装，是发送消息的通用方法

当`msg`为string时，发送文本消息

当`msg`为`{file:xxx,filename:'xxx.ext'}`时，发送对应媒体文件

当`msg`为`{emoticonMd5:xxx}`时，发送表情

```javascript
bot.sendMsg({
    file: request('https://raw.githubusercontent.com/nodeWechat/wechat4u/master/bot-qrcode.jpg'),
    filename: 'bot-qrcode.jpg'
  }, ToUserName)
  .catch(err => {
    console.log(err)
  })
```

### bot.forwardMsg(msg, toUserName)

转发消息，`msg`为`message`事件传递的`msg`对象

### bot.revokeMsg(MsgID, toUserName)

撤回消息

`MsgID`为发送消息后返回的代表消息的ID

```javascript
bot.sendMsg('测试撤回', toUserName)
  .then(res => {
    return bot.revokeMsg(res.MsgID, toUserName)
  })
  .catch(err => {
    console.log(err)
  })
```

### bot.getContact(Seq)

获取通讯录中的联系人

`Seq` 上一次调用 bot.getContact 后返回的 seq，第一次调用可不传

### bot.batchGetContact(contacts)

批量获取指定联系人数据

`contacts` 数组，指定需要获取的数据

当`contacts`为`[{UserName: xxx}]`时，可获取指定联系人或群信息

当`contacts`为`[{UserName: xxx, EncryChatRoomId: xxx}]`时，可获取指定群内成员详细信息，EncryChatRoomId 可从群信息中获得

### bot.getHeadImg(HeadImgUrl)

获取联系人头像

```javascript
bot.getHeadImg(bot.contacts[UserName].HeadImgUrl).then(res => {
  fs.writeFileSync(`${UserName}.jpg`, res.data)
}).catch(err => {
  console.log(err)
})
```

### bot.getMsgImg(MsgId)

获取图片或表情

```javascript
bot.getMsgImg(msg.MsgId).then(res => {
  fs.writeFileSync(`${msg.MsgId}.jpg`, res.data)
}).catch(err => {
  console.log(err)
})
```

### bot.getVoice(MsgId)

获取语音

### bot.getVideo(MsgId)

获取小视频或视频

### bot.getDoc(UserName, MediaId, FileName)

获取文件，消息的`MsgType`为49且`AppMsgType`为6时即为文件。


### bot.addFriend(UserName, Content)

添加好友

`UserName` 一般可从群信息中获得

`Content` 验证信息

### bot.verifyUser(UserName, Ticket)

通过好友添加请求

### bot.createChatroom(Topic, MemberList)

创建群

`Topic` 群聊名称

`MemberList` 数组, 除自己外至少两人的UserName，格式为 [ {"UserName":"@250d8d156ad9f8b068c2e3df3464ecf2"}, {"UserName":"@42d725733741de6ac53cbe3738d8dd2e"} ]

### bot.updateChatroom(ChatRoomUserName, MemberList, fun)

更新群成员

`ChatRoomUserName` '@@'开头的群UserName

`MemberList` 数组，联系人UserNa

`fun` 可选'addmember'，'delmember'，'invitemember'

### bot.updateChatRoomName(ChatRoomUserName, NewName)

更新群名称

`ChatRoomUserName` '@@'开头的群UserName

`NewName` 字符串，新的群名称

### bot.opLog(UserName, OP)

置顶或取消置顶联系人，可通过直接取消置顶群来获取群ChatRoomOwner

OP == 0 取消置顶

OP == 1 置顶

### bot.updateRemarkName(UserName, RemarkName)

设置联系人备注或标签

## 实例事件

### uuid

得到uuid，之后可以构造二维码或从微信服务器取得二维码

```javascript
bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  })
  console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})
```

### user-avatar

手机扫描后可以得到登录用户头像的Data URL

### login

手机确认登录

### logout

成功登出

### contacts-updated

联系人更新，可得到已更新的联系人列表

### message

所有通过同步得到的消息，通过`msg.MsgType`判断消息类型

```javascript
bot.on('message', msg => {
  switch (msg.MsgType) {
    case bot.CONF.MSGTYPE_STATUSNOTIFY:
      break
    case bot.CONF.MSGTYPE_TEXT:
      break
    case bot.CONF.MSGTYPE_RECALLED:
      break
  }
})
```

### error

## Contact对象和Message对象

每个contact，继承自 interface/contact，除原本 json 外，扩展以下属性：

```javascript
contact.AvatarUrl // 处理过的头像地址
contact.isSelf    // 是否是登录用户本人

contact.getDisplayName()
contact.canSearch(keyword)
```

此外，wechat4u 在实例上提供 Contact 作为联系人的通用接口，扩展以下属性：

```javascript
wechat.Contact.isRoomContact()
wechat.Contact.isSpContact()
wechat.Contact.isPublicContact()

wechat.Contact.getUserByUserName()
wechat.Contact.getSearchUser(keyword)
```

每个msg 对象继承自 interface/message，出原本 json 外，具有以下属性：

```javascript
message.isSendBySelf // 是否是本人发送

message.isSendBy(contact)
message.getPeerUserName() // 获取所属对话的联系人 UserName
message.getDisplayTime() // 获取形如 12:00 的时间戳信息
```

## 相关项目

修改适配参考自 ItChat-UOS ，感谢前人的付出

- [ItChat-UOS](https://github.com/why2lyj/ItChat-UOS)


关于微信网页端的接口说明，也有好几篇分析的很厉害的文章。

- [Reverland 大神的web 微信与基于node的微信机器人实现](http://reverland.org/javascript/2016/01/15/webchat-user-bot/)
- [Urinx 大神的 API Map](https://github.com/Urinx/WeixinBot/blob/master/README.md)
- [聂永 大神的 微信协议简单调研笔记](http://www.blogjava.net/yongboy/archive/2014/03/05/410636.html)

## License

MIT
