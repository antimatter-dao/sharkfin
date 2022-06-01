import { useMemo, useState, useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Typography, Box, useTheme, styled, Grid } from '@mui/material'
import MgmtPage from 'components/MgmtPage'
// import { routes } from 'constants/routes'
import { Subject } from 'components/MgmtPage/stableContent'
// import TextButton from 'components/Button/TextButton'
// import { vaultPolicyCall, vaultPolicyPut, valutPolicyTitle, vaultPolicyText } from 'components/MgmtPage/stableContent'
import VaultForm from './VaultForm'
import SharkfinChart from 'pages/SharkfinMgmt/Chart'
import { PastAggrChart } from 'components/Chart/BarChart'
import Card from 'components/Card/Card'
// import dayjs from 'dayjs'
import useBreakpoint from 'hooks/useBreakpoint'
import { useSingleSharkfin } from 'hooks/useSharkfin'
import { ReactComponent as ArrowLeft } from 'assets/componentsIcon/arrow_left.svg'
import { usePrice } from 'hooks/usePriceSet'
import { trimNumberString } from 'utils/trimNumberString'
// import { usePrevDetails } from 'hooks/usePrevDetails'
// import { PrevOrder } from 'utils/fetch/record'
// import Divider from 'components/Divider'
// import { Timer } from 'components/Timer'
// import { ExternalLink } from 'theme/components'
// import SwitchToggle from 'components/SwitchToggle'

export const StyledUnorderList = styled('ul')(({ theme }) => ({
  paddingLeft: '14px',
  margin: '-20px 0 0',
  color: '#808080',
  '& li': {
    marginTop: 20,
    fontSize: 16,
    lineHeight: '20px'
  },
  '& li span': {
    color: '#252525'
  },
  '& li::marker': {
    color: theme.palette.primary.main
  }
}))

export default function SharkfinMgmt() {
  const [investAmount, setInvestAmount] = useState('')

  const theme = useTheme()
  const history = useHistory()
  const { investCurrency, underlying, chainName } = useParams<{
    investCurrency: string
    underlying: string
    chainName: string
  }>()

  const product = useSingleSharkfin(chainName ?? '', underlying ?? '', investCurrency ?? '')
  const price = usePrice(underlying)
  // const prevDetails = usePrevDetails(chainName ?? '', currency ?? '', type ?? '')
  const isDownMd = useBreakpoint('md')

  const returnOnInvestmentListItems = useMemo(() => {
    return [
      <>
        Settlement at maturity:at annualised rate of return{' '}
        <span style={{ color: theme.palette.primary.main, fontWeight: 700 }}>3.00~25.00%</span> Conditions must meet:
        {product?.underlying ?? 'ETH'} price was always within the price range Annualised Product Return =
        3.00%+(settlement price at maturity-38500)/(42500-38500)*(25.00%-3.00%) Return=Principal* Annualised Product
        Return/365*Investment term
      </>,
      <>
        Settlement at maturity:APR of <span style={{ color: theme.palette.primary.main, fontWeight: 700 }}>3.00%</span>{' '}
        Conditions must meet:Would {product?.underlying ?? 'ETH'} price was atleast once below $38500 or above $42500
        Return = Principal * 3.00/365 * 7 (investment term)
      </>,
      <>
        *Observed {product?.underlying ?? 'ETH'}/USD option’s underlying price at Deribit at 12:00 every day is the
        observed price of the day. The settlement price is the {product?.underlying ?? 'ETH'} price at 8:00 UTC on
        expiry date. Price data is sourced from an on-chain oracle.
      </>
    ]
  }, [product?.underlying, theme.palette.primary.main])

  const chart = useMemo(() => {
    return <SharkfinChart marketPrice={price ? trimNumberString(price, 4) : '-'} baseRate={product?.minRate} />
  }, [price, product?.minRate])

  const handleInput = useCallback((val: string) => {
    setInvestAmount(val)
  }, [])

  // const chart2 = useMemo(() => {
  //   return <PastAggrChart />
  //   return null
  // }, [])
  return (
    <>
      {product === null ? (
        <Box
          position="fixed"
          top={{ xs: theme.height.mobileHeader, md: theme.height.header }}
          left={0}
          width={'100%'}
          height={{
            xs: `calc(100vh - ${theme.height.mobileHeader})`,
            md: `calc(100vh - ${theme.height.header})`
          }}
          padding={isDownMd ? '24px 24px 28px' : '27px 24px'}
          sx={{ background: '#ffffff' }}
        >
          <Box
            // component={NavLink}
            // to={routes.sharkfin}
            component="span"
            onClick={history.goBack}
            zIndex={2}
            sx={{
              textDecoration: 'none',
              display: 'block',
              width: 'max-content',
              '&:hover': {
                cursor: 'pointer'
              }
            }}
          >
            <ArrowLeft />
            <Typography component="span" color={theme.bgColor.bg1} fontSize={{ xs: 12, md: 14 }} ml={16}>
              Go Back
            </Typography>
          </Box>
          <Box width="100%" height="100%" display="flex" justifyContent={'center'} alignItems="center">
            Product Not Available
          </Box>
        </Box>
      ) : (
        <>
          <MgmtPage
            graphTitle="Purchase expected income graph"
            showFaq={true}
            // backLink={routes.sharkfin}
            pageTitle={`${product.underlying} weekly sharkfin(Base Currency-${
              product.type === 'SELF' ? product.underlying : 'USDT'
            })`}
            priceCurSymbol={product?.underlying}
            subject={Subject.Sharkfin}
            returnOnInvestmentListItems={returnOnInvestmentListItems}
            vaultForm={<VaultForm product={product} setAmount={handleInput} amount={investAmount} />}
            chart={chart}
          >
            {/* <Grid xs={12} md={4} item>
              <RecurringSwitch />
            </Grid> */}
            <Grid xs={12} item>
              <PastAggregate />
              {/* <PrevCycleStats prevDetails={prevDetails} /> */}
            </Grid>
            {/* {!isDownMd && (
              <Grid xs={12} md={8} item>
                <Card style={{ height: '100%' }}>
                  <Box height="100%" width="100%" display="flex" alignItems={'center'} padding="24px">
                    <Typography sx={{ margin: 'auto auto' }} align="center">
                      Past aggregate earnings graph <br />
                      Coming soon...
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            )} */}
          </MgmtPage>
        </>
      )}
    </>
  )
}

