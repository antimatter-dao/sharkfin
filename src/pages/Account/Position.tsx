import { useMemo } from 'react'
import { useHistory } from 'react-router'
import { Container, Box, Typography } from '@mui/material'
import Card from 'components/Card/Card'
import Table from 'components/Table'
import NoDataCard from 'components/Card/NoDataCard'
import Button from 'components/Button/Button'
import { useActiveWeb3React } from 'hooks'
import { Currency } from 'constants/token'
import useBreakpoint from 'hooks/useBreakpoint'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import { SUPPORTED_CURRENCIES } from 'constants/currencies'
import { useDefiVaultList } from '../../hooks/useDefiVault'
import { routes } from 'constants/routes'
import { ChainListMap, NETWORK_CHAIN_ID } from 'constants/chain'

enum BalanceTableHeaderIndex {
  token,
  apy,
  size,
  position,
  deposit,
  actions
}

// const RecordType: { [key in number]: 'withdraw' | 'deposit' | 'vault deposit' | 'vault withdraw' } = {
//   1: 'deposit',
//   2: 'withdraw',
//   3: 'vault deposit',
//   4: 'vault withdraw'
// }

const BalanceTableHeader = ['', 'Approximate APY', 'Vault Size', 'Your Position', 'Your Deposit', '']
// const DetailTableHeader = ['Type', 'Token', 'Amount', 'Date']

function TokenHeader({
  token,
  investToken,
  type
}: {
  token: Currency | undefined
  investToken: Currency | undefined
  type: 'CALL' | 'PUT'
}) {
  return (
    <Box display="flex" alignItems="center" gap={16}>
      <CurrencyLogo currency={investToken} size="32px" />
      <Box>
        <Typography fontSize={16}>{`${token?.symbol} ${
          type === 'CALL' ? 'Covered Call' : 'Put Selling'
        } Recurring Strategy`}</Typography>
        <Typography fontSize={12} sx={{}}>
          <span style={{ opacity: 0.5, fontSize: '12px' }}>{token?.name}</span>
        </Typography>
      </Box>
    </Box>
  )
}

