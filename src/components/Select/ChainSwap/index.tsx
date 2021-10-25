import { Box } from '@material-ui/core'
import TextButton from 'components/Button/TextButton'
import ChainSelect from '../ChainSelect'
import { Chain } from 'models/chain'
import SwitchButton from './SwitcherButton'

export default function ChainSwap({
  fromChain,
  toChain,
  chainList,
  onSelectTo,
  onSelectFrom,
  disabledFrom,
  disabledTo,
  activeFrom,
  activeTo
}: {
  fromChain: Chain | null
  toChain: Chain | null
  chainList: Chain[]
  onSelectFrom: (chain: Chain | null) => void
  onSelectTo: (chain: Chain | null) => void
  disabledFrom?: boolean
  disabledTo?: boolean
  activeFrom?: boolean
  activeTo?: boolean
}) {
  const handleSwitch = () => {
    const from = fromChain
    const to = toChain
    onSelectFrom(to)
    onSelectTo(from)
  }

  return (
    <Box display="flex" justifyContent="space-between" alignItems={'flex-end'} position={'relative'} width="100%">
      <ChainSelect
        label={'From'}
        selectedChain={fromChain}
        chainList={chainList}
        onChange={onSelectFrom}
        width={'49%'}
        disabled={disabledFrom}
        active={activeFrom}
      />
      <Box position={'absolute'} left={'calc(50% - 16px)'} zIndex={99} padding="0px" height="32px" bottom="8px">
        <TextButton onClick={handleSwitch} disabled={disabledFrom || disabledTo}>
          <SwitchButton />
        </TextButton>
      </Box>
      <ChainSelect
        label={'To'}
        selectedChain={toChain}
        chainList={chainList}
        onChange={onSelectTo}
        width={'49%'}
        disabled={disabledTo}
        active={activeTo}
      />
    </Box>
  )
}