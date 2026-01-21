import { render, screen } from '@/lib/test-utils'
import { Button } from './button'

describe('Button Component', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>)

        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('bg-primary')
    })

    it('renders as a child when asChild is true', () => {
        // This tests the Slot functionality from Radix UI
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        )

        const link = screen.getByRole('link', { name: /link button/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/test')
    })
})
