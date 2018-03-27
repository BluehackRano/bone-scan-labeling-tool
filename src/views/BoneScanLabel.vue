<template>
  <div id="app-content-area">
    <sidebar></sidebar>
    <section class="viewer-area">
      <div class="container is-fluid is-marginless app-content">
        <a id="saveButton"></a>
        <div class="labeling-area" id="labeling-area" ref="imageCanvas">


        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import Sidebar from '@/components/layout/Sidebar'
//  import * as mutationType from '@/store/mutation-types'
  import * as busType from '@/util/bus/bus-types'

  import * as cornerstoneMath from 'cornerstone-math'
  // Cornerstone Libraries
  import * as cornerstone from 'cornerstone-core'
  import * as cornerstoneTools from 'cornerstone-tools'
//  import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
  import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'

//  import * as cornerstoneWADOImageLoaderWebWorker from '@/lib/cornerstone/cornerstoneWADOImageLoaderWebWorker.js'
//  import * as cornerstoneWADOImageLoaderCodecs from '@/lib/cornerstone/cornerstoneWADOImageLoaderCodecs.js'

  import { fabric } from 'fabric'
  import daikon from 'daikon'

  cornerstoneTools.external.cornerstone = cornerstone
//  cornerstoneWebImageLoader.external.cornerstone = cornerstone
//  cornerstoneWebImageLoader.external.cornerstoneMath = cornerstoneMath
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone
//  cornerstone.registerImageLoader('http', cornerstoneWebImageLoader.loadImage)
//  cornerstone.registerImageLoader('https', cornerstoneWebImageLoader.loadImage)

