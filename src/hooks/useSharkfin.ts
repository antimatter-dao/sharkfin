import { useMemo, useState, useEffect } from 'react'
import { Contract } from 'ethers'
import JSBI from 'jsbi'
import { ChainId, ChainList, NETWORK_CHAIN_ID } from 'constants/chain'
import { CURRENCIES, getMappedSymbol, SUPPORTED_CURRENCIES, SUPPORTED_DEFI_VAULT } from 'constants/currencies'
import { getOtherNetworkLibrary } from 'connectors/multiNetworkConnectors'
import { getContract } from 'utils'
import { SHARKFIN_ADDRESS } from 'constants/index'
import DEFI_VAULT_ABI from '../constants/abis/defi_vault.json'
import { useActiveWeb3React } from 'hooks'
import { useBlockNumber } from 'state/application/hooks'
import { parseBalance, parsePrecision } from 'utils/parseAmount'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useSharkfinContract } from './useContract'
import { trimNumberString } from 'utils/trimNumberString'
import { Axios } from 'utils/axios'

export interface DefiProduct {
  apy: string
  type: 'SELF' | 'U'
  expiredAt: number
  beginAt: number
  barrierPrice0?: string
  barrierPrice1?: string
  //equals underlying in api
  underlying: string
  //equals currency in api
  investCurrency: string
  chainId: ChainId | undefined
  instantBalance?: string
  completeBalance?: string
  lockedBalance?: string
  cap?: number
  totalBalance?: number
  depositAmount?: string
  pricePerShareRaw?: string
  contractDecimals?: string
}

enum DefiProductDataOrder {
  accountVaultBalance,
  decimals,
  cap,
  totalBalance,
  depositReceipts,
  vaultState
}

const APY = '3% ~ 15%'

export function useSingleSharkfin(chainName: string, underlying: string, currency: string): DefiProduct | null {
  const { account, chainId } = useActiveWeb3React()
  const [product, setProduct] = useState<any>(undefined)

  const args = useMemo(() => {
    return [account ?? undefined]
  }, [account])

  const cur = underlying.toUpperCase()
  const type = currency == underlying ? 'SELF' : 'U'
  const productChainId: number = useMemo(() => {
    return (
      ChainList.find(chain => {
        if (chain.symbol.toUpperCase() === chainName.toUpperCase()) {
          return true
        } else if (chain.id === +chain) {
          return true
        }
        return false
      })?.id ?? NETWORK_CHAIN_ID
    )
  }, [chainName])

  const contract = useSharkfinContract(productChainId, underlying, type)
  const depositReceipts = useSingleCallResult(contract, 'depositReceipts', args)
  const lockedBalance = useSingleCallResult(contract, 'accountVaultBalance', args)
  const withdrawals = useSingleCallResult(contract, 'withdrawals', args)
  const vaultState = useSingleCallResult(contract, 'vaultState')
  const vaultParams = useSingleCallResult(contract, 'vaultParams')
  const pricePerShare = useSingleCallResult(contract, 'pricePerShare')

  const argPrice = useMemo(() => {
    return [withdrawals?.result?.round]
  }, [withdrawals?.result?.round])

  const price = useSingleCallResult(contract, 'roundPricePerShare', argPrice)

  useEffect(() => {
    let isMounted = true
    Axios.get('getProducts', { chainId, currency, underlying: getMappedSymbol(underlying) })
      .then(r => {
        if (r.data.code !== 200) {
          throw Error(r.data.msg)
        }
        if (!r.data.data) {
          return
        }
        const closest = r.data.data.reduce((acc: any, data: any) => {
          if (!acc) return data
          if (Math.abs(acc.liquidated_at - getExpireAt()) > Math.abs(data.liquidated_at - getExpireAt())) {
            return data
          } else {
            return acc
          }
        }, undefined)

        setProduct(closest)
        if (isMounted) {
        }
      })
      .catch(e => {
        console.error(e)
      })
    return () => {
      isMounted = false
    }
  }, [chainId, currency, underlying])

  const result = useMemo(() => {
    if (!SUPPORTED_DEFI_VAULT[productChainId as keyof typeof SUPPORTED_DEFI_VAULT]?.includes(cur)) {
      return null
    } else {
      const investCurrency = type.toUpperCase() === 'SELF' ? underlying ?? '' : 'USDT'
      const token = CURRENCIES[productChainId as ChainId][investCurrency]
      const shares = withdrawals.result?.shares?.toString()
      const priceResult = price.result?.[0]?.toString()
      const instantBalanceDisabled = vaultState.result?.round !== depositReceipts.result?.round
      const val =
        shares && priceResult
          ? JSBI.divide(
              JSBI.multiply(JSBI.BigInt(shares), JSBI.BigInt(priceResult)),
              JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(vaultParams.result?.decimals.toString() ?? 18))
            )
          : undefined
      const isRound = vaultState.result?.round === depositReceipts.result?.round

      return {
        chainId: productChainId,
        type: type,
        underlying: SUPPORTED_CURRENCIES[cur]?.symbol ?? '',
        investCurrency: investCurrency,
        instantBalance:
          depositReceipts?.result?.amount && productChainId
            ? parseBalance(instantBalanceDisabled ? '0' : depositReceipts.result.amount, token)
            : '-',
        completeBalance: val ? parseBalance(val.toString(), token) : '-',
        pricePerShareRaw: pricePerShare.result?.[0].toString(),
        contractDecimals: vaultParams.result?.decimals.toString(),
        lockedBalance:
          lockedBalance?.result && productChainId ? parseBalance(lockedBalance.result?.[0].toString(), token) : '-',
        expiredAt: getExpireAt(),
        apy: APY,
        barrierPrice0: product?.barrier_prices?.[0].price ?? '-',
        barrierPrice1: product?.barrier_prices?.[1].price ?? '-',
        depositAmount: depositReceipts.result
          ? trimNumberString(
              parsePrecision(
                JSBI.ADD(
                  JSBI.BigInt(isRound ? depositReceipts.result.amount.toString() : '0'),
                  JSBI.BigInt(lockedBalance.result?.toString() ?? '0')
                ).toString(),
                vaultParams.result?.decimals ?? 18
              ),
              4
            )
          : '-'
      } as DefiProduct
    }
  }, [
    cur,
    depositReceipts.result,
    lockedBalance.result,
    price.result,
    pricePerShare.result,
    product?.barrier_prices,
    productChainId,
    type,
    underlying,
    vaultParams.result?.decimals,
    vaultState.result?.round,
    withdrawals.result?.shares
  ])
  return result
}

