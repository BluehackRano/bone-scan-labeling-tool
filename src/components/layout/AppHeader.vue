<template>
  <section class="hero is-bold app-navbar">
    <div class="hero-head">

      <div class="nav-load-file-area">
        <b-field class="nav-load-file-b-field">
          <b-upload v-model="files" @change.native="fileUploaded">
            <a class="button nav-load-file-button">
              <img src="/static/images/icons/img-nor-over-open-dicom.svg">
              <span>Load file</span>
            </a>
          </b-upload>
        </b-field>

        <span class="nav-load-file-label">
          <template v-if="files && files.length">&nbsp; | &nbsp;{{ fileName }}</template>
        </span>
      </div>

      <nav class="nav">
        <div class="nav-left" @click="logoClicked">
          <img src="/static/images/logos/img-logo-vuno.svg">
        </div>

        <div class="nav-right">
          <a class="button nav-help-button"
            @click="helpButtonClicked">
            Help
          </a>
        </div>
      </nav>

    </div>
  </section>
</template>

<script>
  import * as mutationType from '@/store/mutation-types'
  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'AppHeader',
    data () {
      return {
        files: null,
        fileName: null
      }
    },
    created () {
    },
    methods: {
      logoClicked () {
        this.$router.go('/')
      },
      fileUploaded () {
        let uploadedFile = this.files[0]
        if (uploadedFile.name === this.fileName) {
          return
        }
        this.fileName = uploadedFile.name
        let subFileName = this.fileName.substring(0, this.fileName.lastIndexOf('.'))
        let subFileType = this.fileName.substring(this.fileName.lastIndexOf('.') + 1, this.fileName.length)

        console.log('Loaded FILE: ')
        console.log(uploadedFile)

        switch (uploadedFile.type) {
          case 'image/jpeg':
          case 'image/png':
          case 'application/dicom':
            this.$store.commit(mutationType.SET_LOADED_FILE, {file: uploadedFile, name: subFileName, type: uploadedFile.type})
            this.$bus.$emit(busType.FILE_UPLOADED, {file: uploadedFile})
            break
          default:
            if (subFileType === 'dcm' || subFileType === 'DCM') {
              this.$store.commit(mutationType.SET_LOADED_FILE, {file: uploadedFile, name: subFileName, type: 'application/dicom'})
              this.$bus.$emit(busType.FILE_UPLOADED, {file: uploadedFile, fileType: 'application/dicom'})
            } else {
              alert('ERROR: File Type Error')
            }
            break
        }
      },
      helpButtonClicked () {
        this.$bus.$emit(busType.SHOW_HELP_POPUP, null)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../style/bh_style.scss";

  .app-navbar {
    position: fixed;
    width: 100%;
    z-index: 1024;
    background-color: $header-bg-color;
    font-weight: bold;
  }

  .hero .nav {
    height: $header-height;
    box-shadow: none;
  }

  .hero-head {
    height: $header-height;
  }

  .nav-item img {
    max-height: 100%;
  }

  .nav-left {
    img {
      margin-left: 14px;
      /*pointer-events: none;*/
      cursor: pointer;

      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }

  .nav-load-file-area {
    position: fixed;
    left: $sidebar-width;
    z-index: 1025;
    display: inline;
  }
  .nav-load-file-b-field {

  }
  .nav-load-file-button {
    margin-top: 20px;
    padding: 0 15px 0 0;
    width: 132px;
    height: 40px;
    background-color: $header-load-file-button-normal-color;
    color: $header-load-file-button-normal-label-color;
    border: none;

    span {
      font-size: 15px;
    }

    &:hover {
      background-color: #4c456d;
    }

    &:active {
      background-color: #27305e;
    }
  }
  .nav-load-file-label {
    margin-left: 137px;
    margin-top: 30px;
    top: 0px;
    width: 800px;
    height: 20px;
    font-size: 15px;
    color: white;
    position: absolute;
  }

  .nav-help-button {
    width: 80px;
    height: 80px;
    background-color: $sidebar-menu-button-normal-color;
    color: $header-help-button-normal-label-color;
    border: none;

    &:hover {
      background-color: $sidebar-menu-button-over-color;
    }
  }
</style>
