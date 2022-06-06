import { useCallback, useState, useMemo, useEffect } from 'react'
import { Box, Typography, styled, Tab, TabProps, useTheme } from '@mui/material'
import Card from 'components/Card/Card'
import ProductCardHeader from 'components/ProductCardHeader'
import Tabs from 'components/Tabs/Tabs'
import VaultForm from './VaultForm'
import { DefiProduct } from 'hooks/useSharkfin'
import { useActiveWeb3React } from 'hooks'
// import { Timer } from 'components/Timer'
import { trimNumberString } from 'utils/trimNumberString'
import { dayjsUTC } from 'utils/dayjsUTC'
// import dayjs from 'dayjs'

const StyledBox = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.text.secondary}`,
  borderRadius: '50%',
  height: 20,
  width: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 5,
  paddingTop: 2
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
  notAvailable = 'Settlement in progress, please try again after the current period is settled'
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
    onInstantWd,
    onInvest,
    walletBalance,
    product,
    onStandardWd
  } = props
  const [currentTab, setCurrentTab] = useState<TYPE>(0)
  const [standardWithdrawlStep, setStandardWithdrawlStep] = useState<StandardWithdrawType>(0)
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()
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

    const balance = [
      walletBalance,
      [product.lockedBalance, product.completeBalance][standardWithdrawlStep],
      product.instantBalance
    ][currentTab]

    if (balance && amount !== '' && !isNaN(+balance) && +balance < +amount) {
      return ErrorType.insufficientBalance
    }

    if (product.minAmount && balance && amount !== '' && !isNaN(+balance) && +amount < +product.minAmount) {
      return `Amount should be no less than ${product.minAmount} ${product.investCurrency}`
    }

    const now = Date.now()
    const before = product.expiredAt
    // const before = product.expiredAt - 3.6e6
    const after = product.expiredAt + 7.2e6

    if (now >= before && now < after) {
      return ErrorType.notAvailable
    }
    return ''
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
            <Tabs
              customCurrentTab={currentTab}
              customOnChange={handleTabClick}
              titles={['Invest', 'Standard Withdrawal', 'Instant Withdrawal']}
              tabPadding="12px 0px 12px 0px"
              scrollable={'scrollable'}
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
                  <Box display="grid" gap={16} width="100%" margin="20px 0">
                    {[
                      {
                        title: 'Price Range(USDT)',
                        data: `${product?.barrierPrice0}${
                          product?.barrierPrice0 && product?.barrierPrice1 ? '~' : ' '
                        }${product?.barrierPrice1}`
                      },
                      {
                        title: 'APR',
                        data: product?.apy
                      },
                      {
                        title: 'Term',
                        data: '7 Days'
                      },
                      {
                        title: 'Duration',
                        data: product
                          ? `${dayjsUTC(product?.beginAt).format('MMM DD YYYY')} ~ ${dayjsUTC(
                              product?.expiredAt
                            ).format('MMM DD YYYY')}`
                          : '-'
                      },
                      {
                        title: 'Your Position',
                        data: product ? product.depositAmount + ' ' + product.investCurrency : '-'
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
                          {title}
                          <Typography
                            component={'span'}
                            fontWeight={400}
                            variant="inherit"
                            ml={5}
                            color={title === 'APR' ? theme.palette.primary.main : theme.palette.text.primary}
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
                  initiatedAmount={product?.completeBalance}
                >
                  <Tabs
                    titles={['Initiate Withdrawal', 'Complete Withdrawal']}
                    contents={['', '']}
                    CustomTab={CustomTab}
                    customCurrentTab={standardWithdrawlStep}
                  />
                </VaultForm>,
                <VaultForm
                  buttonText="Instant Withdraw"
                  error={error}
                  key={TYPE.instant}
                  type={'Instant'}
                  val={amount}
                  onChange={onInvestChange}
                  currencySymbol={currencySymbol}
                  onClick={onInstantWd}
                  disabled={disabled}
                  productChainId={productChainId}
                  formData={formData}
                  available={product?.instantBalance}
                >
                  <Typography display="flex" alignItems={'center'} variant="inherit">
                    Redeemable:
                    <Typography component={'span'} color="primary" fontWeight={700} variant="inherit" ml={5}>
                      {product?.instantBalance ? trimNumberString(product?.instantBalance, 6) : '-'}{' '}
                      {product?.investCurrency}
                    </Typography>
                  </Typography>
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
        <Box display={'flex'} alignItems="center" sx={{ fontSize: { xs: 12, sm: 14 } }}>
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
        padding: 10,
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
