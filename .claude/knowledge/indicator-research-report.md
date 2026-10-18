# Exhaustive Indicator Research Report
## Date: 2026-03-17
## Researcher: indicator-researcher agent

---

# EXECUTIVE SUMMARY

After exhaustive research across TradingView community scripts, GitHub repositories, academic literature, and quantitative blogs, I have identified **25 high-value indicators** that would meaningfully expand our current 8-indicator collection. These are ranked by value-add -- how much NEW capability they bring that our existing suite does not cover.

## Current Collection Gaps Identified

Our current suite covers: Squeeze Momentum, Trend/MA System, Wick Analysis, ATR-DCA, RSI/Divergence/Thrust, TD Sequential, Dashboard, and Sentiment Overlay.

**What we are MISSING:**
1. Smart Money Concepts (Order Blocks, FVGs, BOS/CHoCH)
2. Machine Learning classification (Lorentzian KNN)
3. Volume Profile / VWAP anchored analysis
4. Cumulative Delta Volume (order flow proxy)
5. Wyckoff phase detection
6. Williams Vix Fix (market bottom detection)
7. WaveTrend Oscillator
8. Nadaraya-Watson kernel regression envelopes
9. COT (Commitment of Traders) for commodities
10. Session/Kill Zone analysis for forex
11. Laguerre RSI (less lag, fewer whipsaws than standard RSI)
12. Range Filter (trend noise reduction)
13. Ichimoku Cloud (complete system we lack entirely)
14. On-chain metrics proxy for crypto
15. Supertrend (simple but proven trend-following)
16. Elliott Wave automated detection
17. Seasonal pattern overlay

---

# TOP 25 INDICATORS TO ADD -- RANKED BY VALUE-ADD

---

## RANK 1: Machine Learning Lorentzian Classification

```
=====================================================
INDICATOR DISCOVERY: ML Lorentzian Classification
=====================================================

Source: TradingView (open-source)
Author: jdehorty
License: Mozilla Public License 2.0

SCORES:
  Accuracy:       ######### 9/10
  Robustness:     ######## 8/10
  Novelty:        ########## 10/10
  Implementation: ####### 7/10
  OVERALL:        ######## 8.5/10

WHAT IT DOES:
Uses k-Nearest Neighbors (KNN) algorithm with Lorentzian distance
metric instead of Euclidean distance to classify current market
conditions. Searches historical price neighborhoods similar to
current state. Each neighbor votes on what happened next, aggregating
into a classification score. Lorentzian distance is more robust to
outliers and market "warping" during high-volatility events.

WHY IT IS VALUABLE:
Nothing in our current collection uses machine learning. This adds
an entirely new dimension -- statistical pattern recognition that
adapts to the specific instrument and timeframe. Features used:
RSI(14), WaveTrend, CCI(20), ADX(14) -- all z-score normalized.

BEST MARKETS: All (Crypto, Forex, Equities, Commodities)
BEST TIMEFRAMES: 1H, 4H, Daily

PARAMETER DEFAULTS:
  - Neighbors (K): 8
  - Feature count: 4 (RSI, WT, CCI, ADX)
  - Z-score normalization window: 50 bars
  - Smoothing: EMA(3) on output score

KNOWN LIMITATIONS:
  - Computationally intensive; may timeout on 10,000+ bar charts
  - Not a standalone system -- best as signal confirmation
  - Can repaint on the current bar (wait for bar close)

PINESCRIPT CONVERSION: Already PineScript (open-source on TV)
STATUS: Ready to implement
```

---

## RANK 2: Smart Money Concepts (LuxAlgo SMC)

```
=====================================================
INDICATOR DISCOVERY: Smart Money Concepts (SMC)
=====================================================

Source: TradingView (open-source) + GitHub Python library
Author: LuxAlgo (TV) / joshyattridge (GitHub Python)
License: Open-source on TradingView / MIT on GitHub

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######## 8/10
  Novelty:        ######### 9/10
  Implementation: ######### 9/10
  OVERALL:        ######## 8.5/10

WHAT IT DOES:
All-in-one price action framework that automatically detects:
  - Market Structure: BOS (Break of Structure) and CHoCH (Change of Character)
  - Order Blocks: Zones where institutional orders cluster
  - Fair Value Gaps (FVGs): Price imbalances between buyers/sellers
  - Equal Highs/Lows: Liquidity pools
  - Premium/Discount Zones: Value areas relative to range
  - Swing Points: HH, HL, LH, LL annotations

WHY IT IS VALUABLE:
Our Wick Analysis Pro covers liquidity sweeps but lacks the full
SMC framework. This is TradingView's MOST liked free indicator
for good reason -- it automates what ICT traders do manually.
The Python library (joshyattridge/smart-money-concepts) enables
backtesting these concepts programmatically.

BEST MARKETS: Forex, Crypto, Equities (any liquid market)
BEST TIMEFRAMES: All (15m to Weekly)

PARAMETER DEFAULTS:
  - Swing length: 50 (internal), 50 (swing)
  - Show internal structure: true
  - Show swing structure: true
  - Order block count: 5 most recent
  - FVG filter: on

KNOWN LIMITATIONS:
  - Can be visually cluttered with all features enabled
  - Order blocks require discretionary interpretation
  - Works best in trending markets; less useful in tight ranges

PINESCRIPT CONVERSION: Already PineScript v5 (open-source)
STATUS: Ready to implement
```

---

## RANK 3: WaveTrend Oscillator

```
=====================================================
INDICATOR DISCOVERY: WaveTrend Oscillator
=====================================================

Source: TradingView (open-source)
Author: LazyBear (port)
License: Open-source

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######### 9/10
  Novelty:        ####### 7/10
  Implementation: ########## 10/10
  OVERALL:        ######## 8.5/10

WHAT IT DOES:
Oscillator that identifies overbought/oversold conditions with
better signal quality than standard RSI. Calculates average price
(hlc3), applies EMA smoothing, measures deviation, normalizes
with another EMA, and creates two crossing signal lines. Produces
clean reversal signals when lines cross in extreme zones.

WHY IT IS VALUABLE:
LazyBear himself recommends combining WaveTrend with Squeeze
Momentum for the best results. Our collection has Squeeze but
lacks a quality oscillator beyond RSI. WaveTrend is used as one
of the 4 features in the Lorentzian Classification ML indicator,
proving its predictive value. Works as excellent entry timing tool.

BEST MARKETS: All markets
BEST TIMEFRAMES: All (particularly 1H, 4H, Daily)

PARAMETER DEFAULTS:
  - Channel Length: 10
  - Average Length: 21
  - Overbought Level 1: 60, Level 2: 53
  - Oversold Level 1: -60, Level 2: -53

KNOWN LIMITATIONS:
  - Can stay overbought/oversold during strong trends
  - Best combined with trend filter (not standalone)

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement
```

