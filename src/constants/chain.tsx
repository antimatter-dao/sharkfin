import { Chain } from 'models/chain'
import { ReactComponent as ETH } from 'assets/svg/eth_logo.svg'
import EthUrl from 'assets/svg/eth_logo.svg'
import BSCUrl from 'assets/svg/binance.svg'
import { ReactComponent as BSC } from 'assets/svg/binance.svg'
import { ReactComponent as AVAX } from 'assets/svg/avax.svg'
import AVAXUrl from 'assets/svg/avax.svg'
import { ReactComponent as MATIC } from 'assets/svg/matic.svg'
import MATICUrl from 'assets/svg/matic.svg'
import { toHex } from 'web3-utils'

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  BSC = 56,
  AVAX = 43114,
  RINKEBY = 4,
  MATIC = 137,
  KOVAN = 42
}

export const NETWORK_CHAIN_ID: ChainId = process.env.REACT_APP_CHAIN_ID
  ? parseInt(process.env.REACT_APP_CHAIN_ID)
  : ChainId.MAINNET

export const IS_TEST_NET = !!(NETWORK_CHAIN_ID === ChainId.RINKEBY)

export const SUPPORTED_CHAIN_ID: Array<ChainId> = IS_TEST_NET
  ? [ChainId.MAINNET, ChainId.RINKEBY, ChainId.BSC]
  : [ChainId.MAINNET, ChainId.BSC]

export const ChainList: Chain[] = [
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'Ropsten',
    name: 'Ropsten Test Network',
    id: ChainId.ROPSTEN,
    hex: '0x3'
  },
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'Rinkeby',
    name: 'Rinkeby Testnet',
    id: ChainId.RINKEBY,
    hex: '0x4'
  },
  {
    icon: <BSC height={20} width={20} />,
    logo: BSCUrl,
    symbol: 'BSC',
    name: 'Binance Smart Chain',
    id: ChainId.BSC,
    hex: '0x38'
  },
  {
    icon: <MATIC />,
    logo: MATICUrl,
    symbol: 'MATIC',
    name: 'Matic',
    id: ChainId.MATIC,
    hex: '0xA86A'
  },
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'ETH',
    name: 'Ethereum Mainnet',
    id: ChainId.MAINNET,
    hex: '0x1'
  },
  {
    icon: <AVAX />,
    logo: AVAXUrl,
    symbol: 'AVAX',
    name: 'Avalanche',
    id: ChainId.AVAX,
    hex: '0xA86A'
  }
  // {
  //   icon: <ETH />,
  //   logo: EthUrl,
  //   symbol: 'Kovan',
  //   name: 'Kovan Testnet',
  //   id: ChainId.KOVAN,
  //   hex: '0x2a'
  // }
]

export const ChainListMap: {
  [key: number]: { icon: JSX.Element; link?: string; selectedIcon?: JSX.Element } & Chain
} = ChainList.reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {} as any)

export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/d49aedc5c8d04128ab366779756cfacd'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  [ChainId.ROPSTEN]: {
    chainId: '0x3',
    chainName: 'Ropsten',
    nativeCurrency: {
      name: 'Ropsten',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://ropsten.infura.io/v3/ab440a3a67f74b6b8a0a8e8e13a76a52'],
    blockExplorerUrls: ['https://ropsten.etherscan.io']
  },
  [ChainId.BSC]: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  [ChainId.AVAX]: {
    chainId: '0xA86A',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io/']
  },
  [ChainId.RINKEBY]: {
    chainId: '0x4',
    chainName: 'Rinkeby',
    nativeCurrency: {
      name: 'Rinkeby',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rinkeby.infura.io/v3/ab440a3a67f74b6b8a0a8e8e13a76a52'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io']
  },
  [ChainId.MATIC]: {
    chainId: toHex(ChainId.MATIC),
    chainName: 'Matic',
    nativeCurrency: {
      name: 'Matic Token',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  [ChainId.KOVAN]: {
    chainId: '0x2a',
    chainName: 'Kovan',
    nativeCurrency: {
      name: 'Kovan',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://kovan.infura.io/v3/ab440a3a67f74b6b8a0a8e8e13a76a52'],
    blockExplorerUrls: ['https://kovan.etherscan.io/']
  }
}
