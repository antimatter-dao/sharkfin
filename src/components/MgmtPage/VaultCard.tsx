import { useCallback, useState, useMemo, useEffect } from 'react'
import { Box, Typography, styled, Tab, TabProps } from '@mui/material'
import Card from 'components/Card/Card'
import ProductCardHeader from 'components/ProductCardHeader'
import useBreakpoint from 'hooks/useBreakpoint'
import Divider from 'components/Divider'
import Tabs from 'components/Tabs/Tabs'
import VaultForm from './VaultForm'
import { DefiProduct } from 'hooks/useDefiVault'
import { useActiveWeb3React } from 'hooks'
// import { Timer } from 'components/Timer'
// import { trimNumberString } from 'utils/trimNumberString'
import dayjs from 'dayjs'

const StyledBox = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.text.secondary}`,
  borderRadius: '50%',
  height: 20,
  width: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 5
}))

export enum TYPE {
  invest,
  standard,
  instant
}
enum StandardWithdrawType {
  initiate,
  complete
}

export enum ErrorType {
  insufficientBalance = 'Insufficient Balance',
  notAvailable = 'The current status is not available for subscription, please try again after the current period is settled'
}

interface Props {
  title: string
  formData: { [key: string]: any }
  available?: string
  onInvestChange: (val: string) => void
  amount: string
  onInstantWd: () => void
  onStandardWd: (amount: string, initiated: boolean) => void
  onInvest: () => void
  product: DefiProduct | undefined
  walletBalance: string | undefined
}

export default function VaultCard(props: Props) {
  const {
    title,
    formData,
    available,
    onInvestChange,
    amount,
    // onInstantWd,
    onInvest,
    walletBalance,
    product,
    onStandardWd
  } = props
  const [currentTab, setCurrentTab] = useState<TYPE>(0)
  const [standardWithdrawlStep, setStandardWithdrawlStep] = useState<StandardWithdrawType>(0)
  const { chainId } = useActiveWeb3React()

  const isDownSm = useBreakpoint('md')
  const productChainId = product?.chainId
  const currencySymbol = product?.investCurrency ?? ''
  const disabled = !product || !amount || chainId !== product?.chainId || +amount === 0

  const initiated = useMemo(() => {
    const step = +(product?.completeBalance ?? 0) ? 1 : 0
    setStandardWithdrawlStep(step)
    return step === StandardWithdrawType.complete
  }, [product?.completeBalance])

  useEffect(() => {
    if (currentTab === TYPE.standard && initiated) {
      onInvestChange(product?.completeBalance ?? '0')
    }
  }, [currentTab, initiated, onInvestChange, product?.completeBalance])

  const handleTabClick = useCallback(
    (val: number) => {
      setCurrentTab(val)
      onInvestChange('')
    },
    [onInvestChange]
  )

  const error = useMemo(() => {
    if (!product || !walletBalance) return ''
    let str = ''
    const balance = [
      walletBalance,
      [product.lockedBalance, product.completeBalance][standardWithdrawlStep],
      product.instantBalance
    ][currentTab]

    if (balance && amount !== '' && !isNaN(+balance) && +balance < +amount) {
      str = ErrorType.insufficientBalance
    }

    // const now = Date.now()
    // const before = product.expiredAt - 7200000
    // const after = product.expiredAt + 1800000

    // if (now >= before && now < after) {
    //   str = ErrorType.notAvailable
    // }

    return str
  }, [product, walletBalance, standardWithdrawlStep, currentTab, amount])

  return (
    <Card>
      <Box padding={{ xs: '24px 16px 25px', md: '34px 24px 48px' }}>
        <ProductCardHeader
          logoCurSymbol={product?.investCurrency}
          title={title}
          logoSize={46}
          // priceCurSymbol={product?.currency ?? ''}
          // description=""
        />

        <Box width={'100%'} mt={{ xs: 0, md: 30 }}>
          <Box mt={12} position="relative">
            {/* <Typography
              position={{ xs: 'static', md: 'absolute' }}
              sx={{ top: 0, right: 0, height: 48 }}
              display="flex"
              alignItems={'center'}
              variant="inherit"
            >
              Time to Expiry:
              <Typography component={'span'} color="primary" fontWeight={700} variant="inherit" ml={5}>
                <Timer timer={product?.expiredAt ?? 0} />
              </Typography>
            </Typography> */}
            {isDownSm && <Divider sx={{ opacity: 0.1 }} />}
            <Tabs
              customCurrentTab={currentTab}
              customOnChange={handleTabClick}
              titles={['Invest', 'Redeem']}
              tabPadding="12px 0px 12px 0px"
              contents={[
                <VaultForm
                  error={error}
                  key="invest"
                  type={'Invest'}
                  currencySymbol={currencySymbol}
                  available={available}
                  onChange={onInvestChange}
                  val={amount}
                  onClick={onInvest}
                  disabled={disabled}
                  productChainId={productChainId}
                  formData={formData}
                  buttonText="Invest"
                >
                  <Box display="grid" gap={16} width="100%" height="100px" margin="20px 0">
                    {[
                      { title: 'Current Vault Approximate APY', data: product?.apy ?? '-' },
                      {
                        title: 'Current Vault Strike Price',
                        data: (product?.strikePrice ?? '-') + ' USDT'
                      },
                      {
                        title: 'Current Vault Expiry Time',
                        data: product?.expiredAt
                          ? dayjs(product.expiredAt).format('MMM DD, YYYY') + ' 08:00:00 AM UTC'
                          : '-'
                      }
                    ].map(({ title, data }) => {
                      return (
                        <Typography
                          display="flex"
                          alignItems={'center'}
                          variant="inherit"
                          key={title}
                          justifyContent="space-between"
                          color={'rgba(37, 37, 37, 0.8)'}
                        >
                          {title}:
                          <Typography
                            component={'span'}
                            fontWeight={500}
                            variant="inherit"
                            ml={5}
                            color="rgba(37, 37, 37, 1)"
                          >
                            {data}
                          </Typography>
                        </Typography>
                      )
                    })}
                  </Box>
                </VaultForm>,
                <VaultForm
                  buttonText={initiated ? 'Complete Withdraw' : 'Initiate Withdraw'}
                  error={error}
                  key={TYPE.standard}
                  type={'Standard'}
                  val={amount}
                  onChange={onInvestChange}
                  currencySymbol={currencySymbol}
                  onClick={() => onStandardWd(amount, initiated)}
                  disabled={disabled}
                  productChainId={productChainId}
                  formData={formData}
                  available={initiated ? product?.completeBalance : product?.lockedBalance}
                >
                  <Tabs
                    titles={[' Initiate Withdrawal', 'Complete Withdrawal']}
                    contents={['', '']}
                    CustomTab={CustomTab}
                    customCurrentTab={standardWithdrawlStep}
                  />
                </VaultForm>
              ]}
            />
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

function CustomTab(props: TabProps & { selected?: boolean }) {
  return (
    <Tab
      {...props}
      disableRipple
      label={
        <Box display={'flex'} alignItems="center">
          <StyledBox component="span" selected={props.selected}>
            {props.value + 1}
          </StyledBox>
          {props.label}
        </Box>
      }
      sx={{
        textTransform: 'none',
        borderRadius: 1,
        color: theme => theme.palette.text.secondary,
        border: '1px solid transparent',
        opacity: 1,
        '&.Mui-selected': {
          color: theme => theme.palette.primary.main
        },
        '&:hover': {
          cursor: 'auto'
        }
      }}
    ></Tab>
  )
}