---

## RANK 4: Williams Vix Fix (Market Bottom Detector)

```
=====================================================
INDICATOR DISCOVERY: CM_Williams_Vix_Fix
=====================================================

Source: TradingView (open-source)
Author: ChrisMoody (TV implementation), Larry Williams (original)
License: Open-source

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######### 9/10
  Novelty:        ######### 9/10
  Implementation: ########## 10/10
  OVERALL:        ######### 9.0/10

WHAT IT DOES:
Creates a "synthetic VIX" for ANY asset (not just S&P 500).
Formula: ((Highest Close over 22 bars - Current Low) / Highest Close) * 100.
When this percentage spikes high, fear is elevated -- historically
preceding short-term bounces. Includes Bollinger Bands to identify
when fear readings are STATISTICALLY significant.

WHY IT IS VALUABLE:
We have NO dedicated bottom-detection indicator. Our ATR-DCA
system identifies discount zones, but Williams Vix Fix specifically
measures fear/volatility extremes -- a fundamentally different
approach. Works on crypto, forex, commodities, equities -- anything.
The extended version also detects market tops.

BEST MARKETS: All markets (originally designed for equities)
BEST TIMEFRAMES: Daily (primary), works on intraday

PARAMETER DEFAULTS:
  - Period: 22 (trading days in a month)
  - BB Length: 20
  - BB Multiplier: 2.0
  - Percentile lookback: 50
  - Highest percentile: 0.85

KNOWN LIMITATIONS:
  - Better at bottoms than tops (inverse version less reliable)
  - Best on Daily; noisier on lower timeframes
  - Signals mean "fear is high" not "buy now" -- needs confirmation

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement
```

---

## RANK 5: Cumulative Delta Volume (Order Flow Proxy)

```
=====================================================
INDICATOR DISCOVERY: Cumulative Delta Volume
=====================================================

Source: TradingView (built-in + community)
Author: LonesomeTheBlue (community), TradingView (official)
License: Open-source

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ####### 7/10
  Novelty:        ######### 9/10
  Implementation: ######## 8/10
  OVERALL:        ####### 7.75/10

WHAT IT DOES:
Estimates the difference between buying and selling pressure
within each bar. The official TV version uses intrabar analysis
(lower timeframe data) for accuracy. The OHLC approximation:
Delta = Volume * (Close - Open) / (High - Low). Cumulates
this delta over time to show the running total of buy vs sell.

WHY IT IS VALUABLE:
We have ZERO order flow indicators. Cumulative delta reveals
divergences between price and actual buying/selling pressure.
When price makes new highs but delta makes lower highs =
distribution (smart money selling into retail buying). This is
the closest thing to footprint chart data available on TradingView.

BEST MARKETS: Crypto (best volume data), Futures, Forex
BEST TIMEFRAMES: 1H, 4H, Daily

PARAMETER DEFAULTS:
  - Anchor period: Daily (resets each day)
  - Lower timeframe: auto-detected
  - Display: Candlesticks or Line
  - Use OHLC approximation (fallback): true

KNOWN LIMITATIONS:
  - OHLC approximation is less accurate than tick data
  - Long shadows and small bodies distort the estimate
  - Requires volume data (some forex pairs lack it)
  - Pine v6 has ta.requestVolumeDelta() built-in

PINESCRIPT CONVERSION: Already available (multiple versions)
STATUS: Ready to implement
```

---

## RANK 6: Nadaraya-Watson Kernel Regression Envelope

```
=====================================================
INDICATOR DISCOVERY: Nadaraya-Watson Envelope
=====================================================

Source: TradingView (open-source)
Author: LuxAlgo
License: Open-source (Mozilla Public License)

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ######## 8/10
  Novelty:        ########## 10/10
  Implementation: ######## 8/10
  OVERALL:        ######## 8.25/10

WHAT IT DOES:
Uses kernel regression (a non-parametric statistical method from
the 1960s) to create a smooth trend estimate. Applies weighted
averages where closer data points get more weight. Creates dynamic
envelopes at standard-deviation multiples above/below the regression
line. These envelopes expand with volatility and contract in calm
periods -- more adaptive than Bollinger Bands.

WHY IT IS VALUABLE:
Fundamentally different from our MA-based trend system. Uses
STATISTICAL REGRESSION rather than simple/exponential averages.
The envelope provides dynamic support/resistance that adapts to
changing volatility regimes. Contrarian signals when price touches
extremes. Non-repainting version available.

BEST MARKETS: All markets
BEST TIMEFRAMES: 4H, Daily, Weekly

PARAMETER DEFAULTS:
  - Lookback Window: 500
  - Relative Weighting: 8.0
  - Start Regression at Bar: 25
  - Envelope multiplier: 3.0 (ATR-based)

KNOWN LIMITATIONS:
  - Default version REPAINTS (use non-repainting setting)
  - Computationally heavy with large lookback
  - Contrarian methodology may conflict with trend-following

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement (use non-repainting version)
```

---

## RANK 7: Anchored VWAP (Auto Swing)

```
=====================================================
INDICATOR DISCOVERY: Auto Anchored Swing VWAP
=====================================================

Source: TradingView (open-source)
Author: Amphibiantrading / liquid-trader / BigBeluga
License: Open-source

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######### 9/10
  Novelty:        ######## 8/10
  Implementation: ######### 9/10
  OVERALL:        ######## 8.5/10

WHAT IT DOES:
Automatically anchors VWAP calculations to detected swing
highs and lows. Shows the volume-weighted average price from
each significant pivot point. Institutional traders use VWAP
as their primary execution benchmark -- these levels act as
magnets for price. Auto-detection eliminates manual anchoring.

WHY IT IS VALUABLE:
We have NO VWAP indicator at all. Anchored VWAP provides
institutional-grade support/resistance levels that are volume-
weighted, not just price-based. These levels represent where
large players have average cost basis. Multiple versions exist:
session-anchored, swing-anchored, and multi-timeframe.

BEST MARKETS: Equities (primary), Crypto, Futures
BEST TIMEFRAMES: Intraday (15m-4H) for session VWAP, Daily for swing

PARAMETER DEFAULTS:
  - Pivot lookback: 10-20 bars
  - Show swing high VWAP: true
  - Show swing low VWAP: true
  - Show standard VWAP: true

KNOWN LIMITATIONS:
  - Requires reliable volume data
  - Less meaningful on weekly/monthly timeframes
  - Multiple VWAPs can clutter the chart

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement
```