export default function Position() {
  // const [isDepositOpen, setIsDepositOpen] = useState(false)
  // const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  // const [currentCurrency, setCurrentCurrency] = useState<Token | undefined>(undefined)
  const { account, chainId } = useActiveWeb3React()
  const history = useHistory()
  const isDownMd = useBreakpoint('md')
  // const [page] = useState(1)
  // const accountBalances = useAccountBalances()
  // const indexPrices = usePriceForAll()
  const vaultList = useDefiVaultList()

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
    return vaultList
      ? vaultList
          .filter(vault => {
            return vault.chainId === chainId
          })
          .map((vault, index) => {
            const token = chainId ? SUPPORTED_CURRENCIES[vault.currency] : undefined
            const investCurrency = chainId ? SUPPORTED_CURRENCIES[vault.investCurrency] : undefined
            return [
              <TokenHeader
                key={vault.chainId + vault.type + vault.currency}
                token={token}
                type={vault.type}
                investToken={investCurrency}
              />,
              vault.apy,
              vault?.totalBalance ?? '-',
              vault?.totalBalance && vault.depositAmount
                ? `${(Number((Number(vault.depositAmount) / vault.totalBalance).toFixed(6)) * 100).toFixed(4)}%`
                : '-',
              (vault?.depositAmount ?? '-') + ' ' + (vault?.investCurrency ?? '-'),
              <VaultActions
                key={index}
                onVisit={() => {
                  // setCurrentCurrency(CURRENCIES[chainId ?? NETWORK_CHAIN_ID][key])
                  // handleDepositOpen()
                  history.push(
                    routes.defiVaultMgmt
                      .replace(':currency', vault.currency ?? '')
                      .replace(':type', vault.type)
                      .replace(':chainName', ChainListMap[vault?.chainId ?? NETWORK_CHAIN_ID].symbol)
                  )
                }}
              />
            ]
          })
      : []
  }, [chainId, history, vaultList])

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
            <Typography fontSize={{ xs: 20, sm: 24 }} fontWeight={700}>
              Vault Details
            </Typography>
            {/*<Typography sx={{ color: theme => theme.palette.text.secondary, mt: 8 }}>*/}
            {/*  Deposit funds to your Dual Investment account, you can withdraw available amount at any time*/}
            {/*</Typography>*/}
            <Box position="relative">
              {/*{isDownMd ? (*/}
              {/*  <InvestmentValueCard*/}
              {/*    value={toLocaleNumberString(totalInvest, 6)}*/}
              {/*    unit="$"*/}
              {/*    // dayChange="+ 8.91% / $350.28 "*/}
              {/*  />*/}
              {/*) : (*/}
              {/*  <NumericalCard*/}
              {/*    value={toLocaleNumberString(totalInvest, 6)}*/}
              {/*    border*/}
              {/*    title="Portfolio Value"*/}
              {/*    unit="$"*/}
              {/*    padding="20px 24px"*/}
              {/*    fontSize={'44px'}*/}
              {/*    // dayChange="+ 8.91% / $350.28 "*/}
              {/*  >*/}
              {/*    <Button*/}
              {/*      onClick={() => {*/}
              {/*        history.push(routes.dualInvest)*/}
              {/*      }}*/}
              {/*      style={{*/}
              {/*        width: 148,*/}
              {/*        height: 44,*/}
              {/*        fontSize: 14*/}
              {/*      }}*/}
              {/*    >*/}
              {/*      Invest*/}
              {/*    </Button>*/}
              {/*    <OutlineButton*/}
              {/*      href={'https://exchange.chainswap.com/'}*/}
              {/*      primary*/}
              {/*      style={{*/}
              {/*        marginLeft: 12,*/}
              {/*        width: 148,*/}
              {/*        height: 44,*/}
              {/*        fontSize: 14*/}
              {/*      }}*/}
              {/*    >*/}
              {/*      Bridge*/}
              {/*    </OutlineButton>*/}
              {/*  </NumericalCard>*/}
              {/*)}*/}
              {!balanceData || balanceData.length === 0 ? (
                <NoDataCard height="20vh" />
              ) : isDownMd ? (
                <AccountBalanceCards data={balanceData} />
              ) : (
                <Table header={BalanceTableHeader} rows={balanceData} />
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    </>
  )
}

function AccountBalanceCards({ data }: { data: any[][] }) {
  return (
    <Box mt={24} display="flex" flexDirection="column" gap={8}>
      {data.map((dataRow, idx) => (
        <Card color="#F2F5FA" padding="17px 16px" key={`balance-row-${idx}`}>
          <Box display="flex" flexDirection="column" gap={20}>
            {dataRow[BalanceTableHeaderIndex.token]}
            {dataRow[BalanceTableHeaderIndex.actions]}
          </Box>

          <Box display="flex" flexDirection="column" gap={16} mt={24}>
            {dataRow.map((datum, idx2) => {
              if (idx2 === BalanceTableHeaderIndex.token) return null
              if (idx2 === BalanceTableHeaderIndex.actions) return null
              return (
                <Box key={`balance-row-${idx}-datum-${idx2}`} display="flex" justifyContent="space-between">
                  <Typography fontSize={12} color="#000000" sx={{ opacity: 0.5 }}>
                    {BalanceTableHeader[idx2]}
                  </Typography>
                  <Typography fontSize={12} fontWeight={600} component="div">
                    {datum}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </Card>
      ))}
    </Box>
  )
}

function VaultActions({ onVisit }: { onVisit: () => void }) {
  const isDownMd = useBreakpoint('md')

  return (
    <Box display="flex" key="action" gap={10} pl={isDownMd ? 0 : 20} component="div">
      <Button fontSize={14} style={{ width: 92, borderRadius: 4, height: 36 }} onClick={onVisit}>
        Visit
      </Button>
    </Box>
  )
}

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
