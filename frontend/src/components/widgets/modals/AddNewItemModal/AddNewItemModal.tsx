import { Modal } from '../Modal/Modal'
import { AddNewItem } from '../AddNewItem/AddNewItem'
import type { Listing } from '../../../../types/listing'

interface AddNewItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  listing?: Listing
}

export const AddNewItemModal = ({
  isOpen,
  onClose,
  onSuccess,
  listing,
}: AddNewItemModalProps) => {
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={listing ? 'Редактировать объект' : 'Добавить объект'}
    >
      <AddNewItem listing={listing} onSuccess={handleSuccess} />
    </Modal>
  )
}