---

## RANK 8: Wyckoff Phase Detector

```
=====================================================
INDICATOR DISCOVERY: Wyckoff Accumulation/Distribution
=====================================================

Source: TradingView (open-source)
Author: faytterro / Alpha Extract / ProfitSync
License: Open-source

SCORES:
  Accuracy:       ###### 6/10
  Robustness:     ####### 7/10
  Novelty:        ########## 10/10
  Implementation: ####### 7/10
  OVERALL:        ####### 7.5/10

WHAT IT DOES:
Automated detection of Wyckoff accumulation and distribution
phases using RSI, pivot points, and volume analysis. Labels
key events: Selling Climax (SC), Automatic Rally (AR), Secondary
Test (ST), Spring, Sign of Strength (SOS), Upthrust (UT), Sign of
Weakness (SOW). Phases A through E identified and color-coded.

WHY IT IS VALUABLE:
Wyckoff is the foundational framework for understanding how
institutional players accumulate and distribute positions.
Nothing in our suite detects these phases. Pairs perfectly
with our Wick Analysis Pro (which detects liquidity sweeps --
a Wyckoff "Spring" is essentially a liquidity sweep).

BEST MARKETS: All (especially equities and crypto)
BEST TIMEFRAMES: Daily, Weekly (higher timeframes for phases)

PARAMETER DEFAULTS:
  - RSI Length: 14
  - Pivot Length: 5-10
  - Volume MA Period: 20
  - Phase detection sensitivity: medium

KNOWN LIMITATIONS:
  - Wyckoff phases are inherently subjective
  - Automated detection has false positives
  - Best as a framework overlay, not precise signals
  - Phases take days/weeks to develop -- patience required

PINESCRIPT CONVERSION: Already PineScript (multiple versions)
STATUS: Ready to implement (recommend Alpha Extract version)
```

---

## RANK 9: Laguerre RSI (Ehlers)

```
=====================================================
INDICATOR DISCOVERY: Laguerre RSI
=====================================================

Source: TradingView / John Ehlers' book
Author: KivancOzbilgic (TV), John Ehlers (original)
License: Open-source

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######### 9/10
  Novelty:        ######## 8/10
  Implementation: ########## 10/10
  OVERALL:        ######## 8.75/10

WHAT IT DOES:
Variation of RSI using a four-element Laguerre filter that
creates a "time warp" -- low-frequency elements are delayed
far more than high-frequency elements. Result: more responsive
indicator with dramatically fewer whipsaws than standard RSI.
Single parameter (Alpha/Gamma) controls lag vs responsiveness.

WHY IT IS VALUABLE:
Our Alpha Confirmation Suite uses standard RSI(14). Laguerre RSI
is objectively better at reducing false signals while maintaining
responsiveness. The ATR-Adaptive version automatically adjusts
its calculation period based on volatility -- faster in volatile
markets, smoother in calm ones. Could replace or complement
our current RSI implementation.

BEST MARKETS: All markets
BEST TIMEFRAMES: All timeframes

PARAMETER DEFAULTS:
  - Alpha (gamma): 0.7 (range: 0.5-0.9)
  - Buy signal: crosses above 0.15 from below
  - Sell signal: crosses below 0.85 from above
  - Overbought: 0.8, Oversold: 0.2

KNOWN LIMITATIONS:
  - Very different visual pattern from standard RSI
  - May require adjustment period for traders used to RSI
  - Still an oscillator -- same fundamental limitations

PINESCRIPT CONVERSION: Already PineScript (multiple versions)
STATUS: Ready to implement
```

---

## RANK 10: COT (Commitment of Traders) Indicator

```
=====================================================
INDICATOR DISCOVERY: Commitment of Traders Report
=====================================================

Source: TradingView (official + community)
Author: TradingView (official), freeman7788, a_guy_from_wall_street
License: Open-source

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######### 9/10
  Novelty:        ########## 10/10
  Implementation: ######### 9/10
  OVERALL:        ######### 9.0/10

WHAT IT DOES:
Displays CFTC Commitment of Traders data directly on chart.
Shows net positioning of Commercials (hedgers), Non-Commercials
(speculators), and Retail traders. COT Index normalizes
positions to 0-100 scale for historical comparison. Extreme
readings (>90 or <10) indicate potential trend reversals.

WHY IT IS VALUABLE:
CRITICAL for WTI crude oil trading. Commercials have proven
information advantage in commodity markets. Research shows COT
analysis works BETTER for crude oil, natural gas, and agricultural
commodities than for financial futures. We trade WTI -- this is
arguably the most important missing indicator for our oil trading.

BEST MARKETS: WTI Crude (primary), all commodities, forex
BEST TIMEFRAMES: Weekly, Daily (data released weekly on Fridays)

PARAMETER DEFAULTS:
  - Report type: Legacy (default) or Disaggregated
  - Show: Net positions
  - Normalization period: 52 weeks (1 year)
  - Extreme threshold: 90/10

KNOWN LIMITATIONS:
  - Data is 3-5 days delayed (Tuesday positions, Friday release)
  - Only for position/swing trading (not intraday)
  - Extreme readings can persist for months
  - Only works for futures-traded instruments

PINESCRIPT CONVERSION: Already PineScript (TradingView official)
STATUS: Ready to implement
```

---

## RANK 11: Ichimoku Cloud (Optimized)

```
=====================================================
INDICATOR DISCOVERY: Ichimoku Cloud (Optimized Settings)
=====================================================

Source: Built-in + Community optimizations
Author: Goichi Hosoda (original), community optimization
License: Public domain

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ######### 9/10
  Novelty:        ####### 7/10
  Implementation: ########## 10/10
  OVERALL:        ######## 8.25/10

WHAT IT DOES:
Complete trading system in one indicator: trend direction (cloud),
momentum (Tenkan/Kijun cross), support/resistance (cloud edges and
Kijun), future projection (Senkou Span), and lagging confirmation
(Chikou). Five components working together provide a comprehensive
market view. Backtesting confirms default 9/26/52 remains optimal
for forex; crypto needs 20/60/120/30 for 24/7 markets.

WHY IT IS VALUABLE:
We have NO complete "system" indicator beyond our custom ones.
Ichimoku is time-tested (since 1930s), works independently, and
the cloud visualization provides instant trend context that our
MA-based system doesn't offer in the same way. Different math
provides non-redundant information.

BEST MARKETS: Forex (best), Crypto (with adjusted settings)
BEST TIMEFRAMES: 4H, Daily, Weekly

PARAMETER DEFAULTS:
  Forex: Tenkan(9), Kijun(26), Senkou(52), Displacement(26)
  Crypto: Tenkan(20), Kijun(60), Senkou(120), Displacement(30)
  Fast/Day: Tenkan(6-7), Kijun(22-24), Senkou(44-48)
  Swing: Tenkan(12), Kijun(36), Senkou(72)

KNOWN LIMITATIONS:
  - Lagging indicator -- signals come after the move starts
  - Visually complex for newcomers
  - Less effective on timeframes below 1H
  - Requires different settings for different markets

PINESCRIPT CONVERSION: Built-in on TradingView
STATUS: Ready to implement (already available -- just add to stack)
```

