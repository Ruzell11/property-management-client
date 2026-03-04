import { render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { vi } from 'vitest'
import AgentView from '@/views/AgentView.vue'

vi.mock('@/api/agents', () => ({
  getAgent: vi.fn(),
  deleteAgent: vi.fn(),
}))

const { getAgent } = await import('@/api/agents')

function makeRouter(id: string) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/agents/:id', name: 'AgentView', component: AgentView },
    ],
  })
}

describe('AgentView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders agent details when found', async () => {
    ;(getAgent as any).mockResolvedValue({
      data: {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        mobileNumber: '+1234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
    })

    const router = makeRouter('1')
    router.push('/agents/1')
    await router.isReady()

    render(AgentView, {
      global: { plugins: [router] },
    })

    await waitFor(() => {
      // Use getAllByText since the name may appear in both the hero and the delete dialog body
      const matches = screen.getAllByText('Jane Doe')
      expect(matches.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('shows not found message when API returns NOT_FOUND', async () => {
    ;(getAgent as any).mockResolvedValue({
      data: null,
      error: {
        error: {
          code: 'NOT_FOUND',
          message: 'Property agent not found.',
        },
      },
    })

    const router = makeRouter('missing')
    router.push('/agents/missing')
    await router.isReady()

    render(AgentView, {
      global: { plugins: [router] },
    })

    await waitFor(() => {
      expect(screen.getByText(/Agent not found/i)).toBeInTheDocument()
    })
  })
})