import { Suspense, useEffect } from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import { styled } from '@mui/material'
import Header from '../components/Header'
// import Polling from '../components/essential/Polling'
import Popups from '../components/essential/Popups'
import Web3ReactManager from '../components/essential/Web3ReactManager'
import WarningModal from '../components/Modal/WarningModal'
import { ModalProvider } from 'context/ModalContext'
import { routes } from 'constants/routes'
import NoService from './NoService'
import Spinner from 'components/Spinner'
import { fetchLocation } from 'utils/fetch/location'
import Account from './Account'
import Sharkfin from './Sharkfin'
import SharkfinMgmt from './SharkfinMgmt'
import { IS_TEST_NET } from 'constants/chain'

const AppWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  minWidth: theme.width.minContent,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}))

const ContentWrapper = styled('div')({
  width: '100%',
  // maxHeight: '100vh',
  alignItems: 'center'
})

const BodyWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: `calc(100vh - ${theme.height.header})`,
  padding: '0 0 80px',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  overflowY: 'auto',
  overflowX: 'auto',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    minHeight: `calc(100vh  - ${theme.height.mobileHeader})`
  }
}))

const resource = fetchLocation()

export default function App() {
  return (
    <Suspense fallback={null}>
      <ModalProvider>
        <AppWrapper id="app">
          <ContentWrapper>
            <Header />
            <BodyWrapper id="body">
              <Popups />
              {/* <Polling /> */}
              <WarningModal />
              <ScrollToTop />
              <Web3ReactManager>
                <LocatoinVerification resource={resource}>
                  <Switch>
                    <Route exact strict path={routes.noService} component={NoService} />
                    <Route exact strict path={routes.accountTab} component={Account} />

                    <Route exact strict path={routes.sharkfin} component={Sharkfin} />
                    <Route exact strict path={routes.sharkfinMgmt} component={SharkfinMgmt} />
                    <Route path="/">
                      <Redirect to={routes.sharkfin} />
                    </Route>
                  </Switch>
                </LocatoinVerification>
              </Web3ReactManager>
            </BodyWrapper>
            {/* <Footer /> */}
          </ContentWrapper>
        </AppWrapper>
      </ModalProvider>
    </Suspense>
  )
}
const isDev = process.env.NODE_ENV === 'development'
function LocatoinVerification({ resource, children }: { resource: { read(): any }; children: React.ReactNode }) {
  const location = resource.read()

  return (
    <Suspense fallback={<Spinner size={100} />}>
      {/*location === 'US' ||*/ location === 'CN' ? (
        isDev ? (
          children
        ) : IS_TEST_NET ? (
          children
        ) : (
          <NoService />
        )
      ) : (
        children
      )}
      {/*{location === 'US' || location === 'CN' || !location || location === 'Not found' ? children : children}*/}
    </Suspense>
  )
}

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