// function RecurringPolicy({ type, currencySymbol }: { type: 'call' | 'put'; currencySymbol: string }) {
//   const [curIdx, setCurIdx] = useState(0)
//   const policy = type === 'SELF' ? vaultPolicyCall : vaultPolicyPut
//   const Text = vaultPolicyText[type]

//   const theme = useTheme()

//   const handlePrev = useCallback(() => {
//     setCurIdx(preIdx => {
//       return preIdx === 0 ? 0 : preIdx - 1
//     })
//   }, [])

//   const handleNext = useCallback(() => {
//     setCurIdx(preIdx => {
//       return preIdx === policy.length - 1 ? policy.length - 1 : preIdx + 1
//     })
//   }, [policy.length])

//   return (
//     <Box display="grid" gap="19px" padding="33px 24px">
//       <Typography fontSize={24} fontWeight={700}>
//         Recurring Policy
//       </Typography>
//       <StyledUnorderList>
//         <Text currencySymbol={currencySymbol} />
//       </StyledUnorderList>
//       <Box position="relative">
//         <Box width="100%" display="flex" justifyContent="space-between" position="absolute" top="50%">
//           <TextButton onClick={handlePrev} disabled={curIdx === 0} style={{ '&:disabled': { opacity: 0 } }}>
//             <svg width="12" height="19" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path
//                 d="M10.4844 17.9707L1.99909 9.48542L10.4844 1.00014"
//                 stroke={theme.palette.primary.main}
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </TextButton>
//           <TextButton
//             onClick={handleNext}
//             disabled={curIdx === policy.length - 1}
//             style={{ '&:disabled': { opacity: 0 } }}
//           >
//             <svg width="11" height="19" viewBox="0 0 11 19" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path
//                 d="M0.828125 1L9.31341 9.48528L0.828125 17.9706"
//                 stroke={theme.palette.primary.main}
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </TextButton>
//         </Box>
//         <Typography fontWeight={700} fontSize={14} color="primary">
//           {valutPolicyTitle[curIdx]}
//         </Typography>
//         {<RecurringPolicyPage img={policy[curIdx].img} text={policy[curIdx].text} />}
//       </Box>
//       <Box display="flex" gap="5px" margin="10px auto 0">
//         {policy.map((item, idx) => {
//           const active = curIdx === idx
//           return (
//             <div
//               key={idx}
//               style={{
//                 height: 3,
//                 width: active ? 24 : 6,
//                 backgroundColor: active ? '#31B047' : '#C4C4C4',
//                 transition: '.5s',
//                 borderRadius: 3
//               }}
//             />
//           )
//         })}
//       </Box>
//     </Box>
//   )
// }

// function RecurringPolicyPage({ img, text }: { img: ReactElement<any, any>; text: string }) {
//   return (
//     <Box display="flex" gap="12px" flexDirection="column" justifyContent={'space-between'} alignItems="center">
//       <div />
//       <Box
//         sx={{ border: '1px solid #25252510', borderRadius: 1 }}
//         padding="15px"
//         width="calc(100% - 34px)"
//         display="grid"
//         justifyItems={'center'}
//         height={210}
//         gap={8}
//       >
//         <Box alignItems="center" display="flex">
//           {img}
//         </Box>

