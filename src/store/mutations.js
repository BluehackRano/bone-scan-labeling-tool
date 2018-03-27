export default {
  SET_LOADED_FILE (state, loadedFile) {
    state.loadedFile = loadedFile
  },
  SET_LABELING_MODE (state, mode) {
    state.labelingMode = mode
  },
  SET_BRUSH_RADIUS (state, radius) {
    state.brush.radius = radius
  },
  UP_BRUSH_RADIUS (state) {
    state.brush.radius += 1
  },
  DOWN_BRUSH_RADIUS (state) {
    if (state.brush.radius == 1) {
      return
    }
    state.brush.radius -= 1
  },
  SET_BRUSH_COLOR (state, color) {
    state.brush.color = color
  },
  SET_ERASER_RADIUS (state, radius) {
    state.eraser.radius = radius
  },
  SELECT_MENU (state, menu) {
    state.currentSelect = menu
  },
  SHOW_SAVE_POPUP (state, show) {
    state.showSavePopup = show
  },
  SET_USER_ID (state, userId) {
    state.userId = userId
  },
  SET_LAYOUT_TYPE (state, layout) {
    state.currentLayout = layout
  },
  SELECT_CANVAS (state, canvas) {
    state.focusedCanvas = canvas
  },
  SET_SHOW_TAGS (state, showTags) {
    state.showTags = showTags
  }
}
