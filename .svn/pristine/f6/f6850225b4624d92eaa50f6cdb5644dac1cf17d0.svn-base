<template>
<Table :height="tableHeight" stripe :columns="Col" :data="gpsLogData" :no-data-text='noData' ref="gps"></Table>
</template>

<script>
import mixin from './mixin'

export default {
  mixins: [mixin],
  computed: {
    gpsLogData () {
      return this.$store.state.log.gpsLogData
    }
  }
}
</script>
