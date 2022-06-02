import { Box, Typography, TextField } from '@mui/material'
// import { Timer } from 'components/Timer'
import Button from 'components/Button/Button'
import Spinner from 'components/Spinner'
import { SUPPORTED_CURRENCIES } from 'constants/currencies'
// import { ChainId } from 'constants/chain'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import { SimpleProgress } from 'components/Progress'
import { DefiProduct } from 'hooks/useSharkfin'
import { Timer } from 'components/Timer'
import useBreakpoint from 'hooks/useBreakpoint'
// import { ChainListMap } from 'constants/chain'
// import Image from 'components/Image'

export default function VaultProductCard({
  title,
  // description,
  onClick,
  color,
  product
}: // onChain
{
  title: string
  // description?: string
  onClick: () => void
  color: string
  product: DefiProduct | undefined
  // onChain: ChainId
}) {
  const isDownMd = useBreakpoint('md')

  return (
    <Box
      display="grid"
      width="100%"
      gap={'32px'}
      margin={{ xs: '0px auto' }}
      position="relative"
      overflow="hidden"
      sx={{
        border: '1px solid transparent',
        background: theme => theme.palette.background.paper,
        borderRadius: 2,
        padding: '36px 24px',
        width: '100%'
      }}
    >
      {/* <ChainTag chainId={onChain} isCall={product?.type === 'SELF'} /> */}
      <TermTag days={7} color={color} />
      <CurrencyLogo
        currency={SUPPORTED_CURRENCIES[product?.investCurrency ?? '']}
        size={isDownMd ? '44px' : '52px'}
        style={{ zIndex: 2, position: 'absolute', right: 24, top: 36 }}
      />

      {/* <TextCard text={title} subText={description} maxWidth={330} /> */}
      <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 700 }}>{title}</Typography>

      {product ? (
        <>
          <Box
            display={{ xs: 'flex', sm: 'grid', md: 'flex' }}
            gap={21}
            maxWidth={'100%'}
            justifyContent={'space-between'}
            alignItems="center"
          >
            <TextCard subTextBold color={color} text={product?.apy ?? '-'} subText="Current APY" />
            <TextCard
              subTextBold
              text={`${product?.lockedBalance ?? '-'}  ${product?.investCurrency ?? '-'}`}
              subText="Initial investment"
            />
          </Box>
          <Box display="grid" gap={9}>
            <SimpleProgress
              val={product?.beginAt ? Date.now() - product.beginAt : 0}
              total={product?.expiredAt ? product.expiredAt - product.beginAt : 100}
              hideValue
              width="100%"
              customColor={color}
              height={8}
            />
            <Box display="flex" alignItems={'center'} justifyContent="space-between">
              <Typography fontSize={12} color="rgba(0,0,0,0.5)" fontWeight={500}>
                Count Down to the start
              </Typography>
              <Typography fontSize={12} fontWeight={700}>
                <Timer timer={product?.expiredAt ?? 0} />
              </Typography>
            </Box>
          </Box>
          {/* <Box display="flex" alignItems={'center'} justifyContent="space-between">
            <Typography fontSize={12} color="rgba(0,0,0,0.5)" fontWeight={500}>
              Countdown to the start
            </Typography>
            <Typography fontSize={12} fontWeight={700}>
              <Timer timer={product?.expiredAt ?? 0} />
            </Typography>{' '}
          </Box> */}
          <Button backgroundColor={color} onClick={onClick}>
            Subscribe
          </Button>
        </>
      ) : (
        <Box margin={'60px auto'}>
          <Spinner size={60} />
        </Box>
      )}
    </Box>
  )
}

function TextCard({
  color,
  text,
  subText,
  maxWidth,
  subTextBold
}: {
  color?: string
  text: string
  subText?: string
  maxWidth?: number
  subTextBold?: boolean
}) {
  return (
    <Box display="grid" gap={6} maxWidth={maxWidth}>
      <Typography fontSize={24} fontWeight={700} color={color}>
        {text}
      </Typography>
      {subText && (
        <Typography sx={{ color: 'rgba(0,0,0,0.5)' }} fontSize={12} fontWeight={subTextBold ? 500 : 400}>
          {subText}
        </Typography>
      )}
    </Box>
  )
}

// function ChainTag({ chainId, isCall }: { chainId: ChainId; isCall: boolean }) {
//   return (
//     <Box
//       bgcolor={isCall ? 'rgba(49, 176, 71, 0.2)' : 'rgba(214, 80, 73, 0.2)'}
//       borderRadius="10px"
//       padding="7px 14px"
//       width="fit-content"
//       display="flex"
//       alignItems="center"
//       gap={4.8}
//     >
//       <Image
//         src={ChainListMap[chainId]?.logo}
//         alt={`${ChainListMap[chainId]?.name} logo`}
//         style={{ width: 14, height: 14 }}
//       />
//       <Typography
//         color={isCall ? '#31B047' : '#D65049'}
//         sx={{ letterSpacing: 2, transformOrigin: '50% 50%', transform: 'scale(1, 0.92)' }}
//         fontSize={11}
//         fontWeight={700}
//       >
//         {ChainListMap[chainId]?.name?.toUpperCase()}
//       </Typography>
//     </Box>
//   )
// }

function TermTag({ days, color }: { days: number; color: string }) {
  return (
    <TextField
      label="Term"
      value={`${days} Days`}
      sx={{
        width: 80,
        height: '35px',
        color,
        pointerEvents: 'none',
        '& .MuiInputBase-input': {
          padding: '8px 14px',
          fontSize: 16,
          fontWeight: 600,
          color
        },
        '& .MuiInputLabel-root': {
          color
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: color
        }
      }}
    />
  )
}
