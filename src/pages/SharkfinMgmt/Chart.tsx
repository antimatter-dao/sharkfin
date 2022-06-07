import { Box, Typography, useTheme } from '@mui/material'
import { ReactComponent as SharkfinChartSvg } from 'assets/svg/sharkfin_chart.svg'
import { ReactComponent as SharkfinChartMobileSvg } from 'assets/svg/sharkfin_chart_mobile.svg'
import useBreakpoint from 'hooks/useBreakpoint'

enum priceStatus {
  lower = 'lower',
  middle = 'middle',
  higher = 'higher'
}

const getPriceStatus = (
  barrierPrice0: string | undefined,
  barrierPrice1: string | undefined,
  marketPrice: string | undefined
) => {
  const barrier0 = barrierPrice0 ? +barrierPrice0 : NaN
  const barrier1 = barrierPrice1 ? +barrierPrice1 : NaN
  const market = marketPrice ? +marketPrice : NaN
  const hasPrice = !isNaN(barrier0) && !isNaN(barrier1) && !isNaN(market)

  if (hasPrice && market < barrier0) {
    return priceStatus.lower
  }
  if (hasPrice && market > barrier1) {
    return priceStatus.higher
  }
  return priceStatus.middle
}

export default function SharkfinChart({
  marketPrice,
  baseRate,
  barrierPrice0,
  barrierPrice1
}: {
  marketPrice: string | undefined
  baseRate?: string
  barrierPrice0?: string
  barrierPrice1?: string
}) {
  const isDownSm = useBreakpoint('sm')
  const theme = useTheme()
  const status = getPriceStatus(barrierPrice0, barrierPrice1, marketPrice)

  return (
    <Box
      display="flex"
      flexDirection={'column'}
      width={{ xs: 'calc(100% + 24px)', md: '100%' }}
      gap="6px"
      margin={{ xs: '0 -12px', md: '0' }}
    >
      <Box display="flex" width="100%" gap="12px">
        <Box
          height="100%"
          display="grid"
          gridTemplateRows={isDownSm ? '15% 37% 45% 3%' : '10% 48% 35% 3%'}
          sx={{ textAlign: 'right', color: theme.palette.text.primary + '60' }}
        >
          <Typography fontWeight={500}>APR</Typography>

          <Typography>15%</Typography>

          <Typography>{baseRate ?? '3%'}</Typography>

          <Typography>0</Typography>
        </Box>

        <Box
          position="relative"
          width="100%"
          sx={{
            [`& path.${status}`]: {
              strokeOpacity: 1
            },
            [`& line.${status}`]: {
              strokeOpacity: 1
            }
          }}
        >
          {isDownSm ? (
            <>
              <Box
                position="absolute"
                left={status === priceStatus.lower ? '20%' : status === priceStatus.higher ? '55%' : '51%'}
                borderRadius={'10px'}
                boxShadow="0px 1px 10px rgba(0, 0, 0, 0.1)"
                padding="10px 12px"
                fontSize={12}
                sx={{ backgroundColor: '#ffffff' }}
              >
                Market Price:{' '}
                <Typography fontSize={12} fontWeight={700}>
                  {marketPrice ?? '-'} USDT
                </Typography>{' '}
              </Box>
              <SharkfinChartMobileSvg width={'100%'} style={{ height: 'auto' }} />
            </>
          ) : (
            <>
              <Box
                position="absolute"
                left={status === priceStatus.lower ? '20%' : status === priceStatus.higher ? '65%' : '50%'}
                borderRadius={'10px'}
                boxShadow="0px 1px 10px rgba(0, 0, 0, 0.1)"
                padding="10px 12px"
                fontSize={12}
                sx={{ backgroundColor: '#ffffff' }}
              >
                Market Price:{' '}
                <Typography fontSize={12} fontWeight={700}>
                  {marketPrice ?? '-'} USDT
                </Typography>
              </Box>
              <SharkfinChartSvg width={'100%'} style={{ height: 'auto' }} />
            </>
          )}
        </Box>
      </Box>
      <Box display="flex" justifyContent={'space-between'} width="100%" sx={{ color: theme.palette.primary.main }}>
        <span style={{ width: 60 }}></span>
        <Typography fontWeight={700}>${barrierPrice0}</Typography>
        <Typography fontWeight={700}>${barrierPrice1}</Typography>
        <Typography fontWeight={500} color={theme.palette.text.primary + '60'}>
          PRICE
        </Typography>
      </Box>
    </Box>
  )
}
