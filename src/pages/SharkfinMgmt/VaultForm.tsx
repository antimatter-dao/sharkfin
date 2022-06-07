import { useState, useCallback, useMemo } from 'react'
// import { Box, Alert, Typography } from '@mui/material'
// import dayjs from 'dayjs'
import VaultCard from 'components/MgmtPage/VaultCard'
import { useActiveWeb3React } from 'hooks'
import { tryParseAmount } from 'utils/parseAmount'
import TransactionPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import useModal from 'hooks/useModal'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import { useTransactionAdder } from 'state/transactions/hooks'
import TransactionSubmittedModal from 'components/Modal/TransactionModals/TransactiontionSubmittedModal'
import RedeemConfirmModal from './RedeemConfirmModal'
import InvestConfirmModal from './InvestConfirmModal'
import { feeRate, getSharkfinAddress } from 'constants/index'
import { NETWORK_CHAIN_ID, SUPPORTED_NETWORKS } from 'constants/chain'
import { useETHBalances, useTokenBalance } from 'state/wallet/hooks'
import { DefiProduct } from 'hooks/useSharkfin'
import { useSharkfinCallback } from 'hooks/useSharkfinCallback'
import { CURRENCIES, DEFAULT_COIN_SYMBOL } from 'constants/currencies'
import { Timer } from 'components/Timer'
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { trimNumberString } from 'utils/trimNumberString'
import { usePrice } from 'hooks/usePriceSet'
import JSBI from 'jsbi'

