<template>
  <div class="save-popup-container">

  <div class="save-popup" ref="savePopupView">
    <div class="save-popup-inner">
      <div class="save-header">
        <span>Save</span>
        <img src="/static/images/icons/svg/btn-close-nor.svg"
             @click="closePopup"
             @mousedown="stopMovable">
      </div>
      <div class="save-body">
        <div class="save-body-inner"
             @mousedown="stopMovable">

          <div class="file-name-text">
            File Name
          </div>
          <div class="file-name-input-area">
            <input ref="inputFileName"
                   placeholder="Please enter the file name.">
          </div>

          <div class="file-type-text">
            File Type
          </div>
          <div class="file-type-select-area">
            <a
              :class="{ active: saveType === TYPE_PNG }"
              @click="typeClicked(TYPE_PNG)">
              <span>{{TYPE_PNG}}</span>
            </a>
            <a
              :class="{ active: saveType === TYPE_JPG }"
              @click="typeClicked(TYPE_JPG)">
              <span>{{TYPE_JPG}}</span>
            </a>
            <!--<a-->
              <!--:class="{ active: saveType === TYPE_NII }"-->
              <!--@click="typeClicked(TYPE_NII)"-->
              <!--class="disabled">-->
              <!--<span>{{TYPE_NII}}</span>-->
            <!--</a>-->
          </div>

          <div class="file-save-button-area">
            <a
              @click="saveButtonClicked()">
              <span>Save</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  </div>

    <button v-shortkey="['enter']" @shortkey="saveButtonClicked()" hidden></button>

  </div>
</template>

<script>
  import {mapState} from 'vuex'

  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'SavePopup',
    computed: {
      ...mapState({
        loadedFile: 'loadedFile',
        showSavePopup: 'showSavePopup'
      })
    },
    data () {
      return {
        saveType: 'png',
        SAVE_SUFFIX: '_LABEL',
        TYPE_PNG: 'png',
        TYPE_JPG: 'jpg',
        TYPE_NII: 'nii'
      }
    },
    created () {
      this.$bus.$on(busType.SHOW_SAVE_POPUP, this.showSavePopupToggle)
    },
    mounted () {
      this.$refs.inputFileName.focus()
    },
    methods: {
      showSavePopupToggle () {
        this.$refs.inputFileName.value = this.loadedFile.name + this.SAVE_SUFFIX + '.' + this.saveType
        setTimeout(() => {
          this.$refs.inputFileName.focus()
          setTimeout(() => { this.$refs.inputFileName.select() }, 50)
        }, 100)
      },
      typeClicked (type) {
        this.saveType = type
        this.$refs.inputFileName.value = this.loadedFile.name + this.SAVE_SUFFIX + '.' + this.saveType
      },
      saveButtonClicked () {
        if (!this.showSavePopup) {
          return
        }
        var inputFileName = this.$refs.inputFileName
        if (inputFileName.value.trim() === '') {
          alert('Please enter the file name.')
          inputFileName.value = this.loadedFile.name + this.SAVE_SUFFIX + '.' + this.saveType
          inputFileName.focus()
          inputFileName.select()
          return
        }
        this.$bus.$emit(busType.SAVE_FILE, {name: inputFileName.value, type: this.saveType})
        this.closePopup(null)
      },
      closePopup (e) {
        this.$bus.$emit(busType.SHOW_SAVE_POPUP, false)
        if (e) {
          e.stopPropagation()
        }
      },
      stopMovable (e) {
        e.stopPropagation()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../style/bh_style.scss";

  .save-popup-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(1, 1, 1, .5);
    z-index: 2001;
    cursor: default;
  }

  .save-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -172px;
    margin-left: -179px;
    width: 344px;
    height: 358px;
    box-shadow: 5px 5px 30px black;
    border-radius: 5px;
    opacity: 1;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    .save-popup-inner {
      width: 100%;
      height: 100%;
      background-color: #27262c;
      border-radius: 5px;
      overflow: hidden;
      border-radius: 5px;
      opacity: 1;

      .save-header {
        margin-left: 15px;
        width: 100%;
        height: 48px;
        cursor: default;

        span {
          position: relative;
          top: 10px;
          font-size: 15px;
          vertical-align: middle;
          color: #e3e3e3;
          font-weight: bold;
        }

        img {
          vertical-align: middle;
          margin-right: 15px;
          width: 48px;
          height: 48px;
          float: right;

          &:hover {
            cursor: pointer;
            background-color: $button-over-color;
          }
        }
      }

      .save-body {
        position: absolute;
        width: 100%;
        top: 48px;
        bottom: 0;
        background-color: #413f47;
        overflow-y: auto;
        overflow-x: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        div.save-body-inner {
          margin-top: 21px;
          margin-left: 28px;
          width: 285px;
          height: 98px;

          .file-name-text {
            width: 67px;
            height: 18px;
            font-family: AppleSDGothicNeo;
            font-size: 15px;
            font-weight: bold;
            line-height: 1.2;
            text-align: left;
            color: #cfcfcf;
          }

          .file-name-input-area {
            margin-top: 9px;
            width: 292px;
            height: 48px;
            border-radius: 4px;
            background-color: #ffffff;

            input {
              padding: 14px 15px;
              margin-top: 3px;
              margin-left: 4px;
              width: 284px;
              height: 42px;
              border: none;
              font-size: 15px;
            }
          }

          .file-type-text {
            margin-top: 21px;
            width: 67px;
            height: 18px;
            font-family: AppleSDGothicNeo;
            font-size: 15px;
            font-weight: bold;
            line-height: 1.2;
            text-align: left;
            color: #cfcfcf;
          }

          .file-type-select-area {
            margin-left: 1px;
            margin-top: 9px;
            width: 292px;
            height: 58px;

            a {
              display: inline-block;
              width: 143.5px;
              height: 58px;
              border-radius: 4px;
              background-color: #333236;

              span {
                position: absolute;
                margin-left: 60px;
                margin-top: 21px;
                width: 24px;
                height: 18px;
                font-family: AppleSDGothicNeo;
                font-size: 15px;
                font-weight: 500;
                line-height: 1.2;
                text-align: center;
                color: #cfcfcf;
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
            a.disabled {
              pointer-events: none;
            }
          }

          .file-save-button-area {
            margin-top: 24px;
            width: 292px;
            height: 58px;

            a {
              display: inline-block;
              width: 292px;
              height: 58px;
              border-radius: 4px;
              background-color: #583edb;

              &:hover {
                background-color: #524d6a;
              }
              &:active {
                background-color: #120a38;
              }

              span {
                position: absolute;
                margin-left: 130px;
                margin-top: 20px;
                width: 32px;
                height: 18px;
                font-family: AppleSDGothicNeo;
                font-size: 15px;
                font-weight: bold;
                line-height: 1.2;
                text-align: left;
                color: #cfcfcf;
              }
            }
          }
        }
      }
    }
  }

</style>
