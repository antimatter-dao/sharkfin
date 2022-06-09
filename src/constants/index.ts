import { AbstractConnector } from '@web3-react/abstract-connector'
import { Token } from './token'
import { binance, injected, walletconnect, walletlink } from '../connectors'
import JSBI from 'jsbi'
import { ChainId, IS_TEST_NET } from './chain'

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH

export const BAST_TOKEN: { [chainId in ChainId]?: Token } = {
  // [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', 18, 'MATTER', 'Matter'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', 18, 'MATTER', 'Matter'),
  [ChainId.BSC]: new Token(ChainId.BSC, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', 18, 'MATTER', 'Matter')
}

export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export const ANTIMATTER_ADDRESS: { [chainId in ChainId]?: string } = {
  // [ChainId.MAINNET]: '0x60d0769c4940cA58648C0AA34ecdf390a10F272e',
  [ChainId.ROPSTEN]: '0x60d0769c4940cA58648C0AA34ecdf390a10F272e',
  [ChainId.BSC]: ''
}

export const ANTIMATTER_GOVERNANCE_ADDRESS = '0x78fC5460737EB07Ce9e7d954B294ecA7E6203D19'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const GOVERNANCE_ADDRESS = '0x78fC5460737EB07Ce9e7d954B294ecA7E6203D19'

export interface WalletInfo {
  connector?: (() => Promise<AbstractConnector>) | AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  BINANCE: {
    connector: binance,
    name: 'Binance Wallet',
    iconName: 'bsc.jpg',
    description: 'Login using Binance hosted wallet',
    href: null,
    color: '#F0B90B',
    mobile: true
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C'
]

export const NO_REFERRER = '0x0000000000000000000000000000000000000000'

export const feeRate = '3%'

export const SHARKFIN_ADDRESS: {
  [chainId in ChainId]?: { [currencySymbol: string]: { SELF: string | undefined; U: string | undefined } }
} = {
  [ChainId.MAINNET]: {
    ETH: { SELF: '0xe3059306d3bC60894C4944Af01553f650D2255E3', U: '0x973c470e885F44B3BcC9fd89308EBE658E88EBe5' },
    BTC: { SELF: '0xF570079Ea377528B513b263C5B980dA58a8fe1a4', U: '0xD383bf84C4dB0764c7f7887b489933dE1B7A157A' }
  },
  [ChainId.BSC]: {
    ETH: { SELF: '0xB2d06a54f2DBC5a2b608358c034be6aA88646Df4', U: '0x07877a8a74C3fDB822F952108EeF9f8d8752A9c4' },
    BTC: { SELF: '0xfE354EA7a06f6dBDEF06F087C4Be5A6d4E021442', U: '0x39F4E6E0fbD301576a8Ce54821a192b91e7d2E90' }
  },
  ...(IS_TEST_NET
    ? {
        [ChainId.RINKEBY]: {
          ETH: { U: '0x22b643fFD852c02600D7c06e6Ce883af9F346c0f', SELF: '0x295c6e4Fe1da094225ef0D4b2672bBaDC511979F' },
          BTC: { SELF: '0xd88313f5bA9cBcD4F87Afe76d6A3C3ff84765B3f', U: '0xD12Ce3081c03f256B40146C31d83b95Fe588E4BC' }
        }
      }
    : {})
}

export const getSharkfinAddress = (
  underlying: string | undefined,
  chainId: ChainId | undefined,
  type: string | undefined
) => {
  return underlying && chainId && type
    ? SHARKFIN_ADDRESS[chainId]?.[underlying]?.[type === 'SELF' ? 'SELF' : 'U']
    : undefined
}
