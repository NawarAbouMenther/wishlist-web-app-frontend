import { createRouter, createWebHistory } from 'vue-router'

import WelcomeView from '../views/WelcomeView.vue'
import CategorySelection from '../views/CategorySelection.vue'
import CategoryView from '../views/CategoryView.vue'
import WishList from '../components/WishList.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'welcome', component: WelcomeView },
    { path: '/categories', name: 'categories', component: CategorySelection },
    { path: '/category/:id', name: 'category', component: CategoryView },
    { path: '/wishlist/:id', name: 'wishlist', component: WishList }
  ]
})

export default router
