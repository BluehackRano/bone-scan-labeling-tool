import * as types from '../../mutation-types'

import Divider from './divider'
import layout from './layout'
import filter from './filter'
import annotations from './annotations'

/*
* - type :
*    > action : 클릭후 바로적용
*    > select : 다른 메뉴 그룹과 CheckBox 형태로 적용
*    > toggle : Toggle
*    > layout : Divide Display
*    > expand : Sub Menu를 가짐 (list view)
*    > parent : Sub Menu를 가짐 (grid view)
* */
const state = {
  items: [
    {
      name: '',
      type: 'parent',
      meta: {},
      children: [
        {
          name: 'Save',
          type: 'action',
          meta: {
            label: 'Save',
            icon: 'img-01-save.png'
          }
        },
        {
          name: 'Undo',
          type: 'action',
          meta: {
            label: 'Undo',
            icon: 'img-02-undo.png'
          }
        }
      ]
    },
    Divider,
    {
      name: '',
      type: 'parent',
      meta: {},
      children: [
        {
          name: 'Pan',
          type: 'select',
          meta: {
            label: 'Pan',
            icon: 'img-pan.png'
          }
        },
        {
          name: 'Draw',
          type: 'select',
          meta: {
            label: 'Brush',
            icon: 'img-brush.png'
          }
        },
        {
          name: 'Erase',
          type: 'select',
          meta: {
            label: 'Erase',
            icon: 'img-eraser.png'
          }
        }
      ]
    },
    Divider,
    {
      name: '',
      type: 'parent',
      meta: {},
      children: [
        {
          name: 'ZoomIn',
          type: 'action',
          meta: {
            label: 'Zoom In',
            icon: 'img-zoomin.png'
          }
        },
        {
          name: 'ZoomOut',
          type: 'action',
          meta: {
            label: 'Zoom Out',
            icon: 'img-zoomout.png'
          }
        },
        {
          name: 'Fit',
          type: 'action',
          meta: {
            label: 'OneOnOne',
            icon: 'img-one-2-one.png'
          }
        }
      ]
    }

    // ,
    // {
    //   name: 'BrainRoiSegmentation',
    //   type: 'action',
    //   meta: {
    //     label: 'Brain ROI Segmentation',
    //     icon: 'img-over-01-brain-roi-segmentation.svg'
    //   }
    // },
    // {
    //   name: 'SegmentationResultOveray',
    //   type: 'action',
    //   meta: {
    //     label: 'Segmentation Result\nOverlay',
    //     icon: 'img-over-02-segmentation-result-overay.svg'
    //   }
    // },
    // {
    //   name: 'AnalysisReport',
    //   type: 'action',
    //   meta: {
    //     label: 'Analysis Report',
    //     icon: 'img-over-03-analysis-roport.svg'
    //   }
    // },
    // {
    //   name: 'OpenSegmentations',
    //   type: 'action',
    //   meta: {
    //     label: 'Open Segmentations',
    //     icon: 'img-over-18-open-segmentations.svg'
    //   }
    // },
    // {
    //   name: 'SaveAsDerived',
    //   type: 'action',
    //   meta: {
    //     label: 'Save As Derived',
    //     icon: 'img-over-04-svae-as-derived.svg'
    //   }
    // },
    // Divider,
    // layout,
    // Divider,
    // {
    //   name: 'Pan',
    //   type: 'select',
    //   meta: {
    //     label: 'Pan',
    //     icon: 'img-over-06-pan.svg'
    //   }
    // },
    // {
    //   name: 'Stack',
    //   type: 'select',
    //   meta: {
    //     label: 'Stack',
    //     icon: 'img-over-19-stack.svg'
    //   }
    // },
    // {
    //   name: 'ZoomIn',
    //   type: 'action',
    //   meta: {
    //     label: 'Zoom In',
    //     icon: 'img-over-07-zoom-in.svg'
    //   }
    // },
    // {
    //   name: 'ZoomOut',
    //   type: 'action',
    //   meta: {
    //     label: 'Zoom Out',
    //     icon: 'img-over-08-zoom-out.svg'
    //   }
    // },
    // Divider,
    // {
    //   name: 'WindowLevel',
    //   type: 'select',
    //   meta: {
    //     label: 'Window Level',
    //     icon: 'img-over-09-window-level.svg'
    //   }
    // },
    // {
    //   name: 'Fit',
    //   type: 'action',
    //   meta: {
    //     label: 'Fit',
    //     icon: 'img-over-10-fit.svg'
    //   }
    // },
    // {
    //   name: 'OneToOne',
    //   type: 'action',
    //   meta: {
    //     label: 'One to One',
    //     icon: 'img-over-11-one-to-one.svg'
    //   }
    // },
    // filter,
    // {
    //   name: 'Reload',
    //   type: 'action',
    //   meta: {
    //     label: 'Reload',
    //     icon: 'img-over-13-reload.svg'
    //   }
    // },
    // Divider,
    // annotations,
    // {
    //   name: 'LoadAnnotation',
    //   type: 'action',
    //   meta: {
    //     label: 'Load Annotation',
    //     icon: 'img-over-15-load-annotation.svg'
    //   }
    // },
    // Divider,
    // {
    //   name: 'ShowTagsToggle',
    //   type: 'toggle',
    //   toggle: true,
    //   meta: {
    //     label: 'Hide Tags',
    //     icon: 'img-over-16-hide-tags.svg'
    //   }
    // }
  ]
}

const getters = {
  menus: state => state.items
}

const mutations = {
  [types.EXPAND_MENU] (state, menuItem) {
    if (menuItem.index > -1) {
      if (state.items[menuItem.index] && state.items[menuItem.index].meta) {
        state.items[menuItem.index].meta.expanded = menuItem.expanded
      }
    } else if (menuItem.item && 'expanded' in menuItem.item.meta) {
      menuItem.item.meta.expanded = menuItem.expanded
    }
  },
  [types.SHOW_TAGS_MENU_TOGGLE] (state, menuItem) {
    for (let i = 0; i < state.items.length; i++) {
      state.items[i].toggle = menuItem.toggle
      if (state.items[i].name === menuItem.name) {
        if (menuItem.toggle) {
          state.items[i].meta.label = 'Hide Tags'
          state.items[i].meta.icon = 'img-over-16-hide-tags.svg'
        } else {
          state.items[i].meta.label = 'Show Tags'
          state.items[i].meta.icon = 'img-over-16-1-show-tags.svg'
        }
      }
    }
  }
}

export default {
  state,
  getters,
  mutations
}
