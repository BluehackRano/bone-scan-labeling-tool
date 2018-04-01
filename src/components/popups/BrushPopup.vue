<template>
  <vue-draggable-resizable
    class="brush-popup"
    :parent="true"
    :resizable="false"
    :x="0" :y="320" :z="2000"
    :w="344" :h="424">
    <div class="brush-popup-inner">
      <div class="brush-header">
        <span>Brush</span>
      </div>
      <div class="brush-body">
        <div class="brush-body-top"
             @mousedown="stopMovable">
          <a
            :class="{ active: brush.radius === BRUSH_SMALL }"
            @click="brushClicked('s')">
            <img :src="`/static/images/icons/svg/img-size-small.svg`">
          </a>
          <a
            :class="{ active: brush.radius === BRUSH_MEDIUM }"
            @click="brushClicked('m')">
            <img :src="`/static/images/icons/svg/img-size-medium.svg`">
          </a>
          <a
            :class="{ active: brush.radius === BRUSH_LARGE }"
            @click="brushClicked('l')">
            <img :src="`/static/images/icons/svg/img-size-large.svg`">
          </a>
        </div>

        <div class="divider"></div>

        <div class="brush-body-mid"
             @mousedown="stopMovable">
          <a
            @click="brushSizeDown()">
            <img :src="`/static/images/icons/svg/btn-size-down.svg`">
          </a>
          <div>
            <span>{{brush.radius}}</span>
          </div>
          <a
            @click="brushSizeUp()">
            <img :src="`/static/images/icons/svg/btn-size-up.svg`">
          </a>
        </div>

        <div class="divider"></div>

        <div class="brush-body-bottom"
             ref="brushBodyBottomDiv"
             @mousedown="stopMovable">
          <template v-for="(aColors, anIndex) in colors">
            <template v-for="(color, index) in aColors">
              <div
                :style="{ backgroundColor: colors[anIndex][index], gridRow: (anIndex+1), gridColumn: (index+1) }"
                @click="colorClicked($event, anIndex, index)"></div>
            </template>
          </template>
        </div>

      </div>
    </div>
  </vue-draggable-resizable>
</template>

