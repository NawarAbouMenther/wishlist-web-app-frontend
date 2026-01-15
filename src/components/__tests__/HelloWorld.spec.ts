import { render, screen } from '@testing-library/vue'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders the greeting text', () => {
    render(HelloWorld, {
      props: { msg: 'Test' }
    })

    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders the project creation text', () => {
    render(HelloWorld, {
      props: { msg: 'Test' }
    })

    expect(screen.getByText(/successfully created/)).toBeInTheDocument()
  })
})
