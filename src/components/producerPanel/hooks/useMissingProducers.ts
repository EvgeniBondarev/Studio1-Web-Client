import {useMemo} from 'react';
import type {EtProducer} from '../../../api/types.ts';
import type {SearchType} from '../../../config/resources.ts';
import {useQueries} from '@tanstack/react-query';
import {fetchProducerById} from '../../../api/producers.ts';

interface Props {
  allProducers: EtProducer[]
  searchType: SearchType
  filterProducerIds?: number[]
}

export const useMissingProducers=({
                                      allProducers,
                                      searchType,
                                      filterProducerIds,
                                    }: Props)=> {
  const missingProducerIds = useMemo(() => {
    if (
      searchType === 'without_producer' &&
      filterProducerIds &&
      filterProducerIds.length > 0
    ) {
      const existingIds = new Set(allProducers.map((p) => p.Id))
      return filterProducerIds.filter((id) => !existingIds.has(id))
    }
    return []
  }, [searchType, filterProducerIds, allProducers])

  const missingProducersQueries = useQueries({
    queries: missingProducerIds.map((producerId) => ({
      queryKey: ['producer', producerId],
      queryFn: () => fetchProducerById(producerId),
      enabled: searchType === 'without_producer' && missingProducerIds.length > 0,
      staleTime: 5 * 60 * 1000,
    })),
  })

  const missingProducers = useMemo(() => {
    return missingProducersQueries
      .map((q) => q.data)
      .filter((p): p is EtProducer => Boolean(p))
  }, [missingProducersQueries])

  return {
    missingProducers,
    missingProducerIds,
    isLoading: missingProducersQueries.some((q) => q.isLoading),
  }
}