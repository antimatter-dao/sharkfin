import { Token } from './token'
import BtcLogo from 'assets/svg/btc_logo.svg'
import UsdtLogo from 'assets/svg/usdt_logo.svg'
import EthLogo from 'assets/svg/eth_logo.svg'
import BSCLogo from 'assets/svg/binance.svg'
import AVAXLogo from 'assets/svg/avax.svg'
import LUNALogo from 'assets/svg/luna.svg'
import MATICLogo from 'assets/svg/matic.svg'
import CAKELogo from 'assets/svg/cake.svg'
import USDCLogo from 'assets/svg/usdc.svg'
import { ChainId, ChainList } from './chain'
import { SHARKFIN_ADDRESS } from 'constants/index'

export const SYMBOL_MAP = {
  BTC: 'BTC',
  'USDT.e': 'USDT',
  USDT: 'USDT',
  BTCT: 'BTC',
  ETH: 'ETH',
  WETH: 'ETH',
  BTCB: 'BTC',
  BNB: 'BNB',
  WBNB: 'BNB',
  AVAX: 'AVAX',
  WAVAX: 'AVAX',
  LUNA: 'LUNA',
  MATIC: 'MATIC',
  WMATIC: 'MATIC',
  CAKE: 'CAKE',
  USDC: 'USDC'
}

export const SUPPORTED_CURRENCY_SYMBOL = {
  [ChainId.BSC]: [SYMBOL_MAP.BTC, SYMBOL_MAP.ETH, SYMBOL_MAP.BNB, SYMBOL_MAP.AVAX, SYMBOL_MAP.CAKE, SYMBOL_MAP.MATIC],
  [ChainId.ROPSTEN]: [SYMBOL_MAP.BTC, SYMBOL_MAP.ETH, SYMBOL_MAP.BNB, SYMBOL_MAP.AVAX],
  [ChainId.MAINNET]: [SYMBOL_MAP.ETH],
  [ChainId.AVAX]: [SYMBOL_MAP.AVAX],
  [ChainId.RINKEBY]: [SYMBOL_MAP.AVAX],
  [ChainId.MATIC]: [SYMBOL_MAP.MATIC],
  [ChainId.KOVAN]: [SYMBOL_MAP.ETH]
}

