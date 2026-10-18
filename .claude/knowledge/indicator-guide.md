# Trading Indicator Knowledge Base

## Agent Team Overview

| Agent | Role | Invoke By |
|-------|------|-----------|
| **indicator-specialist** | Codes & optimizes PineScript indicators | "implement/code this indicator" |
| **indicator-researcher** | Finds the most accurate indicators from open-source & community | "find new indicators", "search for better X" |
| **market-analyst** | Determines best indicators per market | "which indicators work best for WTI?" |
| **strategy-researcher** | Studies Trading Alpha, Invest Answers, Wicks systems | "what does Trading Alpha use?" |
| **market-scanner** | Scans for active setups across markets | "scan for squeeze setups on crypto" |

## PineScript Indicator Collection

### 1. Alpha Squeeze Momentum (`alpha_squeeze_momentum.pine`)
**Inspired by**: Trading Alpha HTF/LTF Suite
**What it does**: Detects volatility compression (Bollinger inside Keltner) and predicts breakout direction using momentum
**Key signals**:
- Yellow background = high energy squeeze (compression > 6 bars)
- Orange dots = squeeze active
- Green dots = squeeze off (fired)
- Green/red histogram = momentum direction and strength
- Triangle arrows = breakout direction when squeeze fires
**Best for**: All markets. Especially powerful on crypto and WTI daily/4H
**Parameters**: BB(20,2.0), KC(20,1.5), Momentum(20)

### 2. Alpha Trend System (`alpha_trend_system.pine`)
**Inspired by**: Trading Alpha Trend VIP + AlphaTrend by KivancOzbilgic
**What it does**: Dual micro/macro trend analysis with ATR trailing stops. Eliminates fakeouts by requiring both scales to confirm
**Key signals**:
- Bar colors: bright green (strong bull) → gray (neutral) → bright red (strong bear)
- Micro trend dots: earliest signal of changing dynamics
- Confirmed reversal labels: micro + trail both confirm
- Yellow diamonds: potential tops/bottoms (early warning)
- Trend cloud between fast and mid MAs
**Best for**: All markets. Swing trading on Daily/4H
**Parameters**: Macro EMA(200), Mid EMA(55), Micro EMA(21), ATR(14, 1.0)

### 3. Wick Analysis Pro (`wick_analysis_pro.pine`)
**Inspired by**: Wicks Trading System + ICT Methodology
**What it does**: Detects wick rejections, liquidity sweeps, wick fill zones, and multi-wick confluence
**Key signals**:
- Triangle up/down = strong wick rejection (score 3+/5)
- Yellow diamonds = ICT liquidity sweep detected
- Labeled signals with score out of 5
- Dotted boxes = wick fill probability zones
**Score components**: Wick ratio + volume confirmation + liquidity sweep + zone accumulation + close direction
**Best for**: Forex and crypto. Works on all timeframes, best on 4H/Daily

### 4. InvestAnswers ATR-DCA System (`invest_answers_atr_dca.pine`)
**Inspired by**: James Mullarney's Augmented Trading Range + DCAS methodology
**What it does**: ATR-based trading range with smart DCA zone detection and risk management
**RESEARCH NOTE (2026-03-17)**: Deep dive research revealed major corrections needed:
- IA's "ATR" = "Augmented Trading Range" (proprietary), NOT standard Average True Range
- IA's DCAS = zero-line oscillator with variable multipliers (0.5x-3x), NOT fixed price zones
- IA's full system includes IADSS (4 components), TABI (15+ on-chain metrics), LILO (10-level
  price ladder), Arb Cloud, Macro Model, and more
- See: `.claude/research/invest_answers_deep_dive.md` for full findings
**Key signals**:
- Yellow band = inner trading range (normal volatility)
- Orange band = extreme range (mean-reversion zone)
- Green DCA zone levels = progressive discount buying zones
- "DCA" labels = smart entry (discount zone + RSI oversold + momentum turning)
- "TP" labels = take profit (range extreme + RSI overbought + fading momentum)
- Red "X" = risk warning (overextended + divergence)
**Best for**: Crypto (BTC, ETH, SOL), disruptive tech stocks. Swing/position trading
**Parameters**: ATR(14), Range EMA(21), Inner mult(1.5), Outer mult(2.5), EMAs 21/55/200
**Needs revision**: DCAS should be oscillator-based with multiplier output; ATR should include trend cloud

