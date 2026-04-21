import type { ReactNode } from 'react'
import { Dialog, Button, Flex, Callout } from '@radix-ui/themes'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  error?: string | null
  submitLabel: string
  onSubmit: () => void
  submitDisabled?: boolean
  submitLoading?: boolean
}

export default function FormDialog({
  open, onOpenChange, title, children,
  error, submitLabel, onSubmit, submitDisabled, submitLoading,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="4" maxWidth="var(--dialog-max-width)">
        <Dialog.Title>{title}</Dialog.Title>
        <Flex direction="column" gap="4" mt="4">
          {children}
          {error && (
            <Callout.Root color="red">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}
          <Flex gap="3" justify="end" mt="2">
            <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
            <Button onClick={onSubmit} disabled={submitDisabled} loading={submitLoading}>
              {submitLabel}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
