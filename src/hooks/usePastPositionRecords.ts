import { useState, useMemo, useCallback } from 'react'
import { useActiveWeb3React } from 'hooks'
import { Axios } from 'utils/axios'
import usePollingWithMaxRetries from './usePollingWithMaxRetries'
import qs from 'qs'
import { OrderRecord, OrderRecordDetail } from 'utils/fetch/record'

const PageSize = 8

// const types = [11, 12].join('&types=')

export function usePastPositionRecords(pageNum: number) {
  const { chainId } = useActiveWeb3React()
  const [orderList, setOrderList] = useState<OrderRecord[] | undefined>(undefined)
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
    return Axios.get<{ records: OrderRecord[] }>('getOrderRecord?' + qs.stringify(params))
  }, [chainId, pageNum])

  const callbackFn = useCallback(r => {
    if (!r.data.data.records) return
    setOrderList(r.data.data.records)
    const idList = r.data.data.records.map((item: OrderRecord) =>
      Axios.get<OrderRecordDetail>('getOrderById', { orderId: item.orderId })
    )
    Promise.all(idList).then((orderRes: any) => {
      setOrderList(
        r.data.data.records.map((item: OrderRecord, idx: number) => {
          const order = orderRes[idx].data.data
          return {
            ...item,
            pnl: order.settlement_pnl,
            settlementPrice: order.settlement_price,
            settlementRate: order.settlement_rate
          }
        })
      )
    })
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
