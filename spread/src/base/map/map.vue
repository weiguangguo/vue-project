<template lang="html">
  <pop-wrap title="地图" height="700px" width="700px" v-if="isShow" @closePop="closeMap">
    <div class="container">
      <div class="search-box">
        <input
          v-model="searchKey"
          type="search"
          id="search">
        <button class="btn-search" @click="searchByHand">
          <i class="icon iconfont icon-sousuo"></i>
        </button>
        <button class="btn-sure" @click="sure" v-if="address && searchKey">
          确定
        </button>
        <div class="tip-box" id="searchTip"></div>
      </div>
      <!-- <el-amap-search-box class="search-box" :search-option="searchOption" :on-search-result="onSearchResult"></el-amap-search-box> -->
      <el-amap class="amap-box"
        :amap-manager="amapManager"
        :vid="'amap-vue'"
        :zoom="zoom"
        :plugin="plugin"
        :center="center"
        :events="events"
      >
        <!-- 标记 -->
        <el-amap-marker v-for="(marker, index) in markers" :position="marker" :key="index"></el-amap-marker>
      </el-amap>
    </div>
  </pop-wrap>
</template>

<script>
import popWrap from 'base/pop-wrap/pop-wrap'
import {AMapManager, lazyAMapApiLoaderInstance} from 'vue-amap'
let amapManager = new AMapManager()
export default {
  data () {
    let self = this
    return {
      address: null,
      searchKey: '',
      amapManager,
      markers: [],
      searchOption: {
        city: '全国',
        citylimit: true
      },
      center: [121.329402, 31.228667],
      zoom: 17,
      lng: 0,
      lat: 0,
      loaded: false,
      events: {
        init () {
          // self.initSearch()
          lazyAMapApiLoaderInstance.load().then(() => {
            self.initSearch()
          })
        },
        click (e) {
          // console.log(e)
          self.markers = []
          let { lng, lat } = e.lnglat
          self.lng = lng
          self.lat = lat
          self.center = [lng, lat]
          self.markers.push([lng, lat])
          // 这里通过高德 SDK 完成。
          let geocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: 'all'
          })
          geocoder.getAddress([lng, lat], function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
              if (result && result.regeocode) {
                console.log(result.regeocode.formattedAddress)
                self.address = result.regeocode.formattedAddress
                self.searchKey = result.regeocode.formattedAddress
                self.$nextTick()
              }
            }
          })
        }
      },
      // 一些工具插件
      plugin: [
        // {
        //   pName: 'Geocoder',
        //   events: {
        //     init (o) {
        //       console.log(o.getAddress())
        //     }
        //   }
        // },
        {
          // 定位
          pName: 'Geolocation',
          events: {
            init (o) {
              // o是高德地图定位插件实例
              o.getCurrentPosition((status, result) => {
                if (result && result.position) {
                  // 设置经度
                  self.lng = result.position.lng
                  // 设置维度
                  self.lat = result.position.lat
                  // 设置坐标
                  self.center = [self.lng, self.lat]
                  self.markers.push([self.lng, self.lat])
                  // load
                  self.loaded = true
                  // 页面渲染好后
                  self.$nextTick()
                }
              })
            }
          }
        },
        {
          // 工具栏
          pName: 'ToolBar',
          events: {
            init (instance) {
              // console.log(instance);
            }
          }
        },
        {
          // 鹰眼
          pName: 'OverView',
          events: {
            init (instance) {
              // console.log(instance);
            }
          }
        },
        {
          // 地图类型
          pName: 'MapType',
          defaultType: 0,
          events: {
            init (instance) {
              // console.log(instance);
            }
          }
        },
        {
          // 搜索
          pName: 'PlaceSearch',
          events: {
            init (instance) {
              // console.log(instance)
            }
          }
        }
      ]
    }
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    // lazyAMapApiLoaderInstance.load().then(() => {
    //   this.initSearch()
    // })
  },
  components: {
    popWrap
  },
  methods: {
    initSearch () {
      let vm = this
      let map = this.amapManager.getMap()
      AMapUI.loadUI(['misc/PoiPicker'], function (PoiPicker) {
        var poiPicker = new PoiPicker({
          input: 'search',
          placeSearchOptions: {
            map: map,
            pageSize: 10
          },
          suggestContainer: 'searchTip',
          searchResultsContainer: 'searchTip'
        })
        vm.poiPicker = poiPicker
        // 监听poi选中信息
        poiPicker.on('poiPicked', function (poiResult) {
          console.log(poiResult)
          let source = poiResult.source
          let poi = poiResult.item
          if (source !== 'search') {
            poiPicker.searchByKeyword(poi.name)
          } else {
            poiPicker.clearSearchResults()
            vm.markers = []
            let lng = poi.location.lng
            let lat = poi.location.lat
            let address = poi.cityname + poi.adname + poi.name
            vm.center = [lng, lat]
            vm.markers.push([lng, lat])
            vm.lng = lng
            vm.lat = lat
            vm.address = address
            vm.searchKey = address
          }
        })
      })
    },
    // 关闭
    closeMap () {
      this.$emit('closeMap')
    },
    searchByHand () {
      if (this.searchKey !== '') {
        this.poiPicker.searchByKeyword(this.searchKey)
      }
    },
    sure () {
      let longitude = this.lng
      let latitude = this.lat
      let positionAddress = this.address
      if (positionAddress.length > 15) {
        positionAddress = positionAddress.slice(0, 15) + '...'
      }
      this.$emit('getAddress', {
        longitude,
        latitude,
        positionAddress
      })
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/theme'
.container
  width: 700px
  height: 656px
  position: relative
.search-box
  position: absolute
  z-index: 5
  width: 70%
  left: 13%
  top: 10px
  height: 30px
.search-box input
  float: left
  width: 80%
  height: 100%
  border: 1px solid $mainColor
  padding: 0 8px
  outline: none
.search-box
  .btn-search, .btn-sure
    float: left
    width: 20%
    height: 100%
    background: $mainColor
    border: 1px solid $mainColor
    color: #fff
    outline: none
    cursor: pointer
    &:hover
      background-color: #36dade
      border-color: #36dade
  .btn-search
    width: 50px
    margin-right: 20px
.tip-box
  width: 100%
  max-height:260px
  position: absolute
  top: 30px
  overflow-y: auto
  background-color: #fff
</style>
