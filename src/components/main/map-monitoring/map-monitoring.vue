<template>
<div class="map-wrap pr h100">
  <div class="map-container h100" id="map" @mousedown="handleStartDrag" @mouseup="handleEndDrag">
  </div>
  <right-menu ref="menu"
              v-if="isMenuShow"
              @on-set-defaut="setDefaultCenter"
              @on-move="handleMoveToDefaultPoint"/>
</div>
</template>

<script>
import {passiveEvent} from '@/utils/compatible'
import TempMember from './temp-member'
import {filterObjArrByKey} from '@/utils/utils'
import * as map from '@/store/types/map'
import * as app from '@/store/types/app'
import RightMenu from './right-menu'
import mixin from './mixin'
import storeMixin from '@/store/mixins/mixin'
import Storage from '@/utils/localStorage'
// import MarkerWithLabel from '@/libs/marker-label'
// const MarkerWithLabel = google && require('../../../libs/marker-label.js')

export default {
  name: 'MapMonitoring',
  components: {TempMember, RightMenu},
  mixins: [mixin, storeMixin],
  computed: {
    shapeStyle () {
      return {
        top: `${this.shapeTop}px`,
        left: `${this.shapeLeft}px`,
        width: `${this.shapeWidth}px`,
        height: `${this.shapeHeight}px`
      }
    },
  },
  data () {
    return {
      shapeOriginPoint: null,
      direction: null,
      shapeDivOriginPoint: null,
      moveEv: null,
      shapeTop: 0,
      shapeLeft: 0,
      shapeWidth: 0,
      shapeHeight: 0,
      gPoints: []
    }
  },
  mounted() {
    this.mapContainer = document.getElementById('map')
    this.initMap()
  },
  methods: {
    initMap () {
        const MarkerWithLabel = google && require('../../../libs/marker-label.js')
        this.centerPoint = this.arrLnglatToObjLatlng(this.centerPoint)
        this.map = new google.maps.Map(this.mapContainer, {
          zoom: 13,
          gestureHandling: 'greedy',
          center: this.centerPoint || {lat: 39.989628, lng: 116.480983}
        })
        this.map.addListener('rightclick', (rightEvent) => {
          this.isDragShape = false
          this.getRightMenu(rightEvent)
          this.map.setOptions({
            draggable: true
          })
        })
        this.map.addListener('click', (ev) => {
          this.isMenuShow = false
        })

        this.map.addListener('mousemove', (ev) => {
          if (this.isDragShape && !this.isMenuShow) {
            if (this.dragStartTime === 0) {
              this.shapeOriginPoint = {lat: ev.latLng.lat(), lng: ev.latLng.lng()}
              this.dragBounds = {north: ev.latLng.lat(), south: ev.latLng.lat(), east: ev.latLng.lng(), west: ev.latLng.lng()}
              this.dragStartTime = this.getTimeNow()
            }
            else {
              if (this.dragShape) this.clearShape()
              this.dragDirection(ev.latLng.lat(), this.shapeOriginPoint.lat, ev.latLng.lng(), this.shapeOriginPoint.lng)
            }
              this.dragShape = this.createShape({bounds: this.dragBounds})

              this.dragEv = ev
          }
        })
        this.setMarkers()
    },
    dragDirection (nowLat, prevLat, nowLng, prevLng) {
      if (nowLat - prevLat > 0 && nowLng - prevLng > 0) {
        this.dragBounds = {north: nowLat, south: this.shapeOriginPoint.lat, east: nowLng, west: this.shapeOriginPoint.lng}
      } else if (nowLat - prevLat > 0 && nowLng - prevLng <= 0) {
        this.dragBounds = {north: nowLat, south: this.shapeOriginPoint.lat, east: this.shapeOriginPoint.lng, west: nowLng}
      } else if (nowLat - prevLat <= 0 && nowLng - prevLng <= 0) {
        this.dragBounds = {north: this.shapeOriginPoint.lat, south: nowLat, east: this.shapeOriginPoint.lng, west: nowLng}
      } else {
        this.dragBounds = {north: this.shapeOriginPoint.lat, south: nowLat, east: nowLng, west: this.shapeOriginPoint.lng}
      }
    },
    addMarker (point, isAlarm) {
      if (point && this.map) {
        let name = this.allMembersObj[point.mid].name
        let marker = new MarkerWithLabel({
          position: {lat: point.lat, lng: point.lng},
          map: this.map,
          icon: isAlarm ? this.redIconImage : this.iconImage,
          title: point.mid,
          labelContent: name,
          labelAnchor: new google.maps.Point(-18, 48),
          labelClass: "marker-info"
        })
        this.gPoints.push(marker)
      }
    },
    setMapOnAll (map) {
      for (let marker of this.markers) {
        marker.setMap(map)
      }
    },
    clearMarkers () {
      this.setMapOnAll(null)
    },
    createShape ({bounds, fillOpacity = 0.35}) {
      return new google.maps.Rectangle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: fillOpacity,
        map: this.map,
        bounds: bounds || this.map.getBounds(),
      })
    },
    handleStartDrag (ev) {
      this.startDrag(ev).then(() => {
        this.map.setOptions({
            draggable: false
        })
      })
    },
    handleEndDrag (ev) {
      if ((ev.button === 2 && this.isDragShape) && this.dragEv) {
        this.dragDirection(this.dragEv.latLng.lat(), this.shapeOriginPoint.lat, this.dragEv.latLng.lng(), this.shapeOriginPoint.lng)
        this.endDrag(ev, 'PART').then(() => {
          this.map.setOptions({
            draggable: true
          })
        })
      }
    },
    arrLnglatToObjLatlng (point) {
      if (point && Array.isArray(point)) {
          return new google.maps.LatLng(point[1], point[0])
      } else {
        return point
      }
    },
    handleMoveToDefaultPoint () {
      this.moveToDefaultPoint().then((point) => {
        this.map.panTo(this.arrLnglatToObjLatlng(point))
      }).catch(() => {
        this.messageAlert('warning', this.languageCtx.noDefaultCenterPoint)
      })
    },
    filterRenderMarker (point) {
      let gIndex
      let _point = this.map && this.gPoints.find((item, index) => {
        if (item.title === point.mid) gIndex = index
        return (item.title === point.mid) || (item.title === point)
      })
      let newIsAlarm = typeof point !== 'string' && this.isAlarm(point)
      if (_point) {
        _point.setMap(null)
        this.gPoints.splice(gIndex, 1)
      }
      return {new: point, old: _point, newIsAlarm}
    }
  },
  watch: {
    gpsPoint (point, oldPoint) {
      if (this.map) {
        this.$store.commit(app.SetAppLoading, false)
        let list = [...this.GPSList]
        if (!oldPoint && typeof point !== 'string') {
          this.addMarker(point, this.isAlarm(point))
          this.map.panTo({lat: point.lat, lng: point.lng})
          list.push(point)
        } else {
          let pointObj = this.filterRenderMarker(point)
          if (pointObj.old) {
            list = list.filter(item => {
              return item.mid !== point.mid
            })
            typeof point !== 'string' && list.push(point)
          }
          typeof point !== 'string' && this.addMarker(pointObj.new, pointObj.newIsAlarm)
          if (this.gPoints.length === 1) {
            this.map.panTo({lat: this.gPoints[0].position.lat(), lng: this.gPoints[0].position.lng()})
          }
        }
        this.GPSList =list
      } else {
        this.$store.commit(app.SetAppLoading, true)
      }
    },
    isToCenter (val) {
      if (val && val.isPan) {
        this.map.panTo({lat: val.point.lat, lng: val.point.lng})
        this.isToCenter = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  .select-shape
    background rgba(251, 25, 10, .3)
    border 2px solid rgb(251, 25, 10)
    width 0
    height 0
    z-index 10
  .marker-info
    background #ffffff
    border-radius 3px
    padding 2px 5px
</style>
