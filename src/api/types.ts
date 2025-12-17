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
  App?: number
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

export interface EtStringEntry {
  Id: number
  ProducerId: number
  OldId?: number
  IdStr: number
  Lng?: number
  Text?: string
}

export interface CtSession {
  Id: number
  App?: number
  Source?: string
  Start?: string
  End?: string
  Inactive?: string
}

export interface CtUser {
  Id: number
  Login: string
  Password: string
}

export interface CtUserDetails {
  Id: number
  Login: string
  Region?: number
  FirstName?: string
  LastName?: string
  Email?: string
  Icq?: number
  Phones?: string
  Address?: string
  Date?: string
  BirthDate?: string
  Locked?: boolean
  Coef?: number
  LastArea?: string
  LastActivity?: string
  ExtId?: string | null
  ExtData1?: string | null
  UserType?: number
  ConfirmsEmails?: boolean
  Comments?: string
  Manager?: string
  CurrencyId?: number
  CoefSurchargeId?: number
  UseSurchargeCoef?: boolean
  UserCoefStatus?: string
  ConnectedSupplierId?: number
  MaxUserOffers?: number
  BasketDiscretSurchargeId?: number
  Income?: number
  OrganisationType?: number
  Inn?: string
  Kpp?: string
  LocalExtData1?: boolean
  UseAutodoc?: number
  UseAutodocCrossLimit?: number
  UseExist?: number
  UseExistCrossLimit?: number
  ExistLogin?: string
  ExistPassword?: string
  UseEmex?: number
  UseEmexCrossLimit?: number
  UseAutodocStoragrCross?: boolean
  UseExistStoragrCross?: boolean
  UseEmexStoragrCross?: boolean
  UseAutopiter?: number
  UseAutopiterCrossLimit?: number
  UseAutopiterStoragrCross?: boolean
}

export interface ODataListResponse<T> {
  '@odata.count'?: number
  '@odata.nextLink'?: string
  value: T[]
}

export interface PRResponse {
  Id: number;
  Article: string;
  Brand: string;
  Vendor_Code: string;
  VehicleAccords: [];
  VendorCategories: ProductVendorCategory[];
  Attributes: ProductAttribute[];
  OemAccords: ProductOemAccord[];
  Images: ProductImage[];
}

export interface ProductVendorCategory {
  Id: number;
  Product_ID: number;
  Vendor_Category_ID: number;
  VendorCategory: VendorCategory;
}

export interface VendorCategory {
  Id: number;
  Name: string;
  Vendor_Code: string;
  Parent_ID: number | null;
}

export interface ProductAttribute {
  Id: number;
  Product_ID: number;
  Attribute_ID: number;
  Value: string;
  Attribute: Attribute;
}

export interface Attribute {
  Id: number;
  Name: string;
}

export interface ProductOemAccord {
  Id: number;
  Product_ID: number;
  OEM_ID: number;
  Oem: Oem;
}

export interface Oem {
  Id: number;
  Code: string;
  Mark: string;
}

export interface ProductImage {
  Id: number;
  Product_ID: number;
  Link: string;
}