---

## RANK 12: Range Filter

```
=====================================================
INDICATOR DISCOVERY: Range Filter
=====================================================

Source: TradingView (open-source)
Author: DonovanWall (original), guikroth (buy/sell version)
License: Open-source

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ######## 8/10
  Novelty:        ######## 8/10
  Implementation: ########## 10/10
  OVERALL:        ######## 8.25/10

WHAT IT DOES:
Filters out minor price action for clearer trend view. Inspired
by QQE's volatility filter but applied directly to price. Calculates
smooth average price range, multiplied by specified amount. Filter
only moves when price exceeds the calculated range -- gating out
noise. Color changes indicate trend direction changes.

WHY IT IS VALUABLE:
Fundamentally different from our MA-based trend system. Instead
of averaging price, it FILTERS it -- only allowing significant
moves through. Very few inputs (source, sampling period, range
multiplier) make it robust to overfitting. The guikroth version
adds clean buy/sell signals on color changes. Can be combined
with Hull Suite for hybrid trend detection.

BEST MARKETS: All markets
BEST TIMEFRAMES: 5m to Daily (versatile)

PARAMETER DEFAULTS:
  - Source: close
  - Sampling Period: 50
  - Range Multiplier: 3.0

KNOWN LIMITATIONS:
  - Can lag in fast-moving breakouts
  - Not designed for ranging markets
  - Simplified -- may need complementary indicators

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement
```

---

## RANK 13: AlgoAlpha ML Adaptive SuperTrend

```
=====================================================
INDICATOR DISCOVERY: ML Adaptive SuperTrend
=====================================================

Source: TradingView (open-source)
Author: AlgoAlpha
License: Open-source

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######## 8/10
  Novelty:        ######### 9/10
  Implementation: ######### 9/10
  OVERALL:        ######## 8.5/10

WHAT IT DOES:
Advanced SuperTrend that uses K-Means clustering to dynamically
categorize market volatility into high/medium/low regimes. ATR
multiplier automatically adjusts based on the current volatility
cluster. In high volatility, the SuperTrend widens to avoid
whipsaws. In low volatility, it tightens for responsive signals.

WHY IT IS VALUABLE:
Our Alpha Trend System uses fixed ATR parameters. This adapts
automatically -- solving the eternal problem of "should I use
tight or wide stops?" The ML clustering is lightweight and
runs within Pine's computation limits. Represents the evolution
of the SuperTrend concept our system already uses.

BEST MARKETS: All markets
BEST TIMEFRAMES: 1H, 4H, Daily

PARAMETER DEFAULTS:
  - ATR Period: 10
  - Factor: 3.0
  - Cluster count: 3 (high/medium/low)
  - Training period: 200 bars

KNOWN LIMITATIONS:
  - ML clustering may categorize regimes incorrectly in transitions
  - More complex than standard SuperTrend
  - Cluster boundaries are recalculated -- slight repaint risk

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement
```

---

## RANK 14: Fair Value Gap (FVG) Indicator

```
=====================================================
INDICATOR DISCOVERY: Fair Value Gap
=====================================================

Source: TradingView (open-source) + GitHub
Author: LuxAlgo (TV), sonnyparlin (GitHub)
License: Open-source

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ####### 7/10
  Novelty:        ######### 9/10
  Implementation: ######### 9/10
  OVERALL:        ######## 8.0/10

WHAT IT DOES:
Detects price imbalances (gaps) where the candle 2 bars ago's
high/low doesn't overlap with the current candle's low/high.
These gaps represent areas where one side (buyers or sellers)
was overwhelmingly dominant. Price tends to "fill" these gaps
as the market seeks equilibrium. Tracks fill percentage and
average fill time.

WHY IT IS VALUABLE:
Core ICT concept we lack. FVGs provide high-probability entry
zones when price returns to fill them. Our Wick Analysis Pro
detects rejection/sweeps but not imbalance gaps. FVGs often
coincide with order blocks, providing confluence when combined
with our existing liquidity sweep detection.

BEST MARKETS: Forex, Crypto (best), Equities
BEST TIMEFRAMES: 15m to Daily

PARAMETER DEFAULTS:
  - Show bullish FVGs: true
  - Show bearish FVGs: true
  - Max FVGs displayed: 10
  - Auto-remove filled gaps: true
  - Threshold multiplier: 0 (show all)

KNOWN LIMITATIONS:
  - Many FVGs form; not all are significant
  - Works best with additional confluence (order blocks, S/R)
  - Gaps may not fill in strong trends

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement
```

---

## RANK 15: Forex Session Kill Zones

```
=====================================================
INDICATOR DISCOVERY: FX Sessions & Kill Zones
=====================================================

Source: TradingView (open-source)
Author: skullp / SpxGh0st / Exponential-X
License: Open-source

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ########## 10/10
  Novelty:        ######## 8/10
  Implementation: ########## 10/10
  OVERALL:        ######### 9.0/10

WHAT IT DOES:
Visualizes major forex trading sessions (Asian, London, New York)
and highlights "kill zones" -- specific high-volatility windows
where institutional activity peaks. Tracks session highs/lows,
overlap periods, and ICT-specific time windows (Silver Bullet,
Macros). Auto-adjusts for daylight saving time.

WHY IT IS VALUABLE:
We trade forex but have NO session awareness indicator.
Kill zones are when 70%+ of daily range is established.
London Open KZ (2-5am ET), NY Open KZ (7-10am ET),
London Close KZ (10am-12pm ET). This is fundamental for
forex timing and completely absent from our stack.

BEST MARKETS: Forex (primary), also useful for equities/futures
BEST TIMEFRAMES: 5m to 4H (intraday focus)

PARAMETER DEFAULTS:
  - London session: 3:00-12:00 EST
  - New York session: 8:00-17:00 EST
  - Asian session: 18:00-3:00 EST
  - Kill zone highlighting: on
  - Show session high/low: on

KNOWN LIMITATIONS:
  - Only useful for intraday timeframes
  - Session times vary slightly by broker
  - Kill zones are probabilistic, not guaranteed

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement
```

