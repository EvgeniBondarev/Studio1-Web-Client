import React, {useCallback, useState} from 'react'
import {message} from 'antd'
import type {EtProducer} from '../../../api/types.ts';
import type {SearchType} from '../../../config/resources.ts';


interface Props {
  searchType: SearchType
  selectedProducer?: EtProducer | null
  onSelect: (producer: EtProducer | null) => void
  onLinkRequested: (targetProducer: EtProducer) => void
}

export const useProducerSelection = ({
                                       searchType,
                                       selectedProducer,
                                       onSelect,
                                       onLinkRequested,
                                     }: Props) => {
  const [selectedProducerIds, setSelectedProducerIds] = useState<Set<number>>(new Set())

  const clearSelection = useCallback(() => {
    setSelectedProducerIds(new Set())
  }, [])

  const handleProducerClick = useCallback(
    (producer: EtProducer, event: React.MouseEvent<HTMLDivElement>) => {
      //  // Если зажат Ctrl, добавляем/убираем из выделения (Ctrl / Cmd — мультивыбор)
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        event.stopPropagation()

        setSelectedProducerIds((prev) => {
          const newSet = new Set(prev)
          if (newSet.has(producer.Id)) {
            newSet.delete(producer.Id)
          } else {
            newSet.add(producer.Id)
          }
          return newSet
        })
        return
      }

      // Если есть выделенные производители и клик без Ctrl, показываем модальное окно ссылки на оригинал
      if (selectedProducerIds.size > 0) {
        event.preventDefault()
        event.stopPropagation()
        onLinkRequested(producer)
        return
      }

      // Поиск без производителя
      if (searchType === 'without_producer') {
        message.info(
          'Сейчас включён поиск деталей без привязки к производителю.',
        )
        return
      }

      // Обычный выбор
      if (producer.Id !== selectedProducer?.Id) {
        onSelect(producer)
      }
    },
    [
      onLinkRequested,
      onSelect,
      searchType,
      selectedProducer?.Id,
      selectedProducerIds,
    ],
  )

  return {
    selectedProducerIds,
    clearSelection,
    handleProducerClick,
  }
}
