import * as app from '@/store/types/app'
import * as log from '@/store/types/log'
import * as user from '@/store/types/user'
import { pttStart, isPtting, pttStop, getRecorder } from '@/libs/webDispatcher-sdk.js'
import language from '@/libs/language'
import {debounce} from '@/utils/utils'
import { codeConfig } from '@/libs/codeConfig'

export default {
  computed: {
    pttAble: {
      get () {
        return this.$store.state.app.pttAble
      },
      set (val) {
        this.$store.commit(app.SetPttAble, val)
      }
    },
    isRecording: {
      get () {
        return this.$store.state.app.isRecording
      },
      set (val) {
        this.$store.commit(app.SetRecording, val)
      }
    },
    isOnline: {
      get () {
        return this.$store.state.user.isOnline
      },
      set (val) {
        this.$store.commit(user.SetIsOnline, val)
      }
    }
  },
  data () {
    return {
      isPtting: false,
      pptStartTime: 0,
      pptTriggerTime: 0,
      timer: null,
      duringTime: 200,
      isTiemout: false
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].main
    this.languageLogType = language[this.languageType].store.logType
    this.debounce = debounce(this.messageAlert.bind(this, 'warning', this.languageCtx.failAlert), 300)
  },
  mounted () {
    document.onkeydown = (ev) => {
      if (!this.$store.getters.isSettingShow) {
        if (ev.keyCode === this.$store.getters.settingItems.pttQuickKey.keyCode) {
          this.handleStartPtt(ev)
        }
      }
    }
    document.onkeyup = (ev) => {
      if (ev.keyCode === this.$store.getters.settingItems.pttQuickKey.keyCode) {
        this.handleEndPtt()
        this.isTiemout = false // 清除上一次的超时
      }
    }
  },
  methods: {
    getTimeNow () {
      let now = new Date()
      return now.getTime()
    },
    hasOnline (bool) {
      if (!bool) {
        this.isTiemout = true
        this.debounce()
      }
    },
    handleStartPtt (ev) {
      if (!this.isTiemout && this.isOnline) { // 判断按下的时间是否超时, 没有超时
        if (!this.isRecording) { // 没有录音才进行判断
          // this.isPtting = false
          getRecorder().then(() => {
            this.calling()
          }).catch(() => {
            this.$store.commit(app.SetMicroTip, true)
            return false
          })
        }
        if (this.isRecording) { // 在录音时才进行时间判断
          if (!this.pptStartTime) this.pptStartTime = this.getTimeNow()
          this.pptTriggerTime = this.getTimeNow()
          if ((this.pptTriggerTime - this.pptStartTime) > 100000) { // 语音超时长~
            this.handleEndPtt()
            this.isTiemout = true
          }
        }
      }
    },
    calling () {
      if (!isPtting()) {
        this.isRecording = true
        this.pttAble = true
        pttStart(res => {
          pttStop()
          this.pttAble = false
          return false
        })
        let remark
        if (this.tempGroupInfo) {
          remark = this.tempGroupInfo.cids.map(item => {
            return this.allMembersObj[item].name
          })
          remark = `${remark.join(',')}`
        } else {
          remark = `${this.user.pttGroup}`
        }
        this.$store.commit(log.SaveLog, {
          account: this.user.msId,
          name: this.user.msName,
          type: codeConfig.startPttNotice,
          remark
        })
      } else if (!this.isPtting) {
        this.isPtting = true
        this.messageAlert('warning', this.languageCtx.callingBusy)
      }
    },
    handleEndPtt () {
      this.isRecording = false
      this.pptStartTime = 0
      this.pptTriggerTime = 0
      this.isPtting = false
      pttStop()
    }
  }
}
