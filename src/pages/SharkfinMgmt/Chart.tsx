import { Box, Typography, useTheme } from '@mui/material'
import { ReactComponent as SharkfinChartSvg } from 'assets/svg/sharkfin_chart.svg'
import { ReactComponent as SharkfinChartMobileSvg } from 'assets/svg/sharkfin_chart_mobile.svg'
import useBreakpoint from 'hooks/useBreakpoint'

export default function SharkfinChart() {
  const isDownSm = useBreakpoint('sm')
  const theme = useTheme()
  return (
    <Box display="flex" flexDirection={'column'} width="100%" gap="6px">
      <Box display="flex" width="100%" gap="12px">
        <Box
          height="100%"
          display="grid"
          gridTemplateRows={isDownSm ? '15% 25% 12% 45% 3%' : '10% 38% 10% 35% 3%'}
          sx={{ textAlign: 'right', color: theme.palette.text.primary + '60' }}
        >
          <Typography fontWeight={500}>APY</Typography>

          <Typography>15%</Typography>
          <Typography>5%</Typography>
          <Typography>3%</Typography>

          <Typography>0</Typography>
        </Box>
        {isDownSm ? (
          <SharkfinChartMobileSvg width={'100%'} height={'auto'} />
        ) : (
          <SharkfinChartSvg width={'100%'} height={'auto'} />
        )}
      </Box>
      <Box display="flex" justifyContent={'space-between'} width="100%" sx={{ color: theme.palette.primary.main }}>
        <span style={{ width: 60 }}></span>
        <Typography fontWeight={700}>$38500</Typography>
        <Typography fontWeight={700}>$42500</Typography>
        <Typography fontWeight={500} color={theme.palette.text.primary + '60'}>
          PRICE
        </Typography>
      </Box>
    </Box>
  )
}
