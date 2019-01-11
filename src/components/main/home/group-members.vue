<template>
    <div class="group-member-wrap scroll-bar pr" id="membersWrap">
      <member-list v-if="!isMemberListShow"
                  type="temp"
                  :list="rowTempMemberList"
                  :msId="msId"
                  :colNum="colNum"
                  @on-remove="handleDelMember"
                  />
      <member-list :list="rowMemberList"
                  v-else
                  @on-select="creatSingleGroup"
                  :msId="msId"
                  :colNum="colNum"
                  />
      <div class="add-mask pa w100 h100 flex align-center justify-center" v-if="dragingMember">
        <div class="content flex shine">
          <Icon type="ios-add-circle-outline" color="rgba(255, 255, 255, .8)" size="60"/>
          <div class="text">{{languageCtx.blockGroup.addBtnText}}</div>
        </div>
      </div>
    </div>
</template>
<script>
import mixin from './mixin'
import addTemp from '@/store/mixins/createTempGroup'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import * as log from '@/store/types/log'
import {sliceArr, uniqueArr} from '@/utils/utils'
import {Row, Col} from 'iview'
import MemberList from './member-list'
import {codeConfig} from '@/libs/codeConfig'
const DEL_MEMBER = 1

export default {
  name: 'GroupMemberWrap',
  mixins: [ mixin, addTemp ],
  components: {
    MemberList
  },
  data () {
    return {
      msId: '',
      nowSelectedSingleCallGid: '',
      rowMemberList: [],
      rowTempMemberList: [],
      colNum: 8,
      gutter: 16,
      isFirstInit: true,
      hasTempCheckToNowGroup: false, //有臨時群組切到當前組,
      hasTempCheckToOtherGroup: false
    }
  },
  computed: {
    tempList () {
      let list = this.$store.getters.groupTempList
      return list
    },
    memberList () {
      let activeGid = this.$store.state.user.userInfo.gId
      let membersObj = this.$store.getters.memberList
      return membersObj[activeGid]
    },
    isAppLoading () {
      return this.$store.getters.isAppLoading
    },
    singleCallActiveCid: {
      get () {
        return this.$store.getters.singleCallActiveCid
      },
      set (val) {
        this.$store.commit(types.SetSingleCallActiveCid, val)
      }
    },
    dragingMember: {
      get () {
        return this.$store.state.group.dragingMember
      },
      set (val) {
        this.$store.commit(types.SetDragingMember, val)
      }
    },
    isMemberListShow: {
      get () {
        let tempGroupInfo = this.$store.getters.tempGroupInfo
        if (tempGroupInfo && tempGroupInfo.creatType !== 'SINGLE_TEMP_GROUP') {
          if (this.hasTempCheckToNowGroup || this.hasTempCheckToOtherGroup) return true
          return false
        }
        return true
      }
    },
    activeGid () {
      return this.$store.state.user.userInfo.gId
    }
  },
  mounted() {
    this.setColNum()
    window.addEventListener('resize', () => {
      this.setColNum()
    })
    this.renderMemberList()
  },
  methods: {
    setColNum () {
      if (document.body.clientWidth <= 1500) {
        this.colNum = 4
      } else if (document.body.clientWidth > 1500 && document.body.clientWidth <= 1800) {
        this.colNum = 6
      } else {
        this.colNum = 8
      }
    },
    creatSingleGroup (item) {
      if (this.singleCallActiveCid !== item.cid) {
        this.toCreatTempGroup({tempInfo: '', creatType: 'SINGLE_TEMP_GROUP', cids: item.cid})
      } else {
        this.handleClose()
      }
    },
    myselfStyl () {
      let id = this.$store.getters.userInfo.msId
      this.msId = id
    },
    justifyType (index) {
     return index === (this.rowMemberList.length - 1) ? 'start' : 'space-between'
    },
    initMemberList (list) {
      if (list) {
        this.myselfStyl()
        return sliceArr(list, this.colNum) 
      }
    },
    renderMemberList () {
      if (this.isMemberListShow) {
        if (this.memberList) {
        let list = [...this.memberList]
          list.unshift(this.allMembersObj[this.user.msId])
          list = uniqueArr(list, 'cid')
          this.rowMemberList = this.initMemberList(list)
        }
      } else {
        this.rowTempMemberList = this.initMemberList(this.tempList)
      }
    },
    handleDelMember (cid) {
      this.$store.dispatch(types.EditTempGroup, {type: DEL_MEMBER, counts: 1, mids: cid})
      .then((res) => {
        const DEL_SUCCESS = 6
        this.messageNotice(DEL_SUCCESS)
        this.$store.commit(log.SaveLog, {
            account: this.user.msId,
            name: this.user.msName,
            type: codeConfig.editTempGroupNotice,
            remark: `${this.languageCtx.home.remove}${this.allMembersObj[cid].name}`
          })
        this.getTempGroupInfo(res, 'TEMP_GROUP')
      })
      .catch(error => {
        const DEL_FAIL = 7
        this.messageNotice(DEL_FAIL)
      })
    }
  },
  watch: {
    colNum (val) {
      if (val && !this.isFirstInit) {
        this.renderMemberList()
      }
    },
    "$route" (val) {
      if (val && val.name === 'home') {
        this.renderMemberList()
      }
    },
    activeGid () {
      this.renderMemberList()
    },
    tempGroupInfo (val) {
      this.renderMemberList()
      if (!val) {
        this.hasTempCheckToNowGroup = false
        this.hasTempCheckToOtherGroup = false
      }
    },
    isMemberListShow () {
      this.renderMemberList()
    },
    isAppLoading (val) {
      if (!val && this.isFirstInit) {
        this.renderMemberList()
        this.isFirstInit = false
      }
    },
    memberList (val) {
      if (val && !this.isFirstInit) {
        this.renderMemberList()
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '../../../assets/styles/variable.styl'

  .group-member-wrap
    background $color-theme
    height 100%
    padding 36px 40px
    overflow-y auto
    .add-mask
      top 0
      left 0
      z-index 10
      background rgba(0, 0, 0, .35)
      .content
        color #ffffff
        text-align center
        height 150px
        width 300px
        border 2px dashed rgba(255, 255, 255, .6)
        flex-direction column
        justify-content space-around
      .text
        font-size 20px  
    .member-item
      box-shadow 0 0 3px 5px rgba(100, 139, 149, .2)
      border-radius 8px
      background #ffffff
      margin-bottom 20px
      padding-bottom 14px
      text-align center
      cursor pointer
      overflow hidden
      .myself-icon
        top 6px
        right 10px
      .img-wrap
        margin 14px auto
      .id
        font-size 10px
        text-align center
      &.active
        background $color-ssub-theme
        border 1px solid $color-ssub-theme-border
      &.myself
        background $color-ssub-theme
        border 1px solid $color-sub-theme
  .slider-in-active, .slider-out-active
    transition all 0.8s ease 
  .slider-in-enter, .slider-out-active
    transform translateY(300px)
</style>