<script>
  import {mapState} from 'vuex'

  import * as busType from '@/util/bus/bus-types'
  import * as mutationType from '@/store/mutation-types'

  export default {
    name: 'BrushPopup',
    computed: {
      ...mapState({
        brush: 'brush'
      })
    },
    data () {
      return {
        BRUSH_SMALL: 3,
        BRUSH_MEDIUM: 7,
        BRUSH_LARGE: 15,
        colors: [
          ['rgb(56,117,30)', 'rgb(152,18,0)', 'rgb(255,37,0)', 'rgb(255,153,0)', 'rgb(255,251,1)', 'rgb(6,249,0)', 'rgb(1,253,255)'],
          ['rgb(74,133,232)', 'rgb(5,50,255)', 'rgb(153,55,255)', 'rgb(255,64,255)', 'rgb(153,154,95)', 'rgb(136,83,24)', 'rgb(128,128,128)'],
          ['rgb(254,229,153)', 'rgb(139,205,255)', 'rgb(255,0,100)', 'rgb(189,255,0)', 'rgb(29,103,157)', 'rgb(255,152,191)', 'rgb(112,0,106)'],
          ['rgb(0,209,88)', 'rgb(213,166,189)', 'rgb(154,151,255)', 'rgb(219,95,0)', 'rgb(223,0,102)', 'rgb(115,26,71)', 'rgb(255,255,255)']
        ]
      }
    },
    mounted () {
      this.getColorClickedImg(0, 0)
    },
    methods: {
      brushClicked (size) {
        if (size === 's') {
          this.$store.commit(mutationType.SET_BRUSH_RADIUS, this.BRUSH_SMALL)
        } else if (size === 'm') {
          this.$store.commit(mutationType.SET_BRUSH_RADIUS, this.BRUSH_MEDIUM)
        } else if (size === 'l') {
          this.$store.commit(mutationType.SET_BRUSH_RADIUS, this.BRUSH_LARGE)
        }
      },
      brushSizeDown () {
        this.$store.commit(mutationType.DOWN_BRUSH_RADIUS, null)
      },
      brushSizeUp () {
        this.$store.commit(mutationType.UP_BRUSH_RADIUS, null)
      },
      colorClicked (e, col, row) {
        this.clearColorClickedImg()
        this.getColorClickedImg(row, col)
        this.$store.commit(mutationType.SET_BRUSH_COLOR, this.colors[col][row])
      },
      clearColorClickedImg () {
        this.$refs.brushBodyBottomDiv.removeChild(document.getElementById('color-clickec-img'))
      },
      getColorClickedImg (col, row) {
        var img = document.createElement('img')
        img.setAttribute('id', 'color-clickec-img')
        img.setAttribute('src', '/static/images/icons/svg/img-color-select.svg')
        img.style.gridColumn = col + 1
        img.style.gridRow = row + 1
        this.$refs.brushBodyBottomDiv.appendChild(img)
      },
      closePopup (e) {
        this.$bus.$emit(busType.SHOW_BRUSH_POPUP, false)
        e.stopPropagation()
      },
      stopMovable (e) {
        e.stopPropagation()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../style/bh_style.scss";

  .brush-popup {
    box-shadow: 5px 5px 30px black;
    border-radius: 5px;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    .brush-popup-inner {
      width: 100%;
      height: 100%;
      background-color: #282828;
      border-radius: 5px;
      overflow: hidden;
      border-radius: 5px;

      .brush-header {
        margin-left: 15px;
        width: 100%;
        height: 48px;
        cursor: move;

        span {
          position: relative;
          top: 10px;
          font-size: 15px;
          vertical-align: middle;
          color: #e3e3e3;
          font-weight: bold;
        }
      }

      .brush-body {
        position: absolute;
        width: 100%;
        top: 48px;
        bottom: 0;
        background-color: #413f47;
        overflow-y: auto;
        overflow-x: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        cursor: default;

        div.divider {
          margin-top: 5px;
          margin-left: 41px;
          width: 262px;
          height: 2px;
          background-color: #383838;
        }

        div.brush-body-top {
          margin-top: 21px;
          margin-left: 28px;
          width: 285px;
          height: 98px;

          a {
            display: inline-block;
            width: 92px;
            height: 98px;
            border-radius: 5px;
            background-color: #333236;

            img {
              margin: 12px 11px;
            }

            &:hover {
              background-color: $button-over-color;
            }
            &:active {
              background-color: $button-select-color;
            }
          }
          a.active {
            background-color: $button-select-color;
          }
        }

        div.brush-body-mid {
          margin-top: 5px;
          margin-left: 28px;
          width: 285px;
          height: 48px;

          a {
            display: inline-block;
            width: 92px;
            height: 48px;
            border-radius: 5px;
            background-color: #333236;

            img {
              margin: 6px 28px;
            }

            &:hover {
              background-color: $button-over-color;
            }
            &:active {
              background-color: $button-select-color;
            }
          }
          a.active {
            background-color: $button-select-color;
          }

          div {
            display: inline-block;
            margin-left: 4px;
            margin-right: 4px;
            margin-bottom: 5px;
            width: 84px;
            height: 38px;
            background-color: #1c1a1f;
            border: solid 2px #333236;

            span {
              position: absolute;
              margin-top: 10px;
              width: 84px;
              height: 18px;
              font-family: AppleSDGothicNeo;
              font-size: 15px;
              font-weight: 500;
              line-height: 1.2;
              text-align: center;
              color: #7a7a7a;
              vertical-align:middle;
            }
          }
        }

        div.brush-body-bottom {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(4, 1fr);
          margin-top: 1.5px;
          margin-left: 26px;
          width: 287px;
          height: 164px;

          div {
            margin: 3.5px;
            width: 34px;
            height: 34px;
            border-radius: 4px;
            cursor: pointer;
          }
        }
      }
    }
  }

</style>
