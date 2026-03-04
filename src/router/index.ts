import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'AgentList', component: () => import('@/views/AgentList.vue'), meta: { title: 'Agents' } },
    { path: '/agents/:id/edit', name: 'AgentEdit', component: () => import('@/views/AgentForm.vue'), meta: { title: 'Edit Agent' } },
  ],
})

router.afterEach((to) => {
  const title = to.meta.title as string
  if (title) document.title = `${title} | Property Management`
})

export default router
