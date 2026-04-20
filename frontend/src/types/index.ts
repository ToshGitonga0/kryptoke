export interface UserPublic {
  id:             string;
  email:          string;
  full_name:      string;
  phone_number:   string;
  national_id?:   string;
  county?:        string;
  role:           string;
  is_active:      boolean;
  is_verified:    boolean;
  kyc_status:     string;
  credit_score:   number;
  created_at:     string;
  updated_at:     string;
  last_login?:    string;
}

export interface Token {
  access_token: string;
  token_type:   string;
  user:         UserPublic;
}

export interface AssetPublic {
  id:               string;
  symbol:           string;
  name:             string;
  asset_type:       string;
  current_price:    string;
  price_change_24h: string;
  volume_24h:       string;
  market_cap:       string;
  icon_url?:        string;
  is_active:        boolean;
  created_at:       string;
}

export interface PriceHistoryPublic {
  id:        string;
  asset_id:  string;
  open:      string;
  high:      string;
  low:       string;
  close:     string;
  volume:    string;
  timestamp: string;
}

export interface WalletPublic {
  id:             string;
  user_id:        string;
  currency:       string;
  balance:        string;
  locked_balance: string;
  created_at:     string;
  updated_at:     string;
}

export interface PortfolioItemPublic {
  id:            string;
  user_id:       string;
  asset_id:      string;
  quantity:      string;
  avg_buy_price: string;
  asset?:        AssetPublic;
  current_value?: string;
  pnl?:          string;
  pnl_pct?:      string;
}

export interface PortfolioPublic {
  items:          PortfolioItemPublic[];
  total_invested: string;
  total_value:    string;
  total_pnl:      string;
  total_pnl_pct:  string;
}

export interface OrderPublic {
  id:              string;
  user_id:         string;
  asset_id:        string;
  side:            "buy" | "sell";
  order_type:      "market" | "limit";
  status:          string;
  quantity:        string;
  price:           string;
  filled_quantity: string;
  fee:             string;
  asset?:          AssetPublic;
  created_at:      string;
  updated_at:      string;
}

export interface TradePublic {
  id:          string;
  order_id:    string;
  asset_id:    string;
  user_id:     string;
  side:        "buy" | "sell";
  quantity:    string;
  price:       string;
  fee:         string;
  total:       string;
  executed_at: string;
  asset?:      AssetPublic;
}

export interface TransactionPublic {
  id:          string;
  wallet_id:   string;
  user_id:     string;
  type:        string;
  amount:      string;
  currency:    string;
  status:      string;
  reference?:  string;
  description?:string;
  created_at:  string;
}
