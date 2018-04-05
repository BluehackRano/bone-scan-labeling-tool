import Vue from 'vue'
import Router from 'vue-router'
// import BoneScanLabeling from '@/views/BoneScanLabeling'
import BoneScanLabelingRefac from '@/views/BoneScanLabelingRefac'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    // {
    //   path: '/',
    //   // redirect: '/labeling'
    //   name: 'BoneScanLabeling',
    //   component: BoneScanLabeling
    // },
    {
      path: '/',
      name: 'BoneScanLabelingRefac',
      component: BoneScanLabelingRefac
    }
    ,
    // {
    //   path: '/labeling',
    //   name: 'BoneScanLabeling',
    //   component: BoneScanLabeling
    // }
  ]
})
