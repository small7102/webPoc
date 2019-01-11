<template>
  <div class="wrap">
    <Modal
        v-model="isModalShow"
        :title="title"
        width="400"
        footer-hide
        class-name="vertical-center-modal"
        >
        <Form ref="formInline">
          <FormItem>
            <RadioGroup v-model="callingStatus">
              <div class="line mt5">
                <Radio label="activation">{{languageCtx.callsetInfo['8']}}</Radio>
              </div>
              <div class="line mt5">
                <Radio label="noCalling">{{languageCtx.callsetInfo['1']}}</Radio>
              </div>
              <div class="line mt5">
              <Radio label="noListenAndCalling">{{languageCtx.callsetInfo['0']}}</Radio>
              </div>
            </RadioGroup>
          </FormItem>
          <FormItem :style="{textAlign: 'center'}">
            <Button type="primary" class="btn" @click="handleSubmit()">{{languageCtx.submitText}}</Button>
          </FormItem>
        </Form>
    </Modal>
  </div>
</template>

<script>
import * as group from '@/store/types/group'
import * as log from '@/store/types/log'
import {codeConfig} from '@/libs/codeConfig'
import mixin from './mixin'
export default {
  name: 'CallingStatus',
  mixins: [mixin],
  props: {
    member: Object,
  },
  computed: {
    membersObj: {
      get () {
        return this.$store.getters.memberList
      },
      set (val) {
        this.$store.commit(group.SetMemberList, val)
      }
    },
    user () {
      return this.$store.state.user.userInfo
    },
    allMembersObj: {
      get () {
        return this.$store.state.group.allMembersObj
      },
      set (val) {
        this.$store.commit(group.SetAllMembersObj, val)
      }
    }
  },
  data () {
    return {
      isModalShow: false,
      callingStatus: '',
      title: ''
    }
  },
  methods: {
    handleSubmit () {
      let callsetCode = this.changeKey()
      this.$store.dispatch(group.SetCallSet, {
        gid: this.member.grp,
        mid: this.member.cid,
        type: callsetCode
      })
      .then(() => {
        let obj = {...this.member, callset: this.changeKey()}
        let list = this.membersObj[this.member.grp]
        const newList = list.map(item => {
          let value = {...item}
          if (value.cid === obj.cid) value = obj
          return value
        })
        this.membersObj = {item: newList, gid: obj.grp}

        // 更改所有成员对象该成员的callset
        let allMembersObj = {...this.allMembersObj}
        allMembersObj[obj.cid] = obj
        this.allMembersObj = allMembersObj

        this.isModalShow = false
        this.$store.commit(log.SaveLog, {
          account: this.user.msId,
          name: this.user.msName,
          type: codeConfig.callsetNotice,
          remark: `${this.member.name}${this.getDescStatus()}`
        })
        this.$emit('on-over')
        this.messageAlert('success', this.languageCtx.setSuccess)
      })
      .catch((code) => {
        console.log(code)
        this.isModalShow = false
        this.messageAlert('warning', this.languageCtx.setFailure)
        this.$emit('on-over')
      })
    },
    initInfo () {
      this.callingStatus = this.member.callset === '8' ? 'activation' : this.member.callset === '0' ? 'noListenAndCalling' : 'noCalling'
      this.title = `${this.member.name}${this.languageCtx.callsetInfo.title}`
    },
    changeKey () {
      return this.callingStatus === 'activation' ? '8' : this.callingStatus === 'noListenAndCalling' ? '0' : '1'
    },
    getDescStatus () {
     return this.languageCtx.callsetInfo[this.member.callset]
    }
  },
  watch: {
    isModalShow (val) {
      val && this.initInfo()
    }
  }
}
</script>

