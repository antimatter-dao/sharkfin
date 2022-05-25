import React, { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, MenuItem, Typography } from '@mui/material'
import ProductBanner from 'components/ProductBanner'
import VaultProductCard from './SharkfinCard'
import { routes } from 'constants/routes'
import { SUPPORTED_CURRENCIES, SUPPORTED_DEFI_VAULT } from 'constants/currencies'
import Select from 'components/Select/Select'
import useBreakpoint from 'hooks/useBreakpoint'
import { ChainId, ChainListMap } from 'constants/chain'
import { DefiProduct, useSharkfinList } from 'hooks/useSharkfin'
import CurrencyLogo from 'components/essential/CurrencyLogo'
import NoDataCard from 'components/Card/NoDataCard'
import { useActiveWeb3React } from 'hooks'

// enum SortBy {
//   highToLow = 'hl',
//   lowToHigh = 'lh'
// }

const formatAssetVal = (chainId: ChainId, curSymbol: string) => {
  return chainId + '-' + curSymbol
}

const filterDepositAsset = (selected: string, item: DefiProduct) => {
  const splited = selected.split('-')
  if (splited[0] === `${item.chainId}` && splited[1] === item.investCurrency) {
    return true
  }
  return false
}

export default function Sharkfin() {
  const history = useHistory()
  const { chainId } = useActiveWeb3React()
  // const theme = useTheme()
  const isDownSm = useBreakpoint('sm')
  // const [sortBy, setSortBy] = useState<SortBy>(SortBy.highToLow)

  const [depositAsset, setDepositAsset] = useState<string>('ALL')
  const allList = useSharkfinList()

  const filteredList = useMemo(() => {
    if (!allList) return undefined
    const list = allList.reduce((acc, item) => {
      if (depositAsset === 'ALL' || filterDepositAsset(depositAsset, item)) {
        acc.push(item)
      }

      return acc
    }, [] as DefiProduct[])

    // const sorted = list.sort((a, b) => {
    //   const isLarger = +a.apy.replace('%', '') > +b.apy.replace('%', '')
    //   return sortBy === SortBy.highToLow ? (isLarger ? -1 : 1) : isLarger ? 1 : -1
    // })
    // return sorted
    return list
  }, [allList, depositAsset])

  // const handleSortBy = useCallback(e => {
  //   setSortBy(e.target.value)
  // }, [])

  const handleDepositAsset = useCallback(e => {
    setDepositAsset(e.target.value)
  }, [])

  const selectOptions = useMemo(() => {
    const defaultOption = (
      <MenuItem value={'ALL'} key="ALL">
        All
      </MenuItem>
    )
    if (!chainId || !SUPPORTED_DEFI_VAULT[chainId as ChainId]) return defaultOption

    const optionList = SUPPORTED_DEFI_VAULT[+chainId as ChainId]?.reduce(
      (acc, curSymbol) => {
        const val = formatAssetVal(+chainId, curSymbol)
        acc.push(
          <MenuItem value={val} key={val}>
            <Box display="flex" alignItems={'center'} gap={10}>
              <CurrencyLogo currency={SUPPORTED_CURRENCIES[curSymbol]} size={'22px'} />
              <Box>{curSymbol} </Box>
            </Box>
          </MenuItem>
        )

        return acc
      },
      [defaultOption] as JSX.Element[]
    )
    if (optionList) {
      optionList.push(
        <MenuItem value={formatAssetVal(+chainId, 'USDT')} key={formatAssetVal(+chainId, ' USDT')}>
          <Box display="flex" alignItems={'center'} gap={10}>
            <CurrencyLogo currency={SUPPORTED_CURRENCIES['USDT']} size={'22px'} />
            <Box>USDT</Box>
          </Box>
        </MenuItem>
      )
    }
    return optionList
  }, [chainId])

  return (
    <Box
      id="defi"
      display="grid"
      justifyItems={{ xs: 'flex-start', md: 'center' }}
      width="100%"
      alignContent="flex-start"
      marginBottom="auto"
      gap={{ xs: 36, md: 48 }}
    >
      <ProductBanner
        title="Weekly Sharkfin"
        checkpoints={['Principal protected products', 'Low-risk profile']}
        imgFileName={'shark'}
        svgMargin={'0 0 40px'}
        val1={'1111,111'}
        subVal1="Total investment amount"
        unit1={'USDT'}
        val2={'1111,111'}
        subVal2="Amount of subscribed investment"
        unit2={'USDT'}
      />
      <Box
        width="100%"
        display={{ xs: 'grid', md: 'flex' }}
        justifyContent={{ xs: undefined, sm: 'space-between' }}
        gap={{ xs: 10, sm: 32 }}
        alignItems="center"
        padding={{ xs: '0 20px', lg: '0' }}
        sx={{
          maxWidth: theme => ({ xs: `calc(100%)`, lg: theme.width.maxContent })
        }}
      >
        <Box display={{ xs: 'grid', sm: 'flex' }} gap={{ xs: 10, sm: 32 }} width="100%">
          <Box display={{ xs: 'grid', sm: 'flex' }} width={{ xs: '100%', sm: 'auto' }} alignItems="center" gap="14px">
            <Typography fontSize={16}>Deposit Asset:</Typography>
            <Select
              width={isDownSm ? '100%' : '232px'}
              height={'44px'}
              defaultValue="ALL"
              value={depositAsset}
              onChange={handleDepositAsset}
            >
              {selectOptions}
            </Select>
          </Box>
        </Box>
        {/* <Box
          display={{ xs: 'grid', sm: 'flex' }}
          width={{ xs: '100%', sm: 'max-content' }}
          alignItems="center"
          gap="14px"
        >
          <Typography fontSize={16} whiteSpace="nowrap">
            Sort by:
          </Typography>
          <Select width={isDownSm ? '100%' : '189px'} height={'44px'} onChange={handleSortBy} value={sortBy}>
            <MenuItem value={SortBy.highToLow}>Yield: High To Low</MenuItem>
            <MenuItem value={SortBy.lowToHigh}>Yield: Low To High</MenuItem>
          </Select>
        </Box> */}
      </Box>
      {filteredList && filteredList.length === 0 && <NoDataCard />}
      <Box
        display={'grid'}
        gap={21}
        width="100%"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}
        padding={{ xs: '0 20px', lg: '0' }}
        sx={{
          maxWidth: theme => ({ xs: '100%', lg: theme.width.maxContent })
        }}
      >
        {filteredList &&
          filteredList.map((item: DefiProduct) => {
            if (!item) return null
            const { chainId, currency, type } = item
            if (!chainId || !currency) return null
            return (
              <React.Fragment key={chainId + (currency ?? '') + type}>
                <VaultProductCard
                  // onChain={+chainId}
                  product={item}
                  title={`Weekly Sharkfin ${currency} (Base Currency-${type === 'CALL' ? currency : 'USDT'})`}
                  onClick={() => {
                    history.push(
                      routes.sharkfinMgmt
                        .replace(':currency', currency ?? '')
                        .replace(':type', type)
                        .replace(':chainName', ChainListMap[+chainId].symbol)
                    )
                  }}
                  color={SUPPORTED_CURRENCIES[type === 'CALL' ? currency ?? 'ETH' : 'USDT'].color ?? '#3164B0'}
                />
              </React.Fragment>
            )
          })}
      </Box>
    </Box>
  )
}
