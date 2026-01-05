import {useMemo} from 'react';
import type {EtProducer} from '../../../api/types.ts';
import type {SearchType} from '../../../config/resources.ts';

interface UseFilteredProducersParams {
  allProducers: EtProducer[]
  missingProducers: EtProducer[]
  searchType: SearchType
  filterProducerIds?: number[]
}

export const useFilteredProducers=({
                                       allProducers,
                                       missingProducers,
                                       searchType,
                                       filterProducerIds,
                                     }: UseFilteredProducersParams)=> {
  return useMemo(() => {
    const combined = [...allProducers, ...missingProducers]

    if (
      searchType === 'without_producer' &&
      filterProducerIds &&
      filterProducerIds.length > 0
    ) {
      const filterSet = new Set(filterProducerIds)
      return combined.filter((producer) => filterSet.has(producer.Id))
    }

    return combined
  }, [allProducers, missingProducers, searchType, filterProducerIds])
}
