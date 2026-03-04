import { render, screen, waitFor } from '@testing-library/vue'
import { vi } from 'vitest'
import AgentList from '@/views/AgentList.vue'

vi.mock('@/api/agents', () => ({
  listAgents: vi.fn(),
}))

const listAgents = (await import('@/api/agents')).listAgents as unknown as ReturnType<
  typeof vi.fn
>

describe('AgentList', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders agents in table when API succeeds', async () => {
    ;(listAgents as any).mockResolvedValue({
      data: [
        {
          id: '1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          mobileNumber: '+1234567890',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      error: null,
    })

    render(AgentList)

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('shows error message when API fails', async () => {
    ;(listAgents as any).mockResolvedValue({
      data: null,
      error: {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong',
        },
      },
    })

    render(AgentList)

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    })
  })
})

