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
    name: 'BoneScanLabeling',
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
        }
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
        } else {
          ratio = containerH / imgH
          this.initialImageWidth = imgW * ratio
          this.newImageHeight = containerH
          this.initBgCanvas(container, containerW, containerH, this.img.object);
          this.initCanvas(container, containerW, containerH);
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

          console.log(containerH/containerW + ' : ' + imgH/imgW)
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

//        var hRatio = this.canvas.width  / bgImage.width;
//        var vRatio =  this.canvas.height / bgImage.height;

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
//      drawCircle(x, y, radius, fillColor) {
//        // Clear the background
//        this.canvas.context.clearRect(0, 0, this.canvas.node.width, this.canvas.node.height)
//
//        for (let i=0; i<this.drawingPaths.length; i++) {
//          let aPaths = this.drawingPaths[i]
//          for (let j = 0; j < aPaths.length; j++) {
//            let aPath = aPaths[j]
//            this.canvas.context.globalCompositeOperation = aPath.globalCompositeOperation
//            this.canvas.context.fillCircle(aPath.x * this.zoomRate, aPath.y * this.zoomRate, aPath.radius * this.zoomRate, aPath.fillColor)
//          }
//        }
//
//        // Establish the circle path
//        this.canvas.context.beginPath();
//        this.canvas.context.arc(x, y, radius, 0 , 2 * Math.PI, true)
//
//        // Fill the circle
//        this.canvas.context.fillStyle = fillColor
//        this.canvas.context.fill()
//      },
      addCanvasEvents (canvas, ctx) {
        let self = this

        // bind mouse events
        canvas.node.onmousemove = function(e) {
          if (self.labelingMode.mode !== 'Pan') {
            if (!canvas.isDrawing) {
              return;
            }

//            console.log(e)
//          var x = e.pageX - this.offsetLeft;
//          var y = e.pageY - this.offsetTop;
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

//            console.log(x + 'x' + y)
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

//          if (e.button === 0) {
//            console.log('left')
//            switch (self.labelingMode) {
//              case 'draw':
//              case 'erase':
//                canvas.isDrawing = true;
//                canvas.isPanning = false;
//
//                self.tempDrawingPaths = []
//                break
//              case 'pan':
//                var r = canvas.node.getBoundingClientRect();
//                canvas.mouseX = (e.clientX - r.left) - self.canvasPos.deltaX;
//                canvas.mouseY = (e.clientY - r.top) - self.canvasPos.deltaY;
//
//                canvas.isDrawing = false;
//                canvas.isPanning = true;
//                break
//              default:
//                break
//            }
//          } else if (e.button === 2) {
//            console.log('right')
//            var r = canvas.node.getBoundingClientRect();
//            canvas.mouseX = (e.clientX - r.left) - self.canvasPos.deltaX;
//            canvas.mouseY = (e.clientY - r.top) - self.canvasPos.deltaY;
//
//            canvas.isDrawing = false;
//            canvas.isPanning = true;
//          }
        };
        canvas.node.onmouseup = function(e) {
          canvas.isDrawing = false;
          canvas.isPanning = false;

          if (self.tempDrawingPaths && self.tempDrawingPaths.length > 0) {
            self.drawingPaths.push(self.tempDrawingPaths)
          }
          self.tempDrawingPaths = []
        };
        canvas.node.onmouseleave = function (e) {
          canvas.isDrawing = false;
          canvas.isPanning = false;

          if (self.tempDrawingPaths && self.tempDrawingPaths.length > 0) {
            self.drawingPaths.push(self.tempDrawingPaths)
          }
          self.tempDrawingPaths = []
        }

        canvas.node.onwheel = function (e) {
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
//        console.log(width + ' x ' + height)
//        console.log(this.img.width + ' x ' + this.img.height)

        var buffer = document.createElement('canvas');
        var b_ctx = buffer.getContext('2d');
        buffer.width = width;
        buffer.height = height;
        b_ctx.drawImage(canvas, offsetX, offsetY, width, height,
          0, 0, buffer.width, buffer.height)

        return buffer
      },
      cropCanvasForSave (canvas, offsetX, offsetY, source_width, source_height) {
        this.canvas.context.imageSmoothingEnabled = false

        console.log('canvas: ' + canvas.width + 'x' +  canvas.height)
        console.log('crop: ' + source_width + 'x' +  source_height)
        console.log('origin: ' + this.img.width + 'x' +  this.img.height)

        var buffer = document.createElement('canvas')
        var b_ctx = buffer.getContext('2d')
        b_ctx.imageSmoothingQuality = 'low'
        buffer.width = this.img.width
        buffer.height = this.img.height
        b_ctx.drawImage(canvas, offsetX, offsetY, source_width, source_height,
          0, 0, buffer.width, buffer.height)

        return buffer
      },
      colorValidation (r, g, b, a) {
        if (r === 56 && g === 117 && b === 30 && a === 255) {
          return true
        }
        if (r === 152 && g === 18 && b === 0 && a === 255) {
          return true
        }
        if (r === 255 && g === 37 && b === 0 && a === 255) {
          return true
        }
        if (r === 255 && g === 153 && b === 0 && a === 255) {
          return true
        }
        if (r === 255 && g === 251 && b === 1 && a === 255) {
          return true
        }
        if (r === 6 && g === 249 && b === 0 && a === 255) {
          return true
        }
        if (r === 1 && g === 253 && b === 255 && a === 255) {
          return true
        }
        if (r === 74 && g === 133 && b === 232 && a === 255) {
          return true
        }
        if (r === 5 && g === 50 && b === 255 && a === 255) {
          return true
        }
        if (r === 153 && g === 55 && b === 255 && a === 255) {
          return true
        }
        if (r === 255 && g === 64 && b === 255 && a === 255) {
          return true
        }
        if (r === 153 && g === 154 && b === 95 && a === 255) {
          return true
        }
        if (r === 136 && g === 83 && b === 24 && a === 255) {
          return true
        }
        if (r === 128 && g === 128 && b === 128 && a === 255) {
          return true
        }



        if (r === 254 && g === 229 && b === 153 && a === 255) {
          return true
        }
        if (r === 139 && g === 205 && b === 255 && a === 255) {
          return true
        }
        if (r === 255 && g === 0 && b === 100 && a === 255) {
          return true
        }
        if (r === 189 && g === 255 && b === 0 && a === 255) {
          return true
        }
        if (r === 29 && g === 103 && b === 157 && a === 255) {
          return true
        }
        if (r === 255 && g === 152 && b === 191 && a === 255) {
          return true
        }
        if (r === 112 && g === 0 && b === 106 && a === 255) {
          return true
        }
        if (r === 0 && g === 209 && b === 88 && a === 255) {
          return true
        }
        if (r === 213 && g === 166 && b === 189 && a === 255) {
          return true
        }
        if (r === 154 && g === 151 && b === 255 && a === 255) {
          return true
        }
        if (r === 219 && g === 95 && b === 0 && a === 255) {
          return true
        }
        if (r === 223 && g === 0 && b === 102 && a === 255) {
          return true
        }
        if (r === 115 && g === 26 && b === 71 && a === 255) {
          return true
        }
        if (r === 255 && g === 255 && b === 255 && a === 255) {
          return true
        }
        return false
      },
      doSave (file) {
        this.doFit()

        setTimeout(() => {
          var croppedCanvasForSave = this.cropCanvasForSave(this.canvas.node, 0, 0, this.initialImageWidth, this.newImageHeight)

          var ctx = croppedCanvasForSave.getContext('2d')
          var imageData = ctx.getImageData(0, 0, croppedCanvasForSave.width, croppedCanvasForSave.height)
          var data = imageData.data

          for (var i = 0; i < data.length; i += 4) {

            var r = data[i]
            var g = data[i + 1]
            var b = data[i + 2]
            var a = data[i + 3]

            if (r === 0 && g === 0 && b === 0) {
              continue
            }
//            console.log(r + ', ' + g + ', ' + b + ', ' + a)

            if (!this.colorValidation(r, g, b, a)) {
              data[i + 3] = 0
            }
          }
          ctx.putImageData(imageData, 0, 0)

          croppedCanvasForSave.toBlob(function(blob){
            var link = document.getElementById('saveButton')
            link.download = file.name

            link.href = URL.createObjectURL(blob);

            var type
            if (file.type === 'png') {
              type = 'image/png'
              link.href = croppedCanvasForSave.toDataURL(type, 1.0)
            } else if (file.type === 'jpg') {
              type = 'image/jpeg'
              link.href = croppedCanvasForSave.toDataURL(type, 1.0)
            } else if (file.type === 'nii') {
              link.href = croppedCanvasForSave.toDataURL()
            }
            link.click()

          },'image/png')



//          var link = document.getElementById('saveButton')
//          link.download = file.name
//
//
//          var type
//          if (file.type === 'png') {
//            type = 'image/png'
//            link.href = croppedCanvasForSave.toDataURL(type, 1.0)
//          } else if (file.type === 'jpg') {
//            type = 'image/jpeg'
//            link.href = croppedCanvasForSave.toDataURL(type, 1.0)
//          } else if (file.type === 'nii') {
//            link.href = croppedCanvasForSave.toDataURL()
//          }
//          link.click()


//          var croppedCanvas = this.cropCanvas(this.canvas.node, 0, 0, this.initialImageWidth, this.newImageHeight)
//
//          var imageData = croppedCanvas.toDataURL('image/png', 1.0)
//          var img = new Image()
//          img.onload = () => {
//            var tc = document.createElement('canvas');
//            tc.width = this.img.width
//            tc.height = this.img.height
//
//            var tctx = tc.getContext('2d')
//            tctx.imageSmoothingEnabled = false
//            tctx.drawImage(img, 0, 0, tc.width, tc.height)
//
//            var link = document.getElementById('saveButton');
//            link.download = file.name
//
//            var type
//            if (file.type === 'png') {
//              type = 'image/png'
//              link.href = tc.toDataURL(type, 1.0)
//            } else if (file.type === 'jpg') {
//              type = 'image/jpeg'
//              link.href = tc.toDataURL(type, 1.0)
//            } else if (file.type === 'nii') {
//              link.href = tc.toDataURL()
//            }
//
//            link.click()
//          }
//          img.src = imageData


        }, 100)
      },
//      doSaveAs () {
//        var imageData = this.dicomCanvas.toDataURL()
//
//        var img = new Image()
//        img.onload = () => {
//          var tc = document.createElement('canvas');
//          tc.width = this.initialImageWidth
//          tc.height = this.newImageHeight
//
//          var tctx = tc.getContext('2d')
//          tctx.drawImage(img, 0, 0, tc.width, tc.height)
//
//          var link = document.getElementById('saveButton');
//          link.download = 'downloaded.png'
//          link.href = tc.toDataURL()//'image/png')
//          link.click()
//        }
//        img.src = imageData
//      },
      drawAfterPan (deltaX, deltaY) {
        // we need to clear the canvas, otherwise we'll have a bunch of overlapping images
        this.canvas.context.clearRect(0,0, this.canvas.node.width, this.canvas.node.height);
        this.bgCanvas.context.clearRect(0,0, this.bgCanvas.node.width, this.bgCanvas.node.height);

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

        if (this.zoomLevel < 1) {
          this.zoomLevel = 1
          return
        }

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
        this.canvas.context.clearRect(0,0, this.canvas.node.width, this.canvas.node.height);
        this.bgCanvas.context.clearRect(0,0, this.bgCanvas.node.width, this.bgCanvas.node.height);

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
          this.doZoomOut(this.canvas.node.width/2, this.canvas.node.height/2)
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