export default function VaultForm({
  product,
  amount,
  setAmount
}: {
  product: DefiProduct | undefined
  amount: string
  setAmount: (val: string) => void
}) {
  const { account, chainId } = useActiveWeb3React()
  const investCurrency = CURRENCIES[product?.chainId ?? NETWORK_CHAIN_ID][product?.investCurrency ?? '']
  const underlying = CURRENCIES[product?.chainId ?? NETWORK_CHAIN_ID][product?.underlying ?? '']
  const title = `${underlying.symbol} Weekly Sharkfin\n (principal protected)`

  const ETHBalance = useETHBalances([account ?? undefined])?.[account ?? '']
  const tokenBalance = useTokenBalance(account ?? undefined, investCurrency)
  // const [snackbarOpen, setSnackbarOpen] = useState(true)
  const [wdConfirmOpen, setWdConfirmOpen] = useState(false)
  const [investConfirmOpen, setInvestConfirmOpen] = useState(false)
  const spotPrice = usePrice(product?.underlying, 60000)

  const balance =
    product?.investCurrency === SUPPORTED_NETWORKS[chainId ?? NETWORK_CHAIN_ID].nativeCurrency.symbol
      ? ETHBalance
        ? maxAmountSpend(ETHBalance)?.toExact()
        : '-'
      : tokenBalance?.toExact()

  const {
    depositCallback,
    instantWithdrawCallback,
    standardWithdrawCallback,
    standardCompleteCallback
  } = useSharkfinCallback(product?.chainId, product?.underlying, product?.type)

  const { showModal, hideModal } = useModal()
  const addPopup = useTransactionAdder()
  const [approvalState, approveCallback] = useApproveCallback(
    tryParseAmount(amount, investCurrency),
    getSharkfinAddress(product?.underlying, product?.chainId, product?.type)
  )

  const formData = useMemo(
    () => ({
      ['Current cycle invested amount']:
        (product?.lockedBalance ? trimNumberString(product.lockedBalance, 6) : '-') + ' ' + investCurrency.symbol,
      ['Progress order due time']: <Timer timer={product?.expiredAt ?? 0} />
    }),
    [investCurrency.symbol, product?.expiredAt, product?.lockedBalance]
  )

  const confirmData = useMemo(() => {
    return product?.investCurrency === 'USDT'
      ? {
          ['Platform service fee']: feeRate,
          ['APY']: product?.apy ?? '-'
        }
      : {
          ['Platform service fee']: feeRate,
          ['Spot Price']: (spotPrice ? trimNumberString(spotPrice, 2) : '-') + ' USDT',
          ['APY']: product?.apy ?? '-'
        }
  }, [product?.apy, product?.investCurrency, spotPrice])

  // const handleCloseSnakebar = useCallback(() => {
  //   setSnackbarOpen(false)
  // }, [])

  const handleInvestChange = useCallback(
    val => {
      setAmount(val)
    },
    [setAmount]
  )

  const handleInvestConfirmOpen = useCallback(() => {
    setInvestConfirmOpen(true)
  }, [])
  const handleInvestConfirmDismiss = useCallback(() => {
    setInvestConfirmOpen(false)
  }, [])
  const handleWdConfirmOpen = useCallback(() => {
    setWdConfirmOpen(true)
  }, [])
  const handleWdConfirmDismiss = useCallback(() => {
    setWdConfirmOpen(false)
  }, [])

  const callbackFactory = useCallback(
    (summary: string, callback: (...args: any[]) => Promise<any>) => {
      return async (amount: string, parsedAmount?: string) => {
        showModal(<TransactionPendingModal />)
        const val = parsedAmount ?? tryParseAmount(amount, investCurrency)?.raw?.toString()
        if (!val) return
        try {
          const r = await callback(val)
          hideModal()

          addPopup(r, {
            summary
          })
          setAmount('')
          showModal(<TransactionSubmittedModal />)
        } catch (e) {
          setAmount('')
          showModal(<MessageBox type="error">{(e as any)?.error?.message || (e as Error).message || e}</MessageBox>)
          console.error(e)
        }
      }
    },
    [addPopup, hideModal, investCurrency, setAmount, showModal]
  )

  const handleInvest = useMemo(() => {
    if (!underlying || !depositCallback || !product || !investCurrency) return () => {}
    return callbackFactory(
      `Subscribed ${amount} ${product.investCurrency} to ${`${product?.underlying ?? ''} weekly sharkfin`}`,
      depositCallback
    )
  }, [underlying, depositCallback, product, investCurrency, callbackFactory, amount])

  const handleInstantWd = useMemo(() => {
    if (!investCurrency || !instantWithdrawCallback || !product || !underlying) return () => {}
    return callbackFactory(
      `Instantly withdrawed ${amount} ${product.investCurrency} from ${product?.underlying ?? ''} weekly sharkfin
         
      }`,
      instantWithdrawCallback
    )
  }, [investCurrency, instantWithdrawCallback, product, underlying, callbackFactory, amount])

  const handleStandardWd = useCallback(
    (amount: string, initiated: boolean) => {
      const amountRaw = tryParseAmount(amount, investCurrency)?.raw?.toString()
      const parsedAmount =
        amountRaw && product?.pricePerShareRaw
          ? JSBI.divide(
              JSBI.multiply(
                JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(product?.contractDecimals ?? '18')),
                JSBI.BigInt(amountRaw)
              ),
              JSBI.BigInt(product.pricePerShareRaw)
            ).toString()
          : '0'
      showModal(
        <RedeemConfirmModal
          isOpen={true}
          onDismiss={hideModal}
          onConfirm={() => {
            if (!investCurrency || !standardWithdrawCallback || !product || !underlying) {
              return
            }

            callbackFactory(
              `${initiated ? 'Initiated' : 'Completed'} withdrawal ${amount} ${
                product.investCurrency
              } from ${product?.underlying ?? ''} weekly sharkfin
              }`,
              initiated ? standardCompleteCallback : standardWithdrawCallback
            )(amount, parsedAmount)
          }}
          amount={amount}
          currency={investCurrency}
        />
      )
    },
    [
      callbackFactory,
      hideModal,
      investCurrency,
      product,
      showModal,
      standardCompleteCallback,
      standardWithdrawCallback,
      underlying
    ]
  )

  return (
    <>
      <InvestConfirmModal
        isNativeCur={DEFAULT_COIN_SYMBOL[chainId ?? NETWORK_CHAIN_ID] === investCurrency?.symbol}
        approvalState={approvalState}
        currency={investCurrency}
        productTitle={title}
        amount={amount}
        confirmData={confirmData}
        isOpen={investConfirmOpen}
        onDismiss={handleInvestConfirmDismiss}
        onConfirm={
          DEFAULT_COIN_SYMBOL[product?.chainId ?? NETWORK_CHAIN_ID] === investCurrency?.symbol ||
          approvalState === ApprovalState.APPROVED
            ? () => {
                handleInvest(amount)
                setInvestConfirmOpen(false)
              }
            : approveCallback
        }
      />
      <RedeemConfirmModal
        isOpen={wdConfirmOpen}
        onDismiss={handleWdConfirmDismiss}
        onConfirm={() => {
          handleInstantWd(amount)
          setWdConfirmOpen(false)
        }}
        amount={amount}
        currency={investCurrency}
      />

      {/* <Box display="grid" position="relative" gap="35px" mt={32}> */}
      {/* {snackbarOpen && (
          <Alert
            onClose={handleCloseSnakebar}
            severity="error"
            sx={{
              width: '100%',
              color: theme => theme.palette.error.main,
              background: theme => theme.palette.background.paper,
              border: theme => `1px solid ${theme.palette.error.main}`,
              '& .MuiAlert-icon': {
                color: theme => theme.palette.error.main
              },
              fontSize: 16
            }}
          >
            <div style={{ maxWidth: 963, lineHeight: '19.2px', margin: '-4px 0' }}>
              Warning:{' '}
              <Typography component="span" sx={{ color: theme => theme.palette.text.primary }}>
                The primary risk for running this covered call strategy is that the vault may incur a weekly loss in the
                case where the call option sold by the vault expires in-the-money
              </Typography>
            </div>
          </Alert>
        )} */}

      <VaultCard
        walletBalance={balance}
        title={title}
        formData={formData}
        product={product}
        onStandardWd={handleStandardWd}
        onInstantWd={handleWdConfirmOpen}
        onInvest={handleInvestConfirmOpen}
        available={balance}
        onInvestChange={handleInvestChange}
        amount={amount}
      />
      {/* </Box> */}
    </>
  )
}
