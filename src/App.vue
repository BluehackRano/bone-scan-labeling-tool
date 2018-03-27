<template>
  <div id="app">
    <app-header></app-header>
    <app-contents></app-contents>

    <save-popup
      v-show="showSavePopup"></save-popup>
  </div>
</template>

<script>
  import {mapState} from 'vuex'

  import AppHeader from '@/components/layout/AppHeader'
  import AppContents from '@/components/layout/AppContents'
  import SavePopup from '@/components/popups/SavePopup'

  import * as busType from '@/util/bus/bus-types'
  import * as mutationType from '@/store/mutation-types'

  export default {
    name: 'app',
    computed: {
      ...mapState({
        showSavePopup: 'showSavePopup'
      })
    },
//    data () {
//      return {
//        showSavePopup: true
//      }
//    },
    components: {
      AppHeader,
      AppContents,
      SavePopup
    },
    created () {
      this.$bus.$on(busType.SHOW_SAVE_POPUP, this.showSavePopupToggle)
    },
    mounted () {
      this.commitShowSavePopup(false)
    },
    methods: {
      showSavePopupToggle (show) {
        if (show) {
          this.commitShowSavePopup(show)
          return
        }
        this.commitShowSavePopup(false)
      },
      commitShowSavePopup (show) {
        this.$store.commit(mutationType.SHOW_SAVE_POPUP, show)
      }
    }
  }
</script>

<style>
  html {
    overflow: hidden;
  }

  /*.save-popup-container {*/
    /*position: absolute;*/
    /*top: 0;*/
    /*left: 0;*/
    /*width: 100vw;*/
    /*height: 100vh;*/
    /*background-color: rgba(1,1,1,.5);*/
    /*z-index: 2001;*/
    /*cursor: default;*/
    /*padding-left: 50vw;*/
    /*padding-top: 50vh;*/

  /*}*/
</style>
