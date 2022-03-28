import { useCallback, useMemo } from 'react'
import { ChainId } from 'constants/chain'
import { useDefiVaultContract } from './useContract'
import { useActiveWeb3React } from 'hooks'
import { DEFAULT_COIN_SYMBOL } from 'constants/currencies'

export function useDefiVaultCallback(
  chainId: ChainId | undefined,
  currencySymbol: string | undefined,
  type: 'CALL' | 'PUT' | undefined
) {
  const { account } = useActiveWeb3React()
  const contract = useDefiVaultContract(chainId, currencySymbol, type)

  const depositETH = useCallback(
    async (val: string): Promise<any> => {
      if (!contract) {
        throw Error('no contract')
      }
      return contract?.depositETH({ value: val })
    },
    [contract]
  )

  const deposit = useCallback(
    async (val: string): Promise<any> => {
      if (!contract) {
        throw Error('no contract')
      }
      const estimatedGas = await contract.estimateGas.deposit(val).catch((error: Error) => {
        console.debug(`Failed to deposit token`, error)
        throw error
      })
      return contract?.deposit(val, { gasLimit: estimatedGas })
    },
    [contract]
  )

  const depositCallback = useCallback(
    (val: string): Promise<any> => {
      if (chainId && DEFAULT_COIN_SYMBOL[chainId] === currencySymbol && type === 'CALL') {
        return depositETH(val)
      } else {
        return deposit(val)
      }
    },
    [chainId, currencySymbol, deposit, depositETH, type]
  )

  const withdrawCallback = useCallback(async (): Promise<any> => {
    if (!contract) {
      throw Error('no contract')
    }
    const amount = await contract.depositReceipts(account)
    const estimatedGas = await contract.estimateGas
      .withdrawInstantly(amount.amount.toString())
      .catch((error: Error) => {
        console.debug(`Failed to deposit token`, error)
        throw error
      })
    return contract?.withdrawInstantly(amount.amount.toString(), { gasLimit: estimatedGas })
  }, [account, contract])

  return useMemo(
    () => ({
      depositCallback,
      withdrawCallback
    }),
    [depositCallback, withdrawCallback]
  )
}
