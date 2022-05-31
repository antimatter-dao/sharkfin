import { useState, useMemo, useCallback } from 'react'
import { useActiveWeb3React } from 'hooks'
import { SharkfinRecord } from 'utils/fetch/sharkfinRecord'
import { Axios } from 'utils/axios'
import usePollingWithMaxRetries from './usePollingWithMaxRetries'
import { SUPPORTED_CURRENCIES } from 'constants/currencies'
import { parsePrecision } from 'utils/parseAmount'
import { trimNumberString } from 'utils/trimNumberString'
import qs from 'qs'

const PageSize = 8

// const types = [11, 12].join('&types=')

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
      const underlying = SUPPORTED_CURRENCIES.WETH.symbol
      const isCall = [11].includes(order.type)
      const investCurrency = isCall ? underlying : 'USDT'
      if ([11, 12].includes(order.type)) {
        acc.push({
          ...order,
          actionType: [11].includes(order.type) ? 'withdraw' : 'deposit',
          underlying: underlying,
          currency: investCurrency,
          amount: parsePrecision(trimNumberString(order.amount, 0), SUPPORTED_CURRENCIES[investCurrency].decimals)
        })
        return acc
      }
      return acc
    }, [] as SharkfinRecord[])
  }, [orderList])

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

  usePollingWithMaxRetries(promiseFn, callbackFn, 50000)

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
