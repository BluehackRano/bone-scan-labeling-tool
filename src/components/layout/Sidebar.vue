<template>
  <div>
    <div class="app-sidebar-dimmed-view" id="dimmed-view"
      v-show="!isFileUploaded"></div>
    <aside class="menu app-sidebar">

      <template v-for="(menu, index) in menus">
        <template v-if="menu.type === 'parent'">
          <div
            :class="{
              twobuttonsmenu: menu.children.length === 2,
              threebuttonsmenu: menu.children.length === 3
            }">
            <a v-for="(submenu, subindex) in menu.children"
               :class="{ active: submenu.name === labelingMode.mode }"
               @click="menuClicked(submenu)">
              <img v-if="submenu.meta.icon" :src="`/static/images/icons/png/${submenu.meta.icon}`">
            </a>
          </div>
        </template>
        <template v-else-if="menu.type === 'divider'">
          <div class="divider"></div>
        </template>
      </template>

    </aside>
  </div>
</template>

<script>
  import {mapGetters, mapState, mapActions} from 'vuex'
  import * as mutationType from '@/store/mutation-types'
  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'Sidebar',
    data () {
      return {
        isFileUploaded: false
      }
    },
    computed: {
      ...mapGetters({
        menus: 'menus'
      }),
      ...mapState({
        labelingMode: 'labelingMode'
      })
    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED, () => {
        this.isFileUploaded = true
      })
    },
    methods: {
      ...mapActions([
        'expandMenu',
        'showTagsToggle'
      ]),
      isExpanded (menu) {
        return menu.meta.expanded
      },
      expandMenuToggle (index, menu) {
        this.expandMenu({
          index: index,
          expanded: !menu.meta.expanded
        })
      },
      openSegmentations () {
        var f = document.createElement('input')
        f.style.display = 'none'
        f.type = 'file'
        f.name = 'file'
        document.getElementById('dimmed-view').appendChild(f)
        f.click()
        f.addEventListener('change', () => {
          if (f.files[0]) {
            this.$bus.$emit(busType.FILE_UPLOADED_SEG, f.files[0])
          }
        })
      },
      toggleShowTags (menu) {
        this.$store.commit(mutationType.SET_SHOW_TAGS, !menu.toggle)
        this.showTagsToggle({
          name: menu.name,
          toggle: !menu.toggle
        })
      },
      closeAllPopups () {
        this.$bus.$emit(busType.SHOW_ERASER_POPUP, false)
        this.$bus.$emit(busType.SHOW_BRUSH_POPUP, false)
      },
      menuClicked (menu) {
        if (menu.type === 'select') {
          if (this.labelingMode.mode === menu.name) {
            return
          }
          this.closeAllPopups()
          if (menu.name === 'Pan') {
          } else if (menu.name === 'Draw') {
            this.$bus.$emit(busType.SHOW_BRUSH_POPUP, true)
          } else if (menu.name === 'Erase') {
            this.$bus.$emit(busType.SHOW_ERASER_POPUP, true)
          }
          this.$store.commit(mutationType.SET_LABELING_MODE, {mode: menu.name})
          this.$bus.$emit(busType.MENU_CLICKED, menu.name)
        } else if (menu.type === 'action') {
          if (menu.name === 'Save') {
            console.log('Save')
            this.$bus.$emit(busType.SHOW_SAVE_POPUP, true)
          } else {
            this.$bus.$emit(busType.MENU_CLICKED, menu.name)
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../style/bh_style.scss";

  .app-sidebar-dimmed-view {
    position: fixed;
    top: $header-height;
    left: 0;
    bottom: 0;
    width: $sidebar-width;
    height: 100%;
    z-index: 1026;
    background-color: $sidebar-menu-bg-color;
    opacity: 0.9;
  }

  .app-sidebar {
    position: fixed;
    top: $header-height;
    left: 0;
    bottom: 0;
    padding: 0 0 $header-height;
    width: $sidebar-width;
    height: 100%;
    z-index: 1025;
    background-color: $sidebar-menu-bg-color;
    overflow-y: auto;
    overflow-x: hidden;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  div.twobuttonsmenu {
    margin-top: 5px;
    margin-left: 5px;
    width: 232px;
    height: 48px;

    a {
      display: inline-block;
      margin-left: 2px;
      width: 115px;
      height: 48px;
      border-radius: 4px;
      background-color: $sidebar-menu-button-normal-color;

      &:hover {
        background-color: $sidebar-menu-button-over-color;
      }
      &:active {
        background-color: $sidebar-menu-button-select-color;
      }

      img {
        width: 30px;
        height: 30px;
        margin-left: 42.5px;
        margin-top: 9px;
        object-fit: contain;
      }
    }
    a:first-child {
      margin-left: 0;
    }
  }

  div.threebuttonsmenu {
    margin-top: 5px;
    margin-left: 5px;
    width: 232px;
    height: 78px;

    a {
      display: inline-block;
      margin-left: 2px;
      width: 76px;
      height: 78px;
      border-radius: 4px;
      background-color: $sidebar-menu-button-normal-color;

      &:hover {
        background-color: $sidebar-menu-button-over-color;
      }
      &:active {
        background-color: $sidebar-menu-button-select-color;
      }

      img {
        width: 56px;
        height: 60px;
        margin-left: 10px;
        margin-top: 9px;
        object-fit: contain;
      }
    }
    a:first-child {
      margin-left: 0;
    }
    a.active {
      background-color: $sidebar-menu-button-select-color;
    }
  }

  div.divider {
    margin-top: 5px;
    margin-left: 12px;
    width: 218px;
    height: 2px;
    background-color: $sidebar-menu-divider-bg-color;
  }
</style>
