import Vue from 'vue'
import Router from 'vue-router'

import TwitchApp from '../components/TwitchApp.vue'
import Home from '../components/Home.vue'

Vue.use(Router)
export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/app',
      name: 'TwitchApp',
      component: TwitchApp
    }
  ]
})
