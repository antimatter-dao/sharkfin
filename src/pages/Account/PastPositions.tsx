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
import { usePastPositionRecords } from 'hooks/usePastPositionRecords'
import { dayjsUTC } from 'utils/dayjsUTC'
import { Loader } from 'components/AnimatedSvg/Loader'

const TableHeader = ['', 'Invest Amount', 'Pnl', 'Return Amount', 'Subscribed Time', 'Delivery Time']

export default function PastPosition() {
  const { account } = useActiveWeb3React()
  // const history = useHistory()
  const isDownMd = useBreakpoint('md')
  const [page, setPage] = useState(1)
  const { orderList: records, pageParams } = usePastPositionRecords(page)

  const data = useMemo(() => {
    if (!records) return { balanceData: undefined, hiddenParts: undefined }
    const hiddenParts: any[] = []
    const dataList = records.reduce((acc, record) => {
      const underlying = record.name.match(/\(([A-Z]+)\)/i)?.[1]

      hiddenParts.push(
        <Box
          key={1}
          display="flex"
          justifyContent="space-between"
          width="100%"
          gap={14}
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
                {record.orderId}
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
              <Typography sx={{ opacity: 0.5 }}>Terms:</Typography>
              <Typography sx={{ fontWeight: { xs: 600, md: 400 } }} component="span">
                7 Days
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
                {record.settlementPrice} {record.currency}
              </Typography>
            </Box>
            <Box />
          </Box>
          <Box></Box>
        </Box>
      )
      acc.push([
        <Box display="flex" alignItems="center" gap={16} key={0}>
          <CurrencyLogo currency={SUPPORTED_CURRENCIES[record.currency]} size="32px" />
          <Box>
            <Typography fontSize={16}>{`${underlying ?? '-'} weekly sharkfin`}</Typography>
            <Typography fontSize={12} sx={{}}>
              <span style={{ opacity: 0.5, fontSize: '12px' }}>{`(Base Currency-${record.currency})`}</span>
            </Typography>
          </Box>
        </Box>,
        <>
          {record.size ?? '-'} {record.currency ?? '-'}
        </>,
        <Typography key={1} color="#31B047">
          {record.pnl ?? '-'} {record.currency ?? '-'}
        </Typography>,
        <>
          {record.size && record.pnl ? (+record.size + +record.pnl).toFixed(2) : '-'} {record.currency ?? '-'}
        </>,
        dayjsUTC(+record.startedAt).format('MMM DD, YYYY\nhh:mm A') + ' UTC',
        dayjsUTC(+record.liquidatedAt).format('MMM DD, YYYY\nhh:mm A') + ' UTC'
      ])
      return acc
    }, [] as any[])
    return { dataList, hiddenParts }
  }, [records])

  const handlePage = useCallback((event, value) => setPage(value), [])

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
            <Box position="relative" display="grid" gap={24}>
              {!data.dataList ? (
                <Loader />
              ) : data.dataList?.length > 0 ? (
                <>
                  {isDownMd ? (
                    <TableCards data={data.dataList} hiddenParts={data.hiddenParts} />
                  ) : (
                    <Table header={TableHeader} rows={data.dataList} hiddenParts={data.hiddenParts} collapsible />
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
              ) : (
                <NoDataCard height="20vh" />
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