export function useSharkfinList() {
  const { account, chainId } = useActiveWeb3React()
  const [promise, setPromise] = useState<Promise<any> | undefined>(undefined)
  const [defiVaultList, setDefiVaultList] = useState<undefined | null | DefiProduct[]>(undefined)
  const blockNumber = useBlockNumber()

  useEffect(() => {
    if (!chainId) return
    // const list = Object.keys(SUPPORTED_DEFI_VAULT).reduce((acc, chainId: string) => {
    const library = getOtherNetworkLibrary(chainId)
    const addresses = SHARKFIN_ADDRESS[chainId as ChainId]
    const list = SUPPORTED_DEFI_VAULT[chainId as keyof typeof SUPPORTED_DEFI_VAULT]?.reduce((acc, symbol: string) => {
      const addressCall = addresses?.[symbol]?.SELF
      const addressPut = addresses?.[symbol]?.U
      const contractCall = addressCall && library ? getContract(addressCall, DEFI_VAULT_ABI, library) : null
      const contractPut = addressPut && library ? getContract(addressPut, DEFI_VAULT_ABI, library) : null
      acc.push(callsFactory(contractCall, account))
      acc.push(callsFactory(contractPut, account))
      return acc
    }, [] as any[])

    // acc.push(list ? Promise.all(list) : undefined)
    // return acc
    // }, [] as any[])
    if (list) {
      setPromise(Promise.all(list))
    }
  }, [account, chainId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!promise) setDefiVaultList(defiVaultListUtil(chainId, undefined))
      try {
        const res = await promise
        const mappedRes = defiVaultListUtil(chainId, res)
        if (mounted) {
          setDefiVaultList(mappedRes)
        }
      } catch (e) {
        console.error(e)
        if (mounted) {
          setDefiVaultList(null)
        }
      }
    })()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promise, blockNumber])

  return defiVaultList
}

// defi list vault calls
const callsFactory = (contract: Contract | null, account: string | null | undefined) => {
  return Promise.all([
    account ? contract?.accountVaultBalance(account) : null,
    contract?.decimals(),
    contract?.cap(),
    contract?.totalBalance(),
    account ? contract?.depositReceipts(account) : null,
    contract?.vaultState()
  ])
}

