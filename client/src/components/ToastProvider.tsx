import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Z } from '../lib/constants'
import type { ReactNode } from 'react'
import { Card, Flex, Text, Button, IconButton } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'

interface Toast {
  id: string
  title: string
  action?: { label: string; onClick: () => void }
}

type ShowToast = (toast: Omit<Toast, 'id'>) => void

const ToastContext = createContext<ShowToast>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

const DURATION = 5000

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), DURATION)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card style={{ minWidth: 'var(--toast-min-width)', boxShadow: 'var(--shadow-4)' }}>
      <Flex align="center" justify="between" gap="4">
        <Text size="2" weight="medium">{toast.title}</Text>
        <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
          {toast.action && (
            <Button size="1" variant="soft" onClick={() => { toast.action?.onClick(); onDismiss() }}>
              {toast.action.label}
            </Button>
          )}
          <IconButton size="1" variant="ghost" color="gray" aria-label="Dismiss" onClick={onDismiss}>
            <Cross2Icon />
          </IconButton>
        </Flex>
      </Flex>
    </Card>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback<ShowToast>(toast => {
    setToasts(prev => [...prev, { ...toast, id: crypto.randomUUID() }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Flex
        direction="column"
        gap="2"
        style={{
          position: 'fixed',
          bottom: 'var(--space-5)',
          right: 'var(--space-5)',
          zIndex: Z.toast,
        }}
      >
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </Flex>
    </ToastContext.Provider>
  )
}
