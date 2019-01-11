<template>
  <div class="settings-wrap">
    <Modal
        v-model="isSettingShow"
        :title="languageCtx.title"
        width="450"
        class-name="vertical-center-modal"
        @on-ok="handleSubmitSettings"
        >
      <Form :label-width="170">
        <FormItem :label="pttQuickKey.label">
            <div v-html="pttQuickKey.key"
                class="quick-key"
                @mouseover="isMouseOnQuickKey=true"
                @mouseleave="isMouseOnQuickKey=false">
            </div>
            <p class="tip" v-html="languageCtx.tip"></p>
        </FormItem>
        <div class="notice" ><span>{{languageCtx.name}}</span></div>
        <FormItem :label="onlineNotice.label"
                  class="switch-item align-center flex">
            <i-switch v-model="online" size="large">
                <span slot="open"></span>
                <span slot="close"></span>
            </i-switch>
        </FormItem>
        <FormItem :label="offlineNotice.label"
                  class="switch-item align-center flex">
            <i-switch v-model="offline" size="large">
                <span slot="open"></span>
                <span slot="close"></span>
            </i-switch>
        </FormItem>
        <FormItem :label="creatTempGroupNotice.label"
                  class="switch-item align-center flex">
            <i-switch v-model="creatTempGroup" size="large">
                <span slot="open"></span>
                <span slot="close"></span>
            </i-switch>
        </FormItem>
        <FormItem :label="cancelTempGroupNotice.label"
                  class="switch-item align-center flex">
            <i-switch v-model="cancelTempGroup" size="large">
                <span slot="open"></span>
                <span slot="close"></span>
            </i-switch>
        </FormItem>
        <FormItem :label="quitTempGroupNotice.label"
                  class="switch-item align-center flex">
            <i-switch v-model="quitTempGroup" size="large">
                <span slot="open"></span>
                <span slot="close"></span>
            </i-switch>
        </FormItem>
        <FormItem :label="switchNotice.label"
                  class="switch-item align-center flex">
            <i-switch v-model="switchGroup" size="large">
                <span slot="open"></span>
                <span slot="close"></span>
            </i-switch>
        </FormItem>
        <div class="notice" ></div>
        <FormItem :label="sosVoice.label"
                  class="switch-item align-center flex">
            <i-switch v-model="sos" size="large">
                <span slot="open"></span>
                <span slot="close"></span>
            </i-switch>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import * as app from '@/store/types/app'
import {toUpperCaseFirstChar, deepClone} from '@/utils/utils'
import Storage from '@/utils/localStorage'
import language from '@/libs/language'

