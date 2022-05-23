import { useMemo, useState, useCallback } from 'react'
// import { useHistory } from 'react-router'
import { Container, Box, Typography, IconButton } from '@mui/material'
import Card from 'components/Card/Card'
import Table from 'components/Table'
import NoDataCard from 'components/Card/NoDataCard'
import { useActiveWeb3React } from 'hooks'
import useBreakpoint from 'hooks/useBreakpoint'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import { SUPPORTED_CURRENCIES } from 'constants/currencies'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Divider from 'components/Divider'
import Pagination from 'components/Pagination'
import { useHistoryRecords } from 'hooks/useHistoryRecords'

const TableHeader = [
  'Invest Amount',
  'Subscribed Time',
  'Final APY',
  'Delivery Time',
  'Price Range(USDT)',
  'Term',
  'Return Amount'
]

export default function History() {
  const { account } = useActiveWeb3React()
  // const history = useHistory()
  const isDownMd = useBreakpoint('md')
  const [page, setPage] = useState(1)
  const { orderList: records, pageParams } = useHistoryRecords(page)

  const data = useMemo(() => {
    if (!records) return undefined

    return records.map(record => {
      return [
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
        <>62091.35 USDT</>
      ]
    })
  }, [records])

  const handlePage = useCallback((event, value) => setPage(value), [])

  const hiddenParts = useMemo(() => {
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
            <Typography sx={{ fontWeight: { xs: 600, md: 400 } }} component="span">
              76
            </Typography>
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
            <Typography sx={{ fontWeight: { xs: 600, md: 400 } }} component="span">
              29
            </Typography>
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
            <Typography sx={{ fontWeight: { xs: 600, md: 400 } }} component="span">
              62091.35
            </Typography>
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
            <Typography sx={{ fontWeight: { xs: 600, md: 400 } }} component="span">
              Sep 21, 2021 10:42 AM
            </Typography>
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
  }, [])

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
          <Box width="100%" padding="38px 24px" display="flex" flexDirection="column" gap={isDownMd ? 24 : 36}>
            <Box position="relative">
              {(!data || data.length == 0) && <NoDataCard height="20vh" />}

              {data && data?.length > 0 && (
                <>
                  {isDownMd ? (
                    <TableCards data={data} hiddenParts={hiddenParts} />
                  ) : (
                    <Table header={TableHeader} rows={data} hiddenParts={hiddenParts} collapsible />
                  )}

                  <Pagination
                    count={pageParams?.count}
                    page={page}
                    perPage={pageParams?.perPage}
                    boundaryCount={0}
                    total={pageParams.total}
                    onChange={handlePage}
                  />
                </>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    </>
  )
}

function TableCards({ data, hiddenParts }: { data: any[][]; hiddenParts: JSX.Element[] }) {
  return (
    <Box display="flex" flexDirection="column" gap={8}>
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
          return (
            <Box key={`datum-${idx}`} display="flex" justifyContent="space-between">
              <Typography fontSize={12} color="#000000" sx={{ opacity: 0.5 }}>
                {TableHeader[idx]}
              </Typography>
              <Typography fontSize={12} fontWeight={600} component="div">
                {datum}
              </Typography>
            </Box>
          )
        })}
      </Box>
      <Box display="flex" alignItems={'center'} justifyContent="center" mt={20}>
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
