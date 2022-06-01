import { getOtherNetworkLibrary } from 'connectors/multiNetworkConnectors'
import { ChainId, NETWORK_CHAIN_ID } from 'constants/chain'
import { SHARKFIN_ADDRESS, ZERO_ADDRESS } from 'constants/index'
import { useEffect, useMemo, useState } from 'react'
import { Axios } from 'utils/axios'
import { usePriceForAll } from './usePriceSet'
import SHARKFIN_VAULT_ABI from '../constants/abis/sharkfin.json'
import { getContract } from 'utils'
import { Contract } from 'ethers'
import { parseBalance } from 'utils/parseAmount'
import { Token } from 'constants/token'
import { CURRENCIES } from 'constants/currencies'

enum DataOrder {
  // decimals,
  vaultState
}

export function useHomeStatistics() {
  const [totalInvest, setTotalInvest] = useState('0')
  const [amountInProgress, setAmountInProgress] = useState('0')
  const prices = usePriceForAll()

  useEffect(() => {
    Axios.get('getTotalInvest').then(r => {
      if (r.data.data) {
        const acc = r.data.data.reduce((acc: number, { amount, currency }: { amount: string; currency: string }) => {
          acc += +amount * (prices[currency as keyof typeof prices] ? +prices[currency as keyof typeof prices] : 1)

          return acc
        }, 0)
        setTotalInvest(acc)
      }
    })
  }, [prices])

  useEffect(() => {
    const allPromises = Object.keys(SHARKFIN_ADDRESS).reduce((acc, chain: string) => {
      const chainId: ChainId = +chain
      const library = getOtherNetworkLibrary(chainId)
      const addresses = SHARKFIN_ADDRESS[chainId]
      if (!addresses) {
        return acc
      }
      const list = Object.keys(addresses).reduce((acc2, curSymbol: string) => {
        const addressSelf = addresses?.[curSymbol]?.SELF
        const addressU = addresses?.[curSymbol]?.U
        const contractSelf = addressSelf && library ? getContract(addressSelf, SHARKFIN_VAULT_ABI, library) : null
        const contractU = addressU && library ? getContract(addressU, SHARKFIN_VAULT_ABI, library) : null
        acc2.push(callsFactory(contractSelf))
        acc2.push(callsFactory(contractU))
        return acc2
      }, [] as any[])

      acc.push(Promise.all(list))
      return acc
    }, [] as any[])

    Promise.all(allPromises)
      .then(r => {
        const sum = Object.keys(SHARKFIN_ADDRESS).reduce((acc, chain, idx1) => {
          const chainId: ChainId = +chain
          const chainRes = r[idx1]
          const addresses = SHARKFIN_ADDRESS[chainId]

          if (!addresses) {
            return acc
          }
          const chainSum = Object.keys(addresses).reduce((acc2, curSymbol: string, idx2) => {
            const price = prices[curSymbol as keyof typeof prices] ?? 1
            const self = chainRes[idx2 * 2]
            const u = chainRes[idx2 * 2 + 1]
            const valSelf = parseBalance(
              self[DataOrder.vaultState].lockedAmount.toString(),
              new Token(1, ZERO_ADDRESS, CURRENCIES[chainId ?? NETWORK_CHAIN_ID][curSymbol].decimals)
            )
            const valU = parseBalance(
              u[DataOrder.vaultState].lockedAmount.toString(),
              new Token(1, ZERO_ADDRESS, CURRENCIES[chainId ?? NETWORK_CHAIN_ID].USDT.decimals)
            )

            acc2 += +(valU ?? '0')
            acc2 += +(valSelf ?? '0') * price

            return acc2
          }, 0)
          acc += chainSum
          return acc
        }, 0)
        setAmountInProgress(sum + '')
      })
      .catch(e => {
        console.error(e)
      })
  }, [prices])

  return useMemo(() => {
    return { totalInvest, amountInProgress }
  }, [amountInProgress, totalInvest])
}

const callsFactory = (contract: Contract | null) => {
  return Promise.all([contract?.vaultState()])
}
