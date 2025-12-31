import { Modal, message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {EtProducer} from '../../../api/types.ts';
import {createProducer, deleteProducer, updateProducer} from '../../../api/producers.ts';

interface Props {
  onAfterSave?: () => void
  onDeleted?: (id: number) => void
}

export const useProducerMutations = ({
                                       onAfterSave,
                                       onDeleted,
                                     }:Props = {}) => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createProducer,
    onSuccess: () => {
      message.success('Производитель создан')
      queryClient.invalidateQueries({ queryKey: ['producers'] })
      onAfterSave?.()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EtProducer> }) =>
      updateProducer(id, payload),
    onSuccess: () => {
      message.success('Изменения сохранены')
      queryClient.invalidateQueries({ queryKey: ['producers'] })
      onAfterSave?.()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProducer(id),
    onSuccess: (_, id) => {
      message.success('Производитель удалён')
      queryClient.invalidateQueries({ queryKey: ['producers'] })
      onDeleted?.(id)
    },
  })

  const confirmDelete = (producer: EtProducer) => {
    Modal.confirm({
      title: 'Удалить производителя?',
      content: `Вы уверены, что хотите удалить ${producer.Name ?? 'без названия'}?`,
      okText: 'Удалить',
      cancelText: 'Отмена',
      okButtonProps: {danger: true, loading: deleteMutation.isPending},
      onOk: () => deleteMutation.mutate(producer.Id),
    })
  }

  return {
    createProducer: createMutation.mutate,
    updateProducer: updateMutation.mutate,
    confirmDelete,

    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
