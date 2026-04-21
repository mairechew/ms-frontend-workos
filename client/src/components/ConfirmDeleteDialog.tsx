import type { ReactNode } from 'react'
import { AlertDialog, Button, Flex } from '@radix-ui/themes'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  onConfirm: () => void
}

export default function ConfirmDeleteDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm }: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="var(--dialog-max-width)">
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description mt="2">{description}</AlertDialog.Description>
        <Flex gap="3" justify="end" mt="4">
          <AlertDialog.Cancel>
            <Button variant="outline" color="gray" highContrast>Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button color="red" onClick={onConfirm}>{confirmLabel}</Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
