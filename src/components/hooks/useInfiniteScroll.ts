import React, {useEffect} from 'react';

interface UseInfiniteScrollParams {
  loadMoreRef: React.RefObject<Element | null>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export const useInfiniteScroll = ({
                                    loadMoreRef,
                                    isFetchingNextPage,
                                    hasNextPage,
                                    fetchNextPage,
                                  }: UseInfiniteScrollParams) => {
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !loadMoreRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      },
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [loadMoreRef, isFetchingNextPage, hasNextPage, fetchNextPage])
}
