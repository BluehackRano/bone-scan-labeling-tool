<template>
  <div id="app-content-area">
    <sidebar></sidebar>
    <section class="viewer-area">
      <div class="container is-fluid is-marginless app-content">
        <a id="saveButton"></a>
        <div class="labeling-area" ref="imageCanvas">
          <div class="loading-spinner-dimmed-view"
               v-if="loadingSpinner.loading"
               @mousedown="$event.stopPropagation()"
          >
            <clip-loader :loading="loadingSpinner.loading" :color="loadingSpinner.color"
                         :size="loadingSpinner.size"></clip-loader>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import {mapState} from 'vuex'

  import Sidebar from '@/components/layout/Sidebar'
  import ClipLoader from '@/components/lib/ClipLoader'

  import * as mutationType from '@/store/mutation-types'
  import * as busType from '@/util/bus/bus-types'

  // Cornerstone Libraries
  import * as cornerstoneMath from 'cornerstone-math'
  import * as cornerstone from 'cornerstone-core'
  import * as cornerstoneTools from 'cornerstone-tools'
  import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'

  cornerstoneTools.external.cornerstone = cornerstone
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone

  var config = {
    webWorkerPath : '/static/lib/cornerstone/cornerstoneWADOImageLoaderWebWorker.js',
    taskConfiguration: {
      'decodeTask' : {
        codecsPath: '/static/lib/cornerstone/cornerstoneWADOImageLoaderCodecs.js'
      }
    }
  }
  cornerstoneWADOImageLoader.webWorkerManager.initialize(config)

  export default {
    name: 'BoneScanLabelingRefac',
    components: {
      Sidebar,
      ClipLoader
    },
    computed: {
      ...mapState({
        labelingMode: 'labelingMode',
        brush: 'brush',
        eraser: 'eraser'
      })
    },
    data () {
      return {
        container: null,
        dicomCanvas: null,
        canvas: null,
        bgCanvas: null,
        mousePointerCanvas: null,
        img: {},
        initialImageWidth: 0,
        newImageHeight: 0,
        canvasPos: {
          deltaX: 0,
          deltaY: 0
        },
        zoomLevel: 1,
        zoomRate: 1,
//        labelingMode: 'draw',
//        brush: {
//          radius: 10,
//          color: 'green'
//        },
        drawingPaths: [],
        tempDrawingPaths: [],
        loadingSpinner: {
          loading: false,
          color: '#cfcfcf',
          size: '50px'
        },
        isMouseRight: false,
        mouseLastPosition: {},
        imageContrast: 100,
        MOUSE_LEFT: 0,
        MOUSE_RIGHT: 2
      }
    },
    created () {
      console.log('# Created')
      this.$bus.$on(busType.FILE_UPLOADED, this.setUploadedFile)
      this.$bus.$on(busType.MENU_CLICKED, this.menuClicked)
      this.$bus.$on(busType.SAVE_FILE, this.doSave)
    },
    mounted () {
      console.log('# Mounted')
      this.container = this.$refs.imageCanvas
    },
    methods: {
      setUploadedFile (uploadedFile) {
        this.loadingSpinner.loading = true

        this.initView()

        if (uploadedFile.fileType || uploadedFile.fileType === 'application/dicom') {
          this.loadDicomImageToCanvas(uploadedFile.file)
          this.container.style.cursor = 'move'
          return
        }

        if (uploadedFile.file.type === 'image/jpeg' || uploadedFile.file.type === 'image/png') {
          this.loadIamgeToCanvas(uploadedFile.file)
        } else if (uploadedFile.file.type === 'application/dicom') {
          this.loadDicomImageToCanvas(uploadedFile.file)
        }
        this.container.style.cursor = 'move'
      },
      loadIamgeObject (container) {
        let imgW = this.img.width
        let imgH = this.img.height
        let ratio

        let containerW = container.getBoundingClientRect().width
        let containerH = container.getBoundingClientRect().height

        if (containerH/containerW >= imgH/imgW) {
          ratio = containerW / imgW
          this.initialImageWidth = containerW
          this.newImageHeight = imgH * ratio
          this.initBgCanvas(container, containerW, containerH, this.img.object);
          this.initCanvas(container, containerW, containerH);
          this.initMousePointerCanvas(container, containerW, containerH);
        } else {
          ratio = containerH / imgH
          this.initialImageWidth = imgW * ratio
          this.newImageHeight = containerH
          this.initBgCanvas(container, containerW, containerH, this.img.object);
          this.initCanvas(container, containerW, containerH);
          this.initMousePointerCanvas(container, containerW, containerH);
        }
      },

      loadIamgeToCanvas (blob) {
        var img = new Image;
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          this.img.object = img
          this.img.width = img.width
          this.img.height = img.height

          this.loadIamgeObject(this.container)
          this.loadingSpinner.loading = false
        }
      },

      loadDicomImageToCanvas (uploadedFile) {
        cornerstone.enable(this.container)
        this.dicomCanvas = document.getElementsByClassName('cornerstone-canvas')[0]
        this.dicomCanvas.style.position = 'absolute'
        this.dicomCanvas.style.visibility = 'hidden'

        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(uploadedFile);
        this.viewDicomImage(imageId)
      },
      viewDicomImage(imageId) {
        const element = this.container
        cornerstone.loadAndCacheImage(imageId).then((image) => {
//          const viewport = cornerstone.getDefaultViewportForImage(element, image);
          cornerstone.displayImage(element, image)
          console.log(image)

          this.img.width = image.columns
          this.img.height = image.rows

          setTimeout(() => {
            let croppedCanvas
            if (containerH/containerW >= imgH/imgW) {
              croppedCanvas = this.cropCanvas(this.dicomCanvas, 0, this.dicomCanvas.height/2 - this.newImageHeight/2, this.initialImageWidth, this.newImageHeight)
            } else {
              croppedCanvas = this.cropCanvas(this.dicomCanvas, this.dicomCanvas.width/2 - this.initialImageWidth/2, 0, this.initialImageWidth, this.newImageHeight)
            }

            var imageData = croppedCanvas.toDataURL()
            var img = new Image()
            img.src = imageData
            img.onload = () => {
              this.img.object = img

              this.loadIamgeObject(this.container)
              this.loadingSpinner.loading = false
            }
          }, 2500)

          let containerW = this.dicomCanvas.getBoundingClientRect().width
          let containerH = this.dicomCanvas.getBoundingClientRect().height

          let imgW = image.columns
          let imgH = image.rows
          let ratio

          if (containerH/containerW >= imgH/imgW) {
            ratio = containerW / imgW
            this.initialImageWidth = containerW
            this.newImageHeight = imgH * ratio
          } else {
            ratio = containerH / imgH
            this.initialImageWidth = imgW * ratio
            this.newImageHeight = containerH
          }
        })
      },

      initView () {
        if (this.canvas) {
          this.container.removeChild(this.canvas.node)
        }
        if (this.bgCanvas) {
          this.container.removeChild(this.bgCanvas.node)
        }
        if (this.dicomCanvas) {
          cornerstone.disable(this.container)
        }

        this.img = {}
        this.dicomCanvas = null
        this.canvas = null
        this.bgCanvas = null
        this.mousePointerCanvas = null
        this.canvasPos.deltaX = 0
        this.canvasPos.deltaY = 0
        this.$store.commit(mutationType.SET_LABELING_MODE, {mode: 'Pan'})
        this.$bus.$emit(busType.SHOW_ERASER_POPUP, false)
        this.$bus.$emit(busType.SHOW_BRUSH_POPUP, false)
        this.drawingPaths.splice(0, this.drawingPaths.length)
        this.tempDrawingPaths = []
        this.zoomLevel = 1
        this.zoomRate = 1
        this.initialImageWidth = 0
        this.newImageHeight = 0
        this.isMouseRight = false
        this.mouseLastPosition = {}
        this.imageContrast = 100
        // init brush
      },
      createCanvas (parent, width, height) {
        var canvas = {};
        canvas.node = document.createElement('canvas');
        canvas.node.style.position = 'absolute'

        canvas.node.width = width;
        canvas.node.height = height;
        canvas.context = canvas.node.getContext('2d');
//        canvas.context.imageSmoothingEnabled = false
        canvas.mouseX = 0
        canvas.mouseY = 0
        parent.appendChild(canvas.node);
        return canvas;
      },
      initBgCanvas (container, width, height, bgImage) {
        var bgCanvas = this.createCanvas(container, width, height);
        this.bgCanvas = bgCanvas

        this.bgCanvas.context.clearRect(0,0,this.bgCanvas.width, this.bgCanvas.height);
        this.bgCanvas.context.drawImage(bgImage, 0,0, this.initialImageWidth, this.newImageHeight)
      },
      initCanvas (container, width, height) {
        var canvas = this.createCanvas(container, width, height);
        this.canvas = canvas

        this.canvas.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        // define a custom fillCircle method
        this.canvas.context.fillCircle = function(x, y, radius, fillColor) {
          this.imageSmoothingEnabled = false
          this.fillStyle = fillColor;
          this.beginPath();
          this.moveTo(x, y);
          this.arc(x, y, radius, 0, Math.PI * 2, false);
          this.fill();
        };

        this.addCanvasEvents(this.canvas, this.canvas.context);
      },
      initMousePointerCanvas (container, width, height) {
        var canvas = this.createCanvas(container, width, height);
        this.mousePointerCanvas = canvas
        this.clearMousePointerCanvas()
        this.mousePointerCanvas.node.style.pointerEvents = 'none'

        this.mousePointerCanvas.context.fillCircle = function(x, y, radius, fillColor) {
          this.imageSmoothingEnabled = false
          this.fillStyle = fillColor;
          this.beginPath();
          this.moveTo(x, y);
          this.arc(x, y, radius, 0, Math.PI * 2, false);
          this.fill();
        }
      },
      drawMousePointerCanvas (x, y, r, color) {
        if (!this.mousePointerCanvas) {
          return;
        }
        if (this.labelingMode.mode === 'Erase') {
          color = '#ffffff'
        }
        this.clearMousePointerCanvas()
        this.mousePointerCanvas.context.fillCircle(x, y, r, color)
      },
      clearMousePointerCanvas () {
        if (!this.mousePointerCanvas) {
          return;
        }
        this.mousePointerCanvas.context.clearRect(0, 0, this.mousePointerCanvas.node.width, this.mousePointerCanvas.node.height)
      },
      addCanvasEvents (canvas, ctx) {
        let self = this

        // bind mouse events
        canvas.node.onmousemove = function(e) {
          if (self.isMouseRight) {
            if (typeof(self.mouseLastPosition.x) != 'undefined') {
              var deltaX = self.mouseLastPosition.x - e.clientX,
                deltaY = self.mouseLastPosition.y - e.clientY
              if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
                //left
                if (self.imageContrast === 20) {
                  return
                }
                self.imageContrast -= 5
              } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
                //right
                if (self.imageContrast === 200) {
                  return
                }
                self.imageContrast += 5
              } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
                //up
                if (self.imageContrast === 200) {
                  return
                }
                self.imageContrast += 5
              } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
                //down
                if (self.imageContrast === 20) {
                  return
                }
                self.imageContrast -= 5
              }
            }
            self.mouseLastPosition = {
              x : e.clientX,
              y : e.clientY
            }
            self.bgCanvas.node.style.filter = 'contrast(' + self.imageContrast + '%' +')'
            return
          }

          if (self.labelingMode.mode !== 'Pan') {
            var x = e.layerX - this.offsetLeft;
            var y = e.layerY - this.offsetTop;

            var radius
            if (self.labelingMode.mode === 'Draw') {
              radius = self.brush.radius * self.zoomRate;
              ctx.globalCompositeOperation = 'source-over'
            } else if (self.labelingMode.mode === 'Erase') {
              radius = self.eraser.radius * self.zoomRate;
              ctx.globalCompositeOperation = 'destination-out'
            }
            var fillColor = self.brush.color

            if (!canvas.isDrawing) {
              self.drawMousePointerCanvas(x, y, radius, fillColor)
              return
            }

            ctx.fillCircle(x, y, radius, fillColor);

            self.tempDrawingPaths.push({
              x: (x - self.canvasPos.deltaX) / self.zoomRate,
              y: (y - self.canvasPos.deltaY) / self.zoomRate,
              radius: radius / self.zoomRate,
              fillColor: fillColor,
              globalCompositeOperation: ctx.globalCompositeOperation
            })
          }
          else {
            if (canvas.isPanning) {
              // get the current mouse position (updates every time the mouse is moved durring dragging)
              var r = canvas.node.getBoundingClientRect();
              var x = e.clientX - r.left;
              var y = e.clientY - r.top;

              // calculate how far we moved
              self.canvasPos.deltaX = (x - canvas.mouseX); // total distance in x
              self.canvasPos.deltaY = (y - canvas.mouseY); // total distance in y

              self.drawAfterPan(self.canvasPos.deltaX, self.canvasPos.deltaY)
            }
          }
        };
        canvas.node.onmousedown = function(e) {
          self.clearMousePointerCanvas()
          if (e.button === self.MOUSE_LEFT) {
            switch (self.labelingMode.mode) {
              case 'Draw':
              case 'Erase':
                canvas.isDrawing = true;
                canvas.isPanning = false;

                self.tempDrawingPaths = []
                break
              case 'Pan':
                var r = canvas.node.getBoundingClientRect();
                canvas.mouseX = (e.clientX - r.left) - self.canvasPos.deltaX;
                canvas.mouseY = (e.clientY - r.top) - self.canvasPos.deltaY;

                canvas.isDrawing = false;
                canvas.isPanning = true;
                break
              default:
                break
            }
          } else if (e.button === self.MOUSE_RIGHT) {
            self.isMouseRight = true
          }
        };
        canvas.node.onmouseup = function(e) {
          canvas.isDrawing = false;
          canvas.isPanning = false;
          self.isMouseRight = false
          self.clearMousePointerCanvas()

          if (self.tempDrawingPaths && self.tempDrawingPaths.length > 0) {
            self.drawingPaths.push(self.tempDrawingPaths)
          }
          self.tempDrawingPaths = []
        };
        canvas.node.onmouseleave = function (e) {
          canvas.isDrawing = false;
          canvas.isPanning = false;
          self.isMouseRight = false
          self.clearMousePointerCanvas()

          if (self.tempDrawingPaths && self.tempDrawingPaths.length > 0) {
            self.drawingPaths.push(self.tempDrawingPaths)
          }
          self.tempDrawingPaths = []
        }

        canvas.node.onwheel = function (e) {
          self.clearMousePointerCanvas()

          var delta = 0;
          var r = canvas.node.getBoundingClientRect();

          if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
          }
          else if (e.detail) {
            delta = -e.detail / 3;
          }

          var canvasZoomX = (e.clientX - r.left);
          var canvasZoomY = (e.clientY - r.top);

          if (delta > 0) {
            self.doZoomIn(canvasZoomX, canvasZoomY)
          }
          else {
            self.doZoomOut(canvasZoomX, canvasZoomY)
          }
        }
      },
      menuClicked (menu) {
        console.log(menu)
        this.clearMousePointerCanvas()
        switch (menu) {
          case 'Pan':
            this.canvas.node.style.cursor = 'move'
            break
          case 'Draw':
            this.canvas.node.style.cursor = 'crosshair'
            break
          case 'Erase':
            this.canvas.node.style.cursor = 'crosshair'
            break
          case 'ZoomIn':
            this.doZoomIn(this.canvas.node.width/2, this.canvas.node.height/2)
            break
          case 'ZoomOut':
            this.doZoomOut(this.canvas.node.width/2, this.canvas.node.height/2)
            break
          case 'Fit':
            this.doFit()
            break
          case 'Undo':
            this.doUndo()
            break
          default :
            break
        }
      },
      cropCanvas (canvas, offsetX, offsetY, width, height) {
        var buffer = document.createElement('canvas');
        var b_ctx = buffer.getContext('2d');
        buffer.width = width;
        buffer.height = height;
        b_ctx.drawImage(canvas, offsetX, offsetY, width, height,
          0, 0, buffer.width, buffer.height)

        return buffer
      },
      createCanvasForSave () {
        var canvasForSave = document.createElement('canvas')
        var ctx = canvasForSave.getContext('2d')
        ctx.imageSmoothingEnabled = false
        ctx.imageSmoothingQuality = 'low'
        canvasForSave.width = this.img.width
        canvasForSave.height = this.img.height

        return canvasForSave
      },
      drawCircleCanvasForSave () {
        var canvas = this.createCanvasForSave()

        var ratio = this.img.width / this.initialImageWidth
        var ctx = canvas.getContext('2d')
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        for (let i=0; i<this.drawingPaths.length; i++) {
          let aPaths = this.drawingPaths[i]
          for (let j = 0; j < aPaths.length; j++) {
            let aPath = aPaths[j]
            let r = Math.round(ratio * aPath.radius)
            let aRGBA = this.getRGBA(aPath.fillColor)
            if (aPath.globalCompositeOperation === 'source-over') { // Brush mode
              if (r !== 0) {
                this.drawCircle(imageData, Math.round(ratio * aPath.x), Math.round(ratio * aPath.y), Math.round(ratio * aPath.radius), aRGBA)
              } else {
                this.setPixel(imageData, Math.round(ratio * aPath.x), Math.round(ratio * aPath.y), aRGBA.r, aRGBA.g, aRGBA.b, aRGBA.a)
              }
            } else if (aPath.globalCompositeOperation === 'destination-out') { // Eraser mode
              if (r !== 0) {
                this.drawCircle(imageData, Math.round(ratio * aPath.x), Math.round(ratio * aPath.y), Math.round(ratio * aPath.radius), {r: 255, g: 255, b: 255, a: 0})
              } else {
                this.setPixel(imageData, Math.round(ratio * aPath.x), Math.round(ratio * aPath.y), 255, 255, 255, 0)
              }
            }
          }
        }
        ctx.putImageData(imageData, 0, 0)

        return canvas
      },
      drawCircle (imageData, xc, yc, r, rgba) {
        if (r < 1) return;

        let self = this

        var x = r, y = 0,  // for Bresenham's mid-point circle algorithm
          cd = 0,
          xoff = 0,
          yoff = r,
          b = -r,
          p0, p1, w0, w1;

        while (xoff <= yoff) {
          p0 = xc - xoff;
          p1 = xc - yoff;
          w0 = xoff + xoff;
          w1 = yoff + yoff;

          fill(imageData, p0, yc - yoff, yc + yoff, w0)
          fill(imageData, p1, yc - xoff, yc + xoff, w1)

          if ((b += xoff+++xoff) >= 0) {
            b -= --yoff + yoff;
          }
        }

        // for fill
        function fill(imageData, x, y1, y2, w) {
          w++;
          var xw = 0;
          while (w--) {
            xw = x + w;
            drawPixel(imageData, xw, y1);
            drawPixel(imageData, xw, y2);
          }
        }

        function drawPixel(imageData, x, y) {
          if (x < imageData.width && y < imageData.height && x >= 0 && y >= 0) {
            self.setPixel(imageData, x, y, rgba.r, rgba.g, rgba.b, rgba.a)
          }
        }
      },
      setPixel (imageData, x, y, r, g, b, a) {
        let index = (x + y * imageData.width) * 4
        imageData.data[index+0] = r
        imageData.data[index+1] = g
        imageData.data[index+2] = b
        imageData.data[index+3] = a
      },
      getRGBA (str){
        var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3}), ?(\d{1,3})?/);
        return match ? {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          a: parseInt(match[4])
        } : {}
      },
      doSave (file) {
        this.doFit()

        setTimeout(() => {
          var canvasForSave = this.drawCircleCanvasForSave()

          var link = document.getElementById('saveButton')
          link.download = file.name

          var type
          if (file.type === 'png') {
            type = 'image/png'
            link.href = canvasForSave.toDataURL(type, 1.0)
          } else if (file.type === 'jpg') {
            type = 'image/jpeg'
            link.href = canvasForSave.toDataURL(type, 1.0)
          } else if (file.type === 'nii') {
            link.href = canvasForSave.toDataURL()
          }
          link.click()

        }, 100)
      },
      drawAfterPan (deltaX, deltaY) {
        // we need to clear the canvas, otherwise we'll have a bunch of overlapping images
        this.canvas.context.clearRect(0,0, this.canvas.node.width, this.canvas.node.height)
        this.bgCanvas.context.clearRect(0,0, this.bgCanvas.node.width, this.bgCanvas.node.height)
        this.mousePointerCanvas.context.clearRect(0,0, this.bgCanvas.node.width, this.bgCanvas.node.height)

        // these will be our new x,y position to move the image.
        this.bgCanvas.context.drawImage(this.img.object,  deltaX, deltaY, this.initialImageWidth, this.newImageHeight);

        for (let i=0; i<this.drawingPaths.length; i++) {
          let aPaths = this.drawingPaths[i]
          for (let j = 0; j < aPaths.length; j++) {
            let aPath = aPaths[j]
            this.canvas.context.globalCompositeOperation = aPath.globalCompositeOperation
            this.canvas.context.fillCircle(aPath.x * this.zoomRate + deltaX, aPath.y * this.zoomRate + deltaY, aPath.radius * this.zoomRate, aPath.fillColor)
          }
        }
      },
      doZoomIn (canvasZoomX, canvasZoomY) {
        this.zoomLevel++

        // ZOOMING IN
        var zoomedX = this.canvasPos.deltaX - (canvasZoomX - this.canvasPos.deltaX);
        var zoomedY = this.canvasPos.deltaY - (canvasZoomY - this.canvasPos.deltaY);

        // scale the image up by 2
        this.initialImageWidth = this.initialImageWidth * 2;

        this.zoomRate = this.zoomRate * 2

        this.drawAfterZoom(zoomedX, zoomedY)
      },
      doZoomOut (canvasZoomX, canvasZoomY) {
        this.zoomLevel--

//        if (this.zoomLevel < 1) {
//          this.zoomLevel = 1
//          return
//        }

        // ZOOMING OUT
        var zoomedX = (this.canvasPos.deltaX + canvasZoomX) / 2;
        var zoomedY = (this.canvasPos.deltaY + canvasZoomY) / 2

        // scale the image down by 2
        this.initialImageWidth = this.initialImageWidth / 2

        this.zoomRate = this.zoomRate / 2

        this.drawAfterZoom(zoomedX, zoomedY)
      },
      drawAfterZoom (zoomedX, zoomedY) {
        this.newImageHeight = this.img.height / this.img.width * this.initialImageWidth;

        // we need to clear the canvas, otherwise we'll have a bunch of overlapping images
        this.canvas.context.clearRect(0,0, this.canvas.node.width, this.canvas.node.height)
        this.bgCanvas.context.clearRect(0,0, this.bgCanvas.node.width, this.bgCanvas.node.height)
        this.mousePointerCanvas.context.clearRect(0,0, this.bgCanvas.node.width, this.bgCanvas.node.height)

        // these will be our new x,y position to move the image.
        this.bgCanvas.context.drawImage(this.img.object, zoomedX, zoomedY, this.initialImageWidth, this.newImageHeight);
        for (let i=0; i<this.drawingPaths.length; i++) {
          let aPaths = this.drawingPaths[i]
          for (let j = 0; j < aPaths.length; j++) {
            let aPath = aPaths[j]
            this.canvas.context.globalCompositeOperation = aPath.globalCompositeOperation
            this.canvas.context.fillCircle(aPath.x * this.zoomRate + zoomedX, aPath.y * this.zoomRate + zoomedY, aPath.radius * this.zoomRate, aPath.fillColor)
          }
        }

        // update the new canvas position
        this.canvasPos.deltaX = zoomedX;
        this.canvasPos.deltaY = zoomedY;
      },
      doFit () {
        while (this.zoomLevel != 1) {
          if (this.zoomLevel > 1) {
            this.doZoomOut(this.canvas.node.width/2, this.canvas.node.height/2)
          } else if (this.zoomLevel < 1) {
            this.doZoomIn(this.canvas.node.width/2, this.canvas.node.height/2)
          }
        }
        this.canvasPos.deltaX = 0
        this.canvasPos.deltaY = 0
        this.drawAfterPan(0, 0)
      },
      doUndo () {
        this.drawingPaths.pop()

        this.canvas.context.clearRect(0,0, this.canvas.node.width, this.canvas.node.height);
        for (let i=0; i<this.drawingPaths.length; i++) {
          let aPaths = this.drawingPaths[i]
          for (let j=0; j<aPaths.length; j++) {
            let aPath = aPaths[j]
            this.canvas.context.globalCompositeOperation = aPath.globalCompositeOperation
            this.canvas.context.fillCircle(aPath.x * this.zoomRate + this.canvasPos.deltaX, aPath.y * this.zoomRate + this.canvasPos.deltaY, aPath.radius * this.zoomRate, aPath.fillColor)
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../style/bh_style.scss";

  /* width */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #282828;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #555;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #888;
  }

  #app-content-area {
  }

  .viewer-area {
    padding: 0;
    padding-top: $header-height;
    padding-left: $sidebar-width;
    width: 100vw;
    height: 100vh;
    background-color: #000000;

    .app-content {
      height: 100%;
      border: 3px solid #583edb;

      .labeling-area {
        position: relative;
        margin: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        overflow: auto;

        canvas {
          position: absolute;
          margin: 0;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .loading-spinner-dimmed-view {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: black;
          opacity: 0.8;
          z-index: 1999;

          .v-spinner {
            position: absolute;
            left: 50%;
            bottom: 50%;
            margin-left: -25px;
            margin-bottom: -30px;
          }
        }
      }
    }
  }
</style>
