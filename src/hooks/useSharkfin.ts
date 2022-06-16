import { useMemo, useState, useEffect } from 'react'
import { Contract } from 'ethers'
import JSBI from 'jsbi'
import { ChainId, ChainList, NETWORK_CHAIN_ID } from 'constants/chain'
import { CURRENCIES, getMappedSymbol, SUPPORTED_CURRENCIES, SUPPORTED_SHARKFIN_VAULT } from 'constants/currencies'
import { getOtherNetworkLibrary } from 'connectors/multiNetworkConnectors'
import { getContract } from 'utils'
import { SHARKFIN_ADDRESS } from 'constants/index'
import SHARKFIN_VAULT_ABI from '../constants/abis/sharkfin.json'
import { useActiveWeb3React } from 'hooks'
// import { useBlockNumber } from 'state/application/hooks'
import { absolute, parseBalance, parsePrecision } from 'utils/parseAmount'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useSharkfinContract } from './useContract'
import { trimNumberString } from 'utils/trimNumberString'
import { Axios } from 'utils/axios'
import { useTokenBalance } from 'state/wallet/hooks'

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
  minAmount?: string
  minRate?: string
  aggregateEarnings?: string
  totalInvestment?: string
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
  const totalPending = useSingleCallResult(contract, 'totalPending')
  const totalBalance = useTokenBalance(contract?.address, CURRENCIES[chainId ?? NETWORK_CHAIN_ID][currency])

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
    if (!SUPPORTED_SHARKFIN_VAULT[productChainId as keyof typeof SUPPORTED_SHARKFIN_VAULT]?.includes(cur)) {
      return null
    } else {
      const investCurrency = currency
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
        apy: ((product?.base_rate ?? 0.01) * 100).toFixed(0) + '%' + ' ~15%',
        minAmount: vaultParams.result?.minimumSupply
          ? parseBalance(vaultParams.result?.minimumSupply.toString(), token)
          : '0',
        barrierPrice0: product?.barrier_prices?.[0].price ?? '-',
        barrierPrice1: product?.barrier_prices?.[1].price ?? '-',
        minRate: ((product?.base_rate ?? 0.03) * 100).toFixed(0) + '%',
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
          : '-',
        aggregateEarnings:
          totalPending.result && totalBalance
            ? trimNumberString(
                parsePrecision(
                  absolute(
                    JSBI.subtract(JSBI.BigInt(totalBalance.raw), JSBI.BigInt(totalPending.result.toString())).toString()
                  ),
                  vaultParams.result?.decimals ?? 18
                ),
                4
              )
            : '-'
      } as DefiProduct
    }
  }, [
    cur,
    currency,
    depositReceipts.result,
    lockedBalance.result,
    price.result,
    pricePerShare.result,
    product?.barrier_prices,
    product?.base_rate,
    productChainId,
    totalBalance,
    totalPending.result,
    type,
    vaultParams.result?.decimals,
    vaultParams.result?.minimumSupply,
    vaultState.result?.round,
    withdrawals.result?.shares
  ])
  return result
}

