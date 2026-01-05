import { useMemo } from 'react';
import type {EtProducer} from '../../../api/types.ts';
import type {SortField, SortOrder} from '../ProducerPanel.tsx';

export interface PartsCountInfo {
  value?: number;
  isLoading: boolean;
}

interface Props {
  producers: EtProducer[];
  sortField: SortField | null;
  sortOrder: SortOrder;
  partsCountMap: Map<number, PartsCountInfo>;
}

export const useSortedProducers = ({
                                     producers,
                                     sortField,
                                     sortOrder,
                                     partsCountMap,
                                   }: Props): EtProducer[] => {
  return useMemo(() => {
    if (!sortField) {
      return producers;
    }

    return [...producers].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'prefix': {
          const prefixA = a.MarketPrefix ?? a.Prefix ?? '';
          const prefixB = b.MarketPrefix ?? b.Prefix ?? '';
          comparison = prefixA.localeCompare(prefixB, 'ru', { sensitivity: 'base' });
          break;
        }
        case 'name': {
          const nameA = a.Name ?? '';
          const nameB = b.Name ?? '';
          comparison = nameA.localeCompare(nameB, 'ru', { sensitivity: 'base' });
          break;
        }
        case 'count': {
          const countA = partsCountMap.get(a.Id)?.value ?? 0;
          const countB = partsCountMap.get(b.Id)?.value ?? 0;
          comparison = countA - countB;
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [producers, sortField, sortOrder, partsCountMap]);
};