<template>
  <vue-draggable-resizable
    class="eraser-popup"
    :parent="true"
    :resizable="false"
    :x="0" :y="320" :z="2000"
    :w="242" :h="186"
    :minw="242" :minh="186">
    <div class="eraser-popup-inner">
      <div class="eraser-header">
        <span>Eraser</span>
      </div>
      <div class="eraser-body">
        <div class="eraser-body-inner"
             @mousedown="stopMovable">
          <a
            :class="{ active: eraser.radius === ERASER_SMALL }"
            @click="eraserClicked('s')">
            <img :src="`/static/images/icons/svg/img-size-small.svg`">
          </a>
          <a
            :class="{ active: eraser.radius === ERASER_MEDIUM }"
            @click="eraserClicked('m')">
            <img :src="`/static/images/icons/svg/img-size-medium.svg`">
          </a>
          <a
            :class="{ active: eraser.radius === ERASER_LARGE }"
            @click="eraserClicked('l')">
            <img :src="`/static/images/icons/svg/img-size-large.svg`">
          </a>
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
    name: 'EraserPopup',
    computed: {
      ...mapState({
        eraser: 'eraser'
      })
    },
    data () {
      return {
        ERASER_SMALL: 5,
        ERASER_MEDIUM: 15,
        ERASER_LARGE: 30
      }
    },
    methods: {
      eraserClicked (size) {
        if (size === 's') {
          this.$store.commit(mutationType.SET_ERASER_RADIUS, this.ERASER_SMALL)
        } else if (size === 'm') {
          this.$store.commit(mutationType.SET_ERASER_RADIUS, this.ERASER_MEDIUM)
        } else if (size === 'l') {
          this.$store.commit(mutationType.SET_ERASER_RADIUS, this.ERASER_LARGE)
        }
      },
      closePopup (e) {
        this.$bus.$emit(busType.SHOW_ERASER_POPUP, false)
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

  .eraser-popup {
    box-shadow: 5px 5px 30px black;
    border-radius: 5px;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    .eraser-popup-inner {
      width: 100%;
      height: 100%;
      background-color: #282828;
      border-radius: 5px;
      overflow: hidden;
      border-radius: 5px;

      .eraser-header {
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

      .eraser-body {
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

        div.eraser-body-inner {
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
      }
    }
  }

</style>
