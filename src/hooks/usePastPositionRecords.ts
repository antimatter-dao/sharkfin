import { useState, useMemo, useCallback } from 'react'
import { useActiveWeb3React } from 'hooks'
import { Axios } from 'utils/axios'
import usePollingWithMaxRetries from './usePollingWithMaxRetries'
import qs from 'qs'
import { OrderRecord, OrderRecordDetail } from 'utils/fetch/record'
import { dayjsUTC } from 'utils/dayjsUTC'
import useBreakpoint from './useBreakpoint'

const PageSize = 8

export interface ChartDataType {
  dateData: string[]
  returnedAmountData: number[]
  otherData: { pnl: string; rate: string; price: string }[]
}

export function usePastPositionRecords(pageNum: number, pageSize = PageSize) {
  const { chainId } = useActiveWeb3React()
  const [orderList, setOrderList] = useState<OrderRecord[] | undefined>(undefined)
  const [pageParams, setPageParams] = useState<{ count: number; perPage: number; total: number }>({
    count: 0,
    perPage: 0,
    total: 0
  })

  const promiseFn = useCallback(() => {
    const params = {
      pageSize: pageSize,
      pageNum,
      chainId
    }
    return Axios.get<{ records: OrderRecord[] }>('getOrderRecord?' + qs.stringify(params))
  }, [chainId, pageNum, pageSize])

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

export function usePastEarningsChartData(): ChartDataType {
  const isDownMd = useBreakpoint('md')
  const { orderList } = usePastPositionRecords(1, isDownMd ? 5 : 10)

  const res = useMemo(() => {
    const defaultData: ChartDataType = {
      dateData: [],
      returnedAmountData: [],
      otherData: []
    }

    if (!orderList) {
      return defaultData
    }
    return orderList.reduce((acc: ChartDataType, item: OrderRecord) => {
      acc.dateData.push(dayjsUTC(item.liquidatedAt).format('DD MMM'))
      acc.returnedAmountData.push(+(item.pnl ?? '0') + +item.size)
      acc.otherData.push({
        pnl: item.pnl ?? '-',
        rate: item.settlementRate ? Math.round(+item.settlementRate * 10000) / 100 + '' : '-',
        price: item.settlementPrice ?? '-'
      })
      return acc
    }, defaultData)
  }, [orderList])

  return res
}
