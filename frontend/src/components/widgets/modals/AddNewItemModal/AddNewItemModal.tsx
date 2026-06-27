import { Modal } from '../Modal/Modal'
import { AddNewItem } from '../AddNewItem/AddNewItem'

interface AddNewItemModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

export const AddNewItemModal = ({ isOpen, onClose, onCreated }: AddNewItemModalProps) => {
  const handleCreated = () => {
    onCreated?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить объект">
      <AddNewItem onCreated={handleCreated} />
    </Modal>
  )
}
