export interface EtProducer {
  Id: number
  RealId?: number
  Prefix?: string
  Name?: string
  Address?: string
  Www?: string
  Rating?: number
  ExistName?: string
  ExistId?: number
  Domain?: string
  TecdocSupplierId?: number
  MarketPrefix?: string
}

export interface EtPart {
  Id: number
  ProducerId: number
  OldId?: number
  Code?: string
  LongCode?: string
  Weight?: number
  Name?: number
  Description?: number
  V?: number
  SessionId?: number
  NoChangeFlag?: boolean
  Accepted?: boolean
  Deleted?: boolean
  Rating?: number
  Old?: boolean
  Dead?: boolean
}

export interface ODataListResponse<T> {
  '@odata.count'?: number
  value: T[]
}

