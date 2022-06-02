import { Box, Typography } from '@mui/material'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import { SUPPORTED_CURRENCIES } from 'constants/currencies'
import useBreakpoint from 'hooks/useBreakpoint'

export function LogoTitle({
  logoCurSymbol,
  title,
  description,
  titleSize,
  logoSize
}: {
  logoCurSymbol?: string
  title: string | JSX.Element
  description: string
  titleSize?: string | number
  logoSize?: string | number
}) {
  const isDownMd = useBreakpoint('md')
  const isDownSm = useBreakpoint('sm')

  return (
    <Box
      display="flex"
      gap={15}
      mb={{ xs: 10, md: 0 }}
      width="auto"
      zIndex={2}
      maxWidth="max-content"
      alignItems="center"
    >
      {logoCurSymbol && (
        <CurrencyLogo
          currency={SUPPORTED_CURRENCIES[logoCurSymbol]}
          size={logoSize ? logoSize : isDownMd ? '32px' : '64px'}
          style={{
            gridRowStart: 1,
            gridRowEnd: isDownSm ? 'span 1' : 'span 2'
          }}
        />
      )}

      <Typography
        fontWeight={700}
        align="left"
        sx={{
          gridColumnStart: isDownSm ? 1 : 2,
          gridColumnEnd: 'span 1',
          fontSize: titleSize
            ? titleSize
            : {
                xs: 20,
                md: 24
              }
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography fontSize={{ xs: 14, md: 16 }} sx={{ opacity: 0.5 }} align="left" mt={{ xs: 8, md: 0 }}>
          {description}
        </Typography>
      )}
    </Box>
  )
}
