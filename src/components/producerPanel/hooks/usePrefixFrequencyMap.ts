import {useMemo} from 'react';
import type {EtProducer} from '../../../api/types.ts';

export const usePrefixFrequencyMap=(producers: EtProducer[])=> {
  return useMemo(() => {
    const map = new Map<string, number>()

    producers.forEach((producer) => {
      const prefix = producer.MarketPrefix ?? producer.Prefix ?? ''
      if (prefix && prefix !== '—') {
        map.set(prefix, (map.get(prefix) || 0) + 1)
      }
    })

    return map
  }, [producers])
}
