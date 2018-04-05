import Vue from 'vue'
import Vuex from 'vuex'

import actions from './actions'
import mutations from './mutations'

import menus from './modules/menus'
import segmentations from './modules/segmentations'

Vue.use(Vuex)

const state = {
  loadedFile: {
    file: null,
    name: '',
    type: ''
  },
  labelingMode: {
    mode: 'Pan'
  },
  brush: {
    radius: 7,
    color: 'rgba(56,117,30,255)'
  },
  eraser: {
    radius: 15
  },
  currentAction: {},
  currentSelect: {},
  showSavePopup: true,

  userId: 'abcd',
  currentLayout: {
    name: '2By2'
  },
  focusedCanvas: {},
  showTags: false
}

const store = new Vuex.Store({
  state,
  modules: {
    menus,
    segmentations
  },
  actions,
  mutations
})

export default store
