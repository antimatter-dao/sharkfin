export enum InvesStatusType {
  SUCCESS = 'success',
  PENDING = 'pending',
  ERROR = 'error'
}

export const InvesStatus = {
  [1]: InvesStatusType.PENDING,
  [2]: InvesStatusType.SUCCESS,
  [3]: InvesStatusType.SUCCESS,
  [4]: InvesStatusType.SUCCESS,
  [5]: InvesStatusType.ERROR,
  [6]: InvesStatusType.PENDING,
  [7]: InvesStatusType.ERROR
}
export interface OrderRecord {
  id: number
  orderId: string
  phaseId: 1
  productName: string
  productCode: string
  currency: string
  name: string
  size: string
  code: string
  baseRate: string
  settlementRate: string
  startedAt: string
  liquidatedAt: string
  status: string
  settlementPrice: string
  createdAt: string
  investStatus: string
  chainId: string
  investType: number
  priceRangeDown: string
  priceRangeUp: string
  rateRangeDown: string
  rateRangeUp: string
  pnl?: string
}
export interface OrderRecordDetail {
  settlement_pnl: string
  client_order_id: string
  size: string
  settlement_price: string
  settlement_rate: string
  tag: string
  product_code: string
  product_name: string
}
export interface PrevOrder {
  orderId: number
  productId: number
  vaultAddress: string
  swapAddress: string
  otokenAddress: string
  indexPrice: string
  price: string
  amount: string
  createdAt: string
  investStatus: number
  chainId: number
  type: string
  annualRor: string
  strikePrice: string
  expiredAt: number
  multiplier: string
  investCurrency: string
  investType: number
}
