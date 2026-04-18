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
      style={{ borderTop: '1px solid var(--gray-a5)' }}
    >
      <Button variant="soft" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </Flex>
  )
}
