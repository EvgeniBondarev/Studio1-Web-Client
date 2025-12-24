import {useMemo} from 'react';
import type {EtProducer} from '../../../api/types.ts';
import {useQueries} from '@tanstack/react-query';
import {fetchPartsCount} from '../../../api/parts.ts';
import type {PartsCountInfo} from './useSortedProducers.ts';

type Props = {
  producers: EtProducer[]
}

export const useProducersPartsCount = ({producers}: Props) => {
  // Загружаем количество деталей для каждого производителя
  const queries = useQueries({
    queries: producers.map((producer) => ({
      queryKey: ['producerPartsCount', producer.Id],
      queryFn: () => fetchPartsCount(producer.Id),
      enabled: Boolean(producer.Id),
      staleTime: 5 * 60 * 1000,
    })),
  })

  return useMemo(() => {
    const map = new Map<number, PartsCountInfo>()
    producers.forEach((producer, index) => {
      const query = queries[index]
      map.set(producer.Id, {
        value: query?.data,
        isLoading: query?.isLoading ?? false,
      })
    })
    return map
  }, [producers, queries])
}
