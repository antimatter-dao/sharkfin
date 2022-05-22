import { useMemo, useState } from 'react'
import { useHistory } from 'react-router'
import { Container, Box, Typography, IconButton } from '@mui/material'
import Card from 'components/Card/Card'
import Table from 'components/Table'
import NoDataCard from 'components/Card/NoDataCard'
import Button from 'components/Button/Button'
import { useActiveWeb3React } from 'hooks'
// import { Currency } from 'constants/token'
import useBreakpoint from 'hooks/useBreakpoint'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import { SUPPORTED_CURRENCIES } from 'constants/currencies'
// import { useDefiVaultList } from '../../hooks/useDefiVault'
import { routes } from 'constants/routes'
// import { ChainListMap, NETWORK_CHAIN_ID } from 'constants/chain'
import { OutlinedCard } from 'components/Card/Card'
import StatusTag from 'components/Status/StatusTag'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Divider from 'components/Divider'

enum BalanceTableHeaderIndex {
  investAmount,
  subscribedTime,
  finalAPY,
  deliveryTime,
  priceRange,
  term,
  returnAmount,
  status
}

const BalanceTableHeader = [
  'Invest Amount',
  'Subscribed Time',
  'Final APY',
  'Delivery Time',
  'Price Range(USDT)',
  'Term',
  'Return Amount',
  'Status'
]

// function TokenHeader({
//   token,
//   investToken,
//   type
// }: {
//   token: Currency | undefined
//   investToken: Currency | undefined
//   type: 'CALL' | 'PUT'
// }) {
//   return (
//     <Box display="flex" alignItems="center" gap={16}>
//       <CurrencyLogo currency={investToken} size="32px" />
//       <Box>
//         <Typography fontSize={16}>{`${token?.symbol} ${
//           type === 'CALL' ? 'Covered Call' : 'Put Selling'
//         } Recurring Strategy`}</Typography>
//         <Typography fontSize={12} sx={{}}>
//           <span style={{ opacity: 0.5, fontSize: '12px' }}>{token?.name}</span>
//         </Typography>
//       </Box>
//     </Box>
//   )
// }

