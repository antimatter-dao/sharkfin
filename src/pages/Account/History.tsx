import { useMemo, useState, useCallback } from 'react'
import { Box, Container, Typography } from '@mui/material'
import Card from 'components/Card/Card'
import NoDataCard from 'components/Card/NoDataCard'
import Table from 'components/Table'
import useBreakpoint from 'hooks/useBreakpoint'
import { useActiveWeb3React } from 'hooks'
import dayjs from 'dayjs'
import Spinner from 'components/Spinner'
// import Button from 'components/Button/Button'
// import Filter from 'components/Filter'
import { useHistoryRecords } from 'hooks/useHistoryRecords'
import { getEtherscanLink } from 'utils'
import TransactionTypeIcon from 'components/Icon/TransactionTypeIcon'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import { ExternalLink } from 'theme/components'
import StatusTag from 'components/Status/StatusTag'
import Pagination from 'components/Pagination'
import { SUPPORTED_CURRENCIES, SYMBOL_MAP } from 'constants/currencies'
import { ReactComponent as UpperRightIcon } from 'assets/componentsIcon/upper_right_icon.svg'

const DetailTableHeader = ['Type', 'Vault', 'Amount', 'Date']

export default function HistoryDualInvest() {
  const [page, setPage] = useState(1)
  const { orderList: records, pageParams } = useHistoryRecords(page)

  const isDownMd = useBreakpoint('md')
  const { account } = useActiveWeb3React()

  const handlePage = useCallback((event, value) => setPage(value), [])

  const data = useMemo(() => {
    if (!records) return undefined

    return records.map(record => {
      const scanLink = getEtherscanLink(record.chainId, record.hash, 'transaction')

      return [
        <TransactionTypeIcon key="type" txType={record.actionType} />,
        <Box key={1} display="flex" gap={10} alignItems="center">
          <CurrencyLogo
            currency={SUPPORTED_CURRENCIES[SYMBOL_MAP[record.investCurrency as keyof typeof SYMBOL_MAP]]}
            size="16px"
          />
          {SYMBOL_MAP[record.currency as keyof typeof SYMBOL_MAP] ?? record.currency} {record.callPut.toUpperCase()}
        </Box>,
        <Box key={1} display="flex" alignItems="center">
          <ExternalLink
            href={scanLink}
            sx={{
              display: 'flex',
              color: theme => theme.palette.text.primary,
              '&:hover': {
                color: theme => theme.palette.primary.main
              }
            }}
          >
            <Typography component="span" sx={{}}>
              {record.amount} {record.investCurrency}
            </Typography>
            <Box component="span" sx={{ ml: 5, display: 'flex', alignItems: 'center' }}>
              <UpperRightIcon style={{ color: 'currentColor' }} />
            </Box>
          </ExternalLink>
        </Box>,
        dayjs(new Date(+record.timestamp * 1000).toUTCString()).format('MMM DD, YYYY hh:mm:ss A') + ' UTC',
        <>{!isDownMd && <StatusTag key="status" status="completed" />}</>
      ]
    })
  }, [isDownMd, records])

  if (!account)
    return (
      <Container disableGutters sx={{ mt: 48 }}>
        <NoDataCard />
      </Container>
    )

  return (
    <Box sx={{ mt: 48, width: '100%' }}>
      <Card>
        <Box padding="38px 24px" display="flex" flexDirection="column" gap={36}>
          <Typography fontSize={24} fontWeight={700}>
            Account Details
          </Typography>
          <Box position="relative">
            {!data && (
              <Box
                position="absolute"
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  width: '100%',
                  height: '100%',
                  background: '#ffffff',
                  zIndex: 3,
                  borderRadius: 2
                }}
              >
                <Spinner size={60} />
              </Box>
            )}

            {data && data.length > 0 ? (
              <>
                {isDownMd ? <AccountDetailCards data={data} /> : <Table header={DetailTableHeader} rows={data} />}

                <Pagination
                  count={pageParams?.count}
                  page={page}
                  perPage={pageParams?.perPage}
                  boundaryCount={0}
                  total={pageParams.total}
                  onChange={handlePage}
                />
              </>
            ) : (
              <NoDataCard height="20vh" />
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

function AccountDetailCards({ data }: { data: any[][] }) {
  return (
    <Box display="flex" flexDirection="column" gap={8} mb={24}>
      {data.map((dataRow, idx) => (
        <Card color="#F2F5FA" padding="17px 16px" key={`detail-row-${idx}`}>
          <Box display="flex" flexDirection="column" gap={16}>
            {dataRow.map((datum, idx2) => {
              return (
                <Box key={`detail-row-${idx}-datum-${idx2}`} display="flex" justifyContent="space-between">
                  <Typography fontSize={12} color="#000000" sx={{ opacity: 0.5 }} component="div">
                    {DetailTableHeader[idx2]}
                  </Typography>
                  <Typography fontSize={12} fontWeight={600} component="div">
                    {datum}
                  </Typography>
                </Box>
              )
            })}
          </Box>
          <Box
            borderRadius={22}
            bgcolor="rgba(17, 191, 45, 0.16)"
            width="100%"
            height={36}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt={20}
          >
            <Typography fontSize={14} color="#11BF2D" textAlign="center" component="div">
              Completed
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  )
}

// function BalanceActions({
//   onDeposit,
//   onWithdraw,
//   buyHref
// }: {
//   onDeposit: () => void
//   onWithdraw: () => void
//   buyHref: string
// }) {
//   const isDownMd = useBreakpoint('md')

//   return (
//     <Box display="flex" key="action" gap={10} pl={isDownMd ? 0 : 20} component="div">
//       <Button fontSize={14} style={{ width: 92, borderRadius: 4, height: 36 }} onClick={onDeposit}>
//         Deposit
//       </Button>
//       <Button fontSize={14} style={{ width: 92, borderRadius: 4, height: 36 }} onClick={onWithdraw}>
//         Withdraw
//       </Button>
//       <OutlineButton
//         href={buyHref}
//         fontSize={14}
//         style={{ width: 72, borderRadius: 4, height: 36, backgroundColor: '#ffffff' }}
//         primary
//       >
//         Swap
//       </OutlineButton>
//     </Box>
//   )
// }
