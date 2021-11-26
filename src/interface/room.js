import {
  convertEmoji,
  getCONF
} from '../util'

import core from '../core'


const roomProto = {
  init: function (instance) {
    //this._bot = instance
    let room = instance.contacts[this.UserName]
    this.NickName = convertEmoji(room.NickName)
    this.HeadImgUrl = room.HeadImgUrl
    this.MemberCount = room.MemberCount
    this.MemberList = room.MemberList
    this.RemarkName = convertEmoji(room.RemarkName)
    this.OrignalNickName = room.OrignalNickName
    this.OriginalNickName = room.OriginalNickName
    this.ChatRoomOwner = room.ChatRoomOwner
    this.IsOwner = room.IsOwner
    this.isSelf = room.isSelf
    this.sendMsg = function (msg,  ...mentionList){
      let mentions=''
      if(typeof msg !== 'object'){
        for(let cc of  mentionList){
          mentions+=('@'+cc.NickName+' ')
        }
        msg = mentions + msg
      }
      return instance.sendMsg (msg, this.UserName)
    }
    return this
  },
  getRoomName: function (){
    return this.RemarkName || this.NickName
  },
}

export default function RoomFactory (instance) {
  return {
    extend: function (roomObj) {
      roomObj = Object.setPrototypeOf(roomObj, roomProto)
      return roomObj.init(instance)
    },
    findAll: function (query) {
      let rooms = []
      if(query&&query.topic){
        for (let key in instance.contacts) {
          let contact  = instance.contacts[key]
          if (contact.UserName.indexOf('@@') === 0 && contact.NickName == query.topic){
            let room = RoomFactory(instance)
            rooms.push(room.extend(instance.contacts[key]))
          }
        }
      } else {
        for (let key in instance.contacts) {
          if (instance.contacts[key].UserName.indexOf('@@') === 0){
            let room = RoomFactory(instance)
            rooms.push(room.extend(instance.contacts[key]))
          }
        }
      }
      //console.info("+++++++++++++++++++++++++++++++++++++++++++++++", rooms)
      // for (let key in instance.contacts) {
      //   if (this.FromUserName.indexOf('@@') === 0){
      //     if(query&&query.topic){

      //     }
      //   }
      // }
      return rooms
    },
    find: function(query){
      if(query&&query.topic){
        for (let key in instance.contacts) {
          let contact  = instance.contacts[key]
          if (contact.UserName.indexOf('@@') === 0 && contact.NickName == query.topic){
            let room = RoomFactory(instance)
            return room.extend(instance.contacts[key])
          }
        }
      }else{
        return
      }
    }
  }
}