---

## RANK 16: Elliott Wave Automated Detection

```
=====================================================
INDICATOR DISCOVERY: Elliott Wave (Experimental)
=====================================================

Source: TradingView (open-source)
Author: UAlgo (best version), LuxAlgo (alternative)
License: Open-source

SCORES:
  Accuracy:       ##### 5/10
  Robustness:     ##### 5/10
  Novelty:        ######## 8/10
  Implementation: ####### 7/10
  OVERALL:        ###### 6.25/10

WHAT IT DOES:
Automated swing-based Elliott Wave scanner. Converts price into
cleaned swing sequence using pivot confirmation. Runs two-pass
detection: five-wave impulse patterns first, then three-wave
corrective structures for gaps. Each pattern validated with rules
engine, assigned confidence score based on Fibonacci ratio
proximity. Renders wave labels, channels, and Fib targets.

WHY IT IS VALUABLE:
Elliott Wave is a powerful framework that's extremely hard to
apply manually and consistently. Automated detection provides
objective analysis. However, accuracy is inherently limited --
Elliott Wave interpretation varies between expert analysts.
Best used as a supplementary framework, not primary signal.

BEST MARKETS: All (best on trending markets)
BEST TIMEFRAMES: 1H, 4H, Daily

PARAMETER DEFAULTS:
  - Swing length: 10
  - Min swing percentage: 1%
  - Confidence threshold: 50
  - Show Fibonacci projections: true

KNOWN LIMITATIONS:
  - Elliott Wave is inherently subjective/probabilistic
  - Automated versions have significant false positive rate
  - Pattern detection is retrospective (confirmed after the fact)
  - Labeled "experimental" by the author

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Research only -- implement cautiously
```

---

## RANK 17: Supertrend (Optimized)

```
=====================================================
INDICATOR DISCOVERY: Supertrend (Optimized)
=====================================================

Source: TradingView (built-in + community)
Author: Olivier Seban (original), KivancOzbilgic (TV)
License: Public domain

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ######### 9/10
  Novelty:        ##### 5/10
  Implementation: ########## 10/10
  OVERALL:        ####### 7.75/10

WHAT IT DOES:
Trend-following indicator using ATR to create trailing stop
levels. Plots a single line that changes color on trend
reversal. Green = uptrend (line below price), Red = downtrend
(line above price). Extremely simple to read and act on.

WHY IT IS VALUABLE:
Our Alpha Trend System is more complex (dual micro/macro).
Supertrend provides a simpler, single-line trend reference
that can serve as a quick-glance filter. The ML Adaptive
version (Rank 13) is the evolved form, but standard Supertrend
is valuable for its simplicity and widespread use as a baseline.

BEST MARKETS: All markets
BEST TIMEFRAMES: All

PARAMETER DEFAULTS:
  Scalping: ATR(7-10), Multiplier(1.5-2)
  Swing: ATR(10-14), Multiplier(3-4)
  Position: ATR(14-20), Multiplier(4-5)

KNOWN LIMITATIONS:
  - Generates many false signals in ranging/choppy markets
  - Lagging by nature (waits for ATR-width move)
  - Simple approach = limited edge on its own

PINESCRIPT CONVERSION: Built-in on TradingView
STATUS: Ready (already built-in -- just optimize settings)
```

---

## RANK 18: KNN Pivot Predictor

```
=====================================================
INDICATOR DISCOVERY: ML Pivot Points (KNN)
=====================================================

Source: TradingView (open-source)
Author: Steversteves
License: Open-source

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ###### 6/10
  Novelty:        ########## 10/10
  Implementation: ####### 7/10
  OVERALL:        ####### 7.5/10

WHAT IT DOES:
Trains in real-time on the specific chart. When a 10-bar pivot
is confirmed, extracts the Linear Regression Slope of the 20 bars
leading into that point. As price moves, rolling slope is compared
to stored pivot signatures. KNN algorithm flags "Approaching Pivot
High/Low" when current slope matches past pivot patterns.

WHY IT IS VALUABLE:
Completely novel approach -- it learns the mathematical "DNA"
of HOW price curves into pivots on the specific instrument being
viewed. This is predictive rather than reactive. Nothing in our
collection attempts to predict pivots before they form.

BEST MARKETS: All markets
BEST TIMEFRAMES: 1H, 4H, Daily

PARAMETER DEFAULTS:
  - Pivot confirmation: 10 bars
  - Regression slope lookback: 20 bars
  - K neighbors: 5
  - Distance metric: Euclidean

KNOWN LIMITATIONS:
  - Needs sufficient training data (pivots) to be useful
  - Predictions are probabilistic, not certain
  - May lag on volatile instruments with rapid pivots
  - Relatively new; limited community testing

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Needs testing before production use
```

---

## RANK 19: Natural Visibility Graph

```
=====================================================
INDICATOR DISCOVERY: Natural Visibility Graph
=====================================================

Source: TradingView (open-source)
Author: UAlgo
License: Open-source

SCORES:
  Accuracy:       ###### 6/10
  Robustness:     ###### 6/10
  Novelty:        ########## 10/10
  Implementation: ####### 7/10
  OVERALL:        ####### 7.25/10

WHAT IT DOES:
Applies complex network theory to price data. Each bar = node.
Nodes connected if they can "see" each other without intermediate
bars blocking line of sight. Bars with high visibility = structural
pivots (hubs). Uses volatility-aware thresholding. Highlights
structural peaks/valleys and draws connections to furthest visible
bar. From academic research on time series analysis.

WHY IT IS VALUABLE:
Completely unique approach -- converts price into a NETWORK
rather than using traditional calculations. Structural hubs
identified this way may reveal pivot points that MA/oscillator-
based methods miss. True academic research applied to trading.
Nothing remotely like this in our collection.

BEST MARKETS: All markets
BEST TIMEFRAMES: 1H, 4H, Daily

PARAMETER DEFAULTS:
  - Visibility type: Natural (vs Horizontal)
  - Hub threshold: dynamic (volatility-aware)
  - Show connections: true
  - Alert on new hubs: true

KNOWN LIMITATIONS:
  - Highly experimental / academic
  - Limited real-world backtesting data
  - Complex to interpret
  - May produce hubs that don't translate to actionable signals

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Research only
```

---

## RANK 20: Smoothed Heikin Ashi Cloud

