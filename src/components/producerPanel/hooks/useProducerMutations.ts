import {Modal} from 'antd'
import type {EtProducer} from '../../../api/types.ts';
import {createProducer, deleteProducer, updateProducer} from '../../../api/producers.ts';
import {useEntityMutation} from '../../hooks/useEntityMutation.ts';

interface Props {
  onAfterSave?: () => void
  onDeleted?: (id: number) => void
}

export const useProducerMutations = ({
                                       onAfterSave,
                                       onDeleted,
                                     }:Props = {}) => {

  const createMutation = useEntityMutation<Partial<EtProducer>, EtProducer>(
    createProducer,
    {
      successMessage: 'Производитель создан',
      invalidate: [['producers']],
      onSuccessExtra: onAfterSave,
    }
  )

  const updateMutation = useEntityMutation<{ id: number; payload: Partial<EtProducer> }, EtProducer>(
    ({ id, payload }) => updateProducer(id, payload),
    {
      successMessage: 'Изменения сохранены',
      invalidate: [['producers']],
      onSuccessExtra: onAfterSave,
    }
  )

  const deleteMutation = useEntityMutation<number, void>(
    (id) => deleteProducer(id),
    {
      successMessage: 'Производитель удалён',
      invalidate: [['producers']],
      onSuccessExtra: (id) => onDeleted?.(id),
    }
  )

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
