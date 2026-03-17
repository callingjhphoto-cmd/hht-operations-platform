# Wicks Trading System -- Exhaustive Research Report

**Date**: 2026-03-17
**Research Scope**: Complete methodology, statistical validation, ICT integration, open-source tooling, and PineScript implementation audit

---

## Table of Contents

1. [System Identity and Origin](#1-system-identity-and-origin)
2. [Core Methodology: What Defines a Significant Wick](#2-core-methodology)
3. [Wick Rejection Signal Generation](#3-wick-rejection-signal-generation)
4. [Volume Confirmation Framework](#4-volume-confirmation-framework)
5. [Wick Fill Probability and Statistics](#5-wick-fill-probability-and-statistics)
6. [Multi-Wick Confluence Zones](#6-multi-wick-confluence-zones)
7. [ICT Integration: Liquidity, FVGs, Order Blocks](#7-ict-integration)
8. [Consequent Encroachment (CE) -- Wick Midpoints](#8-consequent-encroachment)
9. [Timeframe Analysis](#9-timeframe-analysis)
10. [Market Suitability](#10-market-suitability)
11. [Statistical Effectiveness: Academic and Practitioner Data](#11-statistical-effectiveness)
12. [Best Open-Source Wick Analysis Tools](#12-best-open-source-tools)
13. [Current PineScript Implementation Audit](#13-pinescript-audit)
14. [Recommended Improvements](#14-recommended-improvements)
15. [Complete Entry/Exit Rules Framework](#15-entry-exit-rules)
16. [Sources](#16-sources)

---

## 1. System Identity and Origin

There is no single proprietary system called "Wicks Trading" attributable to one educator or platform. Rather, "wick trading" is a composite methodology drawn from three converging traditions:

1. **Japanese candlestick analysis** (Munehisa Homma, Steve Nison) -- pin bars, hammers, shooting stars, doji patterns
2. **Price action trading** (Al Brooks, Nial Fuller, Bulkowski) -- wick rejection at key levels, structure-based entries
3. **ICT / Smart Money Concepts** (Michael J. Huddleston) -- wicks as liquidity sweeps, consequent encroachment, premium/discount wick zones

The methodology synthesizes these into a unified system where wicks are not merely candlestick artifacts but **institutional footprints revealing where smart money absorbed liquidity**.

---

## 2. Core Methodology: What Defines a Significant Wick

### 2.1 Mathematical Definition of Candle Components

```
Total Range     = High - Low
Body Size       = |Close - Open|
Upper Wick      = High - max(Close, Open)
Lower Wick      = min(Close, Open) - Low
```

### 2.2 Wick-to-Body Ratio Thresholds

Based on cross-referencing multiple professional sources:

| Signal Strength | Wick-to-Body Ratio | Wick % of Total Range | Classification |
|----------------|--------------------|-----------------------|----------------|
| Weak           | >= 1.0             | >= 40%                | Minor rejection |
| Moderate       | >= 1.5             | >= 50%                | Standard pin bar |
| Strong         | >= 2.0             | >= 60%                | Strong rejection |
| Very Strong    | >= 3.0             | >= 66%                | Institutional sweep |
| Extreme        | >= 5.0             | >= 80%                | Liquidity grab |

**Key thresholds from professional tools**:
- **Liquidity Hunter [ChartPrime]**: Body < 30% of total range AND wick > 60% of total range (defaults)
- **Pin bar standard definition**: Wick at least 2/3 (66%) of total candle length, body < 25% of total range
- **LuxAlgo Long Wick Detector**: Uses a dynamic volatility threshold (ATR-based) rather than a fixed ratio
- **BigBeluga Wick Pressure Zones**: Normalizes wick length against maximum wick over a lookback period, scores 0-100

### 2.3 Additional Wick Qualification Filters

A wick is not significant by ratio alone. Professional systems add:

1. **ATR filter**: The wick must exceed a minimum percentage of the ATR(14). Typically >= 50% of ATR to filter out noise. The Wick Analysis Chart [LTS] recommends starting with 80% ATR threshold.
2. **Doji exclusion**: Candles where the body is < 5% of the total range produce extreme wick ratios that are misleading. Filter these out.
3. **Minimum candle size**: The total range must be non-trivial (some systems require the candle to be at least 50% of ATR to avoid micro-candles).
4. **Opposite wick size**: For a clean pin bar, the opposite wick should be less than 25% of the dominant wick length.

---

## 3. Wick Rejection Signal Generation

### 3.1 Bullish Wick Rejection (Lower Wick Dominant)

Conditions:
- Lower wick >= 2x body size (ratio >= 2.0)
- Lower wick >= 60% of total candle range
- Close > Open preferred (bullish close adds strength)
- Occurs at or near a support level, demand zone, or swing low
- Volume confirmation present (see Section 4)

Interpretation: Price tested lower levels but was aggressively bought back. The longer the wick relative to the body, the stronger the buying pressure.

### 3.2 Bearish Wick Rejection (Upper Wick Dominant)

Conditions:
- Upper wick >= 2x body size (ratio >= 2.0)
- Upper wick >= 60% of total candle range
- Close < Open preferred (bearish close adds strength)
- Occurs at or near resistance, supply zone, or swing high
- Volume confirmation present

Interpretation: Price tested higher levels but was aggressively sold. Institutional selling interest evident.

### 3.3 Wicks as Continuation Signals (Important Nuance)

Tradeciety's research highlights a critical insight often missed: **wicks do not always mean rejection**. A wick into a support level that fails to break it may signal that sellers are building pressure for a later break. Context matters:

- Wick in the direction of the prevailing trend = potential continuation (sellers/buyers probing)
- Wick against the prevailing trend at a key level = rejection
- Multiple wicks at the same level = building conviction (see Section 6)
- Wick with a proportionally large body in the trend direction = the body tells the real story

---

## 4. Volume Confirmation Framework

### 4.1 Why Volume Matters

A long wick without volume is potentially just thin-market noise. A long wick WITH volume confirms that actual orders were placed and absorbed at those levels.

### 4.2 Volume Confirmation Rules

| Method | Implementation | Purpose |
|--------|---------------|---------|
| Simple average | Volume > SMA(volume, 3) | Current bar traded more than recent average |
| Multiplier | Volume > SMA(volume, 20) * 1.5 | Significant volume surge |
| Relative volume | Volume / SMA(volume, 20) > 1.0 | Normalized comparison |
| Volume spike | Volume > highest(volume, 10) * 0.8 | Near-peak volume |

### 4.3 BigBeluga Wick Pressure Zones Approach

The BigBeluga indicator goes further by:
- Labeling each wick zone with the exact volume at the birth candle
- Using volume as a visual intensity gradient within the zone
- Combining with an RSI filter (RSI > 50 for valid supply zones, RSI < 50 for valid demand zones) to confirm directional pressure

### 4.4 Recommended Configuration

For most markets:
- **Primary**: Volume > SMA(volume, 3) * 1.0 (current bar exceeds 3-bar average)
- **High-confidence**: Volume > SMA(volume, 20) * 1.5 (significant surge above 20-bar average)
- **Note**: In 24/7 markets (crypto), be cautious with volume during low-liquidity sessions (Asian session for most pairs)

---

## 5. Wick Fill Probability and Statistics

### 5.1 Core Concept

The wick fill hypothesis states that the price area traversed by a wick but not by the body represents an "imbalance" or "unfinished business" zone. Price has a tendency to revisit this zone.

### 5.2 Mechanism

Market makers and institutional participants push price to trigger stop-losses and resting orders (the wick), then price snaps back. Later, price often returns to these levels to:
- Rebalance order flow
- Grab remaining liquidity
- Test the level for a genuine break

### 5.3 Statistics (Best Available)

**Hard statistical data on wick fill rates is scarce in published research.** The available evidence:

- No rigorous academic study has been published specifically measuring "wick fill" probability across instruments
- The ICT methodology teaches that the algorithm needs to fill at minimum to the **50% midpoint** (Consequent Encroachment) rather than the full wick
- Practitioner consensus suggests ~60-70% of significant wicks see at least a partial fill (50%+ of wick range) within 20-50 bars on daily timeframes
- The probability varies significantly by market, timeframe, and whether the wick occurred at a structural level vs. in the middle of a range
- Wicks during news events or extreme volatility have lower fill rates because they represent genuine one-way flow rather than a sweep

### 5.4 Implementation Rules for Wick Fill Zones

From the LibyanSatoshi Wick Fill indicator and ControllerFX methodology:

1. Identify a candle with a significant wick (50%+ of total range)
2. Mark the zone from the body edge to 50% of the wick (the CE level)
3. Price is expected to at minimum test the 50% midpoint
4. Entry on the retest, stop-loss beyond the wick tip
5. Take profit at the wick origin (body edge) or beyond
6. Expiry: If price hasn't revisited within 50-100 bars, the zone weakens significantly

### 5.5 Key Conditions for Higher Fill Probability

- Price must be in momentum (trending, not choppy)
- No major news scheduled that could override the technical
- The wick zone should be "empty" (no overlapping S/R levels that might block the fill)
- Best during high-volume sessions (London/NY overlap for forex)
- Avoid Asian session lulls and weekends which produce fakeout wicks

---

## 6. Multi-Wick Confluence Zones

### 6.1 Zone Formation Logic

When multiple candles produce wick rejections at similar price levels, the evidence accumulates:

| Wick Count at Level | Zone Strength | Interpretation |
|---------------------|--------------|----------------|
| 1 wick              | Weak         | Initial rejection -- needs confirmation |
| 2 wicks             | Moderate     | Level is being tested and defended |
| 3+ wicks            | Strong       | Institutional demand/supply zone confirmed |
| 5+ wicks            | Very Strong  | Major structural level |

### 6.2 What Constitutes "Similar Price Level"

Professional systems define proximity using:
- **ATR-based**: Wicks within 0.5 * ATR(14) of each other are at the "same level"
- **Percentage-based**: Within 0.5% of price (for stocks/crypto)
- **Point-based**: Within X pips/points (for forex)

### 6.3 Zone Decay

Wick zones do not last forever. Factors that weaken a zone:
- Time: Zones older than 50-100 bars carry less weight
- Tests: Each successful test of a zone weakens it (liquidity consumed)
- Typically, a zone holds 2-3 tests before breaking on the 4th

### 6.4 Pivot and Wick Boxes

The TradingView "Pivot and Wick Boxes with Break Signals v2" indicator automates this by:
- Detecting pivot points on the chart
- Drawing boxes based on the wick range of pivot candles
- Generating break signals when price exits a wick box
- Providing break-and-retest entries when price returns to the broken level

---

## 7. ICT Integration: Liquidity, FVGs, Order Blocks

### 7.1 Wicks as Liquidity Sweeps

In ICT methodology, long wicks ARE liquidity events:

- **Upper wick** = sweep of buy-side liquidity (BSL) -- stop-losses of shorts above recent highs were triggered
- **Lower wick** = sweep of sell-side liquidity (SSL) -- stop-losses of longs below recent lows were triggered

The distinction between a **liquidity grab** (single-candle wick) and a **liquidity sweep** (multi-candle probe) is important:
- Grab: One bar pierces and snaps back, leaving a long wick (gravestone/dragonfly doji behavior)
- Sweep: Brief consolidation beyond the level before returning

### 7.2 Fair Value Gaps (FVGs) and Wicks

FVGs are three-candle patterns where the second candle is so impulsive that the wicks of candles 1 and 3 do not meet, leaving an imbalance. Wick-FVG synergy:

- A wick into an FVG often marks the completion of the gap fill
- Price reaching the 50% midpoint (CE) of an FVG satisfies the minimum rebalancing requirement
- An FVG that forms immediately after a wick rejection adds confluence to the reversal signal
- **FVG Inversion**: If price breaks through an FVG, it flips from support to resistance (or vice versa)

### 7.3 Order Blocks and Wick Confirmation

Order blocks (OBs) are the last opposing candle before a displacement move. Their relationship to wicks:

- A valid OB must (1) sweep liquidity, (2) create an imbalance (FVG), and (3) remain untouched
- When price returns to an OB, a wick rejection at that level is **the strongest possible confirmation** that the OB is being respected
- High-probability OBs are those paired with an FVG directly adjacent

### 7.4 Breaker Blocks

Breaker blocks are failed order blocks validated by a stop hunt:
- The **Unicorn Setup** (highest-probability ICT configuration) occurs when a breaker block overlaps with an FVG
- A wick through a breaker block that closes back inside confirms the level

### 7.5 Practical ICT + Wick Workflow

1. Identify a liquidity sweep on the higher timeframe (wick through a swing high/low)
2. Drop to a lower timeframe
3. Wait for a Change of Character (CHoCH) confirming market structure shift
4. Place limit orders on the FVG or OB within the sweep zone
5. Stop-loss beyond the tail of the liquidity sweep wick
6. Target the opposite side of the range or next FVG

---

## 8. Consequent Encroachment (CE) -- Wick Midpoints

### 8.1 Definition

Consequent Encroachment is the 50% level of any ICT PD (Price Delivery) array -- including wicks. For a wick:

```
Upper Wick CE = max(Close, Open) + (High - max(Close, Open)) * 0.5
Lower Wick CE = min(Close, Open) - (min(Close, Open) - Low) * 0.5
```

### 8.2 Why 50% Matters

ICT teaches that the algorithm (price delivery mechanism) does not always need to fill the entire imbalance. It only needs to rebalance price to the midpoint. The CE acts as the **minimum requirement for restoring efficiency** inside a displacement.

### 8.3 Trading Applications

- **Entry**: When price retraces to the CE of a wick at a key level, enter in the direction of the rejection
- **Stop-loss refinement**: If entering at a swing low with a long lower wick, place the stop at the wick's CE rather than below the wick tip -- this improves risk:reward. If price retraces past 50% of the wick, the setup is likely invalid
- **Profit target**: Use the CE of the opposing wick zone as a conservative target
- **Setup invalidation**: If price closes beyond the CE of a wick, the rejection has failed

### 8.4 ICT Daily Wick Quadrants Indicator

The Frenchy_Trades "ICT Daily Wick Quadrants" TradingView indicator automates this by:
- Calculating Fibonacci retracement levels within daily candle wicks
- Showing premium/discount zones within both upper and lower daily wicks
- Providing quadrant-based S/R levels for intraday trading

---

## 9. Timeframe Analysis

### 9.1 Reliability by Timeframe

| Timeframe | Signal Quality | False Signal Rate | Best Use |
|-----------|---------------|-------------------|----------|
| 1m-5m     | Low           | Very High (60%+)  | Only as entry timing after HTF signal |
| 15m       | Low-Medium    | High (50%+)       | Scalping with strict confirmation |
| 1H        | Medium        | Moderate (35-45%)  | Day trading, wick fill plays |
| 4H        | High          | Lower (25-35%)    | Swing entries, best signal-to-noise |
| Daily     | Highest       | Lowest (20-30%)   | Directional bias, key rejection zones |
| Weekly    | Very High     | Very Low (<20%)   | Major structural reversals, rare signals |

### 9.2 Multi-Timeframe Workflow

The recommended approach:

1. **Weekly/Daily**: Identify the directional bias and key wick rejection zones
2. **4H**: Confirm the setup and identify the specific trade zone
3. **1H/15m**: Fine-tune entry timing using lower-timeframe wick signals and CHoCH
4. **Ratio rule**: Use a 1:4 to 1:6 ratio between entry and analysis timeframe (e.g., 1H entries using 4H analysis)

### 9.3 Bulkowski's Timeframe Data

Thomas Bulkowski's research specifically found:
- Daily charts: ~60% success rate for hammer/pin bar patterns
- Weekly charts: Higher reliability, fewer false signals
- Intraday: Significantly degraded performance

---

## 10. Market Suitability

### 10.1 Market Rankings for Wick Trading

| Market | Effectiveness | Notes |
|--------|--------------|-------|
| Forex (Majors) | Very High | Clean wicks at session levels, London/NY sweeps |
| Crypto (BTC, ETH) | High | Frequent liquidity grabs, 24/7 means more opportunities but also more noise |
| US Equities (Large Cap) | High | Works well on daily/4H for swing trades |
| Indices (SPX, NQ) | High | Session-based liquidity sweeps are textbook wick signals |
| Commodities (Gold, Oil) | Medium-High | News-driven wicks can be unreliable |
| Small-cap stocks | Medium | Thin liquidity creates wicks that are noise, not institutional |
| Crypto (Alt/Micro) | Low | Too thin, wicks are just slippage, not meaningful rejection |

### 10.2 Best Conditions

- High-liquidity instruments
- Clear trending or ranging structure (not choppy)
- Session transitions (London open, NY open) for forex/indices
- Post-sweep environments where liquidity has been grabbed
- Away from major scheduled news (NFP, FOMC, CPI)

### 10.3 Worst Conditions

- Thin overnight/Asian sessions for forex
- Low-cap crypto with sporadic volume
- Immediately before/during high-impact news
- Choppy, directionless markets with no clear structure

---

## 11. Statistical Effectiveness: Academic and Practitioner Data

### 11.1 Bulkowski's Encyclopedia of Candlestick Charts

The most comprehensive practitioner-level study:

| Pattern | Success Rate | Confirmation Method |
|---------|-------------|---------------------|
| Hammer (bullish) | 60.3% | Breakout above high |
| Inverted Hammer | 50-67% | Context-dependent |
| Shooting Star (bearish) | ~59% | Close below low |
| Pin Bar (general) | 55-65% | Varies by context |
| Doji | 50-55% | Poor standalone |
| Spinning Top | ~48% | Essentially random |

**Critical finding**: Only 10% of candlestick patterns work >= 60% of the time AND occur frequently enough to be tradeable.

### 11.2 Academic Studies (Mostly Skeptical)

- **Fock et al. (2005)**: Intraday candlestick patterns not significantly better than random even before transaction costs
- **Duvinage et al. (2013)**: 5-minute candlesticks on DJIA constituents -- no evidence of outperforming buy-and-hold
- **Prado et al. (2013)**: Brazilian market -- no statistical evidence of predictive power; some patterns showed contradictory results
- **Forex market study**: No evidence of candlestick patterns predicting trends in foreign exchange

### 11.3 Supportive Research

- **Xie et al. (2012)**: Claimed to demonstrate that candlesticks DO provide predictive power based on past performance
- **Nifty IT Sector study (2025)**: Two-day patterns (Harami) showed 72.85% reliability; single-day patterns (Hammer) showed lower success
- **TradesViz backtesting (2025-2026)**: Context beats patterns -- a mediocre pattern with good filters beats a "perfect" pattern in isolation every time. Some patterns showed opposite effectiveness from textbook predictions (Bearish Engulfing performing bullish at 75.76% win rate on ES long)

### 11.4 Synthesis

**Candlestick patterns including wicks are NOT reliable as standalone signals (45-60% base rate).** However, they become significantly more effective when combined with:
- Key structural levels (S/R, order blocks, FVGs)
- Volume confirmation
- Trend context (with-trend signals outperform counter-trend)
- Higher timeframes (daily/4H >> intraday)
- Multiple confluence factors

The edge is not in the pattern itself but in the CONTEXT in which the pattern appears.

---

## 12. Best Open-Source Wick Analysis Tools

### 12.1 TradingView Indicators (Ranked by Quality)

#### Tier 1: Professional Grade

**1. Wick Pressure Zones [BigBeluga]**
- Logic: Decomposes candles, normalizes wick lengths over a lookback, scores 0-100, combines with RSI filter
- Features: 10-layer gradient zones, volume labels, zone management (broken flag), max levels limit
- Trading strategies: First-retest fade, break-and-go, confluence stacking
- Best for: Supply/demand zone identification
- URL: https://www.tradingview.com/script/4haSPpAE-Wick-Pressure-Zones-BigBeluga/

**2. Long Wick Detector [LuxAlgo]**
- Logic: Dynamic volatility threshold (ATR-based) rather than fixed ratio
- Features: Mitigated vs. unmitigated level tracking, wick-based candle transparency, breakout-based coloring
- Adjustable level % (0-100), max duration for levels, colored candle modes
- Best for: Identifying unmitigated wick levels for retest trades
- URL: https://www.tradingview.com/script/8OYreAz6-Long-Wick-Detector-LuxAlgo/

**3. Liquidity Hunter [ChartPrime]**
- Logic: Body% (<30%), Wick% (>60%) thresholds, ATR-based dynamic targets
- Features: Profit target + stop loss via ATR multiplier (1.5x default), CHOCH/BOS detection, candle color highlighting
- Best for: Reversal detection with built-in risk management
- URL: https://www.tradingview.com/script/E9z8Isgd-Liquidity-Hunter-ChartPrime/

**4. ICT Daily Wick Quadrants [Frenchy_Trades]**
- Logic: Fibonacci retracement within daily wicks, premium/discount zone mapping
- Best for: ICT traders wanting intraday S/R from daily wick structure
- URL: https://www.tradingview.com/script/uCYd2nzZ-ICT-Daily-Wick-Quadrants/

#### Tier 2: Solid Utilities

**5. Wick Analysis Chart [LTS / LHAMA-Trading]**
- Logic: Oscillator measuring wick-to-body percentage ratios with volume-weighted calculations
- Scaling: Linear, logarithmic, or square root volume weighting
- Filters: ATR-based volatility, wick size thresholds, doji detection
- Best for: Quantified wick analysis as an oscillator panel
- URL: https://www.tradingview.com/script/TYdk4s2F-Wick-Analysis-Chart-LTS/

**6. Wick Spike 50% Detector**
- Logic: Detects candles where wick exceeds a percentage of total range, marks the 50% CE level
- Best for: Scalpers and day traders spotting quick spikes
- URL: https://www.tradingview.com/script/C3QAkRIW/

**7. Pivot and Wick Boxes with Break Signals v2**
- Logic: Identifies pivot points, draws wick-range boxes, generates break signals
- Best for: Structural wick zone mapping
- URL: https://www.tradingview.com/script/QGdE503P/

**8. Wick Trend Analysis with Supertrend and RSI [AYNET]**
- Logic: Combines wick trend direction, Supertrend filter, and RSI for comprehensive framework
- Best for: Trend-filtered wick trading
- URL: https://www.tradingview.com/script/Zae5ipPl/

**9. Wick CE (Consequent Encroachment) [twingall]**
- Logic: Plots midpoint lines of candle wicks -- the ICT CE level
- Lightweight utility for quickly identifying wick midpoints without manual Fibonacci drawing
- URL: https://www.tradingview.com/script/taoEj9vY-wick-CE-plot-candle-wick-and-tail-midpoint-lines/

**10. ICT Concept [TradingFinder] -- Order Block + FVG + Liquidity Sweeps**
- Logic: Combined ICT toolkit including sweep detection, OB marking, and FVG identification
- Best for: Full ICT methodology implementation
- URL: https://www.tradingview.com/script/5n6Lawvs-ICT-Concept-TradingFinder-Order-Block-FVG-Liquidity-Sweeps/

### 12.2 Platform Indicators

**TrendSpider Wick Sniper**
- Logic: 14-period Wilders Moving Average + advanced ATR formula creating upper/lower deviation bands
- Uses a 1-candle offset to avoid hindsight bias
- Parameters: Offset, Deviation, Trail, MA Type, MA Length
- Best for: Identifying extended-from-mean volatile moves
- URL: https://help.trendspider.com/kb/indicators/wick-sniper

**TrendSpider Wick Oscillator**
- Logic: Calculates difference between highs/lows of consecutive candles for volatility/momentum visualization
- Best for: Measuring wick-based momentum shifts

### 12.3 Python Libraries

**TA-Lib (ta-lib-python)**
- 61 built-in candlestick patterns including CDLHAMMER, CDLSHOOTINGSTAR, CDLDOJI, CDLENGULFING
- One-liner detection: `talib.CDLHAMMER(open, high, low, close)` returns 100 (bullish), -100 (bearish), 0 (no signal)
- Limitations: Fixed definitions from ~15 years ago, no custom wick ratio adjustment, known edge-case inaccuracies
- GitHub: https://github.com/mrjbq7/ta-lib

**Custom Python approach (recommended for wick-specific analysis)**:
```python
# Custom wick analysis is straightforward with pandas
upper_wick = df['high'] - df[['close', 'open']].max(axis=1)
lower_wick = df[['close', 'open']].min(axis=1) - df['low']
body = (df['close'] - df['open']).abs()
total_range = df['high'] - df['low']

wick_to_body_ratio = lower_wick / body.clip(lower=0.0001)
wick_pct_of_range = lower_wick / total_range.clip(lower=0.0001)

# Signal: wick ratio >= 2.0 AND wick >= 60% of range AND volume above average
signal = (wick_to_body_ratio >= 2.0) & (wick_pct_of_range >= 0.60) & (df['volume'] > df['volume'].rolling(20).mean())
```

---

## 13. Current PineScript Implementation Audit

### File: `/home/user/hht-operations-platform/pinescript/indicators/wick_analysis_pro.pine`

### Rating: 6.5 / 10

### What It Does Well

1. **Correct wick math** (lines 42-54): Body size, total range, upper/lower wick calculations, and safe division-by-zero handling are all implemented correctly
2. **Dual-signal detection** (lines 68-79): Properly implements both wick-to-body ratio AND wick-as-percentage-of-range, which is better than most simple pin bar detectors that use only one measure
3. **Volume confirmation** (lines 59-61): Configurable SMA-based volume filter with adjustable lookback and multiplier
4. **ICT liquidity sweep detection** (lines 86-107): Swing high/low tracking with sweep detection (price exceeds swing level but closes back inside) is a solid implementation
5. **Wick fill zone visualization** (lines 117-130): Box-based zone tracking with configurable expiry
6. **Signal scoring system** (lines 162-172): 1-5 score based on multiple confluence factors is a good approach
7. **Alert conditions** (lines 220-231): Comprehensive alerts for all signal types

### What Is Missing or Could Be Improved

#### Critical Gaps

**1. No ATR-based wick size filter**
The indicator checks wick ratios but does not require the wick to be a minimum absolute size relative to volatility. A tiny candle with a 2:1 wick ratio on a flat day is noise. The `wick > ta.atr(14) * 0.5` filter on line 120 only applies to wick fill zone creation, not to the base signal generation.

**Recommended fix**: Add `lowerWick > atrVal * 0.5` (or configurable multiplier) to the base rejection conditions on lines 69 and 75.

**2. No doji detection/exclusion**
Doji candles (body < 5% of total range) produce extreme wick ratios and generate false signals. The LTS Wick Analysis Chart specifically filters these out.

**Recommended fix**: Add `bodySize > totalRange * 0.05` to the rejection conditions.

**3. No opposite-wick filter**
A clean pin bar has a short or nonexistent opposite wick. Currently, a candle with equal-length upper and lower wicks could trigger if either exceeds the ratio threshold.

**Recommended fix**: Add condition that the dominant wick must be >= 3x the opposite wick length.

**4. No RSI or momentum directional filter**
The BigBeluga Wick Pressure Zones indicator uses RSI to confirm directional pressure (RSI > 50 for valid supply zones, RSI < 50 for valid demand zones). Our implementation has no momentum filter.

**Recommended fix**: Add optional RSI(14) confirmation: bullish wicks validated when RSI < 50 (oversold territory), bearish wicks when RSI > 50.

**5. No Consequent Encroachment (CE) levels**
The ICT methodology's most actionable wick concept -- the 50% midpoint of the wick as a key entry/invalidation level -- is completely absent.

**Recommended fix**: Plot CE levels for significant wicks, similar to the twingall "wick CE" indicator.

**6. No trend context filter**
The indicator generates signals regardless of trend direction. With-trend wick signals are significantly more reliable than counter-trend signals.

**Recommended fix**: Add optional EMA(50) or EMA(200) trend filter. Bullish wicks below EMA = with-trend in uptrend. Or at minimum, display the trend direction alongside the signal.

#### Moderate Gaps

**7. Multi-wick zone logic is primitive** (lines 140-155)
The current approach uses a simple counter that increments on any wick rejection, regardless of price level. It does not check whether multiple wicks occurred at the SAME price zone. Two wicks -- one at the top and one at the bottom of a range -- would both increment the same counter.

**Recommended fix**: Track actual price levels of wick rejections and cluster them by ATR-based proximity. Only count as a "zone" when 2+ wicks are within 0.5 * ATR of each other.

**8. Swing detection uses fixed 5-bar lookback** (line 86-87)
The `ta.pivothigh(high, 5, 5)` and `ta.pivotlow(low, 5, 5)` use hardcoded 5-bar lookback. This should be configurable and potentially adaptive.

**9. No FVG detection**
Fair Value Gaps are a natural complement to wick analysis in the ICT framework. When a wick rejection coincides with an FVG, the signal is much stronger.

**10. No multi-timeframe support**
The indicator operates on a single timeframe only. A wick rejection on the 1H that aligns with a daily wick zone is much higher probability.

**11. Wick fill zones do not track whether they were actually filled**
The boxes are drawn but there is no logic to mark them as "filled" when price returns to the zone, or to change their visual state.

**12. No premium/discount zone context**
The ICT premium/discount framework (wicks above/below the 50% equilibrium of the current range) is not implemented.

---

## 14. Recommended Improvements

### Priority 1 (Critical -- Significantly Improves Signal Quality)

1. Add ATR minimum wick size filter to base signal conditions
2. Add doji detection and exclusion
3. Add opposite-wick filter for clean pin bars
4. Fix multi-wick zone logic to use price-level clustering
5. Add Consequent Encroachment (CE) midpoint level plotting

### Priority 2 (High -- Adds Important Context)

6. Add RSI directional filter (optional, togglable)
7. Add trend context via EMA(50)/EMA(200)
8. Make swing detection lookback configurable
9. Add wick fill zone mitigation tracking (visual state change when price fills the zone)

### Priority 3 (Enhancement -- Full ICT Integration)

10. Add FVG detection and wick-FVG confluence scoring
11. Add multi-timeframe wick zone reference
12. Add premium/discount range context
13. Add Change of Character (CHoCH) detection near wick signals
14. Add session-based filtering (e.g., highlight London/NY session wicks differently)

---

## 15. Complete Entry/Exit Rules Framework

### 15.1 Entry Rules (Long / Bullish Wick Signal)

**Minimum conditions (all must be true):**
1. Lower wick >= 2.0x body size
2. Lower wick >= 60% of total candle range
3. Wick length >= 0.5 * ATR(14)
4. Body >= 5% of total range (not a doji)
5. Lower wick >= 3x upper wick length
6. Volume > SMA(volume, 3)
7. Candle has closed (do not trade mid-formation)

**High-confidence additions (bonus score):**
- Signal occurs at a known support level, demand zone, or FVG (+1)
- Bullish close (close > open) (+1)
- Liquidity sweep detected (price swept below swing low and closed back above) (+1)
- Multiple wick rejections at this zone (2+) (+1)
- RSI(14) < 50 (in oversold territory) (+1)
- Price is in discount zone (below 50% equilibrium of current range) (+1)
- With-trend signal (price above EMA(50) on higher timeframe) (+1)

**Score interpretation:**
- 7 minimum conditions + 0-2 bonus = Low confidence, small position or skip
- 7 minimum conditions + 3-4 bonus = Medium confidence, standard position
- 7 minimum conditions + 5-7 bonus = High confidence, full position

### 15.2 Entry Execution

Two methods:

**Method A: Immediate entry on candle close**
- Enter at close of the wick candle
- Stop-loss: Below the wick tip (or at the wick CE for tighter risk)
- Fastest execution but wider stop

**Method B: Limit order at wick CE (50% midpoint)**
- Place limit order at the 50% retracement of the wick
- Stop-loss: Below the wick tip
- Better entry price but risk of price not retracing to the limit

### 15.3 Stop-Loss Placement

| Method | Placement | Risk | Best For |
|--------|-----------|------|----------|
| Beyond wick tip | Low - wick_tip * 1.01 | Widest, safest | Swing trades |
| At wick tip | Exactly at Low | Standard | Day trades |
| At wick CE (50%) | At wick midpoint | Tightest, more invalidations | Scalps, ICT style |

**ICT stop-loss rule**: If price retraces more than 50% of the wick (past the CE), the rejection has likely failed. This provides the tightest stop with the best R:R but the highest invalidation rate.

### 15.4 Exit Rules / Take Profit

| Target | Method | R:R Typical |
|--------|--------|-------------|
| Conservative | Next significant S/R level | 1:1.5 - 1:2 |
| Standard | 1.5x ATR from entry | 1:2 - 1:3 |
| Aggressive | Opposite side of current range | 1:3 - 1:5 |
| ICT-style | Next FVG or order block | Variable |
| Trailing | Trail stop below each successive higher low | Open-ended |

### 15.5 Risk Management

- Maximum risk per trade: 1-2% of account equity
- Position size = (Account * Risk%) / (Entry - Stop Loss)
- If wick length > 1.5x ATR, reduce position size (abnormally large stop)
- Maximum 2-3 correlated positions open simultaneously
- Scale out: 50% at 1:2 R:R, remaining 50% at 1:3+ or trailing

---

## 16. Sources

### Methodology and Strategy
- [FXOpen -- Candlestick Wick Trading: Strategies and Insights](https://fxopen.com/blog/en/candlestick-wick-meaning-and-trading-strategies/)
- [Tradeciety -- How to Trade Candlestick Wicks](https://tradeciety.com/how-to-trade-candlestick-wicks)
- [TradingFinder -- Candlestick Wicks in ICT](https://tradingfinder.com/education/forex/candlestick-wicks/)
- [PriceAction.com -- Pin Bar Trading Strategy](https://priceaction.com/price-action-university/strategies/pin-bar/)
- [TradeFundrr -- Wick Rejection Trading Setups](https://tradefundrr.com/wick-rejection-trading-setups/)
- [AlphaExCapital -- Are Candle Wicks Important in Trading (2026)](https://www.alphaexcapital.com/forex/forex-market-analysis/candlestick-patterns/are-candle-wicks-important-in-trading)
- [Phemex -- Long Wick Candle Trading (2025)](https://phemex.com/academy/long-wick-candle-trading)
- [Angel One -- Wick Fill Trading Strategy](https://www.angelone.in/knowledge-center/online-share-trading/wick-fill-trading-strategy)
- [ControllerFX -- Price Action Wick Fills](https://www.controllerfx.com/beginners-guide/price-action-wick-fills)
- [Defcofx -- Wick Fill Trading Strategy](https://www.defcofx.com/wick-fill-trading-strategy/)
- [Defcofx -- What Is a Premium Wick ICT](https://www.defcofx.com/what-is-a-premium-wick-ict/)

### ICT Methodology
- [Tradezella -- Key ICT Concepts](https://www.tradezella.com/learning-items/key-ict-concepts)
- [FluxCharts -- Liquidity Sweeps Explained](https://www.fluxcharts.com/articles/Trading-Concepts/Price-Action/liquidity-sweeps)
- [EBC Financial Group -- ICT Trading Strategy Explained](https://www.ebc.com/forex/ict-trading-strategy-explained-a-beginner-s-guide)
- [FXNX -- ICT Breaker Blocks](https://fxnx.com/en/blog/ict-breaker-blocks-master-art-trading-failed-order-blocks)
- [WritoFinance -- Consequent Encroachment & Mean Threshold](https://www.writofinance.com/consequent-encroachment-and-mean-threshold/)
- [TheICTTrader -- Wicks Require Special Consideration](https://theicttrader.com/2024/03/05/wicks-require-special-consideration/)
- [TradingFinder -- ICT Consequent Encroachment](https://tradingfinder.com/education/forex/ict-consequent-encroachment/)
- [The Simple ICT -- CE Guide 2026](https://thesimpleict.com/consequent-encroachment-ce-guide/)
- [InnerCircleTrader.net -- ICT Consequent Encroachment Tutorial](https://innercircletrader.net/tutorials/ict-consequent-encroachment/)
- [Phidias Prop Firm -- Liquidity Sweep ICT Guide](https://phidiaspropfirm.com/education/liquidity-sweep)
- [DailyPriceAction -- How to Trade Liquidity Sweep Reversals](https://dailypriceaction.com/blog/liquidity-sweep-reversals/)
- [Beirman Capital -- What Is a Premium Wick ICT](https://beirmancapital.com/what-is-a-premium-wick-ict/)

### TradingView Indicators
- [BigBeluga -- Wick Pressure Zones](https://www.tradingview.com/script/4haSPpAE-Wick-Pressure-Zones-BigBeluga/)
- [LuxAlgo -- Long Wick Detector](https://www.tradingview.com/script/8OYreAz6-Long-Wick-Detector-LuxAlgo/)
- [ChartPrime -- Liquidity Hunter](https://www.tradingview.com/script/E9z8Isgd-Liquidity-Hunter-ChartPrime/)
- [Frenchy_Trades -- ICT Daily Wick Quadrants](https://www.tradingview.com/script/uCYd2nzZ-ICT-Daily-Wick-Quadrants/)
- [LHAMA-Trading -- Wick Analysis Chart LTS](https://www.tradingview.com/script/TYdk4s2F-Wick-Analysis-Chart-LTS/)
- [twingall -- Wick CE Indicator](https://www.tradingview.com/script/taoEj9vY-wick-CE-plot-candle-wick-and-tail-midpoint-lines/)
- [TFlab -- ICT Concept (OB + FVG + Liquidity Sweeps)](https://www.tradingview.com/script/5n6Lawvs-ICT-Concept-TradingFinder-Order-Block-FVG-Liquidity-Sweeps/)
- [LibyanSatoshi -- Wick Fill Indicator](https://www.tradingview.com/script/CDHE1mpj-LibyanSatoshi-Wick-Fill/)
- [thinkCNE -- Trade Entry Detector Wick-to-Body Ratio](https://www.tradingview.com/script/myGHorN2-Trade-Entry-Detector-Wick-to-Body-Ratio/)

### Platform Indicators
- [TrendSpider -- Wick Sniper](https://help.trendspider.com/kb/indicators/wick-sniper)
- [TrendSpider -- Wick Oscillator](https://help.trendspider.com/kb/indicators/wick-oscillator)
- [LuxAlgo Library -- Long Wick Detector](https://www.luxalgo.com/library/indicator/long-wick-detector/)

### Academic Research and Statistics
- Thomas Bulkowski, *Encyclopedia of Candlestick Charts* (60.3% hammer success rate)
- [TradesViz -- Candlestick Pattern Backtesting Deep Dive](https://www.tradesviz.com/blog/candlestick-pattern-effectiveness-backtesting/)
- [SSRN -- Profitability of Bullish Reversal Candlestick Patterns (Nifty IT 2025)](https://papers.ssrn.com/sol3/Delivery.cfm/5755102.pdf?abstractid=5755102)
- [Journal of International Business Research -- Candlestick Analysis](https://scholars.fhsu.edu/cgi/viewcontent.cgi?article=1101&context=jiibr)
- Fock et al. (2005) -- Intraday candlestick patterns not better than random
- Duvinage et al. (2013) -- No evidence of outperforming buy-and-hold on 5-minute DJIA
- Prado et al. (2013) -- No statistical evidence in Brazilian market
- Xie et al. (2012) -- Counter-evidence supporting candlestick predictive power
- [Strike.money -- Pin Bar Pattern Guide](https://www.strike.money/technical-analysis/pin-bar)
- [Strike.money -- Hammer Candlestick Pattern](https://www.strike.money/technical-analysis/hammer-candlestick-pattern)

### Python / GitHub
- [GitHub -- TA-Lib Python](https://github.com/mrjbq7/ta-lib)
- [GitHub -- Candlestick Pattern Recognition with Python and TA-Lib](https://github.com/GaneshJainarain/Candlestick-Pattern-Recognition-with-Python-and-TA-Lib)
- [GitHub -- Candlestick Pattern Detection](https://github.com/edgetrader/candlestick-pattern)
- [GitHub Topics -- Candlestick Patterns Detection](https://github.com/topics/candlestick-patterns-detection)

### Risk Management
- [LearnToTradeTheMarket -- Stop Loss Placement](https://www.learntotradethemarket.com/forex-trading-strategies/how-to-place-stop-loss-profit-target-forex-trading)
- [Mind Math Money -- Risk Management Tools 2025](https://www.mindmathmoney.com/articles/risk-management-trading-tools-every-trader-must-use-in-2025)