export const SUPPORTED_CURRENCIES: {
  [key: string]: {
    address: { [key in ChainId]?: string | [string, number] }
    decimals: number
    symbol: string
    name: string
    logoUrl: string
    color?: string
  }
} = {
  BTC: {
    address: {
      [ChainId.ROPSTEN]: '0x9c1CFf4E5762e8e1F95DD3Cc74025ba8d0e71F93',
      [ChainId.BSC]: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      [ChainId.RINKEBY]: '0x329695b36c66d2d44160Cf84be6e2c6FF76F981F',
      [ChainId.MAINNET]: ['0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8]
    },
    decimals: 18,
    symbol: 'BTC',
    name: 'Bitcoin',
    logoUrl: BtcLogo,
    color: '#FD8B00'
  },
  BTCB: {
    address: {
      [ChainId.ROPSTEN]: '0x9c1CFf4E5762e8e1F95DD3Cc74025ba8d0e71F93',
      [ChainId.BSC]: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      [ChainId.RINKEBY]: '0x329695b36c66d2d44160Cf84be6e2c6FF76F981F',
      [ChainId.MAINNET]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    },
    decimals: 18,
    symbol: 'BTC',
    name: 'Binance-Peg BTCB Token',
    logoUrl: BtcLogo,
    color: '#FD8B00'
  },
  USDT: {
    address: {
      [ChainId.ROPSTEN]: ['0xE78D911B56a6321bF622172D32D916f9563e8D84', 18],
      [ChainId.BSC]: ['0x55d398326f99059fF775485246999027B3197955', 18],
      [ChainId.AVAX]: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
      [ChainId.MAINNET]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      [ChainId.RINKEBY]: '0x4Fc7CF6A62c913203f4CC9B2eA02DB27d090AB18',
      [ChainId.MATIC]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      [ChainId.KOVAN]: '0x7e6edA50d1c833bE936492BF42C1BF376239E9e2'
    } as { [chainId in ChainId]: string | [string, number] },
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
    // name: 'Binance-Peg BSC-USDT',
    logoUrl: UsdtLogo,
    color: '#31B047'
  },
  USDC: {
    address: {
      [ChainId.AVAX]: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
      [ChainId.MAINNET]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      [ChainId.KOVAN]: '0x7e6edA50d1c833bE936492BF42C1BF376239E9e2'
    },
    decimals: 6,
    symbol: 'USDC',
    name: ' USD Coin (USDC.e)',
    logoUrl: USDCLogo,
    color: '#1BA27A'
  },
  ETH: {
    address: {
      [ChainId.ROPSTEN]: '0x55795b02C44Bd098D21bC1854036C2E75d7E7c43',
      [ChainId.BSC]: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      [ChainId.MAINNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      [ChainId.KOVAN]: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
      [ChainId.RINKEBY]: '0x3ade50e667cc085b29C2EFF87F6911A7b55Bd81c'
    },
    decimals: 18,
    symbol: 'ETH',
    name: 'Ethereum',
    logoUrl: EthLogo,
    color: '#3164B0'
  },
  WETH: {
    address: {
      [ChainId.RINKEBY]: '0x3ade50e667cc085b29C2EFF87F6911A7b55Bd81c'
    },
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    logoUrl: EthLogo,
    color: '#3164B0'
  },
  BNB: {
    address: {
      [ChainId.ROPSTEN]: '0x570D3f51D7406b641e63614E4584e3B3dEC90Bc5',
      [ChainId.BSC]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      [ChainId.AVAX]: '0x264c1383EA520f73dd837F915ef3a732e204a493'
    },
    decimals: 18,
    symbol: 'BNB',
    name: 'Wrapped BNB',
    logoUrl: BSCLogo,
    color: '#F3BA2F'
  },
  WBNB: {
    address: {
      [ChainId.ROPSTEN]: '0x570D3f51D7406b641e63614E4584e3B3dEC90Bc5',
      [ChainId.BSC]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      [ChainId.AVAX]: '0x264c1383EA520f73dd837F915ef3a732e204a493'
    },
    decimals: 18,
    symbol: 'BNB',
    name: 'Wrapped BNB',
    logoUrl: BSCLogo,
    color: '#F3BA2F'
  },
  AVAX: {
    address: {
      [ChainId.AVAX]: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      [ChainId.ROPSTEN]: '0x2bb4CE1e3e239D255973015459C50F307A399aCf',
      [ChainId.RINKEBY]: '0xA4560E8B4694B437d77452eBc2dE179AAA1137C3',
      [ChainId.BSC]: '0x1CE0c2827e2eF14D5C4f29a091d735A204794041'
    },
    decimals: 18,
    symbol: 'AVAX',
    name: 'Avalanche Token',
    logoUrl: AVAXLogo,
    color: '#E3453D'
  },
  WAVAX: {
    address: {
      [ChainId.AVAX]: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      [ChainId.ROPSTEN]: '0x2bb4CE1e3e239D255973015459C50F307A399aCf',
      [ChainId.RINKEBY]: '0xA4560E8B4694B437d77452eBc2dE179AAA1137C3',
      [ChainId.BSC]: '0x1CE0c2827e2eF14D5C4f29a091d735A204794041'
    },
    decimals: 18,
    symbol: 'AVAX',
    name: 'Wrapped AVAX',
    logoUrl: AVAXLogo,
    color: '#E3453D'
  },
  LUNA: {
    address: { [ChainId.ROPSTEN]: '0x30305a10c05f7fA6b5ac802CBC6A18Ca4ddDe4D9' },
    decimals: 18,
    symbol: 'LUNA',
    name: '	Terra (LUNA)',
    logoUrl: LUNALogo,
    color: '#172852'
  },
  WMATIC: {
    address: {
      [ChainId.BSC]: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD',
      [ChainId.MATIC]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    },
    decimals: 18,
    symbol: 'MATIC',
    name: 'Matic Token',
    logoUrl: MATICLogo,
    color: '#8247E5'
  },
  MATIC: {
    address: {
      [ChainId.BSC]: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD',
      [ChainId.MATIC]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    },
    decimals: 18,
    symbol: 'MATIC',
    name: 'Matic Token',
    logoUrl: MATICLogo,
    color: '#8247E5'
  },
  CAKE: {
    address: {
      [ChainId.BSC]: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
    },
    decimals: 18,
    symbol: 'CAKE',
    name: 'PancakeSwap Token',
    logoUrl: CAKELogo,
    color: '#1FC7D4'
  }
}

export const CURRENCIES: { [key in ChainId]: { [key: string]: Token } } = ChainList.reduce(
  (acc: { [key in ChainId]: { [key: string]: Token } }, { id }: { id: ChainId }) => {
    // acc[+chainId as ChainId] = new Token(3, item.address[+chainId as ChainId], item.decimals, item.symbol, item.name)
    // return acc
    const tokenMap = Object.keys(SUPPORTED_CURRENCIES).reduce((acc: { [key: string]: Token }, key) => {
      const item = SUPPORTED_CURRENCIES[key as keyof typeof SUPPORTED_CURRENCIES]
      const address = item.address[id]
      const decimal = item.decimals
      if (address) {
        if (Array.isArray(address)) {
          acc[key as keyof typeof SUPPORTED_CURRENCIES] = new Token(id, address[0], address[1], item.symbol, item.name)
        } else {
          acc[key as keyof typeof SUPPORTED_CURRENCIES] = new Token(id, address, decimal, item.symbol, item.name)
        }
      }

      return acc
    }, {} as { [key: string]: Token })

    acc[id] = tokenMap
    return acc
  },
  {} as { [key in ChainId]: { [key: string]: Token } }
)

export const CURRENCY_ADDRESS_MAP = Object.keys(SUPPORTED_CURRENCIES).reduce((acc, key) => {
  const item = SUPPORTED_CURRENCIES[key as keyof typeof SUPPORTED_CURRENCIES]
  ChainList.map(({ id: chainId }: { id: ChainId }) => {
    const address = item.address[chainId]
    const decimal = item.decimals
    if (address) {
      if (Array.isArray(address)) {
        acc[address[0] as keyof typeof SUPPORTED_CURRENCIES] = new Token(
          +chainId,
          address[0],
          address[1],
          item.symbol,
          item.name
        )
      } else {
        acc[address as keyof typeof SUPPORTED_CURRENCIES] = new Token(
          +chainId,
          address,
          decimal,
          item.symbol,
          item.name
        )
      }
    }
  })

  return acc
}, {} as { [key: string]: Token })

export const SUPPORTED_SHARKFIN_VAULT: { [chainId in ChainId]?: string[] } = Object.keys(SHARKFIN_ADDRESS).reduce(
  (acc, chain) => {
    const chainId: ChainId = +chain
    const addresses = SHARKFIN_ADDRESS[chainId]

    if (!addresses) {
      return acc
    }
    const curList = Object.keys(addresses).reduce((acc2, curSymbol: string) => {
      if (!acc2.includes(curSymbol)) {
        acc2.push(curSymbol)
      }
      return acc2
    }, [] as string[])

    acc[chainId] = curList
    return acc
  },
  {} as { [key: string]: string[] }
)

export const DEFAULT_COIN_SYMBOL: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: 'ETH',
  [ChainId.BSC]: 'BNB',
  [ChainId.ROPSTEN]: 'BNB',
  [ChainId.AVAX]: 'AVAX',
  [ChainId.RINKEBY]: 'ETH',
  [ChainId.MATIC]: 'MATIC',
  [ChainId.KOVAN]: 'ETH'
}

export const getMappedSymbol = (symbol: string) => {
  const mapped = SYMBOL_MAP[symbol as keyof typeof SYMBOL_MAP]
  return mapped ? mapped : symbol
}
