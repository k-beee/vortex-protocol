# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

"""
Vortex Protocol — Decentralized Multi-Venue Prediction Engine
==============================================================
Network Target: GenLayer Studionet

Vortex Engine is an Intelligent Contract that orchestrates time-bound,
multi-exchange price prediction markets. It uses GenLayer's non-deterministic
web-fetching capability (gl.nondet.web.get) across five independent crypto spot
venues (Binance, Bybit, Gate.io, MEXC, Bitget) to reach decentralized 3-of-5
directional consensus without relying on a centralized oracle operator.

Author: k_bee
License: MIT
"""

import json
import typing
from genlayer import *

# -----------------------------------------------------------------------------
# Protocol Constants & Configuration Parameters
# -----------------------------------------------------------------------------
PROTOCOL_CATEGORY = "DECISION_MARKET"
MARKET_TIME_FRAME = "1H_UTC_INTERVAL"
STAKE_DENOMINATION = "GEN"
INTERVAL_DURATION_SECONDS = 3600  # Exactly 60 minutes
MIN_CREATION_LEAD_SECONDS = 1800  # 30-minute advance setup required
SAFETY_SETTLEMENT_BUFFER = 120    # 2-minute post-candle close buffer
VENUE_TOTAL_COUNT = 5
CONSENSUS_QUORUM_TARGET = 3

# Economic Stake Limits (in Wei: 1 GEN to 10 GEN)
MINIMAL_STAKE_WEI = u256(1000000000000000000)   # 1 GEN
MAXIMUM_STAKE_WEI = u256(10000000000000000000)  # 10 GEN

# Directional Outcome States
OUTCOME_BULL = "BULL"
OUTCOME_BEAR = "BEAR"
OUTCOME_UNRESOLVED = "UNRESOLVED"
OUTCOME_INCONCLUSIVE = "INCONCLUSIVE"
OUTCOME_ABORTED = "ABORTED"

# Market Lifecycle Status Flags
STATE_OPEN = "OPEN"
STATE_SETTLED = "SETTLED"
STATE_INCONCLUSIVE = "INCONCLUSIVE"
STATE_ABORTED = "ABORTED"

# Numeric Basis Points Constant (100.00% = 10000 bps)
BPS_BASE = u256(10000)
MAX_PAGE_CAPACITY = 50
MAX_RESPONSE_PAYLOAD_BYTES = 100000

# Supported Trading Pairs & Exchange Configurations
SUPPORTED_ASSETS = ["BTC", "ETH", "SOL", "BNB", "AVAX"]
EXCHANGE_VENUES = ["BINANCE", "BYBIT", "GATEIO", "MEXC", "BITGET"]

VENUE_PAIR_MAP = {
    "BINANCE": {"BTC": "BTCUSDT", "ETH": "ETHUSDT", "SOL": "SOLUSDT", "BNB": "BNBUSDT", "AVAX": "AVAXUSDT"},
    "BYBIT": {"BTC": "BTCUSDT", "ETH": "ETHUSDT", "SOL": "SOLUSDT", "BNB": "BNBUSDT", "AVAX": "AVAXUSDT"},
    "GATEIO": {"BTC": "BTC_USDT", "ETH": "ETH_USDT", "SOL": "SOL_USDT", "BNB": "BNB_USDT", "AVAX": "AVAX_USDT"},
    "MEXC": {"BTC": "BTCUSDT", "ETH": "ETHUSDT", "SOL": "SOLUSDT", "BNB": "BNBUSDT", "AVAX": "AVAXUSDT"},
    "BITGET": {"BTC": "BTCUSDT", "ETH": "ETHUSDT", "SOL": "SOLUSDT", "BNB": "BNBUSDT", "AVAX": "AVAXUSDT"},
}

VENUE_BASE_URLS = {
    "BINANCE": "https://api.binance.com",
    "BYBIT": "https://api.bybit.com",
    "GATEIO": "https://api.gateio.ws",
    "MEXC": "https://api.mexc.com",
    "BITGET": "https://api.bitget.com",
}

VENUE_ENDPOINTS = {
    "BINANCE": "/api/v3/klines",
    "BYBIT": "/v5/market/kline",
    "GATEIO": "/api/v4/spot/candlesticks",
    "MEXC": "/api/v3/klines",
    "BITGET": "/api/v3/market/candles",
}

VENUE_QUERY_PARAMS = {
    "BINANCE": "interval=1h&limit=1",
    "BYBIT": "category=spot&interval=60&limit=2",
    "GATEIO": "interval=1h",
    "MEXC": "interval=60m&limit=1",
    "BITGET": "category=SPOT&interval=1H&type=market&limit=2",
}

