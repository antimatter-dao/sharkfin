import { useMemo, useState, useEffect } from 'react'
import { ChainId, ChainList, NETWORK_CHAIN_ID } from 'constants/chain'
import { CURRENCIES, SUPPORTED_CURRENCIES, SUPPORTED_DEFI_VAULT } from 'constants/currencies'
import { getOtherNetworkLibrary } from 'connectors/multiNetworkConnectors'
import { getContract } from 'utils'
import { DEFI_VAULT_ADDRESS } from 'constants/index'
import DEFI_VAULT_ABI from '../constants/abis/defi_vault.json'
import { useActiveWeb3React } from 'hooks'
import { useBlockNumber } from 'state/application/hooks'
import { parseBalance } from 'utils/parseAmount'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useDefiVaultContract } from './useContract'
import JSBI from 'jsbi'

enum DefiProductDataOrder {
  balanceOf,
  depositReceipts
}

export interface DefiProduct {
  apy: string
  type: 'CALL' | 'PUT'
  expiredAt: number
  strikePrice: string
  currency: string
  investCurrency: string
  chainId: ChainId | undefined
  balance?: string
  instantBalance?: string
  completeBalance?: string
  initiateBalance?: string
  withdrawals?: any
}

export function useSingleDefiVault(chainName: string, currency: string, type: string): DefiProduct | null {
  const { account } = useActiveWeb3React()
  const args = useMemo(() => {
    return [account ?? undefined]
  }, [account])

  const cur = currency.toUpperCase()
  const productChainId: number = useMemo(() => {
    return ChainList.find(chain => chain.symbol.toUpperCase() === chainName.toUpperCase())?.id ?? NETWORK_CHAIN_ID
  }, [chainName])

  const contract = useDefiVaultContract(productChainId, cur, type === 'CALL' ? 'CALL' : 'PUT')
  const instantBalance = useSingleCallResult(contract, 'depositReceipts', args)
  const initiateBalance = useSingleCallResult(contract, 'accountVaultBalance', args)
  const withdrawals = useSingleCallResult(contract, 'withdrawals', args)

  const argPrice = useMemo(() => {
    return [withdrawals?.result?.round]
  }, [withdrawals?.result?.round])

  const price = useSingleCallResult(contract, 'roundPricePerShare', argPrice)

  const result = useMemo(() => {
    if (!SUPPORTED_DEFI_VAULT[productChainId as keyof typeof SUPPORTED_DEFI_VAULT]?.includes(cur)) {
      return null
    } else {
      const investCurrency = type.toUpperCase() === 'CALL' ? SUPPORTED_CURRENCIES[cur]?.symbol ?? '' : 'USDC'
      const token = CURRENCIES[productChainId as ChainId][investCurrency]
      const shares = withdrawals?.result?.shares?.toString()
      const price1 = price?.result?.[0]?.toString()

      const val =
        shares && price
          ? JSBI.divide(
              JSBI.multiply(JSBI.BigInt(shares), JSBI.BigInt(price1)),
              JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(10))
            ).toString()
          : undefined

      return {
        chainId: productChainId,
        type: type.toUpperCase() === 'CALL' ? 'CALL' : 'PUT',
        currency: SUPPORTED_CURRENCIES[cur]?.symbol ?? '',
        investCurrency: investCurrency,
        instantBalance:
          instantBalance.result?.amount && productChainId ? parseBalance(instantBalance.result?.amount, token) : '-',
        completeBalance: val ? parseBalance(val, token) : '-',
        initiateBalance:
          initiateBalance?.result?.[0] && productChainId ? parseBalance(initiateBalance.result[0], token) : '-',
        withdrawals: withdrawals.result,
        strikePrice: '30000',
        expiredAt: 1000000000000000,
        apy: '100%'
      } as DefiProduct
    }
  }, [cur, initiateBalance.result, instantBalance.result?.amount, price, productChainId, type, withdrawals.result])
  return result
}

export function useDefiVaultList() {
  const { account } = useActiveWeb3React()
  const [promise, setPromise] = useState<Promise<any> | undefined>(undefined)
  const [defiVaultList, setDefiVaultList] = useState<undefined | null | DefiProduct[]>(undefined)
  const blockNumber = useBlockNumber()
  useEffect(() => {
    const list = Object.keys(SUPPORTED_DEFI_VAULT).reduce((acc, chainId: string) => {
      const library = getOtherNetworkLibrary(+chainId)
      const addresses = DEFI_VAULT_ADDRESS[+chainId as ChainId]

      const list = SUPPORTED_DEFI_VAULT[+chainId as keyof typeof SUPPORTED_DEFI_VAULT]?.reduce(
        (acc, symbol: string) => {
          const addressCall = addresses?.[symbol]?.CALL
          const addressPut = addresses?.[symbol]?.PUT
          const contractCall = addressCall && library ? getContract(addressCall, DEFI_VAULT_ABI, library) : null
          const contractPut = addressPut && library ? getContract(addressPut, DEFI_VAULT_ABI, library) : null
          acc.push(Promise.all([account ? contractCall?.balanceOf(account) : null]))
          acc.push(Promise.all([account ? contractPut?.balanceOf(account) : null]))
          return acc
        },
        [] as any[]
      )
      acc.push(list ? Promise.all(list) : undefined)
      return acc
    }, [] as any[])
    setPromise(Promise.all(list))
  }, [account])

  useEffect(() => {
    if (!promise) setDefiVaultList(defiVaultListUtil())
    ;(async () => {
      try {
        const res = await promise
        const mappedRes = defiVaultListUtil(res)
        setDefiVaultList(mappedRes)
      } catch (e) {
        console.error(e)
        setDefiVaultList(null)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promise, blockNumber])

  return defiVaultList
}

const defiVaultListUtil = (res?: any[][]) => {
  return Object.keys(SUPPORTED_DEFI_VAULT).reduce((accMain, chainId: string, idx1: number) => {
    SUPPORTED_DEFI_VAULT[+chainId as keyof typeof SUPPORTED_DEFI_VAULT]?.map((symbol: string, idx2: number) => {
      accMain.push({
        chainId: +chainId,
        currency: symbol,
        balance:
          res && res[idx1][idx2 * 2][DefiProductDataOrder.balanceOf]
            ? parseBalance(
                res[idx1][idx2][DefiProductDataOrder.balanceOf].toString(),
                CURRENCIES[+chainId as ChainId][symbol]
              )
            : '-',
        type: 'CALL',
        apy: `${(Math.random() * 100).toFixed(2)}%`,
        expiredAt: 23847234987,
        investCurrency: symbol,
        strikePrice: '1000'
      })
      accMain.push({
        chainId: +chainId,
        currency: symbol,
        balance:
          res && res[idx1][idx2 * 2 + 1][DefiProductDataOrder.balanceOf]
            ? parseBalance(
                res[idx1][idx2][DefiProductDataOrder.balanceOf].toString(),
                CURRENCIES[+chainId as ChainId]['USDC']
              )
            : '-',
        type: 'PUT',
        apy: `${(Math.random() * 100).toFixed(2)}%`,
        expiredAt: 23847234987,
        investCurrency: 'USDC',
        strikePrice: '1000'
      })
    })
    return accMain
  }, [] as DefiProduct[])
}
