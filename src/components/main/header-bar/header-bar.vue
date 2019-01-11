<template>
  <div class="header-bar-wrap">
    <div class="top flex align-center between">
      <div class="left flex align-center">
        <img src="../../../assets/kirisun.png" :alt="languageCtx.title" class="logo">
        <h1>{{languageCtx.title}}</h1>
      </div>
      <div class="right">
        <span class="quit" @click="quitLogin">[{{languageCtx.quitBtnText}}]</span>
        <Icon type="ios-settings-outline" size="20" class="setting" @click="openSettingModal" :title="languageCtx.setting"/>
      </div>
    </div>
    <div class="bottom flex align-center">
      <div class="item b-item">
        {{languageCtx.loginSuceessInfo}}{{info}}
        <span v-if="isOnline" class="online">[{{languageCtx.online}}]</span>
        <span v-else class="offline">[{{languageCtx.offline}}]</span>
      </div>
      <div class="item status flex-item">
        {{status}}
      </div>
      <div class="item b-item time-wrap flex">
        <alarm/>
        <span v-html="nowTime" class="time"></span>
      </div>
    </div>
    <settings/>
  </div>
</template>

<script>
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import {dateFmt} from '@/utils/utils'
import Settings from '../settings'
import Storage from '@/utils/localStorage'
import language from '@/libs/language'
import Alarm from '../alarm'

export default {
  name: 'HeaderBar',
  components: {Settings, Alarm},
  computed: {
    info () {
      let userInfo = this.$store.getters.userInfo
      let info = `${userInfo.msName}`
      let state = `${this.languageCtx.nowGroup} ${userInfo.pttGroup}`
      this.$store.commit(types.SetNowStatus, state)
      return info
    },
    status () {
      let state = this.$store.getters.nowStatus
      return state
    },
    isOnline () {
      return this.$store.state.user.isOnline
    }
  },
  data () {
    return {
      nowTime: '',
      languageCtx: null
    }
  },
  created() {
    this.languageType = this.$store.getters.language
    this.languageCtx = language[this.languageType].header
  },
  mounted () {
    this.nowTime = dateFmt("yyyy/MM/dd hh:mm:ss", new Date())
    setInterval(() => {
      this.nowTime = dateFmt("yyyy/MM/dd hh:mm:ss", new Date())
    }, 1000)
  },
  methods: {
    quitLogin () {
      Storage.sessionRemove('isLogin')
      window.location.reload()
    },
    openSettingModal () {
      this.$store.commit(app.SetSettingShow, true)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .top
    vertical-align middle
    height 40px
    padding 0 20px
    h1
      font-size $font-size-large-x
      color $color-theme-weight
      font-weight bold
      line-height 40px
      padding-left 10px
    .quit
      font-size 14px
      color #999
      padding-right 5px
      cursor pointer
    .setting
      cursor pointer
      &:hover
        opacity .9
  .bottom
    padding 0 20px
    height 40px
    line-height 40px
    overflow hidden
    background $color-theme-light
    justify-content around
    color #0b247c
    .status
      text-align center
    .item
      font-size 18px
      color $color-theme-weight
    .b-item
      font-size 14px
      &.time-wrap
        text-align right
      .time
        width 132px
.online
  color #15a00d
.offline
  color #d61e1e
</style>
