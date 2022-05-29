export interface SharkfinRecordRaw {
  id: string
  account: string
  hash: string
  symbol: string
  currency: string
  amount: string
  timestamp: string
  type: number
  investCurrency: string
  chainId: number
}

export interface SharkfinRecord {
  id: string
  account: string
  hash: string
  symbol: string
  currency: string
  amount: string
  timestamp: string
  type: number
  underlying: string
  chainId: number
  actionType: 'deposit' | 'withdraw'
  callPut: 'call' | 'put'
}
