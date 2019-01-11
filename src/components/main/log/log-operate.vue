<template>
<Table :height="tableHeight" stripe :columns="Col" :data="operateLogData" :no-data-text='noData' ref="operate"></Table>
</template>

<script>
import * as log from '@/store/types/log'
import mixin from './mixin'

export default {
  mixins: [mixin],
  computed: {
    operateLogData () {
      return this.$store.state.log.operateLogData
    }
  }
}
</script>
