import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页概览', icon: 'DashboardOutlined' }
      },
      {
        path: 'books',
        name: 'Books',
        component: () => import('@/views/books/BookList.vue'),
        meta: { title: '图书管理', icon: 'BookOutlined' }
      },
      {
        path: 'readers',
        name: 'Readers',
        component: () => import('@/views/readers/ReaderList.vue'),
        meta: { title: '读者管理', icon: 'UserOutlined' }
      },
      {
        path: 'borrow',
        name: 'Borrow',
        component: () => import('@/views/borrow/BorrowList.vue'),
        meta: { title: '借阅管理', icon: 'SwapOutlined' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/CategoryList.vue'),
        meta: { title: '分类管理', icon: 'AppstoreOutlined' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = localStorage.getItem('library_user')

  if (to.path !== '/login' && !userStore) {
    next('/login')
  } else if (to.path === '/login' && userStore) {
    next('/dashboard')
  } else {
    document.title = to.meta.title ? `${to.meta.title} - 图书馆管理系统` : '图书馆管理系统'
    next()
  }
})

export default router
