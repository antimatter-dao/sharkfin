import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box } from '@mui/material'
//import Tabs from 'components/Tabs/Tabs'
//import TabButton from 'components/Button/TabButton'
//import useBreakpoint from 'hooks/useBreakpoint'
//import { routes } from 'constants/routes'

export const PRODUCT_TYPE_ROUTE = {
  dualInvest: 'dual_invest',
  chainType: 'chain_type',
  recurVault: 'recur_vault'
}

const Keys = {
  [PRODUCT_TYPE_ROUTE.dualInvest]: 'dualInvest',
  [PRODUCT_TYPE_ROUTE.chainType]: 'chainType',
  [PRODUCT_TYPE_ROUTE.recurVault]: 'recurVault'
}

enum Tabs {
  dualInvest = 'Dual Investment',
  chainType = 'Chain-Type Option',
  recurVault = 'Recurring Vault'
}

export default function InvestTabs({
  dualInvestContent,
  chainTypeContent,
  recurVaultContent
}: {
  dualInvestContent: JSX.Element
  chainTypeContent?: JSX.Element
  recurVaultContent?: JSX.Element
}) {
  //const history = useHistory()
  const { type } = useParams<{ type: string; tab: string }>()
  const typeKey = type ? Keys[type as keyof typeof Keys] ?? undefined : undefined
  const [currentTab, setCurrentTab] = useState(typeKey ? Tabs[typeKey as keyof typeof Tabs] : Tabs.dualInvest)
  // const isDownMd = useBreakpoint('md')

  // const handleClick = useCallback(
  //   key => () => {
  //     history.replace(
  //       routes.accountTabType
  //         .replace(':tab', tab)
  //         .replace(':type', PRODUCT_TYPE_ROUTE[key as keyof typeof PRODUCT_TYPE_ROUTE])
  //     )
  //   },
  //   [history, tab]
  // )

  useEffect(() => {
    if (Keys[type]) {
      setCurrentTab(Tabs[Keys[type] as keyof typeof Tabs])
    }
  }, [type])

  return (
    <Box
      sx={{
        maxWidth: theme => theme.width.maxContent,
        margin: { xs: '0 0 auto', md: '62px 0 auto' },
        width: '100%',
        padding: { xs: '20px 0', md: 0 }
      }}
    >
      {currentTab === Tabs.dualInvest && dualInvestContent}
      {currentTab === Tabs.chainType && chainTypeContent}
      {currentTab === Tabs.recurVault && recurVaultContent}
    </Box>
  )
}