const defiVaultListUtil = (chainId: ChainId | null | undefined, res?: any[][]) => {
  // return Object.keys(SUPPORTED_DEFI_VAULT).reduce((accMain, chainId: string, idx1: number) => {
  if (!chainId || !SUPPORTED_DEFI_VAULT[chainId as keyof typeof SUPPORTED_DEFI_VAULT]) return undefined
  return SUPPORTED_DEFI_VAULT[+chainId as keyof typeof SUPPORTED_DEFI_VAULT]?.reduce(
    (accMain, symbol: string, idx2: number) => {
      const resCall = res?.[idx2 * 2]
      const resCallIsRound = resCall
        ? resCall?.[DefiProductDataOrder.vaultState]?.round === resCall[DefiProductDataOrder.depositReceipts]?.round
        : false
      accMain.push({
        chainId: +chainId,
        underlying: symbol,
        lockedBalance:
          resCall && resCall[DefiProductDataOrder.accountVaultBalance]
            ? trimNumberString(
                parseBalance(
                  resCall[DefiProductDataOrder.accountVaultBalance].toString(),
                  CURRENCIES[+chainId as ChainId][symbol]
                ),
                4
              )
            : '-',
        cap:
          resCall && resCall[DefiProductDataOrder.cap] && resCall[DefiProductDataOrder.decimals]
            ? +parsePrecision(resCall[DefiProductDataOrder.cap].toString(), resCall[DefiProductDataOrder.decimals])
            : 100,
        totalBalance:
          resCall && resCall[DefiProductDataOrder.totalBalance] && resCall[DefiProductDataOrder.decimals]
            ? +trimNumberString(
                parsePrecision(
                  resCall[DefiProductDataOrder.totalBalance].toString(),
                  resCall[DefiProductDataOrder.decimals]
                ),
                4
              )
            : 0,
        type: 'SELF',
        apy: APY,
        expiredAt: getExpireAt(),
        beginAt: getExpireAt(true),
        investCurrency: symbol,
        depositAmount:
          resCall && resCall[DefiProductDataOrder.depositReceipts] && resCall[DefiProductDataOrder.decimals]
            ? trimNumberString(
                parsePrecision(
                  JSBI.ADD(
                    JSBI.BigInt(resCallIsRound ? resCall[DefiProductDataOrder.depositReceipts].amount.toString() : '0'),
                    JSBI.BigInt(resCall[DefiProductDataOrder.accountVaultBalance].toString())
                  ).toString(),
                  resCall[DefiProductDataOrder.decimals]
                ),
                4
              )
            : '-'
      })

      const resPut = res?.[idx2 * 2 + 1]
      const resPutIsRound = resPut
        ? resPut?.[DefiProductDataOrder.vaultState]?.round === resPut[DefiProductDataOrder.depositReceipts]?.round
        : false

      accMain.push({
        chainId: +chainId,
        underlying: symbol,
        lockedBalance:
          resPut && resPut[DefiProductDataOrder.accountVaultBalance]
            ? trimNumberString(
                parseBalance(
                  resPut[DefiProductDataOrder.accountVaultBalance].toString(),
                  CURRENCIES[+chainId as ChainId]['USDT']
                ),
                4
              )
            : '-',
        cap:
          resPut && resPut[DefiProductDataOrder.cap] && resPut[DefiProductDataOrder.decimals]
            ? +parsePrecision(resPut[DefiProductDataOrder.cap].toString(), resPut[DefiProductDataOrder.decimals])
            : 100,
        totalBalance:
          resPut && resPut[DefiProductDataOrder.totalBalance] && resPut[DefiProductDataOrder.decimals]
            ? +trimNumberString(
                parsePrecision(
                  resPut[DefiProductDataOrder.totalBalance].toString(),
                  resPut[DefiProductDataOrder.decimals]
                ),
                4
              )
            : 0,
        type: 'U',
        apy: APY,
        expiredAt: getExpireAt(),
        beginAt: getExpireAt(true),
        investCurrency: 'USDT',
        depositAmount:
          resPut && resPut[DefiProductDataOrder.depositReceipts] && resPut[DefiProductDataOrder.decimals]
            ? trimNumberString(
                parsePrecision(
                  JSBI.ADD(
                    JSBI.BigInt(resPutIsRound ? resPut[DefiProductDataOrder.depositReceipts].amount.toString() : '0'),
                    JSBI.BigInt(resPut[DefiProductDataOrder.accountVaultBalance].toString())
                  ).toString(),
                  resPut[DefiProductDataOrder.decimals]
                ),
                4
              )
            : '-'
      })
      return accMain
    },
    [] as DefiProduct[]
  )
}

const getExpireAt = (beginAt?: boolean) => {
  const now = new Date(Date.now())
  const UTCh = now.getUTCHours()
  const displacement = (5 + 7 - now.getUTCDay()) % 7
  const fridayDate = now.getUTCDate() + (displacement === 0 && UTCh >= 8 ? 7 : displacement)
  now.setUTCDate(fridayDate)
  //UTC 8:00
  now.setUTCHours(8, 0, 0)
  return beginAt ? now.getTime() - 1000 * 60 * 60 * 24 * 7 : now.getTime()
}