### 5. Alpha Confirmation Suite (`alpha_confirmation_suite.pine`)
**Inspired by**: Trading Alpha Confirmation indicators
**What it does**: Custom RSI with momentum lines, institutional thrust measurement, and divergence detection
**Key signals**:
- RSI line with fast/slow momentum overlay (cross = momentum shift)
- Column histogram = Alpha Thrust (institutional buying/selling pressure)
- "BULL DIV" / "BEAR DIV" labels = regular divergences
- Small triangles = hidden divergences (trend continuation)
- Background highlight on RSI overbought/oversold
- Confirmation score 0-5 for bull/bear probability
**Best for**: Confirmation of setups from other indicators. All markets
**Parameters**: RSI(14), Fast momentum(5), Slow momentum(13), Thrust(14,3)

### 6. TD Sequential 9 (`td_sequential_9.pine`)
**Inspired by**: Tom DeMark's TD Sequential (used in Trading Alpha's TD9 system)
**What it does**: Counts consecutive closes vs 4-bar-ago closes to detect exhaustion
**Key signals**:
- Numbers 1-9 above/below candles (setup phase)
- "9" with background highlight = potential exhaustion
- "9✓" = perfected setup (higher confidence)
- Countdown 1-13 after setup completes
- "13" = trend exhaustion confirmed
**IMPORTANT**: Use privately only — do not publish on TradingView (DeMark trademark)
**Best for**: All markets. Timing entries at exhaustion points. Daily/Weekly

### 7. Multi-Market Dashboard (`multi_market_dashboard.pine`)
**What it does**: Combines ALL indicator signals into one dashboard with net score
**Key features**:
- Status table showing every indicator's current state
- Net score histogram (-10 to +10)
- Squeeze, RSI, MACD, ADX, Wick, Volume, TD9, OBV all in one view
- Yellow background = active squeeze
**Best for**: Quick overview of any asset's technical picture

### 8. IA Mean Reversion (`ia_mean_reversion.pine`)
**Inspired by**: IADSS Mean Reversion component
**What it does**: Standard deviation bands with directional reversal dots
**Key signals**: Band touches, 30% double-tap entry, noise suppression (~30 default)
**Best for**: Range-bound conditions, crypto and equities

### 9. IA Confluence Model (`ia_confluence_model.pine`)
**Inspired by**: IADSS Confluence Model component
**What it does**: Multi-banded Bollinger (1σ, 2σ, 3σ) with break/reintegration signals
**Best for**: Identifying confluence zones across deviation levels

### 10. Sentiment Bias Overlay (`sentiment_bias_overlay.pine`)
**What it does**: Manual sentiment input layer for directional bias
**Best for**: Overlaying macro sentiment context on technical charts

### 11. WaveTrend Oscillator (`wavetrend_oscillator.pine`) — NEW
**Based on**: LazyBear's WaveTrend (allegedly used in Trading Alpha)
**What it does**: Versatile reversal detection oscillator with divergence detection
**Key signals**:
- WT1 (cyan) and WT2 (orange) lines with cross signals
- Green/red dots at crosses in OB/OS zones (60/-60)
- Diamond shapes for extreme zone crosses (80/-80)
- Histogram showing momentum spread
- Regular bullish/bearish divergence with line drawing
**Calculation**: AP=hlc3, ESA=EMA(AP,10), D=EMA(|AP-ESA|,10), CI=(AP-ESA)/(0.015*D), WT1=EMA(CI,21), WT2=SMA(WT1,4)
**Best for**: All markets. Crypto and forex 1H-Daily. Strong in overbought/oversold reversal detection
**Parameters**: Channel(10), Average(21), Signal(4), OB(60), OS(-60)

