# ICT Methodology + Wick Analysis Deep Dive
## Ralph Loop Iterations 5-6 Research Report
## Date: 2026-03-17

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [ICT Methodology — Complete Framework](#ict-methodology)
   - 2.1 Core Philosophy
   - 2.2 Fair Value Gaps (FVGs) — Mathematical Definition
   - 2.3 Order Blocks — Detection Rules
   - 2.4 Breaker Blocks vs Mitigation Blocks
   - 2.5 Liquidity Sweeps — Identification Rules
   - 2.6 Market Structure Shift (MSS) & Displacement
   - 2.7 Optimal Trade Entry (OTE) — Fibonacci Framework
   - 2.8 Kill Zones — Exact Session Times
   - 2.9 Power of Three (AMD Cycle)
   - 2.10 IPDA Data Ranges (20/40/60 Day)
   - 2.11 Silver Bullet Strategy
   - 2.12 Inducement
3. [Wick Analysis — Statistical Research](#wick-analysis)
   - 3.1 Pin Bar / Hammer Backtest Results
   - 3.2 Wick Fill Probability
   - 3.3 Wick-to-Body Ratio Optimal Thresholds
   - 3.4 Candlestick Pattern Win Rates (75-Pattern Study)
   - 3.5 Doji vs Hammer vs Shooting Star by Market
4. [Top 5 TradingView ICT/SMC Scripts](#top-tradingview-scripts)
5. [Integration Map: ICT + Wick Analysis Pro](#integration-map)
6. [PineScript Implementation Specifications](#pinescript-specs)
7. [Recommended Enhancements to Existing Indicators](#enhancements)

---

## 1. Executive Summary <a name="executive-summary"></a>

This report documents the complete ICT (Inner Circle Trader) methodology with mathematical precision, alongside statistical research on wick/candlestick effectiveness. The goal is to identify exactly what can be coded, what has statistical backing, and how these concepts integrate with our existing Wick Analysis Pro indicator.

**Key findings:**
- ICT concepts are mathematically well-defined and fully programmable (FVGs, Order Blocks, MSS, Kill Zones, IPDA ranges)
- Wick-based candlestick patterns have a 66% outperformance rate vs buy-and-hold when backtested across 75 patterns on SPY
- The Hammer pattern is the 2nd most effective single candlestick pattern; daily timeframe produces the most reliable signals
- No rigorous peer-reviewed statistical data exists for wick fill probability percentages, but the 50% wick fill level is widely used as a key retracement target
- LuxAlgo's Smart Money Concepts indicator is the gold standard open-source implementation; its FVG and Order Block detection logic is fully documented
- The ICT Silver Bullet strategy claims 70-80% win rate but backtests show high variance month-to-month

---

## 2. ICT Methodology — Complete Framework <a name="ict-methodology"></a>

### 2.1 Core Philosophy

ICT (Inner Circle Trader), developed by Michael J. Huddleston, is based on the premise that:
- Price moves to seek **liquidity** (stop-loss clusters) and rebalance **imbalances** (fair value gaps)
- Large institutional participants ("smart money") drive price algorithmically via the **Interbank Price Delivery Algorithm (IPDA)**
- Retail traders are systematically trapped through **inducement** and **manipulation** before the real institutional move
- Markets follow a recurring **Power of Three** cycle: Accumulation, Manipulation, Distribution

The framework rejects traditional indicator-based trading in favor of reading the "footprints" left by institutional order flow through price action structures.

---

### 2.2 Fair Value Gaps (FVGs) — Mathematical Definition

**EXACT DEFINITION:**

A Fair Value Gap is a three-candle formation where there is NO overlap between the wick of candle N-2 and the wick of candle N.

**Bullish FVG:**
```
Condition: low[0] > high[2]
Gap Top:    low[0]       // Low of current (3rd) candle
Gap Bottom: high[2]      // High of first candle
Gap exists when: low[0] > high[2]  (no overlap)
```

**Bearish FVG:**
```
Condition: high[0] < low[2]
Gap Top:    low[2]       // Low of first candle
Gap Bottom: high[0]      // High of current (3rd) candle
Gap exists when: high[0] < low[2]  (no overlap)
```

**PineScript Detection Logic (from LuxAlgo open source):**
```pinescript
// Bullish FVG
bullish_fvg = low > high[2] and close[1] > high[2]
bull_fvg_top = low
bull_fvg_bottom = high[2]

// Bearish FVG
bearish_fvg = high < low[2] and close[1] < low[2]
bear_fvg_top = low[2]
bear_fvg_bottom = high
```

**Additional FVG Concepts:**
- **Consequent Encroachment**: The midpoint of the FVG. If price reaches this midpoint and respects it, the FVG is being "respected." Formula: `(fvg_top + fvg_bottom) / 2`
- **FVG Inversion**: When price fully fills an FVG and comes back from the other side, it flips role (support becomes resistance). This is a high-probability setup
- **Implied FVG (IFVG)**: FVGs that form within displacement candles on lower timeframes but are not visible on the current timeframe
- **FVG Filtering**: LuxAlgo uses a `threshold` parameter — only FVGs where `delta_per > threshold` are kept (filters small/noise FVGs). Auto-threshold keeps only above-ATR-sized gaps

**Mitigation (Fill) Rules:**
- By wick: FVG is considered mitigated if price wicks into the zone
- By close: FVG is only mitigated if price closes within/through the zone (more conservative)

**Market Suitability:** All markets. Most effective in forex and index futures where institutional order flow is dominant.

**Statistical Note:** LuxAlgo's FVG indicator tracks fill percentage and average fill duration in bars. No peer-reviewed study quantifies FVG fill rates, but the community consensus is that 60-70% of FVGs eventually get partially filled.

---

### 2.3 Order Blocks — Detection Rules

**EXACT DEFINITION:**

An Order Block is the last opposing candle before a significant displacement move in the opposite direction.

**Bullish Order Block:**
```
1. Candle N is bearish (close[1] < open[1])
2. Candle N+1 is bullish and engulfs candle N completely (body-to-body AND wick-to-wick)
3. Candle N+1 grabs the low of candle N (low[0] < low[1] at some point during the bar)
4. Candle N+1 closes above the high of candle N (close > high[1])
5. The move creates an imbalance (FVG should be present on lower timeframes)
6. A Market Structure Shift should accompany the move

OB Zone: high[1] to low[1] (the full range of the bearish candle N)
```

**Bearish Order Block:**
```
1. Candle N is bullish (close[1] > open[1])
2. Candle N+1 is bearish and engulfs candle N completely
3. Candle N+1 grabs the high of candle N (high[0] > high[1])
4. Candle N+1 closes below the low of candle N (close < low[1])
5. FVG present on lower timeframe within the OB zone
6. Market Structure Shift accompanies the move

OB Zone: low[1] to high[1] (the full range of the bullish candle N)
```

**LuxAlgo Alternative Detection (Volume-Based):**
LuxAlgo detects order blocks by finding **volume peaks** (pivot highs in volume), then marking the candle range as an OB. This is more quantitative than pure price-action detection.

```pinescript
// Simplified OB detection (LuxAlgo approach)
vol_pivot = ta.pivothigh(volume, volPivotLen, volPivotLen)
is_bull_ob = not na(vol_pivot) and close[volPivotLen] < open[volPivotLen]
is_bear_ob = not na(vol_pivot) and close[volPivotLen] > open[volPivotLen]

// OB zone for bullish
ob_top = high[volPivotLen]
ob_bottom = low[volPivotLen]
```

**OB Mitigation:**
- When price returns to the OB zone and wicks into it (wick mitigation) or closes through it (close mitigation), the OB is considered mitigated/used
- Mitigated OBs are removed from the chart
- Typically display only the N most recent unmitigated OBs (default: 5)

**High-Probability OB Confirmation:**
1. OB formed after an inducement (liquidity sweep of nearby high/low)
2. OB caused a displacement (strong momentum candles with small wicks)
3. OB accompanied by a clear Market Structure Shift
4. OB located in the OTE zone (61.8%-79% Fibonacci retracement)
5. OB aligned with higher timeframe bias

---

### 2.4 Breaker Blocks vs Mitigation Blocks

**Breaker Block = Failed Order Block that SWEEPS liquidity before reversing**

```
Formation sequence:
1. Order Block forms (e.g., bullish OB)
2. Price returns to the OB zone
3. Price breaks THROUGH the OB (OB fails)
4. BUT: before breaking, price made a NEW high/low (swept liquidity)
5. Price reverses and the failed OB now acts as resistance (was support)
6. The failed bullish OB is now a BEARISH Breaker Block
```

**Mitigation Block = Failed Order Block that does NOT sweep liquidity**

```
Formation sequence:
1. Order Block forms
2. Price returns toward the OB
3. Price FAILS to make a new high/low (no liquidity sweep)
4. Price breaks through the OB anyway
5. This is a failure swing (momentum fading)
6. The failed OB becomes a Mitigation Block
```

**Key distinction:** Breaker = swept liquidity first, then reversed. Mitigation = no liquidity sweep, just failed continuation.

**Probability ranking:** Breaker > Mitigation > Standard OB (Breakers are highest probability because the liquidity sweep provides fuel for the reversal)

**When either fails:** They revert to "Reclaimed Order Blocks" — back to original support/resistance function.

**"The Unicorn" setup:** When a Breaker Block aligns with a Fair Value Gap at the same price level. ICT considers this one of the highest probability setups in the methodology.

---

### 2.5 Liquidity Sweeps — Identification Rules

**EXACT DEFINITION:**

A liquidity sweep occurs when price briefly trades beyond a significant level (where stop orders accumulate) and then reverses back inside the prior range.

**Types of Liquidity:**
```
Buy-Side Liquidity (BSL): Resting above swing highs, resistance levels, equal highs
  - Contains: Buy stop orders (from short sellers' stop losses)
  - Appears above: Recent highs, double tops, triple tops, trend line highs

Sell-Side Liquidity (SSL): Resting below swing lows, support levels, equal lows
  - Contains: Sell stop orders (from long holders' stop losses)
  - Appears below: Recent lows, double bottoms, triple bottoms, trend line lows
```

**Detection Rules for a Bullish Liquidity Sweep (at SSL):**
```pinescript
// Price trades below the low, then closes back above it
bull_sweep = low < prior_swing_low and close > prior_swing_low

// Additional confirmation:
// - Long lower wick (wick > 50% of total range)
// - Volume spike
// - Occurs during a kill zone session
```

**Detection Rules for a Bearish Liquidity Sweep (at BSL):**
```pinescript
// Price trades above the high, then closes back below it
bear_sweep = high > prior_swing_high and close < prior_swing_high

// Additional confirmation:
// - Long upper wick (wick > 50% of total range)
// - Volume spike
// - Occurs during a kill zone session
```

**Sweep vs Grab vs Run:**
- **Liquidity Grab**: Single candle event — one bar pierces the level and snaps back (long wick)
- **Liquidity Sweep**: May involve brief consolidation beyond the level before returning
- **Liquidity Run**: Price continues PAST the level in the trend direction (NOT a reversal)

**Trading After a Sweep:**
1. If SSL is swept: Look for LONG opportunities
2. If BSL is swept: Look for SHORT opportunities
3. Stop loss: Beyond the sweep extreme + small ATR buffer
4. First target: Range midpoint
5. Second target: Opposing liquidity pool

**Integration with our Wick Analysis Pro:**
Our current indicator already detects liquidity sweeps. Enhancement: add FVG and Order Block confluence detection at the sweep point.

---

### 2.6 Market Structure Shift (MSS) & Displacement

**Market Structure Shift (MSS):**

MSS occurs when price breaks a swing high or swing low with a displacement candle, signaling a change in market direction.

```
Swing High definition: Three-candle formation where high[1] > high[0] AND high[1] > high[2]
Swing Low definition:  Three-candle formation where low[1] < low[0] AND low[1] < low[2]

Bullish MSS: Price breaks above a swing high with a displacement move
Bearish MSS: Price breaks below a swing low with a displacement move
```

**Valid MSS Requirements:**
1. **Liquidity Sweep** must precede the break (BSL or SSL taken first)
2. **Body close** through the swing point (not just a wick — wick-only = liquidity grab, not MSS)
3. **Displacement with FVG** — the move must be strong enough to leave an imbalance
4. **Higher Timeframe Alignment** — MSS should align with HTF bias

**MSS vs BOS vs CHoCH:**
- **BOS (Break of Structure)**: Continues the existing trend (higher high in uptrend, lower low in downtrend)
- **CHoCH (Change of Character)**: First break against the trend direction (weaker signal)
- **MSS (Market Structure Shift)**: CHoCH confirmed by displacement + FVG + liquidity sweep (strongest signal)

**Displacement Definition:**
```
Displacement = 3+ consecutive candles in the same direction with:
  - Large real bodies
  - Very short or no wicks
  - Creates at least one Fair Value Gap
  - Often follows a liquidity sweep

NOT displacement: A single large candle without context
NOT displacement: Strong candles but with large wicks (disagreement between buyers/sellers)
```

**Displacement on different timeframes:**
- Daily displacement: Can fuel setups lasting weeks
- Hourly displacement: Good for intraday/short-term setups
- 15m/5m displacement: Scalping entries

---

### 2.7 Optimal Trade Entry (OTE) — Fibonacci Framework

**EXACT DEFINITION:**

OTE is the zone between the **0.62 (61.8%)** and **0.79 (78.6%)** Fibonacci retracement levels of a swing. The precise optimal level is **0.705**.

```
For a BULLISH OTE (after a confirmed bullish MSS):
  1. Draw Fibonacci from Swing Low to Swing High
  2. OTE zone = between 61.8% and 78.6% retracement
  3. Sweet spot = 70.5% level
  4. Entry: When price retraces into OTE zone and shows rejection (wick/engulfing/OB)
  5. Stop loss: 10-20 pips below the 100% level (below the swing low)
  6. Target: Prior swing high or next liquidity pool

For a BEARISH OTE:
  1. Draw Fibonacci from Swing High to Swing Low
  2. OTE zone = between 61.8% and 78.6% retracement
  3. Sweet spot = 70.5% level
  4. Entry: When price retraces into OTE zone and shows rejection
  5. Stop loss: 10-20 pips above the 100% level
  6. Target: Prior swing low or next liquidity pool
```

**ICT Fibonacci Levels (non-standard):**
```
0%     = Swing terminus
23.6%  = Shallow retracement
38.2%  = Moderate retracement
50%    = Equilibrium / Consequent Encroachment
61.8%  = OTE zone begins
70.5%  = Optimal Trade Entry (sweet spot)
78.6%  = OTE zone ends
100%   = Swing origin (invalidation level)
```

**Pro Tip (from ICT):** Plot Fibonacci body-to-body (open/close), NOT wick-to-wick. Wicks are often liquidity grabs and vary between brokers.

**Confluence Enhancers:**
- OTE zone overlaps with an Order Block = high probability
- OTE zone contains an FVG = high probability
- OTE zone aligns with Breaker Block = "Unicorn" setup territory

---

### 2.8 Kill Zones — Exact Session Times

All times in **Eastern Time (New York local time):**

| Kill Zone | Time (ET) | Characteristics | Best Pairs |
|-----------|-----------|-----------------|------------|
| **Asian KZ** | 7:00 PM - 10:00 PM | Low volatility, range formation, accumulation | AUD, NZD, JPY pairs |
| **London KZ** | 2:00 AM - 5:00 AM | Highest volume, creates daily high/low often | EUR, GBP, CHF pairs |
| **New York KZ** | 7:00 AM - 10:00 AM (indices: 8:30-11:00) | London/NY overlap, high volatility | USD pairs, indices |
| **London Close KZ** | 10:00 AM - 12:00 PM | Late reversals, position squaring | Scalping opportunities |

**Key principles:**
- London KZ tends to create the LOW of the day in bullish markets, HIGH of the day in bearish markets
- New York KZ often reverses the London session's manipulation
- Asian session establishes the range that London/NY will raid for liquidity
- Daylight Saving Time shifts these windows temporarily (US changes 2nd Sunday March; UK changes last Sunday March)

**PineScript Time Detection:**
```pinescript
// Kill Zone detection (New York time)
is_asian_kz  = (hour >= 19 or hour < 22) // 7PM-10PM ET
is_london_kz = (hour >= 2 and hour < 5)   // 2AM-5AM ET
is_ny_kz     = (hour >= 7 and hour < 10)  // 7AM-10AM ET
is_london_close = (hour >= 10 and hour < 12) // 10AM-12PM ET

// Note: Requires timezone="America/New_York" in indicator() call
```

---

### 2.9 Power of Three (AMD Cycle)

**The Three Phases:**

| Phase | Time (ET) | Description |
|-------|-----------|-------------|
| **Accumulation** | 7:00 PM - 1:00 AM | Smart money quietly builds positions. Low volume, sideways/ranging price action |
| **Manipulation** | 1:00 AM - 7:00 AM | False breakout outside accumulation range to trap retail traders and sweep liquidity |
| **Distribution** | 7:00 AM - 1:00 PM | Real institutional move. Price moves in the intended direction, opposite to manipulation |

**Trading the PO3:**
1. Identify the accumulation range (Asian session consolidation)
2. Wait for manipulation (false break of the range during London open)
3. Enter during distribution phase (after manipulation reverses, during NY session)
4. Stop loss at the manipulation extreme
5. Target 1:2 risk-reward minimum

**PineScript Indicators Available:**
- ICT Power Of Three by Flux Charts (open-source, with backtesting dashboard)
- Power Of 3 ICT 01 by TradingFinder (open-source, customizable session times)
- HTF Candle Overlay (Power of 3) by TheTickMagnet (PineScript v6)

---

### 2.10 IPDA Data Ranges (20/40/60 Day)

**EXACT DEFINITION:**

The IPDA framework looks back at three rolling windows of trading days to identify where liquidity pools and institutional reference points exist.

```
20-Day Range: Highest high and lowest low of the past 20 trading days
  - Short-term targets for intraday traders
  - Updated daily (rolling window)

40-Day Range: Highest high and lowest low of the past 40 trading days
  - Intermediate targets
  - Market seeks to rebalance between consumed liquidity zones

60-Day Range: Highest high and lowest low of the past 60 trading days
  - Major long-term targets
  - Often indicates medium-term market reversals
```

**Key Levels Within Each Range:**
```
Range High = Buy-Side Liquidity target
Range Low = Sell-Side Liquidity target
Equilibrium = (Range High + Range Low) / 2 = "Fair Value"
Premium Zone = Above equilibrium (overvalued - look to sell)
Discount Zone = Below equilibrium (undervalued - look to buy)
```

**Convergence Rule:**
When the high/low of all three ranges (20, 40, 60) converge near the same price level, that level becomes an extremely high-probability target.

**Directional Bias Matrix:**
- Price in Discount across all 3 ranges = Strongest bullish bias
- Price in Premium across all 3 ranges = Strongest bearish bias
- Mixed (e.g., 20D Premium + 60D Discount) = Short-term overextension within longer bullish context

**Quarterly Shifts:**
Every 3-4 months, the market typically resets its IPDA cycle, altering overall direction. These are the major macro turning points.

---

### 2.11 Silver Bullet Strategy

**EXACT TIME WINDOWS (all New York time):**
- Window 1: 3:00 AM - 4:00 AM ET (London session)
- Window 2: 10:00 AM - 11:00 AM ET (New York AM — most popular)
- Window 3: 2:00 PM - 3:00 PM ET (New York PM)

**Step-by-Step Rules (10 AM Window):**
```
1. Between 10:00 AM and 11:00 AM ET, identify an untapped liquidity pool
2. Wait for displacement toward that pool within the window
3. Find a Fair Value Gap (FVG) that forms opposite to the targeted pool
4. Wait for price to retrace INTO the FVG
5. Drop to lower timeframe (1m, 30s, 15s) and look for a 2nd FVG
6. Enter on the 2nd FVG in the direction of the targeted liquidity pool
7. VALIDATE: Is the range from FVG entry to liquidity pool > 5 handles?
8. Take profit at 5 handles or when the liquidity pool is reached
```

**Claimed Win Rate:** 70-80% when properly executed.

**Backtest Reality:** Highly variable month-to-month. Some months exceptional, some months terrible. Statistically inconsistent, requires discretionary skill and practice.

---

### 2.12 Inducement

**EXACT DEFINITION:**

Inducement is a deceptive price movement targeting short-term highs or lows where retail stop-loss orders cluster, designed to trigger those stops before a reversal.

```
Bullish Inducement (before a move UP):
  1. Price dips below a short-term low (triggers sell stops)
  2. Retail traders see "breakdown" and go short
  3. Smart money fills buy orders using that selling pressure
  4. Price reverses and moves up

Bearish Inducement (before a move DOWN):
  1. Price spikes above a short-term high (triggers buy stops)
  2. Retail traders see "breakout" and go long
  3. Smart money fills sell orders using that buying pressure
  4. Price reverses and moves down
```

**ICT Sequence:** Inducement -> Displacement -> MSS -> FVG -> OTE Entry

---

## 3. Wick Analysis — Statistical Research <a name="wick-analysis"></a>

### 3.1 Pin Bar / Hammer Backtest Results

**Source:** QuantifiedStrategies.com — comprehensive backtesting on S&P 500 (SPY)

**Key Findings:**
- The Hanging Man is the #1 most effective single candlestick pattern; the Hammer is #2
- Hammer patterns are most reliable on **daily timeframes** — daily bars are "much more reliable than intraday and weekly bars"
- Pin bars at key psychological levels (e.g., 1.2000 in EUR/USD) had **15-20% higher success rate** than in ranging markets (FXOpen study 2015-2020)
- Pin bar success rate improves on higher timeframes; false signal frequency decreases
- A single pattern by itself is often insufficient; combining with trend filters or a second indicator dramatically improves results

**Standalone Performance:**
- Hammer alone is profitable on daily SPY, but margins are thin
- Combined with even one additional filter (volume, trend, support level), results improve significantly

### 3.2 Wick Fill Probability

**Hard statistical data is SCARCE.** No peer-reviewed study provides a definitive fill percentage.

**What the community consensus suggests:**
- The 50% wick fill level is the most commonly used target (similar to ICT's consequent encroachment concept)
- Wicks formed during high-volume sessions (London/NY overlap) have higher fill rates than Asian session wicks
- Larger wicks on higher timeframes are more likely to be filled but may take days/weeks
- NOT all wicks get filled — ranging/choppy markets produce many unfilled wicks

**Key conditions that improve fill probability:**
1. Price must be in momentum (trending, not ranging)
2. No major news event pending
3. The range between wick and fill target is "empty" (no major S/R)
4. Wick formed at a significant structural level
5. Higher timeframe trend alignment

**Our Wick Analysis Pro already tracks wick fill zones** with configurable expiry. Enhancement: Add a 50% wick fill level as an intermediate target.

### 3.3 Wick-to-Body Ratio Optimal Thresholds

**Our current default: 2.0 (wick is 2x the body)**

**Research-based thresholds by context:**

| Threshold | Use Case | Notes |
|-----------|----------|-------|
| 0.3 (30% of total candle) | Bollinger Band reversal setups | Low threshold, high sensitivity |
| 0.5 (50% of total range) | General wick screening | Starting point; most common |
| 1.0 (wick = body) | Moderate rejection filter | Good for daily timeframe |
| 2.0 (wick = 2x body) | Strong rejection filter | Our current default; conservative |
| 5.0 (wick = 5x body) | Extreme rejection only | Very rare signals, highest conviction |

**ICT Perspective on Wicks:**
- Long wicks are treated as **volume inefficiencies**, analogous to Fair Value Gaps
- ICT expects price to NOT retrace more than 50% of a long wick
- If price retraces more than 50% of the wick, it signals weakness

**Timeframe adjustment:** Use higher ratio on smaller timeframes (more noise), lower ratio on bigger timeframes.

**Volume weighting improves signal quality.** Our indicator already has volume confirmation. Enhancement: Add ATR-based volatility filtering and doji detection to reduce noise.

### 3.4 Candlestick Pattern Win Rates (75-Pattern Study)

**Source:** QuantifiedStrategies.com — all 75 candlestick patterns backtested on SPY (S&P 500)

**Headline Results:**
- **66% of 75 patterns outperformed S&P 500** over their holding period
- 50 of 75 patterns returned better results than buy-and-hold using detrended data
- Selecting only patterns with profit factor > 1.5 yields **12 patterns** to trade
- Those 12 patterns combined: **975 trades, 12.89% CAGR, avg gain 0.36%/trade, max DD 25%, profit factor 2.02**

**Top Performers:**
| Pattern | Win Rate | Avg Gain/Trade | Profit Factor | Notes |
|---------|----------|----------------|---------------|-------|
| Bullish Piercing Line | Highest win rate | — | — | Best win rate of all 75 |
| Three Outside Down | — | 0.73% | — | Most profitable per trade |
| Bullish Harami | 76% | 0.33% | 1.65 | 306 trades, 11% time invested |
| Bearish Engulfing (traded LONG) | 75.76% | — | 2.73 | Counter-intuitive: better as bullish signal |

**Critical Insight:** "Traditional labels can be misleading. The 'bearish' patterns often work better as bullish signals." This challenges conventional candlestick interpretation.

**Holding Period Effect:** Win rate and CAGR trend upward as holding period extends toward 20 days for most patterns.

### 3.5 Doji vs Hammer vs Shooting Star by Market

| Feature | Doji | Hammer | Shooting Star |
|---------|------|--------|---------------|
| **Signal Type** | Indecision | Bullish reversal | Bearish reversal |
| **Relative Strength** | Weaker | Stronger | Stronger |
| **Best Context** | At key S/R with high volume | After 3+ declining candles at support | After uptrend at resistance |
| **Wick Requirement** | Near-zero body, wicks both sides | Lower wick >= 2x body | Upper wick >= 2x body |
| **Volume Importance** | Critical (high vol = strong signal) | Important (confirms rejection) | Important (confirms rejection) |

**By Market:**
- **Forex:** Pin bars (hammer/shooting star) extremely effective at psychological levels. Best during London/NY sessions when volume is highest
- **Crypto:** All three patterns generate more **false signals** due to extreme volatility. Require additional confirmation (volume, trend alignment)
- **Stocks:** Work well in context of broader market trend (S&P 500 direction) and sector performance. Daily timeframe most reliable

---

## 4. Top 5 TradingView ICT/SMC Scripts <a name="top-tradingview-scripts"></a>

### #1: Smart Money Concepts (SMC) by LuxAlgo
- **URL:** https://www.tradingview.com/script/CnB3fSph-Smart-Money-Concepts-SMC-LuxAlgo/
- **License:** Open source
- **Features:** Real-time market structure (internal & swing BOS/CHoCH), order blocks, premium/discount zones, equal highs/lows, FVG detection
- **Logic:** BOS/CHoCH detection via swing point breaks. Order blocks from volume pivots. FVG from three-candle gap rule. Auto-mitigation of used OBs
- **Why #1:** Most widely used, open-source, comprehensive, community-verified

### #2: Hybrid Smart Money Concepts by MarkitTick
- **URL:** https://www.tradingview.com/script/rS2PGmNY-Hybrid-Smart-Money-Concepts-MarkitTick/
- **Stats:** 1,700 likes, 24,949 chart uses
- **Features:** Market structure + gap analysis + statistical stress model. Combines VWMA matrix with volume decomposition
- **Unique:** Adds statistical modeling layer on top of standard SMC concepts

### #3: Order Block Detector by LuxAlgo
- **URL:** https://www.tradingview.com/script/KvGhxGxY-Order-Block-Detector-LuxAlgo/
- **Logic:** Volume peak detection -> mark OB zones. Auto-hides mitigated OBs. Two mitigation methods: "wick" and "close"
- **Unique:** Volume-based OB detection rather than pure price action. Configurable volume pivot length

### #4: Fair Value Gap by LuxAlgo
- **URL:** https://www.tradingview.com/script/jWY4Uiez-Fair-Value-Gap-LuxAlgo/
- **Features:** FVG detection with fill percentage tracking, average duration before fill, threshold filtering (auto mode uses ATR)
- **Unique:** Statistical overlay showing % of gaps filled and average bars-to-fill. Excellent for validating FVG trading hypotheses

### #5: ICT Power Of Three by Flux Charts
- **URL:** https://www.tradingview.com/script/byzJqthj-ICT-Power-Of-Three-Flux-Charts/
- **Features:** AMD phase detection using ATR-based manipulation constant. Accumulation range detection via pivot analysis. Auto distribution zone projection. Full backtesting dashboard
- **Unique:** Only PO3 indicator with integrated backtesting. Customizable algorithm modes per asset

**Honorable Mentions:**
- Smarter Money Concepts Dashboard by PhenLabs (combines FVG, OB, Wyckoff, Wick Rejection, ICT Market Structure)
- Smart Money Concepts (Advanced) by robbatt (library-based, extensible architecture)
- Fair Value Gap Signals by UAlgo (VVD metrics: Velocity, Volume, Depth per gap)
- ICT Silver Bullet by LuxAlgo (time-based FVG detection in Silver Bullet windows)

---

## 5. Integration Map: ICT + Wick Analysis Pro <a name="integration-map"></a>

Our existing `wick_analysis_pro.pine` already implements:
- Wick ratio and percentage detection (lines 42-54)
- Volume confirmation (lines 60-61)
- Liquidity sweep detection (lines 86-107)
- Wick fill zone tracking (lines 117-130)
- Multi-wick confluence scoring (lines 137-155)
- Signal strength scoring 1-5 (lines 162-172)

**ICT concepts that directly ENHANCE our existing indicator:**

| ICT Concept | Integration Point | Enhancement |
|-------------|-------------------|-------------|
| **Fair Value Gap** | Wick fill zones | FVGs formed AT wick rejection points = higher probability fill |
| **Order Block** | Multi-wick confluence | OB zones that align with repeated wick rejections = strongest S/R |
| **Market Structure Shift** | Signal scoring | MSS after wick rejection = add +1 to signal score |
| **Kill Zone timing** | Signal filtering | Wick rejections during kill zones = add +1 to score |
| **OTE Fibonacci** | Fibonacci integration | Wick rejection AT the 61.8-78.6% retracement = highest conviction |
| **Displacement** | Liquidity sweep | Displacement following a wick sweep = confirmed institutional entry |
| **IPDA Ranges** | Context layer | Wick rejections at 20/40/60 day range extremes = major levels |

**The key insight:** Wick rejections ARE liquidity sweeps in ICT terminology. A long lower wick = buy-side liquidity was swept. A long upper wick = sell-side liquidity was swept. Our indicator already captures this. The enhancement is adding ICT confluence layers.

---

## 6. PineScript Implementation Specifications <a name="pinescript-specs"></a>

### Spec 1: Fair Value Gap Detector (new module for wick_analysis_pro)

```
// FVG Detection
bullish_fvg = low > high[2]
bearish_fvg = high < low[2]

// FVG Zone
bull_fvg_top = low
bull_fvg_bottom = high[2]
bear_fvg_top = low[2]
bear_fvg_bottom = high

// Consequent Encroachment (midpoint)
bull_fvg_ce = (bull_fvg_top + bull_fvg_bottom) / 2
bear_fvg_ce = (bear_fvg_top + bear_fvg_bottom) / 2

// FVG minimum size filter (ATR-based)
fvg_min_size = ta.atr(14) * 0.25  // Configurable threshold
valid_bull_fvg = bullish_fvg and (bull_fvg_top - bull_fvg_bottom) > fvg_min_size
valid_bear_fvg = bearish_fvg and (bear_fvg_top - bear_fvg_bottom) > fvg_min_size

// Mitigation tracking
// Track as boxes; delete when price closes through zone
```

### Spec 2: Order Block Detector (volume-based approach)

```
// Volume pivot detection
vol_pivot_len = input.int(5, "Volume Pivot Length")
vol_peak = ta.pivothigh(volume, vol_pivot_len, vol_pivot_len)

// At the volume peak candle:
// If bearish candle at peak -> bullish OB (institutions were buying)
// If bullish candle at peak -> bearish OB (institutions were selling)
is_bull_ob = not na(vol_peak) and close[vol_pivot_len] < open[vol_pivot_len]
is_bear_ob = not na(vol_peak) and close[vol_pivot_len] > open[vol_pivot_len]

// OB zone
bull_ob_top = high[vol_pivot_len]
bull_ob_bottom = low[vol_pivot_len]
bear_ob_top = high[vol_pivot_len]
bear_ob_bottom = low[vol_pivot_len]
```

### Spec 3: Market Structure Shift Detector

```
// Swing detection (already have pivothigh/pivotlow in our indicator)
// MSS = break of swing with displacement

// Bullish MSS: close > prior swing high AND displacement conditions met
// Displacement = current close > prior_swing_high AND (close - open) > atr * 0.5 AND upper_wick < body * 0.3

bullish_mss = close > lastSwingHigh and
              (close - open) > atrVal * 0.5 and
              upperWick < bodySize * 0.3

bearish_mss = close < lastSwingLow and
              (open - close) > atrVal * 0.5 and
              lowerWick < bodySize * 0.3
```

### Spec 4: Kill Zone Time Filter

```
// Requires indicator(..., timezone="America/New_York")
kz_asian  = (hour(time, "America/New_York") >= 19 or hour(time, "America/New_York") < 22)
kz_london = (hour(time, "America/New_York") >= 2 and hour(time, "America/New_York") < 5)
kz_ny     = (hour(time, "America/New_York") >= 7 and hour(time, "America/New_York") < 10)
kz_lc     = (hour(time, "America/New_York") >= 10 and hour(time, "America/New_York") < 12)
in_killzone = kz_london or kz_ny  // Primary kill zones
```

### Spec 5: Enhanced Signal Scoring (upgrade from 5-point to 10-point)

```
// Current scoring (5 points):
// 1. Wick rejection
// 2. Volume confirmed
// 3. Liquidity sweep
// 4. Multi-wick zone
// 5. Close direction

// NEW scoring additions (+5 points):
// 6. FVG at wick level (+1)
// 7. Order Block at wick level (+1)
// 8. Kill Zone timing (+1)
// 9. OTE zone alignment (+1)
// 10. Market Structure Shift confluence (+1)
```

### Spec 6: IPDA Range Overlay

```
// Rolling lookback ranges
ipda_20_high = ta.highest(high, 20)
ipda_20_low  = ta.lowest(low, 20)
ipda_40_high = ta.highest(high, 40)
ipda_40_low  = ta.lowest(low, 40)
ipda_60_high = ta.highest(high, 60)
ipda_60_low  = ta.lowest(low, 60)

// Equilibrium levels
ipda_20_eq = (ipda_20_high + ipda_20_low) / 2
ipda_40_eq = (ipda_40_high + ipda_40_low) / 2
ipda_60_eq = (ipda_60_high + ipda_60_low) / 2

// Premium/Discount for current price
in_premium_20 = close > ipda_20_eq
in_discount_20 = close < ipda_20_eq
```

---

## 7. Recommended Enhancements to Existing Indicators <a name="enhancements"></a>

### Priority 1: Add FVG Detection to Wick Analysis Pro
- Every wick rejection should check if an FVG exists at or near the rejection point
- If wick rejection + FVG overlap = add +1 to signal score
- Display FVG zones as semi-transparent boxes (similar to current wick fill boxes)
- Track FVG fill percentage as a table stat

### Priority 2: Add Order Block Detection
- Volume-based OB detection (LuxAlgo approach) is more objective than pure price-action
- Display OBs as colored zones; auto-remove when mitigated
- When a wick rejection occurs AT an Order Block = highest conviction signal

### Priority 3: Kill Zone Time Filter
- Add optional time filter to only show signals during kill zones
- Background color during active kill zones
- Track hit rate difference: signals during KZ vs outside KZ

### Priority 4: Market Structure Shift as Score Component
- Detect when the wick rejection also coincides with a break of structure
- This is the "liquidity sweep -> displacement -> MSS" sequence
- If all three align: score 8+/10, alert as "Institutional Entry Signal"

### Priority 5: IPDA Range Context
- Plot 20/40/60 day range highs and lows as horizontal lines
- Wick rejections AT these range extremes = add +2 to score (these are major institutional levels)
- Display premium/discount zones as background shading

### Priority 6: Enhanced Wick Fill Zones
- Add the 50% wick fill level (consequent encroachment) as an intermediate target line
- Track separately: full wick fills vs 50% wick fills
- ICT methodology suggests price should NOT retrace more than 50% of a long wick; exceeding 50% = weakness signal

### Priority 7: New Standalone ICT Indicator
- Consider building a separate `ict_smart_money_suite.pine` that implements:
  - FVGs with fill tracking
  - Order Blocks with mitigation
  - BOS / CHoCH / MSS detection
  - Kill Zone highlighting
  - Silver Bullet time windows
  - IPDA 20/40/60 range overlay
  - Power of Three AMD session marking
- This would complement (not replace) Wick Analysis Pro

---

## Sources

### ICT Methodology
- [ICT Trading in 2026 - ForexTester](https://forextester.com/blog/ict-trading/)
- [ICT Trading Complete Guide - LiteFinance](https://www.litefinance.org/blog/for-beginners/trading-strategies/ict-trading-strategy/)
- [Fair Value Gap Step by Step - InnerCircleTrader.net](https://innercircletrader.net/tutorials/fair-value-gap-trading-strategy/)
- [Understanding FVG in ICT Trading - Equiti](https://www.equiti.com/sc-en/news/trading-ideas/fair-value-gap-fvg-the-complete-guide-for-ict-traders/)
- [ICT Order Blocks Explained - LuxAlgo](https://www.luxalgo.com/blog/ict-trader-concepts-order-blocks-unpacked/)
- [ICT Order Block - InnerCircleTrader.net](https://innercircletrader.net/tutorials/ict-order-block/)
- [Order Blocks and Breaker Blocks - ATAS](https://atas.net/blog/what-are-ict-order-blocks-and-breaker-blocks-in-trading/)
- [Breaker Blocks vs Order Blocks - LuxAlgo](https://www.luxalgo.com/blog/breaker-blocks-vs-order-blocks-key-differences-explained/)
- [ICT Liquidity Sweep Guide - FluxCharts](https://www.fluxcharts.com/articles/Trading-Concepts/Price-Action/liquidity-sweeps)
- [Liquidity Sweeps Explained - Equiti](https://www.equiti.com/sc-en/news/trading-ideas/liquidity-sweeps-explained-how-to-identify-and-trade-them/)
- [ICT OTE Guide - InnerCircleTrader.net](https://innercircletrader.net/tutorials/ict-optimal-trade-entry-ote-pattern/)
- [ICT Kill Zones - InnerCircleTrader.net](https://innercircletrader.net/tutorials/master-ict-kill-zones/)
- [ICT Kill Zones - HowToTrade](https://howtotrade.com/blog/ict-kill-zones/)
- [ICT Displacement - InnerCircleTrader.net](https://innercircletrader.net/tutorials/ict-displacement-move/)
- [Market Structure Shift - InnerCircleTrader.net](https://innercircletrader.net/tutorials/ict-market-structure-shift/)
- [MSS in ICT Trading - LuxAlgo](https://www.luxalgo.com/blog/market-structure-shifts-mss-in-ict-trading/)
- [ICT Power of 3 Explained - InnerCircleTrader.net](https://innercircletrader.net/tutorials/ict-power-of-3/)
- [ICT IPDA Explained - InnerCircleTrader.net](https://innercircletrader.net/tutorials/ict-ipda/)
- [ICT Silver Bullet - LuxAlgo TradingView](https://www.tradingview.com/script/fq4wSUev-ICT-Silver-Bullet-LuxAlgo/)
- [ICT Silver Bullet Strategy - HowToTrade](https://howtotrade.com/trading-strategies/ict-silver-bullet/)
- [Order Blocks, Breaker Blocks, Mitigation Blocks - TheICTTrader](https://theicttrader.com/2024/03/24/order-blocks-breaker-blocks-and-mitigation-blocks/)
- [OB vs BB vs MB - XS](https://www.xs.com/en/blog/order-block-vs-breaker-block-vs-mitigation-block/)
- [Mitigation Block ICT - InnerCircleTrader.net](https://innercircletrader.net/tutorials/ict-mitigation-block-explained/)

### Wick Analysis & Candlestick Statistics
- [Hammer Candlestick Backtest - QuantifiedStrategies](https://www.quantifiedstrategies.com/hammer-candlestick-pattern/)
- [Do Candlesticks Work? Backtest of 23 - QuantifiedStrategies](https://www.quantifiedstrategies.com/do-candlesticks-work-as-quantitative-test/)
- [All 75 Candlestick Patterns Backtest - QuantifiedStrategies](https://www.quantifiedstrategies.com/the-complete-backtest-of-all-75-candlestick-patterns/)
- [Candlestick Patterns Ranked by Backtest - QuantifiedStrategies](https://www.quantifiedstrategies.com/candlestick-patterns-ranked-by-backtest/)
- [Success Rate of Candlestick Patterns - QuantifiedStrategies](https://www.quantifiedstrategies.com/success-rate-candlestick-patterns/)
- [Candlestick Pattern Backtesting - TradesViz](https://www.tradesviz.com/blog/candlestick-pattern-effectiveness-backtesting/)
- [Candlestick Wick Trading - FXOpen](https://fxopen.com/blog/en/candlestick-wick-meaning-and-trading-strategies/)
- [Wick Fill Trading Strategy - AngelOne](https://www.angelone.in/knowledge-center/online-share-trading/wick-fill-trading-strategy)

### TradingView Indicators
- [Smart Money Concepts SMC - LuxAlgo](https://www.tradingview.com/script/CnB3fSph-Smart-Money-Concepts-SMC-LuxAlgo/)
- [Order Block Detector - LuxAlgo](https://www.tradingview.com/script/KvGhxGxY-Order-Block-Detector-LuxAlgo/)
- [Fair Value Gap - LuxAlgo](https://www.tradingview.com/script/jWY4Uiez-Fair-Value-Gap-LuxAlgo/)
- [ICT Power Of Three - Flux Charts](https://www.tradingview.com/script/byzJqthj-ICT-Power-Of-Three-Flux-Charts/)
- [JXMJXRS Wick Rejection Zones](https://www.tradingview.com/script/mAce8FL5-JXMJXRS-Wick-Rejection-Zones/)
- [Wick-to-Body Ratio Trend Forecast - Flux Charts](https://www.tradingview.com/script/FGmvwby5-Wick-to-Body-Ratio-Trend-Forecast-Flux-Charts/)
- [LuxAlgo SMC Enhanced - GitHub Gist](https://gist.github.com/niquedegraaff/8c2f45dc73519458afeae14b0096d719)
- [Smart Money Concepts Python - GitHub](https://github.com/joshyattridge/smart-money-concepts)
- [Hybrid Smart Money Concepts - MarkitTick](https://www.tradingview.com/script/rS2PGmNY-Hybrid-Smart-Money-Concepts-MarkitTick/)
- [Smarter Money Concepts Dashboard - PhenLabs](https://www.tradingview.com/script/By7we6WP-Smarter-Money-Concepts-Dashboard-PhenLabs/)
