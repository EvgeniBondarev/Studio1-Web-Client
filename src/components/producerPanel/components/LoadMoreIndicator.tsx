import {Flex, Spin, Typography} from 'antd';
import {type ForwardedRef, forwardRef} from 'react';

interface Props {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  totalProducers?: number;
  loadedItemsCount: number;
}

export const LoadMoreIndicator = forwardRef(
  (
    {hasNextPage, isFetchingNextPage, totalProducers, loadedItemsCount}: Props,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    if (!hasNextPage && !isFetchingNextPage) {
      return null;
    }

    return (
      <Flex
        ref={ref}
        vertical
        align="center"
        style={{padding: 12}}
        gap={4}
      >
        {isFetchingNextPage && <Spin size="small"/>}
        {totalProducers !== undefined && totalProducers > loadedItemsCount && (
          <Typography.Text type="secondary" style={{fontSize: 12}}>
            Еще {(totalProducers - loadedItemsCount).toLocaleString('ru-RU')} записей
          </Typography.Text>
        )}
      </Flex>
    );
  }
);

LoadMoreIndicator.displayName = 'LoadMoreIndicator';