```
=====================================================
INDICATOR DISCOVERY: Smoothed Heikin Ashi
=====================================================

Source: TradingView (open-source)
Author: DZIV / SamAccountX / TheBacktestGuy
License: Open-source

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ######## 8/10
  Novelty:        ####### 7/10
  Implementation: ######### 9/10
  OVERALL:        ####### 7.75/10

WHAT IT DOES:
Takes standard Heikin Ashi candles and applies double smoothing:
first smooths OHLC with a moving average, then applies HA
formula, then optionally smooths again. Result: extremely clean
trend visualization with minimal noise. Color changes indicate
definitive trend reversals. Some versions add cloud fill between
the smoothed HA values.

WHY IT IS VALUABLE:
Our trend system uses standard MAs. Smoothed HA provides
a completely different visualization of trend that filters
noise differently. The double-smoothing removes almost all
minor pullback noise while keeping the major trend direction
crystal clear. Good for determining overall bias before
using other indicators for entry timing.

BEST MARKETS: All markets
BEST TIMEFRAMES: 1H, 4H, Daily

PARAMETER DEFAULTS:
  - First MA type: EMA (10)
  - Second MA type: SMA (10)
  - Show as: Overlay candles or cloud

KNOWN LIMITATIONS:
  - Significant lag due to double smoothing
  - Smoothed prices are NOT real prices (do not trade at HA levels)
  - Late entries on trend changes
  - Best for bias confirmation, not precise timing

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement
```

---

## RANK 21: MVRV Z-Score / On-Chain Proxy

```
=====================================================
INDICATOR DISCOVERY: MVRV Z-Score (On-Chain Proxy)
=====================================================

Source: Bitcoin Magazine Pro / CryptoQuant / Community
Author: Various (Willy Woo popularized)
License: Data-dependent (on-chain APIs)

SCORES:
  Accuracy:       ######### 9/10
  Robustness:     ######## 8/10
  Novelty:        ########## 10/10
  Implementation: #### 4/10
  OVERALL:        ####### 7.75/10

WHAT IT DOES:
MVRV = Market Value / Realized Value. Z-Score measures standard
deviations from mean. Realized Value = price at which each BTC
last moved (not current price). When MVRV Z-Score > 7, BTC is
extremely overvalued. When < 0.5, extremely undervalued. Has
picked market cycle tops within 2 weeks historically.

WHY IT IS VALUABLE:
For crypto trading, on-chain data provides fundamental analysis
that no price-based indicator can replicate. MVRV Z-Score has
accurately identified EVERY major BTC cycle top and bottom.
Currently reading 1.2 (accumulation territory as of March 2026).

BEST MARKETS: Bitcoin/Crypto ONLY
BEST TIMEFRAMES: Daily, Weekly (cycle-level analysis)

PARAMETER DEFAULTS:
  - Overvalued threshold: 7+ (extreme), 3.7+ (caution)
  - Undervalued threshold: <1 (opportunity), <0.5 (extreme)

KNOWN LIMITATIONS:
  - Cannot be implemented in standard PineScript (requires API)
  - Only works for Bitcoin (some versions for ETH)
  - TradingView can access some on-chain data via symbols
  - ETF adoption may distort SOPR/MVRV readings going forward

PINESCRIPT CONVERSION: Complex -- requires external data
STATUS: Research/monitor externally (use BTC Magazine Pro)
```

---

## RANK 22: AlphaTrend (Standalone)

```
=====================================================
INDICATOR DISCOVERY: AlphaTrend
=====================================================

Source: TradingView (open-source)
Author: KivancOzbilgic
License: Open-source

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######## 8/10
  Novelty:        ###### 6/10
  Implementation: ########## 10/10
  OVERALL:        ######## 8.0/10

WHAT IT DOES:
Evolved from Trend Magic. Combines momentum (MFI or RSI),
trend (Magic Trend), volatility (ATR), and trailing stop into
one indicator. When MFI >= 50: uses upT (low - ATR*coeff),
otherwise downT (high + ATR*coeff). Two lines (original + 2-bar
offset) generate buy/sell signals from crossovers. Acts "dead"
in sideways markets -- minimizing false signals.

WHY IT IS VALUABLE:
Our Alpha Trend System was INSPIRED by AlphaTrend but evolved
into something different. Having the original clean AlphaTrend
as a reference/comparison would be valuable. Its key advantage:
it goes flat/quiet during sideways markets instead of generating
false signals. The 2-bar offset crossover is elegant.

BEST MARKETS: All markets
BEST TIMEFRAMES: Daily, 4H

PARAMETER DEFAULTS:
  - Coefficient: 1 (ATR multiplier)
  - Common Period: 14 (for ATR, MFI, RSI)
  - No volume fallback: RSI instead of MFI

KNOWN LIMITATIONS:
  - Somewhat redundant with our Alpha Trend System
  - Single-line indicator = limited information
  - Lag during fast-moving markets

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Optional -- may be redundant with existing system
```

---

## RANK 23: BigBeluga Ultimate MACD Suite

```
=====================================================
INDICATOR DISCOVERY: Ultimate MACD Suite
=====================================================

Source: TradingView (premium)
Author: BigBeluga
License: Premium/Subscription required

SCORES:
  Accuracy:       ######## 8/10
  Robustness:     ######## 8/10
  Novelty:        ######## 8/10
  Implementation: ##### 5/10
  OVERALL:        ####### 7.25/10

WHAT IT DOES:
Advanced MACD with: normalized scaling, heatmap trend visualization,
histogram reversal detection, multi-timeframe alignment, divergence
engine, overbought/oversold bands at +/-80, signal-line momentum
shifts with alerts. Transforms basic MACD into a complete momentum
decision engine.

WHY IT IS VALUABLE:
Our Alpha Confirmation Suite has RSI + Thrust but no enhanced
MACD. This would add a sophisticated momentum dimension. However,
it's premium/subscription -- we cannot access the source code.
Better to implement key concepts (normalized MACD + heatmap +
MTF alignment) ourselves.

BEST MARKETS: All markets
BEST TIMEFRAMES: All

KNOWN LIMITATIONS:
  - PREMIUM ONLY -- cannot use open-source code
  - MACD fundamentals are lagging by nature
  - May be overly complex for the marginal benefit

PINESCRIPT CONVERSION: Not available (premium/invite-only)
STATUS: Study concepts; implement key features ourselves
```

---

## RANK 24: Seasonal Pattern Overlay

