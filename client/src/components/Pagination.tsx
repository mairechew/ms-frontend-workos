import { Flex, Button } from '@radix-ui/themes'

interface Props {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <Flex
      justify="end"
      gap="2"
      px="4"
      py="3"
      style={{ borderTop: 'var(--border-subtle)' }}
    >
      <Button variant="soft" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <Button variant="outline" color="gray" highContrast disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} style={{ fontWeight: 'bold' }}>
        Next
      </Button>
    </Flex>
  )
}
