import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
        { path: 'setup/:gameId', name: 'setup', component: () => import('@/views/GameSetupView.vue') },
      ],
    },
    {
      path: '/mahjong/rules',
      name: 'mahjong-rules',
      component: () => import('@/games/mahjong/MahjongRuleSetup.vue'),
    },
    {
      path: '/mahjong/play',
      name: 'mahjong-play',
      component: () => import('@/games/mahjong/MahjongTable.vue'),
    },
    {
      path: '/doudizhu/play',
      name: 'doudizhu-play',
      component: () => import('@/games/doudizhu/DoudizhuTable.vue'),
    },
    {
      path: '/gomoku/play',
      name: 'gomoku-play',
      component: () => import('@/games/gomoku/GomokuBoard.vue'),
    },
  ],
})

export default router