export function useSharkfinList() {
  const { account, chainId } = useActiveWeb3React()
  const [promise, setPromise] = useState<Promise<any> | undefined>(undefined)
  const [products, setProducts] = useState<any[] | undefined>(undefined)
  const [defiVaultList, setDefiVaultList] = useState<undefined | null | DefiProduct[]>(undefined)
  const [otherChainVaultStates, setOtherChainVaultStates] = useState<undefined | any>(undefined)
  // const blockNumber = useBlockNumber()

  useEffect(() => {
    let mounted = true
    if (!chainId) return
    // const list = Object.keys(SUPPORTED_DEFI_VAULT).reduce((acc, chainId: string) => {
    const productsPromises: any[] = []
    const library = getOtherNetworkLibrary(chainId)
    const addresses = SHARKFIN_ADDRESS[chainId as ChainId]
    const vaultStatesPromises: any[] = []
    const list = SUPPORTED_SHARKFIN_VAULT[chainId as keyof typeof SUPPORTED_SHARKFIN_VAULT]?.reduce(
      (acc, symbol: string) => {
        productsPromises.push(
          Axios.get('getProducts', { chainId, currency: getMappedSymbol(symbol), underlying: getMappedSymbol(symbol) }),
          Axios.get('getProducts', { chainId, currency: 'USDT', underlying: getMappedSymbol(symbol) })
        )
        Object.keys(SUPPORTED_SHARKFIN_VAULT).map(chainIdStr => {
          const chainId2: ChainId = +chainIdStr
          if (chainId2 === chainId) {
            return
          } else {
            const library = getOtherNetworkLibrary(chainId2)
            const addressSelf = SHARKFIN_ADDRESS[chainId2]?.[symbol]?.SELF
            const addressU = SHARKFIN_ADDRESS[chainId2]?.[symbol]?.U
            const contractSelf = addressSelf && library ? getContract(addressSelf, SHARKFIN_VAULT_ABI, library) : null
            const contractU = addressU && library ? getContract(addressU, SHARKFIN_VAULT_ABI, library) : null
            vaultStatesPromises.push(
              Promise.all([
                contractSelf?.vaultState(),
                contractSelf?.decimals(),
                contractU?.vaultState(),
                contractU?.decimals()
              ])
            )
          }
        })
        const addressCall = addresses?.[symbol]?.SELF
        const addressPut = addresses?.[symbol]?.U
        const contractCall = addressCall && library ? getContract(addressCall, SHARKFIN_VAULT_ABI, library) : null
        const contractPut = addressPut && library ? getContract(addressPut, SHARKFIN_VAULT_ABI, library) : null
        acc.push(callsFactory(contractCall, account))
        acc.push(callsFactory(contractPut, account))
        return acc
      },
      [] as any[]
    )

    Promise.all(vaultStatesPromises)
      .then(r => {
        if (mounted) {
          setOtherChainVaultStates(r)
        }
      })
      .catch(e => console.error(e))

    Promise.all(productsPromises)
      .then(r => {
        if (mounted) {
          setProducts(r)
        }
      })
      .catch(e => {
        console.error(e)
      })
    // acc.push(list ? Promise.all(list) : undefined)
    // return acc
    // }, [] as any[])
    if (list && mounted) {
      setPromise(Promise.all(list))
    }
    return () => {
      mounted = false
    }
  }, [account, chainId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!promise) setDefiVaultList(defiVaultListUtil(chainId, undefined, products, otherChainVaultStates))
      try {
        const res = await promise
        const mappedRes = defiVaultListUtil(chainId, res, products, otherChainVaultStates)
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
  }, [chainId, otherChainVaultStates, products, promise])

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

const defiVaultListUtil = (
  chainId: ChainId | null | undefined,
  res: any[][] | undefined,
  products: undefined | any[],
  otherChainVaultStates: any[][]
) => {
  // return Object.keys(SUPPORTED_SHARKFIN_VAULT).reduce((accMain, chainId: string, idx1: number) => {
  if (!chainId || !SUPPORTED_SHARKFIN_VAULT[chainId as keyof typeof SUPPORTED_SHARKFIN_VAULT]) return undefined
  return SUPPORTED_SHARKFIN_VAULT[+chainId as keyof typeof SUPPORTED_SHARKFIN_VAULT]?.reduce(
    (accMain, symbol: string, idx2: number) => {
      /////// call results
      const productCall = getClosestProduct(products?.[idx2 * 2].data.data)
      const resCall = res?.[idx2 * 2]
      const decimalsCall = resCall?.[DefiProductDataOrder.decimals] ?? 18
      const vaultStateCall = resCall ? resCall?.[DefiProductDataOrder.vaultState] : undefined
      const resCallIsRound = resCall
        ? resCall?.[DefiProductDataOrder.vaultState]?.round === resCall[DefiProductDataOrder.depositReceipts]?.round
        : false
      const minRateCall = ((productCall?.base_rate ?? 0.03) * 100).toFixed(0) + '%'

      /////// put results
      const productPut = getClosestProduct(products?.[idx2 * 2 + 1].data.data)
      const resPut = res?.[idx2 * 2 + 1]
      const decimalsPut = resPut?.[DefiProductDataOrder.decimals] ?? 18
      const resPutIsRound = resPut
        ? resPut?.[DefiProductDataOrder.vaultState]?.round === resPut[DefiProductDataOrder.depositReceipts]?.round
        : false
      const minRatePut = ((productPut?.base_rate ?? 0.03) * 100).toFixed(0) + '%'
      const vaultStatePut = resPut ? resPut?.[DefiProductDataOrder.vaultState] : undefined

      /////// investment amount on other chain
      const otherChainTotal = { SELF: 0, U: 0 }
      const chainList = Object.keys(SUPPORTED_SHARKFIN_VAULT)
      const curChainIdx = chainList.findIndex(item => item === chainId + '')
      chainList.splice(curChainIdx, 1)
      chainList.map((id, idx3) => {
        const res = otherChainVaultStates?.[idx2 * chainList.length + idx3]
        const self = res?.[0]
        const selfDecimals = res?.[1].toString() ?? '18'
        const u = res?.[2]
        const uDecimals = res?.[3].toString() ?? '18'
        otherChainTotal.SELF += +getTotalInvestment(self, +selfDecimals)
        otherChainTotal.U += +getTotalInvestment(u, +uDecimals)
      })

      const totalInvestmentCall = trimNumberString(
        `${+getTotalInvestment(vaultStateCall, decimalsCall) + otherChainTotal.SELF}`,
        4
      )
      accMain.push({
        chainId: +chainId,
        underlying: symbol,
        totalInvestment: totalInvestmentCall,
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
          resCall && resCall[DefiProductDataOrder.cap]
            ? +parsePrecision(resCall[DefiProductDataOrder.cap].toString(), decimalsCall)
            : 100,
        totalBalance:
          resCall && resCall[DefiProductDataOrder.totalBalance]
            ? +trimNumberString(parsePrecision(resCall[DefiProductDataOrder.totalBalance].toString(), decimalsCall), 4)
            : 0,
        type: 'SELF',
        apy: getApyRange(minRateCall),
        expiredAt: getExpireAt(),
        beginAt: getExpireAt(true),
        investCurrency: symbol,
        depositAmount:
          resCall && resCall[DefiProductDataOrder.depositReceipts]
            ? trimNumberString(
                parsePrecision(
                  JSBI.ADD(
                    JSBI.BigInt(resCallIsRound ? resCall[DefiProductDataOrder.depositReceipts].amount.toString() : '0'),
                    JSBI.BigInt(resCall[DefiProductDataOrder.accountVaultBalance].toString())
                  ).toString(),
                  decimalsCall
                ),
                4
              )
            : '-',
        barrierPrice0: productCall?.barrier_prices?.[0].price ?? '-',
        barrierPrice1: productCall?.barrier_prices?.[1].price ?? '-'
      })

      const totalInvestmentPut = trimNumberString(
        `${+getTotalInvestment(vaultStatePut, decimalsPut) + otherChainTotal.U}`,
        4
      )
      accMain.push({
        chainId: +chainId,
        underlying: symbol,
        totalInvestment: totalInvestmentPut,
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
          resPut && resPut[DefiProductDataOrder.cap]
            ? +parsePrecision(resPut[DefiProductDataOrder.cap].toString(), decimalsPut)
            : 100,
        totalBalance:
          resPut && resPut[DefiProductDataOrder.totalBalance]
            ? +trimNumberString(parsePrecision(resPut[DefiProductDataOrder.totalBalance].toString(), decimalsPut), 4)
            : 0,
        type: 'U',
        apy: getApyRange(minRatePut),
        expiredAt: getExpireAt(),
        beginAt: getExpireAt(true),
        investCurrency: 'USDT',
        depositAmount:
          resPut && resPut[DefiProductDataOrder.depositReceipts]
            ? trimNumberString(
                parsePrecision(
                  JSBI.ADD(
                    JSBI.BigInt(resPutIsRound ? resPut[DefiProductDataOrder.depositReceipts].amount.toString() : '0'),
                    JSBI.BigInt(resPut[DefiProductDataOrder.accountVaultBalance].toString())
                  ).toString(),
                  decimalsPut
                ),
                4
              )
            : '-',
        barrierPrice0: productPut?.barrier_prices?.[0].price ?? '-',
        barrierPrice1: productPut?.barrier_prices?.[1].price ?? '-',
        minRate: ((productPut?.base_rate ?? 0.03) * 100).toFixed(0) + '%'
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

const getClosestProduct = (productList: any[] | undefined) => {
  if (!productList) {
    return undefined
  }
  const product = productList.reduce((acc: any, data: any) => {
    if (!acc) return data
    if (Math.abs(acc.liquidated_at - getExpireAt()) > Math.abs(data.liquidated_at - getExpireAt())) {
      return data
    } else {
      return acc
    }
  }, undefined)

  return product
}

const getApyRange = (minRate: string | undefined) => {
  if (!minRate) {
    return APY
  } else {
    return `${minRate} ~ 15%`
  }
}

const getTotalInvestment = (vaultState: any, decimals: number) => {
  return vaultState
    ? trimNumberString(
        parsePrecision(
          JSBI.add(
            JSBI.BigInt(vaultState.lockedAmount.toString()),
            JSBI.BigInt(vaultState.totalPending.toString())
          ).toString(),
          decimals
        ),
        4
      )
    : '0'
}
