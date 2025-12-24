import { useMemo } from 'react';
import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import {
    fetchPartsPage,
    fetchPartsPageWithoutProducer,
    fetchStringsByIds,
    type PartsPageResult
} from '../../../api/parts.ts';
import { fetchProducerById } from '../../../api/producers.ts';
import type {EtProducer} from '../../../api/types.ts';
import type {CodeFilterMode} from '../PartsPanel.tsx';
import type {SearchType} from '../../../config/resources.ts';


interface UsePartsDataProps {
    producer?: EtProducer | null;
    searchType: SearchType;
    search: string;
    codeFilterMode: CodeFilterMode;
    normalizedSearchTerm: string;
    rawSearchTerm: string;
}

export const usePartsData = ({
                                 producer,
                                 searchType,
                                 search,
                                 codeFilterMode,
                                 normalizedSearchTerm,
                                 rawSearchTerm,
                             }: UsePartsDataProps) => {
    // Infinite query для частей
    const {
        data,
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: refetchParts,
    } = useInfiniteQuery({
        queryKey: ['parts', producer?.Id, searchType, search, codeFilterMode],
        queryFn: ({ pageParam }) => {
            if (searchType === 'without_producer') {
                return fetchPartsPageWithoutProducer(search || undefined, 'exact', pageParam as string | undefined);
            }
            return producer
                ? fetchPartsPage(
                    producer.Id,
                    pageParam as string | undefined,
                    search?.trim() || undefined,
                    codeFilterMode,
                )
                : Promise.resolve(undefined);
        },
        enabled:
            searchType === 'without_producer'
                ? Boolean(search?.trim())
                : Boolean(producer?.Id),
        getNextPageParam: (lastPage) => lastPage?.nextLink ?? undefined,
        initialPageParam: undefined as string | undefined,
    });

    // Преобразование страниц в массив частей
    const partsPages = useMemo<PartsPageResult[]>(() => {
        if (!data?.pages) {
            return [];
        }
        return data.pages.filter((page): page is PartsPageResult => Boolean(page));
    }, [data]);

    const parts = useMemo(() => partsPages.flatMap((page) => page.items), [partsPages]);
    const totalParts = partsPages[0]?.total;

    // Загрузка производителей для режима without_producer
    const producerIds = useMemo(() => {
        if (searchType === 'without_producer') {
            return Array.from(
                new Set(parts.map((part) => part.ProducerId).filter((id): id is number => typeof id === 'number'))
            );
        }
        return [];
    }, [parts, searchType]);

    const producersQueries = useQueries({
        queries: producerIds.map((producerId) => ({
            queryKey: ['producer', producerId],
            queryFn: () => fetchProducerById(producerId),
            enabled: searchType === 'without_producer',
            staleTime: 5 * 60 * 1000,
        })),
    });

    const producersMap = useMemo(() => {
        const map = new Map<number, EtProducer>();
        producersQueries.forEach((query, index) => {
            if (query.data) {
                map.set(producerIds[index], query.data);
            }
        });
        return map;
    }, [producersQueries, producerIds]);

    // Загрузка строк для деталей
    const stringsIdsForQuery = useMemo(
        () =>
            Array.from(
                new Set(
                    parts
                        .flatMap((part) => [part.Name, part.Description])
                        .filter((id): id is number => typeof id === 'number')
                )
            ),
        [parts]
    );

    const { data: stringsMap = {}, isFetching: isStringsFetching } = useQuery<Record<number, string>>({
        queryKey: ['partsStrings', producer?.Id, stringsIdsForQuery, searchType, codeFilterMode],
        queryFn: () => {
            if (searchType === 'without_producer' && stringsIdsForQuery.length > 0) {
                // Для поиска без производителя нужно загружать строки для каждого производителя
                // Пока используем первый найденный ProducerId
                const firstProducerId = parts.find((p) => p.ProducerId)?.ProducerId;
                if (firstProducerId) {
                    return fetchStringsByIds(firstProducerId, stringsIdsForQuery);
                }
            }
            return producer && stringsIdsForQuery.length
                ? fetchStringsByIds(producer.Id, stringsIdsForQuery)
                : Promise.resolve<Record<number, string>>({});
        },
        enabled:
            (searchType === 'without_producer' && stringsIdsForQuery.length > 0) ||
            (Boolean(producer?.Id) && stringsIdsForQuery.length > 0),
    });

    // Функция для получения строкового значения
    const getStringValue = (id?: number) => (id ? stringsMap[id] : undefined);

    // Фильтрация частей
    const filteredParts = useMemo(() => {
        // Если поиск без производителя, фильтрация уже выполнена на сервере
        // Сортируем по рейтингу детали (Rating), затем по рейтингу производителя от большего к меньшему
        if (searchType === 'without_producer') {
            return [...parts].sort((a, b) => {
                // Сначала сортируем по рейтингу детали
                const partRatingA = a.Rating ?? -1;
                const partRatingB = b.Rating ?? -1;
                
                if (partRatingA !== partRatingB) {
                    // Сортируем по убыванию рейтинга детали (от большего к меньшему)
                    return partRatingB - partRatingA;
                }
                
                // Если рейтинги деталей равны, сортируем по рейтингу производителя
                const producerA = producersMap.get(a.ProducerId);
                const producerB = producersMap.get(b.ProducerId);
                
                const producerRatingA = producerA?.Rating ?? -1;
                const producerRatingB = producerB?.Rating ?? -1;
                
                // Сортируем по убыванию рейтинга производителя (от большего к меньшему)
                return producerRatingB - producerRatingA;
            });
        }

        // Для поиска по производителю Code уже отфильтрован на сервере
        // Применяем локальную фильтрацию только для остальных полей
        if (!rawSearchTerm && !normalizedSearchTerm) {
            return parts;
        }

        return parts.filter((part) => {
            // Code уже отфильтрован на сервере по выбранному режиму
            // Проверяем только остальные поля (LongCode, Name, Description)
            const stringName = getStringValue(part.Name);
            const stringDescription = getStringValue(part.Description);
            const rawCandidates = [
                rawSearchTerm.toLowerCase(),
                stringName?.toLowerCase(),
                stringDescription?.toLowerCase(),
            ].filter((candidate): candidate is string => typeof candidate === 'string');

            if (rawSearchTerm && rawCandidates.some((candidate) => candidate.includes(rawSearchTerm))) {
                return true;
            }

            if (!normalizedSearchTerm) {
                return false;
            }

            const normalizedCandidates = [
                normalizedSearchTerm,
                stringName?.replace(/[^a-z0-9]/gi, '').toLowerCase(),
                stringDescription?.replace(/[^a-z0-9]/gi, '').toLowerCase(),
            ].filter((candidate): candidate is string => typeof candidate === 'string');

            return normalizedCandidates.some((candidate) => candidate.includes(normalizedSearchTerm));
        });
    }, [parts, rawSearchTerm, normalizedSearchTerm, searchType, producersMap]);

    return {
        // Данные
        parts,
        filteredParts,
        totalParts,
        producersMap,
        stringsMap,

        // Состояния загрузки
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        isStringsFetching,

        // Функции
        fetchNextPage,
        refetchParts,
    };
};