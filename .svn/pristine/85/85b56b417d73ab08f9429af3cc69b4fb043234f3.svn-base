<template>
  <div class="right-menu-wrap pa" :style="menuPosition">
    <Card shadow class="card" :padding="0">
      <p class="line" style="line-height: 30px;cursor: pointer;padding: 0 10px" @click.stop="setDefaultCenter">{{languageCtx.setDefaultPoint}}</p>
      <p class="line" style="line-height: 30px;cursor: pointer;padding: 0 10px" @click.stop="moveToDefaultPoint">{{languageCtx.moveToDefaultPoint}}</p>
    </Card>
  </div>
</template>

<script>
import mixin from './mixin'
export default {
  name: 'RightMenu',
  mixins: [mixin],
  computed: {
    menuPosition () {
      return this.position
    },
  },
  data () {
    return {
      position: {
        left: 0,
        top: 0
      }
    }
  },
  methods: {
    setDefaultCenter() {
      this.$emit('on-set-defaut')
    },
    moveToDefaultPoint() {
      this.$emit('on-move')
    }
  }
}
</script>

<style lang="stylus" scoped>
.card
  padding 10px 0
.line
  line-height 30px
  transition all .2s
  cursor pointer
  padding-left 0 10px
  &:hover
    background #f5f5f5
</style>