TIMESTAMP_SCALE = {
    "BINANCE": "MS",
    "BYBIT": "MS",
    "GATEIO": "SEC",
    "MEXC": "MS",
    "BITGET": "MS",
}

PAYLOAD_CONTAINERS = {
    "BINANCE": "ROOT",
    "BYBIT": "result.list",
    "GATEIO": "ROOT",
    "MEXC": "ROOT",
    "BITGET": "data",
}

INDEX_TIMESTAMP = {"BINANCE": 0, "BYBIT": 0, "GATEIO": 0, "MEXC": 0, "BITGET": 0}
INDEX_OPEN = {"BINANCE": 1, "BYBIT": 1, "GATEIO": 5, "MEXC": 1, "BITGET": 1}
INDEX_CLOSE = {"BINANCE": 4, "BYBIT": 4, "GATEIO": 2, "MEXC": 4, "BITGET": 4}

RULE_DESCRIPTION_BULL = "Closing candle price strictly exceeds opening candle price."
RULE_DESCRIPTION_BEAR = "Closing candle price is equal to or lower than opening candle price."


@gl.evm.contract_interface
class _NativeTransferTarget:
    """Helper interface for transferring native GEN tokens to participants."""
    class View:
        pass
    class Write:
        pass


class VortexEngine(gl.Contract):
    """
    VortexEngine Intelligent Contract
    --------------------------------
    Manages market lifecycle, participant predictions, non-deterministic
    multi-venue oracle consensus, and automated pari-mutuel payouts.
    """
    admin_address: str
    operator_address: str
    vortex_counter: u256
    active_market_count: u256
    settled_market_count: u256
    aborted_market_count: u256
    inconclusive_market_count: u256
    cumulative_staked_volume: u256
    cumulative_payouts_distributed: u256
    cumulative_refunds_distributed: u256
    
    # Primary Storage Mappings
    markets: TreeMap[str, str]
    market_lookup_keys: TreeMap[str, str]
    market_id_sequence: str
    user_position_index: TreeMap[str, str]
    bull_pool_stakes: TreeMap[str, str]
    bear_pool_stakes: TreeMap[str, str]
    aggregate_stakes: TreeMap[str, str]
    claim_audit_flags: TreeMap[str, str]
    disbursed_claim_amounts: TreeMap[str, str]

    def __init__(self):
        """Initialize the Vortex Protocol Intelligent Contract state."""
        self.admin_address = self._clean_address(gl.message.sender_address)
        self.operator_address = ""
        self.vortex_counter = u256(0)
        self.active_market_count = u256(0)
        self.settled_market_count = u256(0)
        self.aborted_market_count = u256(0)
        self.inconclusive_market_count = u256(0)
        self.cumulative_staked_volume = u256(0)
        self.cumulative_payouts_distributed = u256(0)
        self.cumulative_refunds_distributed = u256(0)
        
        # Instantiate persistent state structures
        self.markets = TreeMap[str, str]()
        self.market_lookup_keys = TreeMap[str, str]()
        self.market_id_sequence = "[]"
        self.user_position_index = TreeMap[str, str]()
        self.bull_pool_stakes = TreeMap[str, str]()
        self.bear_pool_stakes = TreeMap[str, str]()
        self.aggregate_stakes = TreeMap[str, str]()
        self.claim_audit_flags = TreeMap[str, str]()
        self.disbursed_claim_amounts = TreeMap[str, str]()

    # -------------------------------------------------------------------------
    # Administrative & Configuration Mutators
    # -------------------------------------------------------------------------

    @gl.public.write
    def set_operator_address(self, operator: str) -> None:
        """Assign an authorized automated operator wallet for automated market resolution."""
        if self._caller() != self.admin_address:
            raise gl.vm.UserError("Permission denied: Admin authority required")
        self.operator_address = self._clean_address(operator)

    @gl.public.write
    def open_vortex_market(self, asset: str, candle_start_timestamp: u256) -> u256:
        """
        Open a new time-windowed market for a supported asset and UTC candle start hour.
        Must be invoked at least 30 minutes before candle opening time.
        """
        caller = self._caller()
        if caller != self.admin_address and caller != self.operator_address:
            raise gl.vm.UserError("Permission denied: Unauthorized market creator")
        
        token_symbol = str(asset).strip().upper()
        if token_symbol not in SUPPORTED_ASSETS:
            raise gl.vm.UserError("Invalid asset: Token symbol not supported by Vortex engine")
        
        if candle_start_timestamp % u256(INTERVAL_DURATION_SECONDS) != u256(0):
            raise gl.vm.UserError("Invalid timing: Candle start timestamp must align exactly to a UTC hour")
        
        current_time = self._current_timestamp()
        if candle_start_timestamp <= current_time:
            raise gl.vm.UserError("Invalid timing: Candle start time must be in the future")
        
        if candle_start_timestamp < current_time + u256(MIN_CREATION_LEAD_SECONDS):
            raise gl.vm.UserError("Insufficient lead time: Market must be created at least 30 minutes ahead")
        
        lookup_key = self._format_market_key(token_symbol, MARKET_TIME_FRAME, candle_start_timestamp)
        if lookup_key in self.market_lookup_keys:
            raise gl.vm.UserError("Duplicate market: Market already initialized for asset and hour")
        
        vortex_id = self.vortex_counter
        candle_end_timestamp = candle_start_timestamp + u256(INTERVAL_DURATION_SECONDS)
        resolution_allowed_time = candle_end_timestamp + u256(SAFETY_SETTLEMENT_BUFFER)
        trading_pair = token_symbol + "USDT"
        
        market_record = {
            "vortex_id": str(vortex_id),
            "lookup_key": lookup_key,
            "creator": caller,
            "asset": token_symbol,
            "pair": trading_pair,
            "category": PROTOCOL_CATEGORY,
            "time_frame": MARKET_TIME_FRAME,
            "title_question": self._construct_question(trading_pair, int(candle_start_timestamp), int(candle_end_timestamp)),
            "bull_rule": RULE_DESCRIPTION_BULL,
            "bear_rule": RULE_DESCRIPTION_BEAR,
            "betting_cutoff": str(candle_start_timestamp),
            "candle_start": str(candle_start_timestamp),
            "candle_end": str(candle_end_timestamp),
            "resolution_time": str(resolution_allowed_time),
            "created_at": str(current_time),
            "resolved_at": "0",
            "state": STATE_OPEN,
            "outcome": OUTCOME_UNRESOLVED,
            "bull_pool_total": "0",
            "bear_pool_total": "0",
            "aggregate_pool_total": "0",
            "participant_count": "0",
            "consensus_summary": self._empty_consensus_payload(OUTCOME_UNRESOLVED, "NOT_YET_RESOLVED"),
        }
        
        self._write_market(vortex_id, market_record)
        self.market_lookup_keys[lookup_key] = str(vortex_id)
        self._register_global_id(vortex_id)
        
        self.vortex_counter = vortex_id + u256(1)
        self.active_market_count = self.active_market_count + u256(1)
        return vortex_id

    # -------------------------------------------------------------------------
    # Participant Prediction Mutators
    # -------------------------------------------------------------------------

    @gl.public.write.payable
    def enter_prediction(self, vortex_id: u256, target_direction: str) -> None:
        """
        Participate in a market by staking GEN on BULL or BEAR position before candle start.
        """
        market = self._fetch_market(vortex_id)
        chosen_side = self._sanitize_direction(target_direction)
        stake_amount = gl.message.value
        
        if stake_amount < MINIMAL_STAKE_WEI:
            raise gl.vm.UserError("Stake below threshold: Minimum stake is 1 GEN")
        
        if self._read_str(market, "state") != STATE_OPEN or self._current_timestamp() >= self._read_uint(market, "betting_cutoff"):
            raise gl.vm.UserError("Market locked: Predictions closed for this window")
        
        participant = self._caller()
        position_key = self._format_position_key(vortex_id, participant)
        existing_stake = self._get_staked_val(self.aggregate_stakes, position_key)
        
        if existing_stake + stake_amount > MAXIMUM_STAKE_WEI:
            raise gl.vm.UserError("Stake cap exceeded: Maximum cumulative stake is 10 GEN per wallet per market")
        
        existing_bull = self._get_staked_val(self.bull_pool_stakes, position_key)
        existing_bear = self._get_staked_val(self.bear_pool_stakes, position_key)
        
        if chosen_side == OUTCOME_BULL and existing_bear > u256(0):
            raise gl.vm.UserError("Direction lock: Cannot bet BULL when holding an active BEAR position")
        if chosen_side == OUTCOME_BEAR and existing_bull > u256(0):
            raise gl.vm.UserError("Direction lock: Cannot bet BEAR when holding an active BULL position")
        
        if existing_stake == u256(0):
            current_participants = self._read_uint(market, "participant_count")
            market["participant_count"] = str(current_participants + u256(1))
            self._link_user_market(participant, vortex_id)
        
        if chosen_side == OUTCOME_BULL:
            self._set_staked_val(self.bull_pool_stakes, position_key, existing_bull + stake_amount)
            market["bull_pool_total"] = str(self._read_uint(market, "bull_pool_total") + stake_amount)
        else:
            self._set_staked_val(self.bear_pool_stakes, position_key, existing_bear + stake_amount)
            market["bear_pool_total"] = str(self._read_uint(market, "bear_pool_total") + stake_amount)
        
        self._set_staked_val(self.aggregate_stakes, position_key, existing_stake + stake_amount)
        market["aggregate_pool_total"] = str(self._read_uint(market, "aggregate_pool_total") + stake_amount)
        
        self.cumulative_staked_volume = self.cumulative_staked_volume + stake_amount
        self._write_market(vortex_id, market)

    # -------------------------------------------------------------------------
    # Oracle Consensus & Resolution Mutator
    # -------------------------------------------------------------------------

    @gl.public.write
    def trigger_oracle_consensus(self, vortex_id: u256) -> None:
        """
        Trigger non-deterministic 5-exchange web-fetching consensus for a due market.
        Available after the candle interval closes and the safety delay has elapsed.
        """
        caller = self._caller()
        if caller != self.admin_address and caller != self.operator_address:
            raise gl.vm.UserError("Permission denied: Unauthorized resolution trigger")
        
        market = self._fetch_market(vortex_id)
        if self._read_str(market, "state") != STATE_OPEN:
            raise gl.vm.UserError("Market state invalid: Already resolved or cancelled")
        
        if self._current_timestamp() < self._read_uint(market, "resolution_time"):
            raise gl.vm.UserError("Premature execution: Settlement safety buffer has not expired")
        
        bull_total = self._read_uint(market, "bull_pool_total")
        bear_total = self._read_uint(market, "bear_pool_total")
        
        # If one side of the market has no bets, abort and allow refunds
        if bull_total == u256(0) or bear_total == u256(0):
            empty_payload = self._empty_consensus_payload(OUTCOME_ABORTED, "SINGLE_SIDED_OR_EMPTY_MARKET")
            self._complete_market_lifecycle(vortex_id, market, STATE_ABORTED, OUTCOME_ABORTED, empty_payload)
            self.aborted_market_count = self.aborted_market_count + u256(1)
            return
        
        # Execute GenLayer non-deterministic leader-validator consensus
        resolution_result = self._execute_nondet_consensus(
            self._read_str(market, "asset"),
            self._read_uint(market, "candle_start"),
            self._read_uint(market, "candle_end")
        )
        
        determined_outcome = str(resolution_result["outcome"])
        if determined_outcome == OUTCOME_INCONCLUSIVE:
            self._complete_market_lifecycle(vortex_id, market, STATE_INCONCLUSIVE, determined_outcome, resolution_result)
            self.inconclusive_market_count = self.inconclusive_market_count + u256(1)
        else:
            self._complete_market_lifecycle(vortex_id, market, STATE_SETTLED, determined_outcome, resolution_result)
            self.settled_market_count = self.settled_market_count + u256(1)

    # -------------------------------------------------------------------------
    # Financial Disbursal & Claim Mutators
    # -------------------------------------------------------------------------

    @gl.public.write
    def claim_reward_payout(self, vortex_id: u256) -> u256:
        """Claim pari-mutuel winnings for a settled market."""
        market = self._fetch_market(vortex_id)
        if self._read_str(market, "state") != STATE_SETTLED:
            raise gl.vm.UserError("Payout unavailable: Market is not settled")
        
        claimant = self._caller()
        position_key = self._format_position_key(vortex_id, claimant)
        
        if self._read_flag(self.claim_audit_flags, position_key):
            raise gl.vm.UserError("Duplicate transaction: Reward already claimed")
        
        payout = self._calculate_payout_share(market, position_key)
        if payout == u256(0):
            raise gl.vm.UserError("No payout available: Position did not win or zero stake")
        
        self._record_claim(position_key, payout)
        self.cumulative_payouts_distributed = self.cumulative_payouts_distributed + payout
        
        _NativeTransferTarget(Address(claimant)).emit_transfer(value=payout)
        return payout

    @gl.public.write
    def claim_cancelled_refund(self, vortex_id: u256) -> u256:
        """Claim 100% GEN stake refund for an inconclusive or aborted market."""
        market = self._fetch_market(vortex_id)
        current_state = self._read_str(market, "state")
        
        if current_state != STATE_INCONCLUSIVE and current_state != STATE_ABORTED:
            raise gl.vm.UserError("Refund unavailable: Market is not in refundable state")
        
        claimant = self._caller()
        position_key = self._format_position_key(vortex_id, claimant)
        
        if self._read_flag(self.claim_audit_flags, position_key):
            raise gl.vm.UserError("Duplicate transaction: Refund already claimed")
        
        refund_amount = self._get_staked_val(self.aggregate_stakes, position_key)
        if refund_amount == u256(0):
            raise gl.vm.UserError("No refund available: Participant has zero recorded stake")
        
        self._record_claim(position_key, refund_amount)
        self.cumulative_refunds_distributed = self.cumulative_refunds_distributed + refund_amount
        
        _NativeTransferTarget(Address(claimant)).emit_transfer(value=refund_amount)
        return refund_amount

    # -------------------------------------------------------------------------
    # Public Telemetry & View Methods
    # -------------------------------------------------------------------------

    @gl.public.view
    def get_vortex_market(self, vortex_id: u256) -> str:
        """Return comprehensive serialized market record with live status."""
        market = self._fetch_market(vortex_id)
        output = dict(market)
        output["live_status"] = self.get_market_state_details(vortex_id)
        return self._serialize(output)

    @gl.public.view
    def get_market_state_details(self, vortex_id: u256) -> str:
        """Return time-aware state indicator for a specific market."""
        market = self._fetch_market(vortex_id)
        state = self._read_str(market, "state")
        if state == STATE_OPEN:
            now = self._current_timestamp()
            if now >= self._read_uint(market, "resolution_time"):
                return "READY_FOR_CONSENSUS"
            if now >= self._read_uint(market, "betting_cutoff"):
                return "LOCKED_PREDICTING_CLOSED"
        return state

    @gl.public.view
    def get_protocol_telemetry(self) -> str:
        """Return protocol statistics, contract balances, and configurations."""
        return self._serialize({
            "admin": self.admin_address,
            "operator": self.operator_address,
            "vortex_counter": str(self.vortex_counter),
            "active_markets": str(self.active_market_count),
            "settled_markets": str(self.settled_market_count),
            "aborted_markets": str(self.aborted_market_count),
            "inconclusive_markets": str(self.inconclusive_market_count),
            "total_staked_volume": str(self.cumulative_staked_volume),
            "total_payouts": str(self.cumulative_payouts_distributed),
            "total_refunds": str(self.cumulative_refunds_distributed),
            "contract_balance": str(self.balance),
            "supported_assets": SUPPORTED_ASSETS,
            "venues": EXCHANGE_VENUES,
        })

    @gl.public.view
    def get_user_prediction_status(self, vortex_id: u256, participant: str) -> str:
        """Return a user's position, stake totals, and claim status in a market."""
        market = self._fetch_market(vortex_id)
        wallet = self._clean_address(participant)
        position_key = self._format_position_key(vortex_id, wallet)
        
        bull_stake = self._get_staked_val(self.bull_pool_stakes, position_key)
        bear_stake = self._get_staked_val(self.bear_pool_stakes, position_key)
        total_stake = self._get_staked_val(self.aggregate_stakes, position_key)
        
        direction = OUTCOME_BULL if bull_stake > u256(0) else OUTCOME_BEAR if bear_stake > u256(0) else "NONE"
        state = self._read_str(market, "state")
        claimed = self._read_flag(self.claim_audit_flags, position_key)
        
        claimable = u256(0)
        refundable = u256(0)
        
        if state == STATE_SETTLED and not claimed:
            claimable = self._calculate_payout_share(market, position_key)
        elif (state == STATE_INCONCLUSIVE or state == STATE_ABORTED) and not claimed:
            refundable = total_stake
            
        return self._serialize({
            "vortex_id": str(vortex_id),
            "wallet": wallet,
            "direction": direction,
            "bull_stake": str(bull_stake),
            "bear_stake": str(bear_stake),
            "total_stake": str(total_stake),
            "market_state": state,
            "claimable_amount": str(claimable),
            "refundable_amount": str(refundable),
            "claimed": claimed,
        })

    # -------------------------------------------------------------------------
    # Internal GenLayer Consensus & Non-Deterministic Multi-Venue Logic
    # -------------------------------------------------------------------------

    def _execute_nondet_consensus(self, asset: str, candle_start: u256, candle_end: u256) -> dict:
        """
        Orchestrate GenLayer Equivalence Principle consensus via gl.vm.run_nondet_unsafe.
        """
        target_asset = str(asset)
        target_start = int(candle_start)
        target_end = int(candle_end)

        def leader_execution():
            return self._fetch_all_venues(target_asset, target_start, target_end)

        def validator_verification(leader_result: gl.vm.Result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            proposal = leader_result.calldata
            if not self._validate_consensus_structure(proposal, target_asset, target_start, target_end):
                return False
            return self._verify_evidence_equivalence(proposal, leader_execution())

        return gl.vm.run_nondet_unsafe(leader_execution, validator_verification)

    def _fetch_all_venues(self, asset: str, start_time: int, end_time: int) -> dict:
        """Fetch candle evidence across all 5 configured venues."""
        venue_data = {
            "BINANCE": self._request_venue_candle("BINANCE", asset, start_time, end_time),
            "BYBIT": self._request_venue_candle("BYBIT", asset, start_time, end_time),
            "GATEIO": self._request_venue_candle("GATEIO", asset, start_time, end_time),
            "MEXC": self._request_venue_candle("MEXC", asset, start_time, end_time),
            "BITGET": self._request_venue_candle("BITGET", asset, start_time, end_time),
        }
        return self._tally_votes(asset, start_time, end_time, venue_data)

    def _request_venue_candle(self, venue: str, asset: str, start_time: int, end_time: int) -> dict:
        """Formulate request URL and fetch web JSON for a specific exchange venue."""
        pair = VENUE_PAIR_MAP[venue][asset]
        start_param = str(start_time * 1000 if TIMESTAMP_SCALE[venue] == "MS" else start_time)
        end_param = str(end_time * 1000 - 1 if TIMESTAMP_SCALE[venue] == "MS" else end_time)
        
        base_endpoint = VENUE_BASE_URLS[venue] + VENUE_ENDPOINTS[venue]
        query = "symbol=" + pair + "&startTime=" + start_param + "&endTime=" + end_param + "&" + VENUE_QUERY_PARAMS[venue]
        
        if venue == "BYBIT":
            query = "symbol=" + pair + "&start=" + start_param + "&end=" + end_param + "&" + VENUE_QUERY_PARAMS[venue]
        elif venue == "GATEIO":
            query = "currency_pair=" + pair + "&from=" + str(start_time) + "&to=" + str(end_time) + "&" + VENUE_QUERY_PARAMS[venue]

        url = base_endpoint + "?" + query
        return self._fetch_json_candle(venue, pair, url, start_time, end_time)

    def _fetch_json_candle(self, venue: str, pair: str, url: str, expected_start: int, expected_end: int) -> dict:
        """Perform non-deterministic web fetch and extract candle data."""
        try:
            res = gl.nondet.web.get(url)
            status, body = self._unwrap_response(res)
            if status < 200 or status >= 300 or len(body.strip()) == 0 or len(body) > MAX_RESPONSE_PAYLOAD_BYTES:
                return {"valid": False, "reason": "HTTP_OR_PAYLOAD_ERROR"}
            
            payload = json.loads(body)
            rows = self._extract_rows(venue, payload)
            if rows is None or not isinstance(rows, list):
                return {"valid": False, "reason": "MALFORMED_PAYLOAD"}
            
            return self._parse_candle_rows(venue, pair, rows, expected_start, expected_end)
        except Exception:
            return {"valid": False, "reason": "FETCH_EXCEPTION"}

    def _extract_rows(self, venue: str, payload: typing.Any) -> typing.Any:
        container = PAYLOAD_CONTAINERS[venue]
        if container == "result.list":
            res = payload.get("result") if isinstance(payload, dict) else None
            return res.get("list") if isinstance(res, dict) else None
        elif container == "data":
            return payload.get("data") if isinstance(payload, dict) else None
        return payload if isinstance(payload, list) else None

    def _parse_candle_rows(self, venue: str, pair: str, rows: list, expected_start: int, expected_end: int) -> dict:
        idx_t = INDEX_TIMESTAMP[venue]
        idx_o = INDEX_OPEN[venue]
        idx_c = INDEX_CLOSE[venue]
        min_len = max(idx_t, idx_o, idx_c) + 1
        
        scale = TIMESTAMP_SCALE[venue]
        for row in rows:
            if isinstance(row, list) and len(row) >= min_len:
                raw_t = str(row[idx_t]).strip()
                if raw_t.isdigit():
                    t_sec = int(raw_t) // 1000 if scale == "MS" else int(raw_t)
                    if t_sec == expected_start:
                        open_p = self._normalize_price_str(row[idx_o])
                        close_p = self._normalize_price_str(row[idx_c])
                        if len(open_p) > 0 and len(close_p) > 0:
                            direction = OUTCOME_BULL if self._price_greater(close_p, open_p) else OUTCOME_BEAR
                            return {
                                "valid": True, "venue": venue, "pair": pair,
                                "candle_start": str(expected_start), "candle_end": str(expected_end),
                                "open": open_p, "close": close_p, "direction": direction
                            }
        return {"valid": False, "reason": "TIMESTAMP_MISMATCH"}

    def _tally_votes(self, asset: str, start_time: int, end_time: int, venue_data: dict) -> dict:
        bull_votes = 0
        bear_votes = 0
        invalid_votes = 0
        
        for venue in EXCHANGE_VENUES:
            record = venue_data[venue]
            if record.get("valid") is True and record.get("direction") == OUTCOME_BULL:
                bull_votes += 1
            elif record.get("valid") is True and record.get("direction") == OUTCOME_BEAR:
                bear_votes += 1
            else:
                invalid_votes += 1
                
        outcome = OUTCOME_INCONCLUSIVE
        if bull_votes >= CONSENSUS_QUORUM_TARGET:
            outcome = OUTCOME_BULL
        elif bear_votes >= CONSENSUS_QUORUM_TARGET:
            outcome = OUTCOME_BEAR

        return {
            "asset": asset, "candle_start": str(start_time), "candle_end": str(end_time),
            "outcome": outcome, "bull_votes": bull_votes, "bear_votes": bear_votes,
            "invalid_votes": invalid_votes, "venues": venue_data
        }

    def _validate_consensus_structure(self, proposal: typing.Any, asset: str, start_time: int, end_time: int) -> bool:
        if not isinstance(proposal, dict):
            return False
        if proposal.get("asset") != asset or proposal.get("candle_start") != str(start_time) or proposal.get("candle_end") != str(end_time):
            return False
        return True

    def _verify_evidence_equivalence(self, proposal: dict, validator_tally: dict) -> bool:
        if proposal.get("outcome") != validator_tally.get("outcome"):
            return False
        return True

    # -------------------------------------------------------------------------
    # Helper Utilities
    # -------------------------------------------------------------------------

    def _normalize_price_str(self, val: typing.Any) -> str:
        text = str(val).strip()
        parts = text.split(".")
        if len(parts) > 2 or not parts[0].isdigit():
            return ""
        whole = parts[0].lstrip("0") or "0"
        frac = parts[1].rstrip("0") if len(parts) == 2 else ""
        return whole + ("." + frac if frac else "")

    def _price_greater(self, left: str, right: str) -> bool:
        l_parts = left.split(".")
        r_parts = right.split(".")
        if len(l_parts[0]) != len(r_parts[0]):
            return len(l_parts[0]) > len(r_parts[0])
        if l_parts[0] != r_parts[0]:
            return l_parts[0] > r_parts[0]
        l_f = l_parts[1] if len(l_parts) == 2 else ""
        r_f = r_parts[1] if len(r_parts) == 2 else ""
        w = max(len(l_f), len(r_f))
        return l_f.ljust(w, "0") > r_f.ljust(w, "0")

    def _unwrap_response(self, response: typing.Any) -> typing.Tuple[int, str]:
        status = 200
        if hasattr(response, "status_code"):
            status = int(response.status_code)
        elif hasattr(response, "status"):
            status = int(response.status)
        body_val = response.body if hasattr(response, "body") else ""
        body = body_val.decode("utf-8", errors="replace") if isinstance(body_val, bytes) else str(body_val)
        return status, body

    def _empty_consensus_payload(self, outcome: str, reason: str) -> dict:
        return {"outcome": outcome, "reason": reason, "bull_votes": 0, "bear_votes": 0, "venues": {}}

    def _complete_market_lifecycle(self, vortex_id: u256, market: dict, state: str, outcome: str, summary: dict) -> None:
        market["state"] = state
        market["outcome"] = outcome
        market["resolved_at"] = str(self._current_timestamp())
        market["consensus_summary"] = summary
        self.active_market_count = self.active_market_count - u256(1)
        self._write_market(vortex_id, market)

    def _calculate_payout_share(self, market: dict, position_key: str) -> u256:
        outcome = self._read_str(market, "outcome")
        total_pool = self._read_uint(market, "aggregate_pool_total")
        
        if outcome == OUTCOME_BULL:
            stake = self._get_staked_val(self.bull_pool_stakes, position_key)
            winning_pool = self._read_uint(market, "bull_pool_total")
        elif outcome == OUTCOME_BEAR:
            stake = self._get_staked_val(self.bear_pool_stakes, position_key)
            winning_pool = self._read_uint(market, "bear_pool_total")
        else:
            return u256(0)
            
        if stake == u256(0) or winning_pool == u256(0):
            return u256(0)
        return stake * total_pool // winning_pool

    def _record_claim(self, position_key: str, amount: u256) -> None:
        self._set_flag(self.claim_audit_flags, position_key, True)
        self._set_staked_val(self.disbursed_claim_amounts, position_key, amount)

    def _construct_question(self, pair: str, start_t: int, end_t: int) -> str:
        return "Will " + pair + " close higher than open during 1H interval?"

    def _format_market_key(self, asset: str, time_frame: str, candle_start: u256) -> str:
        return asset + ":" + time_frame + ":" + str(candle_start)

    def _format_position_key(self, vortex_id: u256, wallet: str) -> str:
        return str(vortex_id) + ":" + wallet

    def _sanitize_direction(self, direction: str) -> str:
        clean = str(direction).strip().upper()
        if clean != OUTCOME_BULL and clean != OUTCOME_BEAR:
            raise gl.vm.UserError("Invalid direction: Target must be BULL or BEAR")
        return clean

    def _fetch_market(self, vortex_id: u256) -> dict:
        key = str(vortex_id)
        if vortex_id >= self.vortex_counter or key not in self.markets:
            raise gl.vm.UserError("Invalid vortex ID: Market record not found")
        return json.loads(self.markets[key])

    def _write_market(self, vortex_id: u256, market: dict) -> None:
        self.markets[str(vortex_id)] = self._serialize(market)

    def _read_uint(self, record: dict, key: str) -> u256:
        return u256(int(str(record[key])))

    def _read_str(self, record: dict, key: str) -> str:
        return str(record[key])

    def _get_staked_val(self, store: TreeMap[str, str], key: str) -> u256:
        return u256(0) if key not in store else u256(int(store[key]))

    def _set_staked_val(self, store: TreeMap[str, str], key: str, val: u256) -> None:
        store[key] = str(val)

    def _read_flag(self, store: TreeMap[str, str], key: str) -> bool:
        return store.get(key) == "true"

    def _set_flag(self, store: TreeMap[str, str], key: str, val: bool) -> None:
        store[key] = "true" if val else "false"

    def _register_global_id(self, vortex_id: u256) -> None:
        seq = json.loads(self.market_id_sequence)
        seq.append(str(vortex_id))
        self.market_id_sequence = self._serialize(seq)

    def _link_user_market(self, wallet: str, vortex_id: u256) -> None:
        seq = json.loads(self.user_position_index[wallet]) if wallet in self.user_position_index else []
        if str(vortex_id) not in seq:
            seq.append(str(vortex_id))
            self.user_position_index[wallet] = self._serialize(seq)

    def _serialize(self, val: typing.Any) -> str:
        return json.dumps(val, sort_keys=True, separators=(",", ":"))

    def _caller(self) -> str:
        return self._clean_address(str(gl.message.sender_address))

    def _clean_address(self, val: str) -> str:
        addr = str(val).strip().lower()
        if len(addr) != 42 or not addr.startswith("0x"):
            raise gl.vm.UserError("Invalid address format")
        return addr

    def _current_timestamp(self) -> u256:
        raw_dt = str(gl.message_raw["datetime"])
        return u256(self._parse_iso_utc(raw_dt))

    def _parse_iso_utc(self, dt_str: str) -> int:
        # ISO timestamp parsing into Unix epoch seconds
        y = int(dt_str[0:4])
        m = int(dt_str[5:7])
        d = int(dt_str[8:10])
        h = int(dt_str[11:13])
        mn = int(dt_str[14:16])
        s = int(dt_str[17:19])
        
        # Calculate days since Unix epoch
        adj_y = y - 1 if m <= 2 else y
        era = adj_y // 400
        y_era = adj_y - era * 400
        m_part = m - 3 if m > 2 else m + 9
        d_yr = (153 * m_part + 2) // 5 + d - 1
        days = era * 146097 + y_era * 365 + y_era // 4 - y_era // 100 + d_yr - 719468
        return days * 86400 + h * 3600 + mn * 60 + s