//         <Typography sx={{ color: '#00000060' }} fontWeight={400} fontSize={12}>
//           {text}
//         </Typography>
//       </Box>
//     </Box>
//   )
// }

// function PrevCycleStats({ prevDetails }: { prevDetails: PrevOrder | undefined }) {
//   const theme = useTheme()
//   const data = useMemo(
//     () => ({
//       ['APY']: prevDetails?.annualRor ? (+prevDetails.annualRor * 100).toFixed(2) + '%' : '-',
//       ['Strike Price']: `${prevDetails?.strikePrice ?? '-'} USDT`,
//       // ['Executed Price']: `${prevDetails?.deliveryPrice ?? '-'} USDT`,
//       // ['Status']: prevDetails?.status ?? '-',
//       // ['Your P&L']: prevDetails?.pnl ?? '-',
//       ['Date']: prevDetails
//         ? `From ${dayjs(+prevDetails.createdAt).format('MMM DD, YYYY')} to ${dayjs(prevDetails.expiredAt * 1000).format(
//             'MMM DD, YYYY'
//           )}`
//         : '-'
//     }),
//     [prevDetails]
//   )
//   return (
//     <Card width={'100%'}>
//       <Box display="flex" gap="21px" padding="28px" flexDirection="column" alignItems={'stretch'}>
//         <Typography fontSize={24} fontWeight={700}>
//           Previous Cycle Statistics
//         </Typography>

//         {Object.keys(data).map((key, idx) => (
//           <Box key={idx} display="flex" justifyContent={'space-between'}>
//             <Typography fontSize={16} sx={{ opacity: 0.8 }}>
//               {key}
//             </Typography>

//             <Typography
//               fontWeight={key === 'APY' ? 400 : 500}
//               color={key === 'APY' ? theme.palette.primary.main : theme.palette.text.primary}
//             >
//               {data[key as keyof typeof data]}
//             </Typography>
//           </Box>
//         ))}
//       </Box>
//     </Card>
//   )
// }

// function RecurringSwitch() {
//   const theme = useTheme()
//   const data = useMemo(
//     () => ({
//       ['Subscribed orders in progress']: <ExternalLink href="">Details</ExternalLink>,
//       ['Progress order due time']: <Timer timer={0} />
//     }),
//     []
//   )
//   return (
//     <Card width="100%" padding="43px 22px" height={400}>
//       <Card gray>
//         <Box padding="20px 22px" display="grid" gap={30} minHeight={141}>
//           <Box display={'flex'} alignItems="center">
//             <Divider
//               orientation="vertical"
//               sx={{
//                 marginRight: 12,
//                 width: 2,
//                 backgroundColor: theme => theme.palette.primary.main,
//                 borderColor: 'transparent'
//               }}
//             />
//             <Typography fontSize={14} sx={{ color: theme => theme.palette.text.secondary }}>
//               When you stop recurring, all your existing orders will not be taken into next cycle and you can redeem
//               your tokens once your existing orders expire.
//             </Typography>
//           </Box>
//           <Box display="flex" gap="13px" alignItems="center">
//             <SwitchToggle checked={true} onChange={() => {}} />
//             <Typography fontWeight={600} fontSize={16}>
//               Recurring
//             </Typography>
//           </Box>
//         </Box>
//       </Card>
//       <Box display="flex" gap="17px" flexDirection="column" mt={28}>
//         {Object.keys(data).map((key, idx) => (
//           <Box key={idx} display="flex" justifyContent={'space-between'}>
//             <Typography fontSize={16} sx={{ opacity: 0.8 }}>
//               {key}
//             </Typography>

//             <Typography
//               fontWeight={key === 'APY' ? 400 : 500}
//               color={key === 'APY' ? theme.palette.primary.main : theme.palette.text.primary}
//             >
//               {data[key as keyof typeof data]}
//             </Typography>
//           </Box>
//         ))}
//       </Box>
//     </Card>
//   )
// }

function PastAggregate() {
  return (
    <Card width="100%" padding="34px 24px" height={400}>
      <Typography fontSize={16} sx={{ opacity: 0.5 }} mb={8}>
        Past Aggregate Earnings (Platform)
      </Typography>
      <Box display="flex" alignItems="flex-end">
        <Typography fontSize={44} fontWeight={700}>
          11,111
        </Typography>
        <Typography fontWeight={700}>$</Typography>
      </Box>
      <Typography sx={{ opacity: 0.8, mt: 8 }}>Aug 26, 2021</Typography>
      <PastAggrChart />
    </Card>
  )
}
