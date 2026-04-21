import { Component } from 'react'
import type { ReactNode } from 'react'
import { Flex, Callout, Button } from '@radix-ui/themes'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <Flex justify="center" p="8">
          <Callout.Root color="red">
            <Callout.Text>{this.state.error.message}</Callout.Text>
            <Button mt="3" variant="soft" color="red" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
          </Callout.Root>
        </Flex>
      )
    }
    return this.props.children
  }
}
