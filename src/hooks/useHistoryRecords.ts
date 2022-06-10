import { useState, useMemo, useCallback } from 'react'
import { useActiveWeb3React } from 'hooks'
import { SharkfinRecord } from 'utils/fetch/sharkfinRecord'
import { Axios } from 'utils/axios'
import usePollingWithMaxRetries from './usePollingWithMaxRetries'
import { CURRENCIES } from 'constants/currencies'
import { parsePrecision } from 'utils/parseAmount'
import { trimNumberString } from 'utils/trimNumberString'
import qs from 'qs'
import { NETWORK_CHAIN_ID } from 'constants/chain'

const PageSize = 8

export function useHistoryRecords(pageNum: number) {
  const { account, chainId } = useActiveWeb3React()
  const [orderList, setOrderList] = useState<SharkfinRecord[] | undefined>(undefined)
  const [pageParams, setPageParams] = useState<{ count: number; perPage: number; total: number }>({
    count: 0,
    perPage: 0,
    total: 0
  })

  const filteredOrderList = useMemo(() => {
    if (!orderList) return undefined
    return orderList.reduce((acc, order) => {
      const underlying = (() => {
        let cur: string
        switch (order.type) {
          case 15:
          case 16:
          case 17:
          case 18:
            cur = 'BTC'
            break
          default:
            // 11|12|13|14 ETH
            cur = 'ETH'
        }
        return cur
      })()
      const isSelf = [11, 12, 15, 16].includes(order.type)
      const investCurrency = isSelf ? underlying : 'USDT'
      acc.push({
        ...order,
        actionType: order.type % 2 == 0 ? 'withdraw' : 'deposit',
        underlying: underlying,
        investCurrency: investCurrency,
        amount: parsePrecision(
          trimNumberString(order.amount, 0),
          CURRENCIES[chainId ?? NETWORK_CHAIN_ID]?.[investCurrency].decimals ?? 18
        )
      })
      return acc
    }, [] as SharkfinRecord[])
  }, [chainId, orderList])

  const promiseFn = useCallback(() => {
    if (!account)
      return new Promise((resolve, reject) => {
        reject(null)
      })
    const params = {
      account: account,
      pageSize: PageSize,
      pageNum,
      chainId
    }
    return Axios.get<{ records: SharkfinRecord[] }>('getDepositRecord?' + qs.stringify(params))
  }, [account, chainId, pageNum])

  const callbackFn = useCallback(r => {
    setOrderList(r.data.data.records)
    setPageParams({
      count: parseInt(r.data.data.pages, 10),
      perPage: parseInt(r.data.data.size, 10),
      total: parseInt(r.data.data.total, 10)
    })
  }, [])

  usePollingWithMaxRetries(promiseFn, callbackFn, 100000)

  return useMemo(() => {
    return {
      orderList:
        pageNum && filteredOrderList
          ? filteredOrderList.slice((pageNum - 1) * PageSize, pageNum * PageSize)
          : undefined,
      pageParams
    }
  }, [filteredOrderList, pageNum, pageParams])
}
