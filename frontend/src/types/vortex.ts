export type MarketState = "OPEN" | "SETTLED" | "INCONCLUSIVE" | "ABORTED";
export type DirectionOutcome = "BULL" | "BEAR" | "UNRESOLVED" | "INCONCLUSIVE" | "ABORTED";

export interface VenueEvidenceRecord {
  valid: boolean;
  venue: string;
  pair?: string;
  candle_start?: string;
  candle_end?: string;
  open?: string;
  close?: string;
  direction?: DirectionOutcome;
  reason?: string;
}

export interface ConsensusSummary {
  asset: string;
  candle_start: string;
  candle_end: string;
  outcome: DirectionOutcome;
  bull_votes: number;
  bear_votes: number;
  invalid_votes: number;
  venues: Record<string, VenueEvidenceRecord>;
}

export interface VortexMarketRecord {
  vortex_id: string;
  lookup_key: string;
  creator: string;
  asset: string;
  pair: string;
  category: string;
  time_frame: string;
  title_question: string;
  bull_rule: string;
  bear_rule: string;
  betting_cutoff: string;
  candle_start: string;
  candle_end: string;
  resolution_time: string;
  created_at: string;
  resolved_at: string;
  state: MarketState;
  outcome: DirectionOutcome;
  bull_pool_total: string;
  bear_pool_total: string;
  aggregate_pool_total: string;
  participant_count: string;
  live_status?: string;
  consensus_summary?: ConsensusSummary;
}

export interface UserPredictionStatus {
  vortex_id: string;
  wallet: string;
  direction: "BULL" | "BEAR" | "NONE";
  bull_stake: string;
  bear_stake: string;
  total_stake: string;
  market_state: MarketState;
  claimable_amount: string;
  refundable_amount: string;
  claimed: boolean;
}

export interface ProtocolTelemetry {
  admin: string;
  operator: string;
  vortex_counter: string;
  active_markets: string;
  settled_markets: string;
  aborted_markets: string;
  inconclusive_markets: string;
  total_staked_volume: string;
  total_payouts: string;
  total_refunds: string;
  contract_balance: string;
  supported_assets: string[];
  venues: string[];
}