export default {
  name: 'Settings',
  computed: {
    isSettingShow: {
      get () {
        return this.$store.state.app.isSettingShow
      },
      set (val) {
        this.$store.commit(app.SetSettingShow, false)
      }
    },
    storeSettingItems: {
      get () {
        return this.$store.state.app.settingItems
      },
      set (val) {
        this.$store.commit(app.SetSettingItems, val)
      }
    },
    user () {
      return this.$store.getters.userInfo
    },
    pttQuickKey () {
      return Object.assign({label: this.languageCtx.pttQuickKeyLabel}, this.pttKey)
    },
    onlineNotice () {
      return Object.assign({label: this.languageCtx.online, key: 'onlineNotice'}, {val: this.online})
    },
    offlineNotice () {
      return Object.assign({label: this.languageCtx.offline, key: 'offlineNotice'}, {val: this.offline})
    },
    creatTempGroupNotice () {
      return Object.assign({label: this.languageCtx.creatTempGroup, key: 'creatTempGroupNotice'}, {val: this.creatTempGroup})
    },
    switchNotice () {
      return Object.assign({label: this.languageCtx.switchGroup, key: 'switchNotice'}, {val: this.switchGroup})
    },
    quitTempGroupNotice () {
      return Object.assign({label: this.languageCtx.quitTempGroup, key: 'quitTempGroupNotice'}, {val: this.quitTempGroup})
    },
    cancelTempGroupNotice () {
      return Object.assign({label: this.languageCtx.cancelTempGroup, key: 'cancelTempGroupNotice'}, {val: this.cancelTempGroup})
    },
    sosVoice () {
      return {label: this.languageCtx.sosVoice, val: this.sos, key: 'sos'}
    }
  },
  data () {
    return {
      isMouseOnQuickKey: false,
      languageCtx: null,
      pttKey: {keyCode: 32, key: 'Space'},
      online: true,
      offline: true,
      quitTempGroup: true,
      cancelTempGroup: true,
      switchGroup: true,
      creatTempGroup: true,
      sos: true
    }
  },
  created () {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].settings
    this.getLocalSettingItems()
 },
  mounted () {
    // Storage.localRemove('mySettings')
    this.disableKeys = [27, 112, 116]
    window.addEventListener('keydown', (ev) => {
      let hasDisableKey = this.disableKeys.some(item => {
        return item === ev.keyCode
      })
      if (!hasDisableKey && this.isMouseOnQuickKey) {
        this.setQuickKey(ev)
      }
    })

  },
  methods: {
    setQuickKey (ev) {
      let key = ev.keyCode !== 32 ? ev.key : 'Space'
      key = toUpperCaseFirstChar(key)
      this.pttKey = {...this.pttKey, keyCode: ev.keyCode, key}
    },
    handleSubmitSettings () {
      let mySettings = {}
      mySettings[this.user.msId] = {
          pttQuickKey: {...this.pttQuickKey},
          onlineNotice: {...this.onlineNotice},
          offlineNotice: {...this.offlineNotice},
          creatTempGroupNotice: {...this.creatTempGroupNotice},
          cancelTempGroupNotice: {...this.cancelTempGroupNotice},
          quitTempGroupNotice: {...this.quitTempGroupNotice},
          switchNotice: {...this.switchNotice},
          sosVoice: {...this.sosVoice}
        }
      console.log(mySettings[this.user.msId])
      // 临时群组存到本地
      this.storeSettingItems = mySettings[this.user.msId]
      Storage.localSet('mySettings', mySettings)
    },
    getLocalSettingItems () {
      if (Storage.localGet('mySettings') && Storage.localGet('mySettings')[this.user.msId]) {
        let localSettingItems = Storage.localGet('mySettings')[this.user.msId]
        this.pttKey = Object.assign({}, localSettingItems.pttQuickKey)
        this.online = localSettingItems.onlineNotice.val
        this.offline = localSettingItems.offlineNotice.val
        this.creatTempGroup = localSettingItems.creatTempGroupNotice.val
        this.cancelTempGroup = localSettingItems.cancelTempGroupNotice.val
        this.quitTempGroup = localSettingItems.quitTempGroupNotice.val
        this.switchGroup = localSettingItems.switchNotice.val
        this.storeSettingItems = localSettingItems
      } else {
        this.storeSettingItems = {
          pttQuickKey: {...this.pttQuickKey},
          onlineNotice: {...this.onlineNotice},
          offlineNotice: {...this.offlineNotice},
          creatTempGroupNotice: {...this.creatTempGroupNotice},
          cancelTempGroupNotice: {...this.cancelTempGroupNotice},
          quitTempGroupNotice: {...this.quitTempGroupNotice},
          switchNotice: {...this.switchNotice},
          sosVoice: {...this.sosVoice}
        }
      }
    }
  },
  watch: {
    isSettingShow (val) {
      val && this.getLocalSettingItems()
    }
  }
}
</script>

<style lang="stylus" scoped>
.settings-wrap
  font-size 14px
.quick-key
  width 200px
  line-height 30px
  height 30px
  border 1px solid #eaeaea
  padding 0 5px
  text-align center
  &:hover
    border 1px solid #2d8cf0
    transition all .2s
.tip
  font-size 12px
  color #bbb
.notice
  border-bottom 1px solid #eaeaea
  margin-bottom 10px
  padding-bottom 15px
  span
    font-weight bold
    display inline-block
.switch-item 
  margin-bottom 12px !important
</style>


