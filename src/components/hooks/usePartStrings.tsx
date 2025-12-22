import { useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import {fetchStringsByIds} from '../../api/parts.ts';

export const usePartStrings = (producerId?: number, ids?: (number | undefined)[]) => {
    const validIds = ids?.filter(Boolean) as number[] | undefined

    const { data: strings = {}, isFetching } = useQuery<Record<number, string>>({
        queryKey: ['partStrings', producerId, validIds],
        queryFn: () =>
            producerId && validIds?.length
                ? fetchStringsByIds(producerId, validIds)
                : Promise.resolve({}),
        enabled: Boolean(producerId && validIds?.length),
    })

    const getText = (id?: number) => {
        if (!id) return '—'
        if (strings[id]) return strings[id]
        return isFetching ? <Spin size="small" /> : id
    }

    return { strings, isFetching, getText }
}
