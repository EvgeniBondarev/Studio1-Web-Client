import {useInfiniteQuery} from '@tanstack/react-query';
import type {ProducerFilterMode} from '../ProducerPanel.tsx';
import {fetchProducersPage, type ProducersPageResult} from '../../../api/producers.ts';
import {useMemo} from 'react';

interface Props {
  search: string
  filterMode: ProducerFilterMode
}

export const useProducerPages=({
                                   search,
                                   filterMode,
                                 }: Props)=> {
  const query = useInfiniteQuery({
    queryKey: ['producers', search, filterMode],
    queryFn: ({ pageParam }) =>
      fetchProducersPage(
        search && search.trim() ? search.trim() : undefined,
        pageParam as string | undefined,
        { filterMode },
      ),
    getNextPageParam: (lastPage) => lastPage?.nextLink ?? undefined,
    initialPageParam: undefined as string | undefined,
  })

     const producerPages = useMemo<ProducersPageResult[]>(() => {
         if (!query.data?.pages) {
             return []
         }
        return query.data.pages.filter((page): page is ProducersPageResult => Boolean(page))
    }, [query.data])

  const allProducers = useMemo(
    () => producerPages.flatMap((page) => page.items),
    [producerPages],
  )

  return {
    allProducers,
    producerPages,

    isLoading: query.isLoading,
    isFetching: query.isFetching,

    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,

    refetch: query.refetch,
  }
}