### 12. ML Lorentzian Classification (`ml_lorentzian_classification.pine`) — NEW
**Based on**: jdehorty's open-source KNN classifier (Mozilla Public License 2.0)
**What it does**: Machine learning pattern classification using Lorentzian distance metric
**Key signals**:
- Green/red arrows for buy/sell classifications
- Background shading showing classification confidence
- Feature info table with neighbor vote counts
**Features used**: RSI(14), WaveTrend, CCI(20), ADX(14), RSI(9) — all z-score normalized
**Filters**: SMA(200) regime filter, ATR volatility filter, ADX trend filter, minimum bar spacing
**Best for**: All markets. 1H, 4H, Daily. Adds ML dimension missing from rest of collection
**Parameters**: K=8 neighbors, 50-bar normalization window, EMA(3) output smoothing

### 13. Ehlers DSP Suite (`ehlers_dsp_suite.pine`) — NEW
**Based on**: John Ehlers' digital signal processing (Rocket Science for Traders)
**What it does**: Three modes — Fisher Transform, Super Smoother Momentum, Cycle Period
**Key components**:
- Super Smoother: 2-pole filter with minimal lag, superior to any moving average
- Fisher Transform: Converts price to Gaussian distribution, amplifies turning points
- Dominant Cycle: Estimates current market cycle period
- Instantaneous Trendline: Zero-lag trendline using Hilbert Transform
**Best for**: Cycle-adaptive analysis. Forex and commodities. Fisher Transform excellent for reversals
**Parameters**: SS Length(10), Fisher Lookback(10), Cycle Min(6)/Max(50)

### 14. Smart Money Concepts (`smart_money_concepts.pine`) — NEW
**Based on**: ICT methodology + LuxAlgo open-source detection logic
**What it does**: Complete SMC indicator — Order Blocks, FVGs, BOS/CHoCH, Liquidity Sweeps
**Key signals**:
- BOS (Break of Structure) labels with trend lines
- CHoCH (Change of Character) labels with dashed lines
- Fair Value Gap boxes (cyan=bullish, orange=bearish) with mitigation tracking
- Order Block boxes with age-based expiry
- Liquidity sweep labels (yellow diamonds)
- Premium/Discount zone background shading
- Equilibrium line
**Best for**: Forex, crypto, indices. Institutional order flow analysis. 15min-Daily
**Parameters**: Swing(5), FVG Filter(Aggressive/Moderate/Conservative), FVG/OB Max Age(50)

### 15. Volatility Regime Detector (`volatility_regime_detector.pine`) — NEW
**What it does**: Classifies market into 5 regimes using composite of 4 methods
**Components**:
- ADX for trend strength
- Choppiness Index for range detection
- Random Walk Index for trend validity
- Hurst Exponent proxy for persistence/mean-reversion
**Regimes**: Strong Trend → Trending → Transitioning → Ranging → Choppy
**Composite score**: -100 to +100 (positive=trending, negative=ranging)
**Best for**: Meta-indicator — tells you WHICH other indicators to use
- Trending regime: Use Alpha Trend, Squeeze Momentum, WaveTrend
- Ranging regime: Use IA Mean Reversion, Wick Analysis, Ehlers Fisher Transform
**Parameters**: ADX(14), Choppiness(14), RWI(14), Vol Regime Lookback(50)

## Indicator Effectiveness by Market

### WTI Crude Oil — Best Indicator Stack
1. Alpha Trend System (EMA 20/50/200 for persistent trends)
2. Alpha Squeeze Momentum (catches breakouts after OPEC/inventory compression)
3. Volatility Regime Detector (know when to trend-follow vs mean-revert)
4. ACS v2 — 3-line RSI alignment + thrust clusters for institutional confirmation
5. Ehlers Fisher Transform (cycle-adaptive reversal detection for commodities)

