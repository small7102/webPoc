import * as map from '../types/map'

export default {
  state: {
    GPSList: [],
    mapTempMemberList: [],
    hasMapTempGroup: false,
    gpsPoint: null,
    isToCenter: false
  },
  getters: {
    GPSList: state => state.GPSList,
    mapTempMemberList: state => state.mapTempMemberList,
    hasMapTempGroup: state => state.hasMapTempGroup
  },
  mutations: {
    [map.SetGPSList] (state, newState) {
      state.GPSList = newState
    },
    [map.SetMapTempMemberList] (state, newState) {
      state.mapTempMemberList = newState
    },
    [map.SetHasMapTempGroup] (state, bool) {
      state.hasMapTempGroup = bool
    },
    [map.SetGpsPoint] (state, obj) {
      state.gpsPoint = obj
    },
    [map.SetIsToCenter] (state, newState) {
      state.isToCenter = newState
    }
  }
}
