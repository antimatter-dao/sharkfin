import { useMemo, useState } from 'react'
import { useHistory } from 'react-router'
import { Container, Box, Typography, IconButton } from '@mui/material'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import dayjs from 'dayjs'
import Card from 'components/Card/Card'
import Table from 'components/Table'
import NoDataCard from 'components/Card/NoDataCard'
import Button from 'components/Button/Button'
import { useActiveWeb3React } from 'hooks'
// import { Currency } from 'constants/token'
import useBreakpoint from 'hooks/useBreakpoint'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import { SUPPORTED_CURRENCIES } from 'constants/currencies'
import { useSharkfinList } from '../../hooks/useSharkfin'
import { routes } from 'constants/routes'
// import { ChainListMap, NETWORK_CHAIN_ID } from 'constants/chain'
import { OutlinedCard } from 'components/Card/Card'
import StatusTag from 'components/Status/StatusTag'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Divider from 'components/Divider'
import { Currency } from 'constants/token'
import { ChainListMap } from 'constants/chain'
import { usePrice } from 'hooks/usePriceSet'
import { toLocaleNumberString } from 'utils/toLocaleNumberString'

dayjs.extend(dayjsPluginUTC)

enum TableHeaderIndex {
  vault,
  finalAPY,
  priceRange,
  investAmount,
  deliveryTime,
  status
}

const TableHeader = ['', 'APY', 'Price Range(USDT)', 'Invest Amount', 'Delivery Time', '']

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
        <Typography fontSize={16}>{`${token?.symbol} weekly sharkfin`}</Typography>
        <Typography fontSize={12} sx={{}}>
          <span style={{ opacity: 0.5, fontSize: '12px' }}>{`(Base Currency- ${
            type === 'CALL' ? token?.symbol : investToken?.symbol
          })`}</span>
        </Typography>
      </Box>
    </Box>
  )
}

export default function Position() {
  const { account, chainId } = useActiveWeb3React()
  const history = useHistory()
  const isDownMd = useBreakpoint('md')
  const price = usePrice('BTC', 10000)

  const vaultList = useSharkfinList()

  const data = useMemo(() => {
    if (!vaultList) return { balanceData: undefined, hiddenParts: undefined }
    const hiddenParts: any[] = []
    const balanceData = vaultList.map(data => {
      const token = SUPPORTED_CURRENCIES[data.currency]
      const investCurrency = SUPPORTED_CURRENCIES[data.investCurrency]
      hiddenParts.push(
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
                761
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
              <Typography sx={{ opacity: 0.5 }}>Subscribed Time:</Typography>
              <Typography sx={{ fontWeight: { xs: 600, md: 400 } }} component="span">
                Sep 21, 2021 10:42 AM
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
              <Typography sx={{ opacity: 0.5 }}>Term:</Typography>
              <Typography sx={{ fontWeight: { xs: 600, md: 400 } }} component="span">
                7 Days
              </Typography>
            </Box>
          </Box>
          <Box display="grid" gap={14}>
            {/* <CurrencyLogo currency={SUPPORTED_CURRENCIES['BTC']} />
            <Typography fontWeight={700} sx={{ fontSize: { xs: 12, md: 14 } }}>
              Daily Sharkfin BTC(Base Currency-BTC)
            </Typography> */}
          </Box>
        </Box>
      )
      return [
        <TokenHeader key={data.type + data.currency} token={token} type={data.type} investToken={investCurrency} />,

        <Typography key={1} color="#31B047">
          {data.apy}
        </Typography>,
        '59,000~62,000',
        data.depositAmount ?? '-',
        data?.expiredAt ? (dayjs(data.expiredAt) as any).utc().format('MMM DD, YYYY hh:mm A') + ' UTC' : '-',
        <Box
          key={1}
          display="flex"
          gap={10}
          pl={isDownMd ? 0 : 20}
          justifyContent="flex-end"
          width={isDownMd ? '100%' : 'auto'}
          mr={isDownMd ? '20px' : 0}
        >
          <StatusTag key="status" status="progressing" />
          <Button
            fontSize={14}
            style={{ width: 92, borderRadius: 4, height: 36 }}
            onClick={() => {
              history.push(
                routes.sharkfinMgmt
                  .replace(
                    ':chainName/:currency/:type',
                    `${chainId ? ChainListMap[chainId].symbol : 'ETH'}/${data.currency}/${data.type}`
                  )
                  .replace(':type', '')
                  .replace(':chainName', '')
              )
            }}
          >
            View
          </Button>
        </Box>
      ]
    })
    return { balanceData, hiddenParts }
  }, [chainId, history, isDownMd, vaultList])

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
            <OutlinedCard padding="20px 24px 28px">
              <Typography fontSize={16} sx={{ opacity: 0.5, mb: 24 }}>
                BTC latest spot price
              </Typography>
              <Typography fontSize={24} fontWeight={700}>
                {price ? toLocaleNumberString(price, 4) : '-'}
              </Typography>
            </OutlinedCard>
            <Box position="relative">
              {!data.balanceData || data.balanceData.length === 0 ? (
                <NoDataCard height="20vh" />
              ) : isDownMd ? (
                <TableCards data={data.balanceData} hiddenParts={data.hiddenParts} />
              ) : (
                <Table header={TableHeader} rows={data.balanceData} hiddenParts={data.hiddenParts} collapsible />
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
          if (idx === TableHeaderIndex.status) return null
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
      <Box display="flex" alignItems={'center'} justifyContent="space-between" mt={20}>
        {dataRow[TableHeaderIndex.status]}

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
