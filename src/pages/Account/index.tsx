import { useCallback, useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useParams, useHistory } from 'react-router-dom'
import Tabs from 'components/Tabs/Tabs'
import Image from 'components/Image'
import Position from './Position'
//import Position from './Position/index'
import History from './History'
import positionUrl from 'assets/images/position.png'
import dashboardUrl from 'assets/images/dashboard.png'
import historyUrl from 'assets/images/history.png'
import useBreakpoint from 'hooks/useBreakpoint'
import { routes } from 'constants/routes'
import PastPosition from './PastPositions'

export enum AccountTabs {
  position = 0,
  history = 1,
  past = 2
}

export const AccountTabsRoute = {
  [AccountTabs.position]: 'position',
  [AccountTabs.history]: 'history',
  [AccountTabs.past]: 'past'
}

export default function Account() {
  const history = useHistory()
  const { tab } = useParams<{ tab: string }>()
  const [currentTab, setCurrentTab] = useState(AccountTabs.position)

  const handleTabClick = useCallback(
    tabNum => {
      setCurrentTab(tabNum)
      history.replace(routes.accountTab.replace(':tab', AccountTabsRoute[tabNum as keyof typeof AccountTabsRoute]))
    },
    [history]
  )

  useEffect(() => {
    if (tab) {
      setCurrentTab(AccountTabs[tab as keyof typeof AccountTabs])
    }
  }, [tab])

  return (
    <Box
      sx={{
        maxWidth: theme => theme.width.maxContent,
        margin: { xs: '0 0 auto', md: '62px 0 auto' },
        width: '100%',
        padding: { xs: 20, md: 0 }
      }}
    >
      <Tabs
        customCurrentTab={currentTab}
        customOnChange={handleTabClick}
        titles={[
          <Tab text="Position" iconUrl={positionUrl} key="dashboard" />,
          <Tab text="History" iconUrl={historyUrl} key="history" />,
          <Tab text="Past Positions" iconUrl={dashboardUrl} key="past" />
        ]}
        contents={[<Position key="position" />, <History key="history" />, <PastPosition key="past" />]}
        tabPadding="18px 0"
      />
    </Box>
  )
}

function Tab({ text, iconUrl }: { text: string; iconUrl: string }) {
  const isDownMd = useBreakpoint('md')
  return (
    <Typography key={text} fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 8.45, md: 12 } }}>
      {isDownMd ? (
        <Image src={iconUrl} style={{ width: 17, height: 'auto' }} />
      ) : (
        <Image src={iconUrl} style={{ width: 24, height: 'auto' }} />
      )}

      {text}
    </Typography>
  )
}
