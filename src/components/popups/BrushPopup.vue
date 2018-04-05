<template>
  <vue-draggable-resizable
    class="brush-popup"
    :parent="true"
    :resizable="false"
    :x="0" :y="320" :z="2000"
    :w="242" :h="390">
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
          ['rgba(56,117,30,255)', 'rgba(152,18,0,255)', 'rgba(255,37,0,255)', 'rgba(255,153,0,255)', 'rgba(255,251,1,255)'],
          ['rgba(6,249,0,255)', 'rgba(1,253,255,255)', 'rgba(74,133,232,255)', 'rgba(5,50,255,255)', 'rgba(153,55,255,255)'],
          ['rgba(255,64,255,255)', 'rgba(153,154,95,255)', 'rgba(136,83,24,255)', 'rgba(128,128,128,255)', 'rgba(255,255,255,255)']
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
          margin-left: 16px;
          width: 210px;
          height: 2px;
          background-color: #383838;
        }

        div.brush-body-top {
          margin-top: 21px;
          margin-left: 12px;
          width: 220px;
          height: 98px;

          a {
            display: inline-block;
            width: 70px;
            height: 98px;
            border-radius: 5px;
            background-color: #333236;

            img {
              margin-top: 12px;
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
          margin-left: 12px;
          width: 220px;
          height: 48px;

          a {
            display: inline-block;
            width: 63px;
            height: 48px;
            border-radius: 5px;
            background-color: #333236;

            img {
              margin: 6px 14px;
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
            margin-left: 0;
            margin-right: 0;
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
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(3, 1fr);
          margin-top: 3px;
          margin-left: 12px;
          width: 220px;
          height: 135px;

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
