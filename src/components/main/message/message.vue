<template>
  <div class="message-wrap">
    <Modal
        v-model="isModalShow"
        :title="title"
        width="500"
        footer-hide
        class-name="vertical-center-modal"
        >
        <Form ref="formInline">
          <FormItem prop="name">
          <Input autofocus 
                 type="textarea"
                 :placeholder="placeholder"
                 :rows="4"
                 size="large"
                 v-model="sendingMessage"
                 @on-keydown.stop="forbidTriggleVoice"/>
          </FormItem>
          <FormItem :style="{textAlign: 'right'}">
            <Button type="primary" @click="handleSendMessage" class="btn">{{this.languageContext.messageModal.submitText}}</Button>
          </FormItem>
        </Form>
    </Modal>
  </div>
</template>

<script>
import mixin from '@/store/mixins/message'

export default {
  name: 'Message',
  props: {
    member: Object
  },
  computed: {
    placeholder () {
      return this.languageContext.messageModal.placeholder
    },
    title () {
      return `${this.languageContext.messageModal.title}${this.toName}`
    }
  },
  mixins: [mixin],
  data () {
    return {
      isModalShow: false,
      formInline: {
        message: ''
      },
      toName: ''
    }
  },
  watch: {
    member (val) {
      if (val) {
        this.toName = `To ${this.member.name}`
      }
    },
    mapTempMemberList (list) {
      if (list && list.length === 1) {
        this.toName = `To ${list[0].name}`
      } else {
        this.toName = ''
      }
    },
    isModalShow (val) {
      if (!val) this.sendingMessage = ''
    }
  }
}
</script>

