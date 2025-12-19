import { useMemo } from 'react';
import type { SearchType } from './PartsPanel.tsx';
import type { EtPart, EtProducer } from '../../api/types.ts';

interface UseCountLabelProps {
    searchType: SearchType;
    trimmedSearch?: string;
    producer?: EtProducer | null;
    filteredParts: EtPart[];
    parts: EtPart[];
    totalParts?: number;
}

interface UseCountLabelResult {
    countLabel: string;
    resolvedTotalCount: number | undefined;
}

export const useCountLabel = ({
                                  searchType,
                                  trimmedSearch,
                                  producer,
                                  filteredParts,
                                  parts,
                                  totalParts,
                              }: UseCountLabelProps): UseCountLabelResult => {
    const resolvedTotalCount = useMemo(() => {
        const hasProducer = Boolean(producer?.Id);
        return totalParts ?? (hasProducer ? parts.length : undefined);
    }, [producer, parts, totalParts]);

    const countLabel = useMemo(() => {
        if (searchType === 'without_producer') {
            if (!trimmedSearch) {
                return '—';
            }
            const currentPageCount = parts.length;
            const total = resolvedTotalCount !== undefined ? resolvedTotalCount : '...';
            return `${currentPageCount.toLocaleString('ru-RU')} / ${
                typeof total === 'number' ? total.toLocaleString('ru-RU') : total
            }`;
        }

        if (!producer) {
            return '—';
        }

        if (trimmedSearch) {
            return `${filteredParts.length.toLocaleString('ru-RU')} / ${
                resolvedTotalCount !== undefined ? resolvedTotalCount.toLocaleString('ru-RU') : '...'
            }`;
        }

        return resolvedTotalCount !== undefined ? resolvedTotalCount.toLocaleString('ru-RU') : '...';
    }, [searchType, trimmedSearch, producer, filteredParts, parts, resolvedTotalCount]);

    return { countLabel, resolvedTotalCount };
};