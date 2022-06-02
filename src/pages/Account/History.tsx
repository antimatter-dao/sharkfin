import { useMemo, useState, useCallback } from 'react'
// import { useHistory } from 'react-router'
import { Container, Box, Typography } from '@mui/material'
import Card from 'components/Card/Card'
import Table from 'components/Table'
import NoDataCard from 'components/Card/NoDataCard'
import { useActiveWeb3React } from 'hooks'
import useBreakpoint from 'hooks/useBreakpoint'
import Pagination from 'components/Pagination'
import { useHistoryRecords } from 'hooks/useHistoryRecords'
import { dayjsUTC } from 'utils/dayjsUTC'
import TransactionTypeIcon from 'components/Icon/TransactionTypeIcon'
import { ExternalLink } from 'theme/components'
import { getEtherscanLink, shortenHash } from 'utils'
import { NETWORK_CHAIN_ID } from 'constants/chain'
import { Loader } from 'components/AnimatedSvg/Loader'

// const TableHeader = [
//   'Invest Amount',
//   'Subscribed Time',
//   'Final APY',
//   'Delivery Time',
//   'Price Range(USDT)',
//   'Term',
//   'Return Amount'
// ]

const TableHeader = ['Product', 'Type', 'Amount', 'Tx ID', 'Time']

export default function History() {
  const { account, chainId } = useActiveWeb3React()
  // const history = useHistory()
  const isDownMd = useBreakpoint('md')
  const [page, setPage] = useState(1)
  const { orderList: records, pageParams } = useHistoryRecords(page)

  const data = useMemo(() => {
    if (!records) return undefined

    return records.map(record => {
      return [
        `${record.underlying ?? '-'} weekly sharkfin`,
        <TransactionTypeIcon key="type" txType={record.actionType} />,
        <>
          {record.amount} {record.currency ?? '-'}
        </>,
        record.hash ? (
          <ExternalLink
            href={getEtherscanLink(chainId ?? NETWORK_CHAIN_ID, record.hash, 'transaction')}
            color="#252525"
          >
            {shortenHash(record.hash)}{' '}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.5417 11.5417H2.20833V2.20833H6.875V0.875H2.20833C1.46833 0.875 0.875 1.475 0.875 2.20833V11.5417C0.875 12.275 1.46833 12.875 2.20833 12.875H11.5417C12.275 12.875 12.875 12.275 12.875 11.5417V6.875H11.5417V11.5417ZM8.20833 0.875V2.20833H10.6017L4.04833 8.76167L4.98833 9.70167L11.5417 3.14833V5.54167H12.875V0.875H8.20833Z"
                fill="black"
              />
            </svg>
          </ExternalLink>
        ) : (
          record.hash
        ),
        record.timestamp ? `${dayjsUTC(+record.timestamp * 1000).format('MMM DD, YYYY\nhh:mm A')} UTC` : '-'
      ]
    })
  }, [chainId, records])

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
              {!data && <Loader />}
              {data && data.length == 0 && <NoDataCard height="20vh" />}

              {data && data?.length > 0 && (
                <>
                  {isDownMd ? <TableCards data={data} /> : <Table header={TableHeader} rows={data} />}

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

function TableCards({ data }: { data: any[][] }) {
  return (
    <Box display="flex" flexDirection="column" gap={8}>
      {data.map((dataRow, idx) => (
        <TableCard dataRow={dataRow} key={`table-row-${idx}`} />
      ))}
    </Box>
  )
}

function TableCard({ dataRow }: { dataRow: any[] }) {
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
    </Card>
  )
}
