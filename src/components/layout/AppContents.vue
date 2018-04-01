<template>
  <div class="app-main">
    <router-view></router-view>

    <eraser-popup
      v-show="showEraserPopup">
    </eraser-popup>

    <brush-popup
      v-show="showBrushPopup">
    </brush-popup>

    <help-popup
      v-show="showHelpPopup">
    </help-popup>

  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import * as busType from '@/util/bus/bus-types'
  import * as mutationType from '@/store/mutation-types'

  import BrushPopup from '@/components/popups/BrushPopup'
  import EraserPopup from '@/components/popups/EraserPopup'
  import HelpPopup from '@/components/popups/HelpPopup'

  export default {
    name: 'AppContents',
    computed: {
      ...mapState({
        loadedFile: 'loadedFile',
        showSavePopup: 'showSavePopup'
      })
    },
    data () {
      return {
        showEraserPopup: false,
        showBrushPopup: false,
        showHelpPopup: false,
        showAnalysisReportPopup: false
      }
    },
    components: {
      BrushPopup,
      EraserPopup,
      HelpPopup
    },
    created () {
      this.$bus.$on(busType.SHOW_BRUSH_POPUP, this.showBrushPopupToggle)
      this.$bus.$on(busType.SHOW_ERASER_POPUP, this.showEraserPopupToggle)
      this.$bus.$on(busType.SHOW_HELP_POPUP, this.showHelpPopupToggle)
    },
    mounted () {
      let self = this
      document.onkeydown = function (e) {
        if (!self.loadedFile.file) {
          return
        }
        if (self.showSavePopup) {
          return
        }
        let keyCode = e.keyCode
//        console.log(keyCode)
        if (keyCode === 80) { // p
          self.shortKeyPan()
        } else if (keyCode === 66) { // b
          self.shortKeyBrush()
        } else if (keyCode === 69) { // e
          self.shortKeyErase()
        } else if (keyCode === 83) { // s
          self.shortKeySave()
        } else if (keyCode === 90) { // z
          self.shortKeyUndo()
        } else if (keyCode === 187) { // +
          self.shortKeyZoomIn()
        } else if (keyCode === 189) { // -
          self.shortKeyZoomOut()
        } else if (keyCode === 48) { // 0
          self.shortKeyOneOnOne()
        }
      }
    },
    methods: {
      showBrushPopupToggle (show) {
        if (show) {
          this.showBrushPopup = show
          return
        }
        this.showBrushPopup = false
      },
      showEraserPopupToggle (show) {
        if (show) {
          this.showEraserPopup = show
          return
        }
        this.showEraserPopup = false
      },
      showHelpPopupToggle (show) {
        if (show) {
          this.showHelpPopup = show
          return
        }
        this.showHelpPopup = !this.showHelpPopup
      },
      showSegmentationPopupToggle (show) {
        if (show) {
          this.showSegmentationPopup = show
          return
        }
        this.showSegmentationPopup = !this.showSegmentationPopup
      },
      showAnalysisReportPopupToggle (show) {
        if (show) {
          this.showAnalysisReportPopup = show
          return
        }
        this.showAnalysisReportPopup = !this.showAnalysisReportPopup
      },
      shortKeyPan () {
        this.closeAllPopups()
        this.$store.commit(mutationType.SET_LABELING_MODE, {mode: 'Pan'})
        this.$bus.$emit(busType.MENU_CLICKED, 'Pan')
      },
      shortKeyBrush () {
        this.closeAllPopups()
        this.$bus.$emit(busType.SHOW_BRUSH_POPUP, true)
        this.$store.commit(mutationType.SET_LABELING_MODE, {mode: 'Draw'})
        this.$bus.$emit(busType.MENU_CLICKED, 'Draw')
      },
      shortKeyErase () {
        this.closeAllPopups()
        this.$bus.$emit(busType.SHOW_ERASER_POPUP, true)
        this.$store.commit(mutationType.SET_LABELING_MODE, {mode: 'Erase'})
        this.$bus.$emit(busType.MENU_CLICKED, 'Erase')
      },
      shortKeySave () {
        this.$bus.$emit(busType.SHOW_SAVE_POPUP, true)
      },
      shortKeyUndo () {
        this.$bus.$emit(busType.MENU_CLICKED, 'Undo')
      },
      shortKeyZoomIn () {
        this.$bus.$emit(busType.MENU_CLICKED, 'ZoomIn')
      },
      shortKeyZoomOut () {
        this.$bus.$emit(busType.MENU_CLICKED, 'ZoomOut')
      },
      shortKeyOneOnOne () {
        this.$bus.$emit(busType.MENU_CLICKED, 'Fit')
      },
      closeAllPopups () {
        this.$bus.$emit(busType.SHOW_ERASER_POPUP, false)
        this.$bus.$emit(busType.SHOW_BRUSH_POPUP, false)
      }
    }
  }
</script>

<style lang="scss" scoped>
  #app-main {
  }
</style>