### Bitcoin — Best Indicator Stack
1. Alpha Squeeze Momentum (volatility compression is incredibly powerful here)
2. InvestAnswers ATR-DCA (DCA zones + DCAS multiplier system)
3. Smart Money Concepts (FVGs + liquidity sweeps dominate crypto)
4. WaveTrend Oscillator (reversal detection at extreme zones)
5. ML Lorentzian Classification (pattern recognition adapts to BTC's regime shifts)

### Forex — Best Indicator Stack
1. Smart Money Concepts (ICT methodology dominant in forex — BOS/CHoCH/FVGs)
2. Wick Analysis Pro (wick rejections + liquidity sweeps at key levels)
3. WaveTrend Oscillator (oversold/overbought reversals)
4. Alpha Confirmation Suite v2 (3-line RSI divergences + institutional thrust)
5. Volatility Regime Detector (avoid choppy sessions, trade trending Kill Zones)

### Equities — Best Indicator Stack
1. Alpha Trend System (SMA 50/200 golden/death cross)
2. ML Lorentzian Classification (KNN adapts well to equity patterns)
3. ACS v2 — thrust clusters detect institutional accumulation/distribution
4. Ehlers DSP Suite (Super Smoother momentum + Fisher Transform)
5. TD Sequential 9 (timing entries at exhaustion)

## Indicator Expansion Pipeline (Iterations 7-8 Discovery)

### Tier 1 -- Implement Immediately (Critical Gaps)
| Indicator | Gap Filled | Markets | Source |
|-----------|-----------|---------|--------|
| Cumulative Volume Delta | Volume/Order Flow | All | Pine v6 native |
| Smart Money Concepts (BOS/CHoCH/FVG) | Market Structure | All | LuxAlgo open-source |
| Volatility Regime Classifier | Regime Detection | All | k-means clustering |
| COT Positioning Index | Commodities Positioning | WTI/Commodities | TradingView LibraryCOT |
| Contango/Backwardation Monitor | Futures Term Structure | WTI | twingall open-source |

### Tier 2 -- Implement Next (High Value-Add)
| Indicator | Gap Filled | Markets | Source |
|-----------|-----------|---------|--------|
| Nadaraya-Watson Envelope | ML Envelopes/Mean-Reversion | All | LuxAlgo open-source |
| Ehlers MAMA/FAMA | Adaptive Cycle Analysis | All | MESA Software / DasanC |
| Supply & Demand Zones | Auto Zone Detection | All | BigBeluga/AlgoAlpha |
| Anchored VWAP | Volume-Weighted Levels | All | Community scripts |
| Liquidation Heatmap | Crypto Leverage Clusters | Crypto | Alien_Algorithms |

### Tier 3 -- When Resources Allow
| Indicator | Gap Filled | Markets |
|-----------|-----------|---------|
| Funding Rate + OI Composite | Crypto Derivatives | Crypto |
| Volume Profile | Volume Distribution | All |
| Fear & Greed On-Chain Proxy | Crypto Sentiment | Crypto |
| Twin Range Filter | Alternative Trend | All |
| Seasonal Patterns | Time-Based Analysis | WTI/BTC |

Full research: `.claude/research/indicator-discovery-iterations-7-8.md`

## Open Source Resources for Continuous Improvement

### Python Libraries (for backtesting)
- `pandas-ta`: 130+ indicators — pip install pandas_ta
- `ta-lib`: Industry standard — pip install TA-Lib
- `vectorbt`: Vectorized backtesting — pip install vectorbt
- `jesse`: Full trading framework — pip install jesse

### GitHub Repos to Watch
- `freqtrade/freqtrade` — Crypto trading bot with community strategies
- `jesse-ai/jesse` — Python framework with tested strategies
- `Drakkar-Software/OctoBot` — Open-source crypto trading
- `GiustiRo/squeezem-adx-ttm` — PineScript squeeze + ADX + TTM

### TradingView Creators to Follow
- KivancOzbilgic (AlphaTrend, Trend Magic)
- LazyBear (Squeeze Momentum original)
- LuxAlgo (Smart Money Concepts)
- AlgoAlpha (Advanced oscillators)
- ChrisMoody (Volume-based indicators)

## System Cross-Reference

| Indicator | Trading Alpha | Invest Answers | Wicks Trading |
|-----------|:---:|:---:|:---:|
| Squeeze Momentum | ✅ Core | — | — |
| Trend MAs | ✅ Trend Bars | ✅ IADSS Trend | ✅ Trend context |
| Augmented Range | — | ✅ ATR (Core) | — |
| RSI + Divergence | ✅ Alpha RSI | ✅ IADSS Mean Rev | ✅ Confluence |
| Wick Analysis | — | — | ✅ Core |
| TD Sequential | ✅ TD9 | — | — |
| Volume/Thrust | ✅ Alpha Thrust | — | ✅ Vol confirm |
| Fibonacci | — | — | ✅ Fib + Wick |
| DCA Oscillator | — | ✅ DCAS (multiplier) | — |
| ICT Liquidity | — | — | ✅ Sweep detect |
| Multi-Band Bollinger | — | ✅ IADSS Confluence | — |
| On-Chain Metrics | — | ✅ TABI (15+ metrics) | — |
| Macro Composite | — | ✅ Macro Model (12+) | — |
| Cointegration Arb | — | ✅ Arb Cloud | — |
| Layer In/Out | — | ✅ LILO (10 levels) | — |
| Pair Hedging | — | ✅ Pair Trading | — |

**Note**: Invest Answers' "ATR" = "Augmented Trading Range" (proprietary), NOT standard Average True Range.
See `.claude/research/invest_answers_deep_dive.md` for full research (2026-03-17).

## ICT (Inner Circle Trader) Methodology — Quick Reference

### Core Concepts (all mathematically defined, fully programmable)

| Concept | Definition | Detection Rule |
|---------|------------|----------------|
| **Fair Value Gap (FVG)** | 3-candle gap where candle 1 high < candle 3 low (bullish) or candle 1 low > candle 3 high (bearish) | `low > high[2]` (bull) / `high < low[2]` (bear) |
| **Order Block (OB)** | Last opposing candle before displacement; zone of institutional order placement | Volume pivot peak + opposing candle direction |
| **Breaker Block** | Failed OB that sweeps liquidity before reversing; flips S/R role | OB broken after liquidity sweep |
| **Mitigation Block** | Failed OB without liquidity sweep; fading momentum | OB broken without new high/low |
| **Market Structure Shift (MSS)** | Swing break with displacement + FVG; strongest reversal signal | Body close through swing + large candle + small wick |
| **Liquidity Sweep** | Price briefly exceeds key level then reverses back inside range | `low < prior_low AND close > prior_low` |
| **OTE (Optimal Trade Entry)** | 61.8%-78.6% Fibonacci retracement zone; sweet spot at 70.5% | Fibonacci from swing low to swing high |
| **Kill Zones** | London 2-5AM ET, NY 7-10AM ET, Asian 7-10PM ET, LC 10AM-12PM ET | Time-based filter |
| **Power of Three (AMD)** | Accumulation (7PM-1AM), Manipulation (1AM-7AM), Distribution (7AM-1PM) | Session-based phase detection |
| **IPDA Ranges** | 20/40/60 day lookback for institutional targets | `ta.highest(high, 20/40/60)` and `ta.lowest(low, 20/40/60)` |
| **Displacement** | 3+ same-direction candles with large bodies, small wicks, creating FVG | Consecutive candles + body > ATR * 0.5 + wick < body * 0.3 |
| **Inducement** | Deceptive move targeting short-term stops before reversal | Price dip/spike beyond short-term high/low then reversal |

### ICT Integration with Existing Indicators
- **Wick Analysis Pro**: Wick rejections = liquidity sweeps in ICT terms. Add FVG/OB confluence for higher conviction
- **Alpha Squeeze Momentum**: Squeeze fire + ICT displacement = confirmed institutional breakout
- **Alpha Confirmation Suite**: RSI divergence at an Order Block = multi-system confluence

### Key Statistical Findings (Wick/Candlestick Research)
- 66% of 75 candlestick patterns outperform S&P 500 buy-and-hold (QuantifiedStrategies backtest)
- Hammer is #2 most effective single pattern; daily timeframe most reliable
- Pin bars at psychological levels have 15-20% higher success vs random locations
- "Bearish" patterns often work better as bullish signals (counter-intuitive finding)
- 12 patterns with profit factor >1.5 combine for 12.89% CAGR, 2.02 profit factor

### Top TradingView ICT/SMC Scripts
1. Smart Money Concepts (SMC) [LuxAlgo] — open source, most widely used
2. Hybrid Smart Money Concepts [MarkitTick] — statistical stress model + SMC
3. Order Block Detector [LuxAlgo] — volume-based OB detection
4. Fair Value Gap [LuxAlgo] — fill tracking + ATR threshold
5. ICT Power Of Three [Flux Charts] — AMD detection with backtesting

Full research: `research/ict-methodology-wick-analysis-deep-dive.md` (2026-03-17).