```
=====================================================
INDICATOR DISCOVERY: Seasonal Pattern Analysis
=====================================================

Source: TradingView built-in + SeasonalCharts.com
Author: TradingView / Community
License: Built-in feature

SCORES:
  Accuracy:       ###### 6/10
  Robustness:     ######## 8/10
  Novelty:        ######### 9/10
  Implementation: ###### 6/10
  OVERALL:        ####### 7.25/10

WHAT IT DOES:
Overlays historical seasonal patterns (monthly/quarterly) on
current price chart. Shows average price behavior during each
month/week of the year based on 5-20 year history. For crude
oil: summer driving season demand, winter heating, refinery
maintenance cycles create repeatable patterns.

WHY IT IS VALUABLE:
We trade WTI crude oil which has STRONG seasonal patterns.
Crude tends to rally Feb-May, weaken Sep-Oct. Having this
context overlaid helps with position bias. TradingView has
built-in seasonality charts for USOIL at the symbol level.

BEST MARKETS: Commodities (strongest), Equities (moderate)
BEST TIMEFRAMES: Weekly, Monthly (macro view)

PARAMETER DEFAULTS:
  - Historical lookback: 5-20 years
  - Average method: mean or median
  - Overlay: separate panel or chart background

KNOWN LIMITATIONS:
  - "Past seasonality doesn't guarantee future patterns"
  - Macro events override seasonal tendencies
  - Best as context/bias, not timing signals
  - TradingView's built-in version is limited

PINESCRIPT CONVERSION: Moderate (custom PineScript needed)
STATUS: Use TradingView built-in + supplement with external data
```

---

## RANK 25: AlgoAlpha Smart Money Breakout Signals

```
=====================================================
INDICATOR DISCOVERY: Smart Money Breakout Signals
=====================================================

Source: TradingView (open-source)
Author: AlgoAlpha
License: Open-source

SCORES:
  Accuracy:       ####### 7/10
  Robustness:     ####### 7/10
  Novelty:        ######## 8/10
  Implementation: ######### 9/10
  OVERALL:        ####### 7.75/10

WHAT IT DOES:
Identifies structural shifts and breakout opportunities using
smart money concepts. Detects BOS and CHoCH, adds dynamic take-
profit targets, provides real-time alerts, and includes a performance
dashboard monitoring signal statistics including win rates.
Built-in backtesting metrics make it self-evaluating.

WHY IT IS VALUABLE:
The built-in performance dashboard is unique -- it tracks its
own win rate and signal statistics. This self-evaluation feature
is something none of our indicators provide. Could serve as
both a signal generator and a performance accountability tool.

BEST MARKETS: All liquid markets
BEST TIMEFRAMES: 15m to Daily

PARAMETER DEFAULTS:
  - Swing detection period: 10
  - Show BOS: true
  - Show CHoCH: true
  - Performance dashboard: enabled

KNOWN LIMITATIONS:
  - Overlaps conceptually with LuxAlgo SMC (Rank 2)
  - Performance dashboard may create false confidence
  - Open-source but AlgoAlpha has premium versions too

PINESCRIPT CONVERSION: Already PineScript (open-source)
STATUS: Ready to implement (consider vs LuxAlgo SMC)
```

---

# IMPLEMENTATION PRIORITY MATRIX

## Tier 1: Implement Immediately (Highest Value-Add)
These fill the BIGGEST gaps in our current collection:

| # | Indicator | Gap Filled | Effort |
|---|-----------|-----------|--------|
| 1 | Smart Money Concepts (LuxAlgo) | Order Blocks, FVGs, BOS/CHoCH | Low (copy from TV) |
| 2 | Williams Vix Fix | Market bottom detection | Low |
| 3 | WaveTrend Oscillator | Quality oscillator for entry timing | Low |
| 4 | COT Indicator | Commodity positioning (WTI!) | Low |
| 5 | Cumulative Delta Volume | Order flow proxy | Low |
| 6 | Forex Session Kill Zones | Session timing for forex | Low |

## Tier 2: Implement Soon (High Value, Moderate Effort)
These add significant new capability:

| # | Indicator | Gap Filled | Effort |
|---|-----------|-----------|--------|
| 7 | ML Lorentzian Classification | Machine learning classification | Medium |
| 8 | Nadaraya-Watson Envelope | Statistical regression bands | Low |
| 9 | Laguerre RSI | Superior RSI replacement | Low |
| 10 | Anchored VWAP (Auto Swing) | Institutional volume levels | Low |
| 11 | Fair Value Gap | Price imbalance detection | Low |
| 12 | Ichimoku Cloud (Optimized) | Complete system indicator | Low |

## Tier 3: Implement When Ready (Useful But Lower Priority)
These add useful but non-critical capabilities:

| # | Indicator | Gap Filled | Effort |
|---|-----------|-----------|--------|
| 13 | ML Adaptive SuperTrend | Self-adjusting trend | Low |
| 14 | Range Filter | Trend noise reduction | Low |
| 15 | Wyckoff Phase Detector | Institutional phase detection | Medium |
| 16 | Smoothed Heikin Ashi | Clean trend visualization | Low |
| 17 | KNN Pivot Predictor | Predictive pivot analysis | Medium |

## Tier 4: Monitor / Research Only
These are interesting but need more validation:

| # | Indicator | Status |
|---|-----------|--------|
| 18 | Natural Visibility Graph | Experimental / academic |
| 19 | Elliott Wave Automated | Inherently subjective |
| 20 | MVRV Z-Score | Needs external API |
| 21 | Seasonal Pattern | Use TradingView built-in |
| 22 | BigBeluga MACD Suite | Premium only -- study concepts |

---

# ACADEMIC RESEARCH KEY FINDINGS

## What the Data Says About Indicator Effectiveness

1. **No single indicator works in isolation.** Analysis of 114,000+ backtests found the best strategies use a LAYERED approach: fundamental filters + market regime filter (200-day SMA on SPY) + short-term technical entry (RSI/BB).

2. **RSI is the most backtested useful indicator**, but ONLY with additional filters. Works best on mean-reverting securities. Shorter timeframes (2-3 day) outperform the standard 14-day setting.

3. **Momentum is the most academically supported factor.** Time-series momentum (Moskowitz, Ooi & Pedersen, 2012) has the strongest research backing of any technical approach.

4. **Multi-indicator combinations outperform singles.** RSI + EMA + VWAP + MACD together achieved 60.63% win rate with 1.882 profit factor -- significantly better than any single indicator.

5. **COT data has proven edge for commodities.** Commercial hedger positioning has the strongest information advantage for crude oil, natural gas, and agricultural commodities.

6. **Most technical indicators lack statistically significant alpha** when tested rigorously. The edge comes from combining them intelligently and applying proper regime filtering.

---

# GITHUB REPOSITORIES WORTH MONITORING

