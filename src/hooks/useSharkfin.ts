import { useMemo, useState, useEffect } from 'react'
import { Contract } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import JSBI from 'jsbi'
import { ChainId, ChainList, NETWORK_CHAIN_ID } from 'constants/chain'
import { CURRENCIES, SUPPORTED_CURRENCIES, SUPPORTED_DEFI_VAULT } from 'constants/currencies'
import { getOtherNetworkLibrary } from 'connectors/multiNetworkConnectors'
import { getContract, isAddress } from 'utils'
import { SHARKFIN_ADDRESS, ZERO_ADDRESS } from 'constants/index'
import DEFI_VAULT_ABI from '../constants/abis/defi_vault.json'
import DEFI_VAULT_OPTION_ABI from '../constants/abis/defi_vault_option.json'
import { useActiveWeb3React } from 'hooks'
import { useBlockNumber } from 'state/application/hooks'
import { parseBalance, parsePrecision } from 'utils/parseAmount'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useSharkfinContract } from './useContract'
import { trimNumberString } from 'utils/trimNumberString'

export interface DefiProduct {
  apy: string
  type: 'CALL' | 'PUT'
  expiredAt: number
  strikePrice: string
  currency: string
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

const APY = '20%'

export function useSingleSharkfin(chainName: string, currency: string, type: string): DefiProduct | null {
  const { account } = useActiveWeb3React()
  const [strikePrice, setStrikePrice] = useState<any>(undefined)
  const args = useMemo(() => {
    return [account ?? undefined]
  }, [account])

  const cur = currency.toUpperCase()
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

  const contract = useSharkfinContract(productChainId, cur, type === 'CALL' ? 'CALL' : 'PUT')
  const depositReceipts = useSingleCallResult(contract, 'depositReceipts', args)
  const lockedBalance = useSingleCallResult(contract, 'accountVaultBalance', args)
  const withdrawals = useSingleCallResult(contract, 'withdrawals', args)
  const optionAddress = useSingleCallResult(contract, 'currentOption')
  const vaultState = useSingleCallResult(contract, 'vaultState')
  const vaultParams = useSingleCallResult(contract, 'vaultParams')
  const pricePerShare = useSingleCallResult(contract, 'pricePerShare')

  const argPrice = useMemo(() => {
    return [withdrawals?.result?.round]
  }, [withdrawals?.result?.round])
  const price = useSingleCallResult(contract, 'roundPricePerShare', argPrice)

  useEffect(() => {
    let mounted = true
    if (!optionAddress.result?.[0]) return
    ;(async () => {
      const price = await getStrikePrice(optionAddress.result?.[0], getOtherNetworkLibrary(+productChainId))
      if (mounted) {
        setStrikePrice(price)
      }
    })()
    return () => {
      mounted = false
    }
  }, [optionAddress.result, productChainId])

  const result = useMemo(() => {
    if (!SUPPORTED_DEFI_VAULT[productChainId as keyof typeof SUPPORTED_DEFI_VAULT]?.includes(cur)) {
      return null
    } else {
      const investCurrency = type.toUpperCase() === 'CALL' ? SUPPORTED_CURRENCIES[cur]?.symbol ?? '' : 'USDT'
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

      return {
        chainId: productChainId,
        type: type.toUpperCase() === 'CALL' ? 'CALL' : 'PUT',
        currency: SUPPORTED_CURRENCIES[cur]?.symbol ?? '',
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
        strikePrice: strikePrice,
        expiredAt: getExpireAt(),
        apy: APY
      } as DefiProduct
    }
  }, [
    cur,
    depositReceipts.result?.amount,
    depositReceipts.result?.round,
    lockedBalance.result,
    price.result,
    pricePerShare.result,
    productChainId,
    strikePrice,
    type,
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
      const addressCall = addresses?.[symbol]?.CALL
      const addressPut = addresses?.[symbol]?.PUT
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
        currency: symbol,
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
        type: 'CALL',
        apy: APY,
        expiredAt: getExpireAt(),
        investCurrency: symbol,
        strikePrice: '-',
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
        currency: symbol,
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
        type: 'PUT',
        apy: APY,
        expiredAt: getExpireAt(),
        investCurrency: 'USDT',
        strikePrice: '-',
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

const getStrikePrice = async (contractAddress: string | undefined, library: Web3Provider | undefined) => {
  if (!contractAddress || !library || !isAddress(contractAddress) || contractAddress === ZERO_ADDRESS) return '-'
  try {
    const contract = getContract(contractAddress, DEFI_VAULT_OPTION_ABI, library)
    const price = await contract?.strikePrice()
    const decimals = await contract?.decimals()
    return parsePrecision(price.toString(), decimals)
  } catch (e) {
    console.error(e)
    return '-'
  }
}

const getExpireAt = () => {
  const now = new Date(Date.now())
  const UTCh = now.getUTCHours()
  const displacement = (5 + 7 - now.getUTCDay()) % 7
  const fridayDate = now.getUTCDate() + (displacement === 0 && UTCh >= 8 ? 7 : displacement)
  now.setUTCDate(fridayDate)
  now.setUTCHours(8, 0, 0)
  return now.getTime()
}
