import { Box, Typography } from '@mui/material'
import InputNumerical from 'components/Input/InputNumerical'
import Button, { BlackButton } from 'components/Button/Button'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useActiveWeb3React } from 'hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { useCallback } from 'react'
import { ErrorType } from './VaultCard'
import { ChainId, SUPPORTED_NETWORKS } from 'constants/chain'
import { useSwitchChainModal } from 'hooks/useSwitchChainModal'
// import useBreakpoint from 'hooks/useBreakpoint'
// import { OutlinedCard } from 'components/Card/Card'
import Card from 'components/Card/Card'
import Divider from 'components/Divider'

enum TYPE {
  invest = 'Invest',
  standard = 'Standard',
  instant = 'Instant'
}

const Instructions: JSX.Element = (
  <>
    Standard withdrawals are for funds that have been deployed in the weekly strategy and involve a 2-step withdrawal
    process:
    <br /> Step 1: User submits the amount to be withdrawn <br />
    Step 2: After the investment expires, the actual withdrawal will be completed, and the withdrawal amount includes
    part of the income.
  </>
)

export default function VaultForm({
  type,
  currencySymbol,
  available,
  onChange,
  val,
  onClick,
  disabled,
  error,
  productChainId,
  formData,
  children,
  buttonText,
  initiatedAmount
}: {
  type: string
  currencySymbol: string
  available?: string
  onChange: (val: string) => void
  val: string
  onClick: () => void
  disabled: boolean
  error?: string
  productChainId: ChainId | undefined
  formData: { [key: string]: any }
  children: React.ReactNode
  buttonText: string
  initiatedAmount?: string
}) {
  const { account, chainId } = useActiveWeb3React()
  const toggleWallet = useWalletModalToggle()
  const { switchChainCallback } = useSwitchChainModal()
  // const isDownMd = useBreakpoint('md')

  const handleChange = useCallback(
    e => {
      onChange && onChange(e.target.value)
    },
    [onChange]
  )

  const handleMax = useCallback(() => {
    if (!available || available === '-') return

    onChange(available)
  }, [available, onChange])

  return (
    <Box pt="20px" display="flex" flexDirection="column" width="100%">
      <Box display="grid" gap={type === TYPE.invest ? '30px' : '16px'} width={'100%'}>
        <Box display="flex" alignItems={'flex-end'} minHeight="48px">
          {children}
        </Box>
        <InputNumerical
          label={`${TYPE.invest === type ? 'Invest' : 'Withdrawal'} Amount`}
          balance={available ? available : '-'}
          unit={currencySymbol}
          error={!!error && error !== ErrorType.notAvailable}
          smallPlaceholder
          placeholder={'0.00'}
          onChange={handleChange}
          onMax={handleMax}
          value={val}
          disabled={
            !account ||
            error === ErrorType.notAvailable ||
            chainId !== productChainId ||
            !!(available && +available === 0)
          }
        />
        <Box>
          {account && chainId === productChainId && (
            <Button onClick={onClick} disabled={disabled || !!error}>
              {buttonText}
            </Button>
          )}
          {account && !(chainId === productChainId) && (
            <BlackButton onClick={switchChainCallback(productChainId)}>
              Switch to {productChainId && SUPPORTED_NETWORKS[productChainId]?.chainName}
            </BlackButton>
          )}
          {!account && <BlackButton onClick={toggleWallet}>Connect</BlackButton>}
        </Box>
        <Box display="flex" alignItems="center">
          {error ? (
            <>
              <InfoOutlinedIcon sx={{ color: theme => theme.palette.error.main, height: 12 }} />
              <Typography component="p" fontSize={12} sx={{ color: theme => theme.palette.text.secondary }}>
                {
                  <>
                    <Typography component="span" color="error" fontSize={12}>
                      {error}
                    </Typography>
                  </>
                }
              </Typography>
            </>
          ) : (
            <>
              {/* <InfoOutlinedIcon sx={{ color: theme => theme.palette.primary.main, height: 14, width: 14, mr: 8 }} /> */}
              {type === TYPE.standard && (
                <Typography component="span" fontSize={12} sx={{ opacity: 0.5 }}>
                  Pending Withdrawal: {initiatedAmount ?? '-'} {currencySymbol}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>

      {type !== TYPE.invest && (
        <Box width={'100%'} display="flex" flexDirection={'column'} gap={24}>
          <>
            <Divider
              sx={{
                mt: 16,
                backgroundColor: 'rgba(204, 204, 204, 0.61)',
                borderColor: 'transparent'
              }}
            />
            <Card gray>
              <Box padding="20px 22px" display="grid" gap={30} minHeight={141}>
                <Box display={'flex'} alignItems="center">
                  <Divider
                    orientation="vertical"
                    sx={{
                      marginRight: 12,
                      width: 2,
                      backgroundColor: theme => theme.palette.primary.main,
                      borderColor: 'transparent'
                    }}
                  />
                  <Typography fontSize={14} sx={{ color: theme => theme.palette.text.secondary }}>
                    {Instructions}
                  </Typography>
                </Box>
              </Box>
            </Card>
            <Box display="flex" flexDirection="column" gap={16}>
              {Object.keys(formData).map(key => (
                <Box key={key} display={'flex'} justifyContent="space-between" gap={5}>
                  <Typography fontSize={16}>{key}</Typography>
                  <Typography
                    fontSize={16}
                    component="div"
                    fontWeight={700}
                    sx={{ color: theme => theme.palette.text.secondary }}
                  >
                    {formData[key as keyof typeof formData]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        </Box>
      )}
    </Box>
  )
}