//  var config = {
//    webWorkerPath : '/static/lib/cornerstone/cornerstoneWADOImageLoaderWebWorker.js',
//    taskConfiguration: {
//      'decodeTask' : {
//        codecsPath: '/static/lib/cornerstone/cornerstoneWADOImageLoaderCodecs.js'
//      }
//    }
//  }
//  cornerstoneWADOImageLoader.webWorkerManager.initialize(config)

  export default {
    name: 'BoneScanLabel',
    components: {
      Sidebar
    },
    data () {
      return {
        img: null,
        initialImageWidth: 0,
        newImageHeight: 0,
        labelingMode: 'draw',
        canvas: null,
        canvasCtx: null,
        canvasPos: {
          deltaX: 0,
          deltaY: 0
        },
        drawingPaths: [],
        tempDrawingPaths: [],
        bgCanvas: null,
        bgCanvasCtx: null,
        zoomLevel: 1,
        zoomRate: 1
      }
    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED, this.setUploadedFile)
      this.$bus.$on(busType.MENU_CLICKED, this.menuClicked)
    },
    mounted () {
      console.log('### Mounted')

      console.log(cornerstone)

      let canvas = this.$refs.imageCanvas
      cornerstone.enable(canvas)




//      var config = {
//        webWorkerPath : cornerstoneWADOImageLoaderWebWorker,
//        taskConfiguration: {
//          'decodeTask' : {
//            codecsPath: cornerstoneWADOImageLoaderCodecs
//          }
//        }
//      };
//      cornerstoneWADOImageLoader.webWorkerManager.initialize(config)

//      var toBase64Btn = document.getElementById("toBase64");
//      var canvas = document.getElementById("canvas");
//      var ctx = canvas.getContext("2d");
//      var drawing = false;
//      var drawingMode = "add";
//      var pencilWidth = 5;
//      var base64Str = "";
//      var fabCan = new fabric.Canvas("b");
//      var fillColor = "rgba(255,0,0,.5)";
//
//      var self = this


//      toBase64Btn.onclick = function () {
//        if (drawing) return false;
//
//        var img = document.createElement("img");
//
//        img.onload = function () {
//
//          var group = [];
//
//          ctx.clearRect(0,0,canvas.width, canvas.height);
//          fabCan.add(new fabric.Image(this));
//
//          fabCan.getObjects().forEach(function (obj) {
//            obj.globalCompositeOperation = "xor";
//            group.push(obj);
//          });
//
//          fabCan.clear().add(new fabric.Group(group)).renderAll();
//        };
//
//        img.src = canvas.toDataURL("image/png");
//      };

//      document.getElementById("erase").onchange = function () {
//        drawingMode = this.checked ? "delete" : "add";
//        console.warn(drawingMode);
//      };
    },
    methods: {
      readDICOM(name, buf) {
        console.log("File: " + name);
        console.log("");

        var data = new DataView(buf);
        daikon.Parser.verbose = true;

        var dicomImage = daikon.Series.parseImage(data);
        var dicomImageData = dicomImage.getRawData();

        var blb = new Blob([dicomImageData], {type: 'image/png'});
        var url = (window.URL || window.webkitURL).createObjectURL(blb);
        image.src = url;

        console.log(dicomImageData)
      },

      makeSlice(file, start, length) {
        var fileType = (typeof File);
        if (fileType === 'undefined') {
          return function () {};
        }
        if (File.prototype.slice) {
          return file.slice(start, start + length);
        }
//        if (File.prototype.mozSlice) {
//          return file.mozSlice(start, length);
//        }
//        if (File.prototype.webkitSlice) {
//          return file.webkitSlice(start, length);
//        }
        return null;
      },

      readFile(file) {
        var blob = this.makeSlice(file, 0, file.size);
        var reader = new FileReader();
        reader.onloadend = (evt) => {
          if (evt.target.readyState === FileReader.DONE) {
            this.readDICOM(file.name, evt.target.result);
          }
        };
        reader.readAsArrayBuffer(blob);
      },

      loadAndViewImage(imageId) {
        const element = this.$refs.imageCanvas; //document.getElementById('labeling-area');
        const start = new Date().getTime();
        cornerstone.loadImage(imageId).then(function(image) {
          console.log(image);

          var myArray; //= your data in a UInt8Array
          var blob = new Blob([image.data.byteArray], {'type': 'image/png'});
          var url = URL.createObjectURL(blob)
          console.log(url)

          const viewport = cornerstone.getDefaultViewportForImage(element, image);
//          document.getElementById('toggleModalityLUT').checked = (viewport.modalityLUT !== undefined);
//          document.getElementById('toggleVOILUT').checked = (viewport.voiLUT !== undefined);
          cornerstone.displayImage(element, image, viewport);
        })
      },


      setUploadedFile (uploadedFile) {
        this.img = null
        this.canvas = null
        this.canvasCtx = null
        this.bgCanvas = null
        this.bgCanvasCtx = null
        this.canvasPos.deltaX = 0
        this.canvasPos.deltaY = 0
        this.labelingMode = 'draw'
        this.drawingPaths.splice(0, this.drawingPaths.length)
        this.zoomLevel = 1

        console.log(cornerstoneWADOImageLoader)


        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(uploadedFile);
        console.log(imageId);

        this.loadAndViewImage(imageId)

//        this.readFile(uploadedFile)

//        var container = document.getElementById('labeling-area')
//        while (container.firstChild) {
//          container.removeChild(container.firstChild);
//        }
//
//        var img = new Image;
//        img.src = URL.createObjectURL(uploadedFile);
//        img.onload = () => {
//          this.img = img
//          let imgW = img.width
//            let imgH = img.height
//            let ratio
//
//            let containerW = container.getBoundingClientRect().width
//            let containerH = container.getBoundingClientRect().height
//
//            console.log(containerH/containerW + ' : ' + imgH/imgW)
//            console.log(img)
//
//            if (containerH/containerW >= imgH/imgW) {
//              ratio = containerW / imgW
//              this.initCanvas(container, containerW, imgH * ratio, img);
//              this.initialImageWidth = containerW
//              this.newImageHeight = imgH * ratio
//            } else {
//              ratio = containerH / imgH
//              this.initCanvas(container, imgW * ratio, containerH, img);
//              this.initialImageWidth = imgW * ratio
//              this.newImageHeight = containerH
//            }
//        }



//
//        var reader = new FileReader()
//        reader.onload = f => {
//          var data = f.target.result



//          fabric.Image.fromURL(data, img => {
//            let imgW = img.width
//            let imgH = img.height
//            let ratio
//
//            let containerW = container.getBoundingClientRect().width
//            let containerH = container.getBoundingClientRect().height
//
//            console.log(containerH/containerW + ' : ' + imgH/imgW)
//            console.log(img)
//
//            if (containerH/containerW >= imgH/imgW) {
//              ratio = containerW / imgW
//              this.initCanvas(container, containerW, imgH * ratio, img);
//            } else {
//              ratio = containerH / imgH
//              this.initCanvas(container, imgW * ratio, containerH, img);
//            }
//          })

//        }
//        reader.readAsDataURL(uploadedFile);
      },
      createCanvas (parent, width, height) {
        var canvas = {};
        canvas.node = document.createElement('canvas');
        canvas.node.style.position = 'absolute'
        canvas.context = canvas.node.getContext('2d');
        canvas.node.width = width;
        canvas.node.height = height;
        canvas.mouseX = 0
        canvas.mouseY = 0
        parent.appendChild(canvas.node);
        return canvas;
      },
//      createBackgroundCanvas (parent, width, height) {
//        var canvas = {};
//        canvas.node = document.createElement('canvas');
//        canvas.node.style.position = 'absolute'
//        canvas.context = canvas.node.getContext('2d');
//        canvas.node.width = width;
//        canvas.node.height = height;
//        parent.appendChild(canvas.node);
//        return canvas;
//      },
      initCanvas (container, width, height, bgImage) {
        var self = this

        var bgCanvas = this.createCanvas(container, width, height);
        var bgCtx = bgCanvas.context;

        var canvas = this.createCanvas(container, width, height);
        var ctx = canvas.context;

        var hRatio = canvas.width  / bgImage.width;
        var vRatio =  canvas.height / bgImage.height;
        var ratio  = Math.min ( hRatio, vRatio );
        bgCtx.clearRect(0,0,canvas.width, canvas.height);
        bgCtx.drawImage(bgImage, 0,0, width, height)

        // define a custom fillCircle method
        ctx.fillCircle = function(x, y, radius, fillColor) {
          this.fillStyle = fillColor;
          this.beginPath();
          this.moveTo(x, y);
          this.arc(x, y, radius, 0, Math.PI * 2, false);
          this.fill();
        };

        // bind mouse events
        canvas.node.onmousemove = function(e) {
          if (self.labelingMode !== 'pan') {
            if (!canvas.isDrawing) {
              return;
            }
//            console.log(e)
//          var x = e.pageX - this.offsetLeft;
//          var y = e.pageY - this.offsetTop;
            var x = e.layerX - this.offsetLeft;
            var y = e.layerY - this.offsetTop;
            var radius = 10; // or whatever
            var fillColor = 'green'
            ctx.globalCompositeOperation = self.labelingMode === 'erase' ? "destination-out" : "source-over";
            ctx.fillCircle(x, y, radius, fillColor);

            self.drawingPaths.push({
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

              // we need to clear the canvas, otherwise we'll have a bunch of overlapping images
              ctx.clearRect(0,0, canvas.node.width, canvas.node.height);
              bgCtx.clearRect(0,0, canvas.node.width, canvas.node.height);

              // these will be our new x,y position to move the image.
              bgCtx.drawImage(self.img,  self.canvasPos.deltaX, self.canvasPos.deltaY, self.initialImageWidth, self.newImageHeight);
              for (let i=0; i<self.drawingPaths.length; i++) {
                let aPath = self.drawingPaths[i]
                ctx.globalCompositeOperation = aPath.globalCompositeOperation
                ctx.fillCircle(aPath.x * self.zoomRate + self.canvasPos.deltaX, aPath.y * self.zoomRate + self.canvasPos.deltaY, aPath.radius * self.zoomRate, aPath.fillColor)
              }
            }
          }
        };
        canvas.node.onmousedown = function(e) {
          switch (self.labelingMode) {
            case 'draw':
            case 'erase':
              canvas.isDrawing = true;
              canvas.isPanning = false;
              break
            case 'pan':
              var r = canvas.node.getBoundingClientRect();
              canvas.mouseX = (e.clientX - r.left) - self.canvasPos.deltaX;
              canvas.mouseY = (e.clientY - r.top) - self.canvasPos.deltaY;

              canvas.isDrawing = false;
              canvas.isPanning = true;
              break
            default:
              break
          }

        };
        canvas.node.onmouseup = function(e) {
          canvas.isDrawing = false;
          canvas.isPanning = false;
        };
        canvas.node.onmouseleave = function (e) {
          canvas.isDrawing = false;
          canvas.isPanning = false;
        }

        canvas.node.onwheel = function (e) {
          var delta = 0;
          var r = canvas.node.getBoundingClientRect();

//          console.log(e.clientX + ', ' + e.clientY)

          if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
          }
          else if (e.detail) {
            delta = -e.detail / 3;
          }

          var canvasZoomX = (e.clientX - r.left);
          var canvasZoomY = (e.clientY - r.top);

          console.log(canvasZoomX + ', ' + canvasZoomY)
          console.log(canvas.node.width/2 + ', ' + canvas.node.height/2)

          if (delta > 0)
          {
            self.zoomLevel++

            // ZOOMING IN
            var zoomedX = self.canvasPos.deltaX - (canvasZoomX - self.canvasPos.deltaX);
            var zoomedY = self.canvasPos.deltaY - (canvasZoomY - self.canvasPos.deltaY);

            // scale the image up by 2
            self.initialImageWidth = self.initialImageWidth * 2;

            self.zoomRate = self.zoomRate * 2
          }
          else
          {
            self.zoomLevel--

            if (self.zoomLevel < 1) {
              self.zoomLevel = 1
              return
            }

            // ZOOMING OUT
            var zoomedX = (self.canvasPos.deltaX + canvasZoomX) / 2;
            var zoomedY = (self.canvasPos.deltaY + canvasZoomY) / 2

            // scale the image down by 2
            self.initialImageWidth = self.initialImageWidth / 2

            self.zoomRate = self.zoomRate / 2
          }

          self.newImageHeight = self.img.height / self.img.width * self.initialImageWidth;

          // we need to clear the canvas, otherwise we'll have a bunch of overlapping images
          self.canvasCtx.clearRect(0,0, canvas.node.width, canvas.node.height);
          self.bgCanvasCtx.clearRect(0,0, canvas.node.width, canvas.node.height);

          // these will be our new x,y position to move the image.
          self.bgCanvasCtx.drawImage(self.img, zoomedX, zoomedY, self.initialImageWidth, self.newImageHeight);
          for (let i=0; i<self.drawingPaths.length; i++) {
            let aPath = self.drawingPaths[i]
            self.canvasCtx.globalCompositeOperation = aPath.globalCompositeOperation
            self.canvasCtx.fillCircle(aPath.x * self.zoomRate + zoomedX, aPath.y * self.zoomRate + zoomedY, aPath.radius * self.zoomRate, aPath.fillColor)
          }

          // update the new canvas position
          self.canvasPos.deltaX = zoomedX;
          self.canvasPos.deltaY = zoomedY;
        }

        this.canvas = canvas
        this.canvasCtx = ctx

        this.bgCanvas = bgCanvas
        this.bgCanvasCtx = bgCtx
      },
      menuClicked (menu) {
        if (menu.type === 'action') {
          switch (menu.name) {
            case 'Erase':
              this.labelingMode = 'erase'
              break
            case 'Drawing':
              this.labelingMode = 'draw'
              break
            case 'Panning':
              this.labelingMode = 'pan'
              break
            case 'Undo':
              this.doUndo()
              break
            default :
              let saveButton = document.getElementById('saveButton')
              saveButton.click()

              this.doSave()
          }
        }
      },

      doSave () {

        let dicomCanvas = document.getElementsByClassName('cornerstone-canvas')[0]

//        var imageData = this.canvas.node.toDataURL()

        var imageData = dicomCanvas.toDataURL()

        var img = new Image()
        img.onload = () => {
          var tc = document.createElement('canvas');
          tc.width = dicomCanvas.width
          tc.height = dicomCanvas.height

          var tctx = tc.getContext('2d')
          tctx.drawImage(img, 0, 0, tc.width, tc.height)

          var link = document.getElementById('saveButton');
          link.download = 'downloaded.png'
          link.href = tc.toDataURL()//'image/png')
          link.click()
        }
        img.src = imageData
      },

      doUndo () {
        this.drawingPaths.pop()

        this.canvasCtx.clearRect(0,0, this.canvas.node.width, this.canvas.node.height);
        for (let i=0; i<this.drawingPaths.length; i++) {
          let aPath = this.drawingPaths[i]
          this.canvasCtx.globalCompositeOperation = aPath.globalCompositeOperation
          this.canvasCtx.fillCircle(aPath.x * this.zoomRate + this.canvasPos.deltaX, aPath.y * this.zoomRate + this.canvasPos.deltaY, aPath.radius * this.zoomRate, aPath.fillColor)
        }
      },
      resetFbCanvas () {
        this.fbCanvas.freeDrawingBrush.color = 'black'
        this.fbCanvas.freeDrawingBrush.width = 5
//        this.fbCanvas.setWidth(0)
//        this.fbCanvas.setHeight(0)
        this.fbCanvas.setZoom(1)
        this.keepPositionInBounds()
        this.fbCanvas.defaultCursor = 'crosshair'
        //
        this.zoomLevel = 0
        this.shiftKeyDown = false
      },
      drawingMode () {
        this.fbCanvasCtx.globalCompositeOperation = 'source-over'
        this.fbCanvas.freeDrawingBrush.color = 'black'
      },
      eraseMode () {
        this.fbCanvasCtx.globalCompositeOperation = 'destination-out'
        this.fbCanvas.freeDrawingBrush.color = 'rgba(0,0,0,1)'
      },
      zoomIn (point) {
        if (this.zoomLevel < this.zoomLevelMax) {
//          this.zoomLevel++;
          this.zoomLevel += 0.5
          this.fbCanvas.zoomToPoint(point, Math.pow(2, this.zoomLevel));
          this.keepPositionInBounds(this.fbCanvas);
        }
      },
      zoomOut (point) {
        if (this.zoomLevel > this.zoomLevelMin) {
//          this.zoomLevel--;
          this.zoomLevel -= 0.5
          this.fbCanvas.zoomToPoint(point, Math.pow(2, this.zoomLevel));
          this.keepPositionInBounds(this.fbCanvas);
        }
      },
      keepPositionInBounds () {
        var zoom = this.fbCanvas.getZoom();
        var xMin = (2 - zoom) * this.fbCanvas.getWidth() / 2;
        var xMax = zoom * this.fbCanvas.getWidth() / 2;
        var yMin = (2 - zoom) * this.fbCanvas.getHeight() / 2;
        var yMax = zoom * this.fbCanvas.getHeight() / 2;

        var point = new fabric.Point(this.fbCanvas.getWidth() / 2, this.fbCanvas.getHeight() / 2);
        var center = fabric.util.transformPoint(point, this.fbCanvas.viewportTransform);

        var clampedCenterX = this.clamp(center.x, xMin, xMax);
        var clampedCenterY = this.clamp(center.y, yMin, yMax);

        var diffX = clampedCenterX - center.x;
        var diffY = clampedCenterY - center.y;

        if (diffX !== 0 || diffY !== 0) {
          this.fbCanvas.relativePan(new fabric.Point(diffX, diffY));
        }
      },
      clamp (value, min, max) {
        return Math.max(min, Math.min(value, max));
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../style/bh_style.scss";

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

      .labeling-area {
        position: relative;
        margin: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        overflow: auto;

        /*.image-canvas {*/
          /*width: 100%;*/
          /*height: 100%;*/
        /*}*/


        /*canvas {*/
          /*position: absolute;*/
          /*margin: 0;*/
          /*top: 0;*/
          /*left: 0;*/
          /*right: 0;*/
          /*bottom: 0;*/
        /*}*/
      }
    }
  }
</style>
