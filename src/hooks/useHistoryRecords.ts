import { useState, useMemo, useCallback } from 'react'
import { useActiveWeb3React } from 'hooks'
import { DefiRecord } from 'utils/fetch/defiRecord'
import { Axios } from 'utils/axios'
import usePollingWithMaxRetries from './usePollingWithMaxRetries'
import { DEFAULT_COIN_SYMBOL, SUPPORTED_CURRENCIES } from 'constants/currencies'
import { parsePrecision } from 'utils/parseAmount'
import { trimNumberString } from 'utils/trimNumberString'

const PageSize = 8

export function useHistoryRecords(pageNum: number) {
  const { account } = useActiveWeb3React()
  const [orderList, setOrderList] = useState<DefiRecord[] | undefined>(undefined)

  const filteredOrderList = useMemo(() => {
    if (!orderList) return undefined
    return orderList.reduce((acc, order) => {
      const currency = DEFAULT_COIN_SYMBOL[order.chainId as keyof typeof DEFAULT_COIN_SYMBOL]
      const isCall = [5, 6].includes(order.type)
      const investCurrency = isCall ? currency : 'USDC'
      if ([5, 6, 7, 8].includes(order.type)) {
        acc.push({
          ...order,
          actionType: [6, 8].includes(order.type) ? 'withdraw' : 'deposit',
          currency: currency,
          callPut: isCall ? 'call' : 'put',
          investCurrency: investCurrency,
          amount: parsePrecision(trimNumberString(order.amount, 0), SUPPORTED_CURRENCIES[investCurrency].decimals)
        })
        return acc
      }
      return acc
    }, [] as DefiRecord[])
  }, [orderList])

  const pageCount = useMemo(() => {
    if (!filteredOrderList) return 0

    return Math.ceil(filteredOrderList.length / PageSize)
  }, [filteredOrderList])

  const promiseFn = useCallback(() => {
    if (!account)
      return new Promise((resolve, reject) => {
        reject(null)
      })
    return Axios.get<{ records: DefiRecord[] }>('getAccountRecord', {
      account: account,
      pageSize: 999999
    })
  }, [account])

  const callbackFn = useCallback(r => {
    setOrderList(r.data.data.records)
  }, [])

  usePollingWithMaxRetries(promiseFn, callbackFn, 50000)

  return useMemo(() => {
    return {
      orderList:
        pageNum && filteredOrderList
          ? filteredOrderList.slice((pageNum - 1) * PageSize, pageNum * PageSize)
          : undefined,
      pageParams: { count: pageCount, perPage: PageSize, total: filteredOrderList?.length ?? 0 }
    }
  }, [filteredOrderList, pageCount, pageNum])
}
