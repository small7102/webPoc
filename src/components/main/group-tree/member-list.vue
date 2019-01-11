<template>
  <div class="member-wrap" :style="paddingLeftStyle">
    <CheckboxGroup v-model="selectList">
    <div v-for="(item, index) in memberList" 
          class="item flex align-center between" 
          :key="index" 
          :id="item.cid"
          :class="getActiveClass(item.cid, selectList)"
          :draggable="draggable"
          @click="selectItem(item.cid)"
          @dragstart="handleDragstart(item)"
          @dragend="handleDragend"
          >
          <div class="left flex align-center">
            <Checkbox :label="item.cid" class="label">
            </Checkbox>
            <img v-if="item.cid === user.msId" :src="myIcon" alt="" class="img">
            <img v-else :src="iconImg(item)" alt="" class="img">
            <span class="name">{{item.name}}</span>
          </div>
          <div class="right" @click.stop=""
                             @mouseover="selectMember = item"
                             >
              <span :title="languageCtx.gpsTitle">
                <Icon type="md-pin" color="#4f90ef" size="13" v-if="item.online === '1' && allMembersObj && allMembersObj[item.cid].gps" @click="moveToCenter(allMembersObj[item.cid].gps)"/>
              </span>
              <span>
                <Icon type="md-mic-off" 
                      size="13" 
                      color="#ff633e" 
                      class="status" 
                      v-if="item.callset==='1' && item.grp === user.gId" 
                      :title="languageCtx.callsetInfo['1']"/>
                <Icon type="ios-remove-circle-outline" 
                      size="13" 
                      class="status no-calling-listening" 
                      color="#ff633e" v-if="item.callset==='0' && item.grp === user.gId" 
                      :title="languageCtx.callsetInfo['0']"/>
              </span>
              <span @mouseover="handleMouseover">
                <Icon type="md-more"/>
              </span>
          </div>
    </div>
    </CheckboxGroup>
  </div>
</template>

