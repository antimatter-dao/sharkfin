import { useState, useMemo, useCallback } from 'react'
import { useActiveWeb3React } from 'hooks'
import { SharkfinRecord } from 'utils/fetch/sharkfinRecord'
import { Axios } from 'utils/axios'
import usePollingWithMaxRetries from './usePollingWithMaxRetries'
import qs from 'qs'

const PageSize = 8

// const types = [11, 12].join('&types=')

export function usePastPositionRecords(pageNum: number) {
  const { chainId } = useActiveWeb3React()
  const [orderList, setOrderList] = useState<SharkfinRecord[] | undefined>(undefined)
  const [pageParams, setPageParams] = useState<{ count: number; perPage: number; total: number }>({
    count: 0,
    perPage: 0,
    total: 0
  })

  const promiseFn = useCallback(() => {
    const params = {
      pageSize: PageSize,
      pageNum,
      chainId
    }
    return Axios.get<{ records: SharkfinRecord[] }>('getOrderRecord?' + qs.stringify(params))
  }, [chainId, pageNum])

  const callbackFn = useCallback(r => {
    setOrderList(r.data.data)
    setPageParams({
      count: parseInt(r.data.data.pages, 10),
      perPage: parseInt(r.data.data.size, 10),
      total: parseInt(r.data.data.total, 10)
    })
  }, [])

  usePollingWithMaxRetries(promiseFn, callbackFn, 50000)

  return useMemo(() => {
    return {
      orderList,
      pageParams
    }
  }, [orderList, pageParams])
}