| Repository | Stars | What It Has |
|-----------|-------|-------------|
| `twopirllc/pandas-ta` (classic fork) | High | 212 indicators in Python for backtesting |
| `joshyattridge/smart-money-concepts` | Growing | SMC in Python (FVG, BOS, CHoCH, OBs) |
| `freqtrade/freqtrade-strategies` | High | Community crypto strategies |
| `freqtrade/technical` | Medium | Laguerre RSI, VFI, consensus indicators |
| `nateemma/strategies` | Medium | DWT, FFT, Kalman, PCA-based strategies |
| `smtlab/smartmoneyconcepts` | Growing | Alternative Python SMC library |

---

# SOURCES

## TradingView Community Scripts
- [TradingView Featured Scripts](https://www.tradingview.com/scripts/editors-picks/)
- [Smart Money Concepts (LuxAlgo)](https://www.tradingview.com/script/CnB3fSph-Smart-Money-Concepts-SMC-LuxAlgo/)
- [Lorentzian Classification (jdehorty)](https://www.tradingview.com/script/WhBzgfDu-Machine-Learning-Lorentzian-Classification/)
- [Squeeze Momentum (LazyBear)](https://www.tradingview.com/script/nqQ1DT5a-Squeeze-Momentum-Indicator-LazyBear/)
- [WaveTrend Oscillator (LazyBear)](https://www.tradingview.com/script/2KE8wTuF-Indicator-WaveTrend-Oscillator-WT/)
- [CM_Williams_Vix_Fix (ChrisMoody)](https://www.tradingview.com/script/og7JPrRA-CM-Williams-Vix-Fix-Finds-Market-Bottoms/)
- [AlphaTrend (KivancOzbilgic)](https://www.tradingview.com/script/o50NYLAZ-AlphaTrend/)
- [Fair Value Gap (LuxAlgo)](https://www.tradingview.com/script/jWY4Uiez-Fair-Value-Gap-LuxAlgo/)
- [Nadaraya-Watson Envelope (LuxAlgo)](https://www.tradingview.com/script/Iko0E2kL-Nadaraya-Watson-Envelope-LuxAlgo/)
- [ML Adaptive SuperTrend (AlgoAlpha)](https://www.tradingview.com/script/CLk71Qgy-Machine-Learning-Adaptive-SuperTrend-AlgoAlpha/)
- [Range Filter (DonovanWall)](https://www.tradingview.com/script/lut7sBgG-Range-Filter-DW/)
- [Laguerre RSI (KivancOzbilgic)](https://www.tradingview.com/script/B094baNp-Laguerre-RSI/)
- [Cumulative Delta Volume (LonesomeTheBlue)](https://www.tradingview.com/script/vB1T3EMp-Cumulative-Delta-Volume/)
- [Elliott Wave (UAlgo)](https://www.tradingview.com/script/0AzhhULr-Elliott-Wave-Experimental-UAlgo/)
- [Wyckoff Event Detection (Alpha Extract)](https://www.tradingview.com/script/CReJpjHe-Wyckoff-Event-Detection-Alpha-Extract/)
- [Natural Visibility Graph (UAlgo)](https://www.tradingview.com/script/RDTIXnxQ-Natural-Visibility-Graph-UAlgo/)
- [Smart Money Breakout Signals (AlgoAlpha)](https://www.tradingview.com/script/IV6eZF3w-Smart-Money-Breakout-Signals-AlgoAlpha/)
- [FX Sessions & Killzones (skullp)](https://www.tradingview.com/script/GzDeS3iv-FX-Sessions-Killzones-ET/)
- [ICT Killzones and Sessions (SpxGh0st)](https://www.tradingview.com/script/InMPCLO7-ICT-Killzones-and-Sessions-W-Silver-Bullet-Macros/)
- [Market Structure CHoCH/BOS (LuxAlgo)](https://www.tradingview.com/script/ZpHqSrBK-Market-Structure-CHoCH-BOS-Fractal-LuxAlgo/)
- [Auto Anchored Swing VWAPs (Amphibiantrading)](https://www.tradingview.com/script/yGQMVJ90-Auto-Anchored-Swing-VWAP-s/)
- [Trend Targets (AlgoAlpha)](https://www.tradingview.com/script/OXsSm5NV-Trend-Targets-AlgoAlpha/)
- [Commitment of Traders Total (TradingView)](https://www.tradingview.com/script/CQBbeOHQ-Commitment-of-Traders-Total/)
- [SuperTrend Indicator (TrendSpider Guide)](https://trendspider.com/learning-center/supertrend-indicator-a-comprehensive-guide/)

## GitHub Repositories
- [pandas-ta-classic](https://github.com/xgboosted/pandas-ta-classic)
- [Smart Money Concepts Python](https://github.com/joshyattridge/smart-money-concepts)
- [Freqtrade Strategies](https://github.com/freqtrade/freqtrade-strategies)
- [Freqtrade Technical](https://github.com/freqtrade/technical)
- [nateemma Strategies (DWT/FFT/Kalman)](https://github.com/nateemma/strategies)
- [FVG PineScript (GitHub)](https://github.com/sonnyparlin/fvg_pinescript)

## Academic & Quantitative Research
- [100k+ Backtests Analysis (Medium)](https://medium.com/@austin-starks/i-analyzed-100-000-backtests-to-find-the-best-trading-indicator-42b31b739ff1)
- [Empirical Validity of Technical Indicators (TradingView)](https://www.tradingview.com/chart/SPX/MFwiyqpL-The-Empirical-Validity-of-Technical-Indicators-and-Strategies/)
- [Ichimoku Optimization Case Study](https://www.forex.in.rs/ichimoku-settings-7-22-44/)
- [Williams VixFix Trading Strategies (Quantified Strategies)](https://www.quantifiedstrategies.com/williamsvixfix/)

## Market-Specific Resources
- [Bitcoin On-Chain (Check On Chain)](https://charts.checkonchain.com/)
- [Bitcoin Magazine Pro Charts](https://www.bitcoinmagazinepro.com/charts/)
- [COT Reports (CFTC)](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm)
- [WTI Seasonality (TradingView)](https://www.tradingview.com/symbols/USOIL/seasonals/)
- [Crude Oil Seasonal Charts](https://www.seasonalcharts.com/classics_rohoel.html)
- [Best Scripts TradingView Guide (Pineify)](https://pineify.app/resources/blog/best-scripts-for-tradingview-complete-guide-to-top-indicators-and-strategies-for-2025)
- [Top TradingView Indicators (Trade Nation)](https://tradenation.com/articles/tradingview-indicators/)
