import { useMemo } from 'react'
import { Token } from 'constants/token'
import { useActiveWeb3React } from 'hooks'
import { useSingleCallResult } from 'state/multicall/hooks'
import { parseBalance } from 'utils/parseAmount'
import { useDualInvestContract } from './useContract'

export function useDualInvestBalance(token?: Token) {
  const contract = useDualInvestContract()
  const { account } = useActiveWeb3React()
  const args = useMemo(() => [token?.address ?? '', account ?? undefined], [account, token])

  const balanceRes = useSingleCallResult(token ? contract : null, 'balances', args)

  return useMemo(() => {
    const result = token && balanceRes?.result ? parseBalance(balanceRes.result?.[0].toString(), token) : '-'
    return result === 'NaN' ? '-' : result
  }, [balanceRes, token])
}
