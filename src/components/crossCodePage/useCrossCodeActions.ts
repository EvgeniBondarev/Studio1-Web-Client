import {App, Modal} from 'antd'
import {
  fetchPartsPageWithoutProducer,
  updatePart,
  createPart,
  deletePart,
} from '../../api/parts'
import {
  fetchProducerById,
  updateProducer,
  createProducer,
  deleteProducer,
} from '../../api/producers'
import {useEntityMutation} from '../hooks/useEntityMutation'
import type {EtPart, EtProducer} from '../../api/types'

type Props = {
  mainCode: string
  // setters из страницы
  setEditingPart: (p: EtPart | null) => void
  setIsPartModalOpen: (v: boolean) => void
  setViewingPart: (p: EtPart | null) => void
  setViewingPartProducer: (p: EtProducer | null) => void

  setEditingProducer: (p: EtProducer | null) => void
  setIsProducerModalOpen: (v: boolean) => void
  setViewingProducer: (p: EtProducer | null) => void
}

export function useCrossCodeActions({
                                      mainCode,
                                      setEditingPart,
                                      setIsPartModalOpen,
                                      setViewingPart,
                                      setViewingPartProducer,
                                      setEditingProducer,
                                      setIsProducerModalOpen,
                                      setViewingProducer,
                                    }: Props) {

  const {message} = App.useApp()

  // ================== MUTATIONS ==================

  const partUpdateMutation = useEntityMutation(
    ({id, payload}: { id: number; payload: Partial<EtPart> }) =>
      updatePart(id, payload),
    {
      successMessage: 'Деталь сохранена',
      invalidate: [['cross-tree', mainCode], ['cross-all', mainCode]],
      onSuccessExtra: () => {
        setIsPartModalOpen(false)
        setEditingPart(null)
      },
    }
  )

  const partCreateMutation = useEntityMutation(
    (payload: Partial<EtPart>) => createPart(payload),
    {
      successMessage: 'Деталь добавлена',
      invalidate: [['cross-tree', mainCode], ['cross-all', mainCode]],
      onSuccessExtra: () => {
        setIsPartModalOpen(false)
        setEditingPart(null)
      },
    }
  )

  const partDeleteMutation = useEntityMutation(
    (id: number) => deletePart(id),
    {
      successMessage: 'Деталь удалена',
      invalidate: [['cross-tree', mainCode], ['cross-all', mainCode]],
    }
  )

  const producerUpdateMutation = useEntityMutation(
    ({id, payload}: { id: number; payload: Partial<EtProducer> }) =>
      updateProducer(id, payload),
    {
      successMessage: 'Производитель сохранен',
      invalidate: [['cross-tree', mainCode]],
      onSuccessExtra: () => {
        setIsProducerModalOpen(false)
        setEditingProducer(null)
      },
    }
  )

  const producerCreateMutation = useEntityMutation(
    (payload: Partial<EtProducer>) => createProducer(payload),
    {
      successMessage: 'Производитель добавлен',
      invalidate: [['cross-tree', mainCode]],
      onSuccessExtra: () => {
        setIsProducerModalOpen(false)
        setEditingProducer(null)
      },
    }
  )

  const producerDeleteMutation = useEntityMutation(
    (id: number) => deleteProducer(id),
    {
      successMessage: 'Производитель удален',
      invalidate: [['cross-tree', mainCode]],
    }
  )

  // ================== PART HANDLERS ==================

  const handlePartView = async (code: string) => {
    try {
      const page = await fetchPartsPageWithoutProducer(code, 'exact')
      const part = page.items.find(p => p.Code === code)
      if (!part) return message.warning('Деталь не найдена')

      const producer = part.ProducerId
        ? await fetchProducerById(part.ProducerId).catch(() => null)
        : null

      setViewingPartProducer(producer)
      setViewingPart(part)
    } catch {
      message.error('Ошибка при загрузке детали')
    }
  }

  const handlePartEdit = async (code: string) => {
    try {
      const page = await fetchPartsPageWithoutProducer(code, 'exact')
      const part = page.items.find(p => p.Code === code)
      if (!part) return message.warning('Деталь не найдена')

      setEditingPart(part)
      setIsPartModalOpen(true)
    } catch {
      message.error('Ошибка при загрузке детали')
    }
  }

  const handlePartDeleteByCode = async (code: string) => {
    const page = await fetchPartsPageWithoutProducer(code, 'exact')
    const part = page.items.find(p => p.Code === code)
    if (!part) return

    Modal.confirm({
      title: 'Удалить деталь?',
      content: `Удалить деталь ${part.Code ?? 'без кода'}?`,
      okButtonProps: {danger: true, loading: partDeleteMutation.isPending},
      onOk: () => partDeleteMutation.mutate(part.Id),
    })
  }

  // ================== PRODUCER HANDLERS ==================

  const handleProducerView = async (id: number) => {
    try {
      const producer = await fetchProducerById(id)
      setViewingProducer(producer)
    } catch {
      message.error('Ошибка при загрузке производителя')
    }
  }

  const handleProducerEdit = async (id: number) => {
    try {
      const producer = await fetchProducerById(id)
      setEditingProducer(producer)
      setIsProducerModalOpen(true)
    } catch {
      message.error('Ошибка при загрузке производителя')
    }
  }

  const handleProducerDelete = (producer: EtProducer) => {
    Modal.confirm({
      title: 'Удалить производителя?',
      content: `Вы уверены, что хотите удалить ${producer.Name ?? 'без названия'}?`,
      okText: 'Удалить',
      cancelText: 'Отмена',
      okButtonProps: {danger: true, loading: producerDeleteMutation.isPending},
      onOk: () => producerDeleteMutation.mutate(producer.Id),
    })
  }

  return {
    // handlers
    handlePartView,
    handlePartEdit,
    handlePartDeleteByCode,
    handleProducerView,
    handleProducerEdit,
    handleProducerDelete,

    // mutations for forms
    partUpdateMutation,
    partCreateMutation,
    partDeleteMutation,
    producerUpdateMutation,
    producerCreateMutation,
    producerDeleteMutation
  }
}
