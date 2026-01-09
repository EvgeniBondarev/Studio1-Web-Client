import {type QueryKey, useMutation, useQueryClient} from '@tanstack/react-query';
import {message} from 'antd';

type MutationOptions<TVariables> = {
  successMessage: string
  invalidate?: QueryKey[]
  onSuccessExtra?: (variables: TVariables) => void
}

export const useEntityMutation  = <TVariables,TResult>(
  mutationFn: (vars: TVariables) => Promise<TResult>,
  {
    successMessage,
    invalidate = [],
    onSuccessExtra,
  }: MutationOptions<TVariables>) => {
  const queryClient = useQueryClient()

  return useMutation<TResult, unknown, TVariables>({
    mutationFn,
    onSuccess: (_data, variables) => {
      message.success(successMessage)

      invalidate.forEach(key =>
        queryClient.invalidateQueries({ queryKey: key })
      )

      onSuccessExtra?.(variables)
    },
  })
}