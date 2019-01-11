import {dateFmt, hasIllegalChar, getStrCharLength} from '@/utils/utils'
import {Message} from '@/libs/dom'
import mixin from '@/store/mixins/mixin'
import * as types from '@/store/types/group'
import * as log from '@/store/types/log'
const messageNotice = 103

export default {
  mixins: [mixin],
  data () {
    return {
      sendingMessage: ''
    }
  },
  methods: {
    forbidTriggleVoice (ev) {
      if (ev.code === 'Enter') {
        this.handleSendMessage(ev)
        return false
      }
    },
    handleSendMessage (event) {
      this.sendingMessage = this.sendingMessage.replace(/[\r\n]/g, '')
      this.sendingMessage = this.sendingMessage.replace(/\ +/g, '')

      if (hasIllegalChar(this.sendingMessage)) {
        this.messageNotice(10) // 不能包含非法字符
        this.sendingMessage = ''
        return
      }

      if (!this.sendingMessage) {
        event.cancelBubble = true
        event.preventDefault()
        event.stopPropagation()
        this.messageNotice(11) // 发送信息不能为空
      } else {
        let strLength = getStrCharLength(this.sendingMessage)
        if (strLength > 400) return

        let receiversObj = this.getReceivers()
        this.$store.dispatch(types.SendSMS, {mid: receiversObj.mids, msName: this.user.msName, msg: this.sendingMessage}).then(() => {
          let message = new Message({
            time: dateFmt('hh:mm:ss', new Date()),
            msName: this.user.msName,
            msg: this.sendingMessage,
            arrow: '>>',
            list: [...this.$store.getters.messageList],
            others: receiversObj.result
          })

          message.addMessage()
          this.$store.commit(types.SetMessageList, message.list)
          this.$store.commit(log.SaveLog, {
            account: this.user.msId,
            name: this.user.msName,
            type: messageNotice,
            remark: `${this.languageContext.messageContent}(${this.sendingMessage})To(${receiversObj.result})`
          })

          this.sendingMessage = ''
          this.sendingMessage = this.sendingMessage.replace(/[\r\n]/g, '')
        })
      }
    },
    getReceivers () {
      let result = []
      let mids = []
      if (this.member) {
        result.push(this.member.name)
        mids.push(this.member.cid)
      } else if (this.tempGroupInfo) {
        mids = this.tempGroupInfo.cids
        mids.forEach(item => {
          let name = this.allMembersObj[item].name
          result.push(name)
        })
      } else if (this.mapTempMemberList.length && this.$route.name === 'monitoring') {
        mids = this.mapTempMemberList.map(item => {
          result.push(item.name)
          return item.cid
        })
      } else {
        let gid = this.user.gId
        this.memberObj[gid].forEach(item => {
          let name = this.allMembersObj[item.cid].name
          if (item.cid !== this.user.msId) result.push(name)
        })
      }
      mids = mids.length ? mids.join(',') : ''
      result = result.join(',')
      return {result, mids}
    }
  }
}
