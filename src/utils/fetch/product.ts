import { ChainId } from 'constants/chain'

export interface createOrder {
  address: string
  amount: number
  currency: string
  investStatus: 1 | 2 | 3 | 4 | 5 | 6
  orderId: number
  productId: number
}

export interface Product {
  chainId: ChainId
  chain: string
  productId: number
  expiredAt: number
  apy: string
  type: string
  isActive: boolean
  strikePrice: string
  currentPrice: string
  multiplier: string
  currency: string
  investCurrency: string
  orderLimit: string
  ts: number
  gtStrikePrice: string
  ltStrikePrice: string
  strikeCurrency: string
  price: string
}
