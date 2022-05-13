import { useCallback, useState } from 'react'
import usePollingWithMaxRetries from './usePollingWithMaxRetries'
import { Axios } from 'utils/axios'
import { ChainList } from 'constants/chain'
import { PrevOrder } from 'utils/fetch/record'

export function usePrevDetails(chainName: string, currency: string, type: string): PrevOrder | undefined {
  const [product, setProduct] = useState<any | undefined>(undefined)

  const promiseFn = useCallback(
    () =>
      Axios.post('lastVaultOrder', {
        type,
        chainId:
          ChainList.find(chain => {
            return chain.symbol === chainName || chain.id === +chainName
          })?.id ?? 1
      }),
    [chainName, type]
  )
  const callbackFn = useCallback(r => setProduct(r.data.data), [])

  usePollingWithMaxRetries(promiseFn, callbackFn)

  return product
}