<script>
import language from './mixin'
import mixin from '@/store/mixins/mixin'
import * as types from '@/store/types/group'
import * as app from '@/store/types/app'
import * as map from '@/store/types/map'
import * as log from '@/store/types/log'
import { uniqueArr, filterArrByKey, filterObjArrByKey } from '@/utils/utils'
import {codeConfig} from '@/libs/codeConfig'
const ADD_MEMBER = 0
export default {
  name: 'MemberList',
  mixins: [mixin, language],
  props: {
    gid: String,
    paddingLeftStyle: {
      type: Object,
      default: () => {
        return {
          paddingLeft: '24px'
        }
      }
    }
  },
  computed: {
    selectList: {
      get () {
        return this.$store.getters.treeGroupSelectedList
      },
      set (val) {
        this.$store.commit(types.SetTreeGroupSelectedList, val)
      }
    },
    draggable () {
      return this.tempGroupInfo && this.tempGroupInfo.creatType !== 'SINGLE_TEMP_GROUP'
    },
    dragingMember: {
      get () {
        return this.$store.state.group.dragingMember
      },
      set (val) {
        this.$store.commit(types.SetDragingMember, val)
      }
    },
    tempGroupInfo: {
      get () {
        return this.$store.getters.tempGroupInfo
      },
      set (val) {
        this.$store.commit(types.SetTempGroupInfo, val)
      }
    },
    singleCallActiveCid: {
      get () {
        return this.$store.getters.singleCallActiveCid
      },
      set (val) {
        this.$store.commit(types.SetSingleCallActiveCid, val)
      }
    }
  },
  data () {
    return {
      tempList: [],
      selectListLength: 0,
      selectMember: null,
      memberList: [],
      membersWrap: null
    }
  },
  mounted () {
    this.handleDragDrop()
  },
  methods: {
    hasCid (cid, list) {
      return list.some(item => {
          return item === cid
      })
    },
    getActiveClass (cid, list) {
      if (list) {
        let hasCid = this.hasCid(cid, list)
        return hasCid ? 'active' : ''
      } else {
        return true
      }
    },
    getScrollDistance (list) {
      if (list.length && this.$store.getters.isSearch) {
        let element = document.getElementById(list[0])
        let distance = 0
        while (element && element.offsetParent && element.offsetParent.id !== 'treeScroll') {
          distance += element.offsetTop
          element = element.offsetParent
        }
        this.$emit('on-scroll', distance)
      }
    },
    selectItem(cid) {
      let newArr = [...this.selectList]
      let hasCid = this.hasCid(cid, newArr)
      if (!hasCid) {
        newArr.push(cid)
      } else {
        let index = newArr.indexOf(cid)
        newArr.splice(index, 1)
      }
      this.$store.commit(types.SetTreeGroupSelectedList, newArr)
    },
    handleMouseover (ev) {
      this.$emit('on-hover', {top: ev.y, item: this.selectMember, show: true})
    },
    handleDragstart (item) {
      if (item.cid !== this.user.msId) {
        if (!this.selectList.length) {// 直接拖拉一个
          let hasThisMember = this.tempGroupInfo.cids.some(cid => {
            return cid === item.cid
          })
          if (!hasThisMember) {
            this.dragingMember = item
          }
        } else {
          this.dragingMember = this.selectList
        }
      }
    },
    handleDragDrop () {
      this.membersWrap = document.getElementById('membersWrap')
      if (this.membersWrap) {
        this.membersWrap.ondrop = (ev) => {
          this.editingTempGroup()
        }
        this.membersWrap.ondragover = ev => {
          ev.preventDefault()
        }
      }
    },
    handleDragend () {
      this.dragingMember = null
    },
    editingTempGroup () {
      let counts, mids, member
      if (this.dragingMember) {
        if (!Array.isArray(this.dragingMember)) {
          counts = 1,
          mids = this.dragingMember.cid
          member = this.allMembersObj[mids].name
        } else {
          counts = this.dragingMember.length
          mids = this.dragingMember.join(',')
          member = this.dragingMember.map(cid => {
            return this.allMembersObj[cid].name
          })
          member = member.join(',')
        }
        this.$store.dispatch(types.EditTempGroup, {type: ADD_MEMBER, counts, mids})
        .then((res) => {
          this.messageAlert('success', this.languageCtx.addSuccess)
          this.getTempGroupInfo(res, 'TEMP_GROUP')
          this.$store.commit(log.SaveLog, {
            account: this.user.msId,
            name: this.user.msName,
            type: codeConfig.editTempGroupNotice,
            remark: `${this.languageCtx.add}${member}`
          })
          this.dragingMember = null
          this.selectList = []
        })
        .catch(error => {
          console.log(error)
          this.messageAlert('warning', this.languageCtx.addFailure)
          this.dragingMember = null
          this.selectList = []
        })
      }
    },
    moveToCenter (point) {
      this.$store.commit(map.SetIsToCenter, {isPan: true, point})
    }
  },
  watch: {
    selectList (list) {
      this.getScrollDistance(list)
    },
    memberObj (list) {
      this.memberList = this.memberObj[this.gid]
    },
    "$route" (val) {
      if (val && val.name === 'home') {
        this.handleDragDrop()
      }
    }
  }
}
</script>

<style lang="stylus">
  @import './reset.styl'
</style>

<style lang="stylus" scoped>
@import '../../../assets/styles/variable.styl';
.member-wrap
  line-height: 40px
  .right-menu
    right 0
    top 50px
    height 300px
    width 100px
  .item
    padding 0 10px
    text-align left
    cursor pointer
    margin-bottom 3px
    .left 
      width 140px
      overflow hidden
      text-overflow ellipsis
      white-space nowrap     
    &.active
      background $color-theme-light-l
    &:hover
      background $color-theme-light-ll
    .img
      width 20px
      margin-right 5px
    .status
      cursor default
    .no-calling-listening
      font-weight bold !important
  .label
    font-size 0
</style>
