import Vue from 'vue'
import Router from 'vue-router'
import BoneScanLabeling from '@/views/BoneScanLabeling'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      // redirect: '/labeling'
      name: 'BoneScanLabeling',
      component: BoneScanLabeling
    },
    {
      path: '/labeling',
      name: 'BoneScanLabeling',
      component: BoneScanLabeling
    }
  ]
})