export default function Position() {
  // const [isDepositOpen, setIsDepositOpen] = useState(false)
  // const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  // const [currentCurrency, setCurrentCurrency] = useState<Token | undefined>(undefined)
  const { account } = useActiveWeb3React()
  const history = useHistory()
  const isDownMd = useBreakpoint('md')
  // const [page] = useState(1)
  // const accountBalances = useAccountBalances()
  // const indexPrices = usePriceForAll()
  // const vaultList = useDefiVaultList()

  // const totalInvest = useMemo(() => {
  //   if (!accountBalances) return '-'
  //
  //   const accumulated = Object.keys(accountBalances).reduce((acc: number, key: string) => {
  //     const val = accountBalances?.[key as keyof typeof accountBalances]?.totalInvest
  //     const price = indexPrices[key as keyof typeof indexPrices]
  //     if (val && val !== '-' && price) {
  //       return acc + +val * (key === 'USDT' ? 1 : +price)
  //     } else {
  //       return acc
  //     }
  //   }, 0)
  //   return accumulated.toFixed(2) + ''
  // }, [accountBalances, indexPrices])

  // const accountDetailsData = useMemo(() => {
  //   // const records = accountRecord?.records
  //   if (!vaultList) return []
  //
  //   return vaultList.map(vault => {
  //     //const scanLink = chainId ? getEtherscanLink(chainId, record.hash, 'transaction') : ''
  //     const token = chainId ? SUPPORTED_CURRENCIES[vault.investCurrency] : undefined
  //     return [
  //       // <TransactionTypeIcon key="type" txType={RecordType[value.type]} />,
  //       <Box key={1} display="flex" gap={10} alignItems="center">
  //         <CurrencyLogo currency={token} size="16px" />
  //         {vault.investCurrency}
  //       </Box>
  //       // <Box key={1} display="flex" alignItems="center">
  //       //   <ExternalLink
  //       //     href={scanLink}
  //       //     sx={{
  //       //       display: 'flex',
  //       //       color: theme => theme.palette.text.primary,
  //       //       '&:hover': {
  //       //         color: theme => theme.palette.primary.main
  //       //       }
  //       //     }}
  //       //   >
  //       //     <Typography component="span" sx={{}}>
  //       //       {value.amount}
  //       //     </Typography>
  //       //     <Box component="span" sx={{ ml: 5, display: 'flex', alignItems: 'center' }}>
  //       //       <UpperRightIcon style={{ color: 'currentColor' }} />
  //       //     </Box>
  //       //   </ExternalLink>
  //       // </Box>
  //       // dayjs(new Date(+record.timestamp * 1000).toUTCString()).format('MMM DD, YYYY hh:mm:ss A') + ' UTC',
  //       // <>{!isDownMd && <StatusTag key="status" status="completed" />}</>
  //     ]
  //   })
  // }, [chainId, isDownMd, vaultList])

  // const handleDepositOpen = useCallback(() => {
  //   setIsDepositOpen(true)
  // }, [])

  // const handleWithdrawOpen = useCallback(() => {
  //   setIsWithdrawOpen(true)
  // }, [])

  // const handlePage = useCallback((event, value) => setPage(value), [])

  const balanceData = useMemo(() => {
    return [
      [
        <>129000 USDT</>,
        <>Sep 21, 2021</>,
        <Typography key={1} color="#31B047">
          5% ~ 12%
        </Typography>,
        <>
          Sep 21, 2021
          <br />
          08:30 AM UTC{' '}
        </>,
        <>59,000~62,000</>,
        <>7 Days</>,
        <>--</>,
        <Box key={1} display="flex" gap={10} pl={isDownMd ? 0 : 20}>
          <StatusTag key="status" status="finished" />
          <Button
            fontSize={14}
            style={{ width: 92, borderRadius: 4, height: 36 }}
            onClick={() => {
              history.push(
                routes.sharkfinMgmt
                  .replace(':currency', '')
                  .replace(':type', '')
                  .replace(':chainName', '')
              )
            }}
          >
            Claim
          </Button>
        </Box>
      ]
    ]
  }, [])

  const balanceHiddenParts = useMemo(() => {
    return [
      <Box
        key={1}
        display="flex"
        justifyContent="space-between"
        width="100%"
        sx={{ flexDirection: { xs: 'column', md: 'row' } }}
      >
        <Box display="grid" gap={14}>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              justifyContent: { xs: 'space-between', md: 'flex-start' },
              width: { xs: '100%', md: 'fit-content' },
              gap: { xs: 0, md: 17 }
            }}
          >
            <Typography sx={{ opacity: 0.5 }}>Order ID:</Typography>
            <span>76</span>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              justifyContent: { xs: 'space-between', md: 'flex-start' },
              width: { xs: '100%', md: 'fit-content' },
              gap: { xs: 0, md: 17 }
            }}
          >
            <Typography sx={{ opacity: 0.5 }}>Product ID:</Typography>
            <span>29</span>
          </Box>
        </Box>
        <Box display="grid" gap={14}>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              justifyContent: { xs: 'space-between', md: 'flex-start' },
              width: { xs: '100%', md: 'fit-content' },
              gap: { xs: 0, md: 17 }
            }}
          >
            <Typography sx={{ opacity: 0.5 }}>Settlement Price:</Typography>
            <span>62091.35</span>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              justifyContent: { xs: 'space-between', md: 'flex-start' },
              width: { xs: '100%', md: 'fit-content' },
              gap: { xs: 0, md: 17 }
            }}
          >
            <Typography sx={{ opacity: 0.5 }}>Settlement Time:</Typography>
            <span>Sep 21, 2021 10:42 AM </span>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={7} sx={{ mt: { xs: 16, md: 0 } }}>
          <CurrencyLogo currency={SUPPORTED_CURRENCIES['BTC']} />
          <Typography fontWeight={700} sx={{ fontSize: { xs: 12, md: 14 } }}>
            Daily Sharkfin BTC(Base Currency-BTC)
          </Typography>
        </Box>
      </Box>
    ]
  }, [isDownMd])

  if (!account) {
    return (
      <Container disableGutters sx={{ mt: 48 }}>
        <NoDataCard height={account ? '40vh' : undefined} />
      </Container>
    )
  }

  return (
    <>
      <Box width="100%" mt={48} display="flex" flexDirection="column" gap={19}>
        <Card>
          <Box width="100%" padding="38px 24px" display="flex" flexDirection="column" gap={36}>
            <OutlinedCard padding="20px 24px 28px">
              <Typography fontSize={16} sx={{ opacity: 0.5, mb: 24 }}>
                BTC latest spot price
              </Typography>
              <Typography fontSize={24} fontWeight={700}>
                57640.00
              </Typography>
            </OutlinedCard>
            <Box position="relative">
              {!balanceData || balanceData.length === 0 ? (
                <NoDataCard height="20vh" />
              ) : isDownMd ? (
                <AccountBalanceCards data={balanceData} hiddenParts={balanceHiddenParts} />
              ) : (
                <Table header={BalanceTableHeader} rows={balanceData} hiddenParts={balanceHiddenParts} collapsible />
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    </>
  )
}

function AccountBalanceCards({ data, hiddenParts }: { data: any[][]; hiddenParts: JSX.Element[] }) {
  return (
    <Box mt={24} display="flex" flexDirection="column" gap={8}>
      {data.map((dataRow, idx) => (
        <TableCard dataRow={dataRow} key={`table-row-${idx}`} hiddenPart={hiddenParts && hiddenParts[idx]} />
      ))}
    </Box>
  )
}

function TableCard({ dataRow, hiddenPart }: { dataRow: any[]; hiddenPart: JSX.Element }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card color="#F2F5FA" padding="16px">
      <Box display="flex" flexDirection="column" gap={16}>
        {dataRow.map((datum, idx) => {
          if (idx === BalanceTableHeaderIndex.status) return null
          return (
            <Box key={`datum-${idx}`} display="flex" justifyContent="space-between">
              <Typography fontSize={12} color="#000000" sx={{ opacity: 0.5 }}>
                {BalanceTableHeader[idx]}
              </Typography>
              <Typography fontSize={12} fontWeight={600} component="div">
                {datum}
              </Typography>
            </Box>
          )
        })}
      </Box>
      <Box display="flex" alignItems={'center'} justifyContent="space-between" mt={20}>
        {dataRow[BalanceTableHeaderIndex.status]}

        <IconButton
          aria-label="expand row"
          size="small"
          onClick={() => setIsOpen(isOpen => !isOpen)}
          sx={{ flexGrow: 0, border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '50%' }}
        >
          {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>
      {isOpen && (
        <>
          <Divider sx={{ opacity: 0.1 }} extension={16} style={{ marginTop: 20, marginBottom: 20 }} />
          <Box width="100%">{hiddenPart}</Box>
        </>
      )}
    </Card>
  )
}

// function VaultActions({ onVisit }: { onVisit: () => void }) {
//   const isDownMd = useBreakpoint('md')

//   return (
//     <Box display="flex" key="action" gap={10} pl={isDownMd ? 0 : 20} component="div">
//       <Button fontSize={14} style={{ width: 92, borderRadius: 4, height: 36 }} onClick={onVisit}>
//         Visit
//       </Button>
//     </Box>
//   )
// }

// function InvestmentValueCard({ value, unit }: { value?: string; unit?: string; dayChange?: string }) {
//   const theme = useTheme()
//   const history = useHistory()
//   return (
//     <Card style={{ position: 'relative', border: '1px solid #00000010' }}>
//       <Box
//         sx={{
//           padding: '16px',
//           gap: '12px',
//           height: 'auto',
//           display: 'flex',
//           flexDirection: 'column'
//         }}
//       >
//         <Box display="flex">
//           <Typography variant="inherit" color={theme.palette.text.secondary}>
//             Total Investment Value
//           </Typography>
//         </Box>
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'baseline',
//             color: theme.palette.text.primary
//           }}
//         >
//           <Typography
//             sx={{
//               fontSize: 20,
//               fontWeight: 700,
//               lineHeight: 1
//             }}
//             component="div"
//           >
//             {value}
//           </Typography>
//           <Typography sx={{ fontSize: 16, fontWeight: 700, ml: 4, lineHeight: 1 }} component="div">
//             {unit}
//           </Typography>
//           {/* <Box
//             component="div"
//             borderRadius={22}
//             color="#31B047"
//             bgcolor="rgba(49, 176, 71, 0.16)"
//             fontSize={14}
//             display="flex"
//             alignItems="center"
//             justifyContent="center"
//             width={120}
//             height={24}
//             ml={12}
//           >
//             <Typography
//               sx={{
//                 color: '#11BF2D',
//                 fontSize: '12px'
//               }}
//             >
//               {dayChange}
//             </Typography>
//           </Box> */}
//         </Box>
//         <Button
//           onClick={() => {
//             history.push(routes.dualInvest)
//           }}
//           style={{ width: '100%', height: 36, fontSize: 14, borderRadius: 22 }}
//         >
//           Invest
//         </Button>
//       </Box>
//     </Card>
//   )
// }
