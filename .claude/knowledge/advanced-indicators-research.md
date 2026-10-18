# Advanced Trading Indicators: Deep Technical Research
## Date: 2026-10-18
## Researcher: indicator-researcher agent
## Scope: Order Flow, Smart Money Concepts, Advanced Oscillators, Regime Detection

---

# TABLE OF CONTENTS

1. [Part 1: Order Flow / Volume Analysis](#part-1-order-flow--volume-analysis)
2. [Part 2: Smart Money Concepts (SMC)](#part-2-smart-money-concepts-smc)
3. [Part 3: Advanced Oscillators & Filters](#part-3-advanced-oscillators--filters)
4. [Part 4: Regime Detection](#part-4-regime-detection)
5. [Implementation Priority Matrix](#implementation-priority-matrix)

---

# PART 1: ORDER FLOW / VOLUME ANALYSIS

## 1.1 Cumulative Volume Delta (CVD)

### What It Is
CVD tracks the running sum of buying volume minus selling volume. It is the closest
proxy to order flow (footprint chart) data available on TradingView. When price makes
new highs but CVD makes lower highs, it suggests distribution (sellers absorbing buying
pressure). The reverse signals accumulation.

### Calculation Methods

**Method A: Bar-Level Approximation (simple, less accurate)**
Uses candle direction or close-location within the bar range.

```pinescript
//@version=5
indicator("CVD Simple", overlay=false)

// Method 1: Candle direction
delta_simple = close > open ? volume : close < open ? -volume : 0
cvd_simple = ta.cum(delta_simple)

// Method 2: Close-location value (CLV) -- more granular
clv = ((close - low) - (high - close)) / math.max(high - low, 0.0001)
delta_clv = clv * volume
cvd_clv = ta.cum(delta_clv)

plot(cvd_clv, "CVD (CLV)", color=color.blue, linewidth=2)
```

**Method B: Intrabar Analysis (more accurate, requires lower TF data)**
Requests volume data from a lower timeframe and accumulates directional volume
from each sub-bar. This is the preferred method and what TradingView's official
CVD indicator uses internally.

```pinescript
//@version=5
indicator("CVD Intrabar", overlay=false)

// Request lower timeframe data for intrabar precision
// The idea: split each chart bar into sub-bars and classify each
[ltfOpen, ltfClose, ltfVolume] = request.security_lower_tf(
    syminfo.tickerid, "1",
    [open, close, volume])

var float cvd = 0.0
if barstate.isconfirmed
    for i = 0 to array.size(ltfOpen) - 1
        float subOpen = array.get(ltfOpen, i)
        float subClose = array.get(ltfClose, i)
        float subVol = array.get(ltfVolume, i)
        cvd += subClose >= subOpen ? subVol : -subVol

plot(cvd, "CVD Intrabar", color=color.teal, linewidth=2)
```

**Method C: Pine v6 Built-in (newest)**
Pine v6 introduced `ta.requestVolumeDelta()` which handles intrabar splitting
automatically. Not available in v5.

### CVD Divergence Detection Logic
```pinescript
// Detect CVD-Price divergence
// Bullish: price lower low + CVD higher low
// Bearish: price higher high + CVD lower high
price_higher_high = high > ta.highest(high, 20)[1]
cvd_lower_high = cvd_clv < ta.highest(cvd_clv, 20)[1]
bearish_divergence = price_higher_high and cvd_lower_high
```

### Key Parameters
- **Reset period**: Session (intraday) or None (continuous)
- **Lower timeframe**: 1-minute for best accuracy on 1H+ charts
- **Smoothing**: Optional EMA(10) on the delta for noise reduction

### Best Markets: Crypto (best volume data), Futures, Equities
### Best Timeframes: 1H, 4H, Daily
### Limitations
- OHLC approximation accuracy degrades with long wicks and small bodies
- Forex volume is tick-based (not true volume) -- less meaningful
- Intrabar method is computationally heavier

### Sources
- [TradingView CVD by immediatePerso44773](https://www.tradingview.com/script/QakBzhop-Cumulative-Volume-Delta/)
- [astropark CVD](https://www.tradingview.com/script/os2Ejj8P-astropark-Cumulative-Volume-Delta-CVD/)
- [GitHub Gist CVD v5](https://gist.github.com/devmehta91/99bec944d2a6b9d2d079fc7c61b71aa2)
- [Medium: Build CVD in Pine Script](https://medium.com/@betashorts1998/what-smart-traders-see-before-breakouts-build-it-in-pine-script-0facb8f9e2b1)

---

## 1.2 Volume Profile (VPVR / VPFR)

### What It Is
Volume Profile shows the volume traded at each price level over a specified period,
displayed as a horizontal histogram. Key levels:
- **POC (Point of Control)**: Price level with the highest volume -- acts as magnet
- **VAH (Value Area High)**: Upper boundary of the 70% value area
- **VAL (Value Area Low)**: Lower boundary of the 70% value area
- **HVN (High Volume Node)**: Clusters of high activity -- support/resistance
- **LVN (Low Volume Node)**: Thin areas -- price moves quickly through these

### PineScript v5 Approximation

Volume Profile is complex to build in Pine because it requires binning volume
across price levels. The general approach:

```pinescript
//@version=5
indicator("Volume Profile Approx", overlay=true, max_boxes_count=500)

// Inputs
lookback    = input.int(200, "Lookback Bars", minval=10)
numRows     = input.int(24, "Number of Rows", minval=5, maxval=100)
vaPercent   = input.float(70.0, "Value Area %", minval=50, maxval=95)

// Calculate price range over lookback
highestPrice = ta.highest(high, lookback)
lowestPrice  = ta.lowest(low, lookback)
priceRange   = highestPrice - lowestPrice
rowHeight    = priceRange / numRows

// Initialize volume arrays
var float[] rowVolume = array.new_float(numRows, 0.0)

// Reset and populate on last bar of lookback
if barstate.islast
    array.fill(rowVolume, 0.0)
    for i = 1 to lookback
        // Determine which rows this bar spans
        barLow  = low[i]
        barHigh = high[i]
        barVol  = volume[i]
        int lowRow  = math.floor((barLow - lowestPrice) / rowHeight)
        int highRow = math.floor((barHigh - lowestPrice) / rowHeight)
        lowRow  := math.max(0, math.min(lowRow, numRows - 1))
        highRow := math.max(0, math.min(highRow, numRows - 1))
        int rowSpan = highRow - lowRow + 1
        float volPerRow = barVol / rowSpan
        for r = lowRow to highRow
            array.set(rowVolume, r, array.get(rowVolume, r) + volPerRow)

    // Find POC (row with maximum volume)
    float maxVol = 0.0
    int pocRow = 0
    for r = 0 to numRows - 1
        if array.get(rowVolume, r) > maxVol
            maxVol := array.get(rowVolume, r)
            pocRow := r

    // Draw POC line
    float pocPrice = lowestPrice + (pocRow + 0.5) * rowHeight
    line.new(bar_index - lookback, pocPrice, bar_index, pocPrice,
             color=color.red, width=2, style=line.style_solid)

    // Build Value Area: expand outward from POC until vaPercent reached
    float totalVol = array.sum(rowVolume)
    float vaVol = array.get(rowVolume, pocRow)
    int vaLowRow = pocRow
    int vaHighRow = pocRow
    while vaVol / totalVol < vaPercent / 100.0
        float addAbove = vaHighRow < numRows - 1 ?
             array.get(rowVolume, vaHighRow + 1) : 0.0
        float addBelow = vaLowRow > 0 ?
             array.get(rowVolume, vaLowRow - 1) : 0.0
        if addAbove >= addBelow and vaHighRow < numRows - 1
            vaHighRow += 1
            vaVol += addAbove
        else if vaLowRow > 0
            vaLowRow -= 1
            vaVol += addBelow
        else
            break

    // Draw Value Area
    float vahPrice = lowestPrice + (vaHighRow + 1) * rowHeight
    float valPrice = lowestPrice + vaLowRow * rowHeight
    box.new(bar_index - lookback, vahPrice, bar_index, valPrice,
            bgcolor=color.new(color.blue, 85),
            border_color=color.blue, border_width=1)
```

### Key Concepts
- **Fixed Range (VPFR)**: User-defined start and end bar
- **Visible Range (VPVR)**: Computed over whatever is visible on the chart
- **Session Volume Profile**: Resets each session
- **Lower-TF aggregation**: For greater precision, use `request.security_lower_tf`
  to get sub-bar volume and price data

### Limitations in PineScript
- Array size limits cap the number of rows (~500 boxes max)
- Performance degrades with large lookbacks
- No native volume-at-price function in Pine v5
- TradingView has a built-in Volume Profile indicator that uses proprietary
  data -- community scripts are approximations

### Sources
- [Trading Strategies Academy: Volume Profile](https://trading-strategies.academy/archives/3751)
- [Chartrades: Volume Profile Guide](https://chartrades.com/guides/volume-profile-pine-script/)
- [TradingView Community Volume Profile](https://vn.tradingview.com/script/r3VrWAO4-Volume-Profile)

---

## 1.3 Market Profile (TPO Charts)

### What It Is
Market Profile, developed by J. Peter Steidlmayer at the CBOT, assigns a letter
(A, B, C...) to each 30-minute time period within a session. Letters are placed
at the price levels traded during that period. The resulting letter distribution
reveals:

- **POC**: Price level with the most letters (most time spent)
- **Value Area**: Range containing ~70% of all TPOs (time-price opportunities)
- **Initial Balance (IB)**: Range of the first hour (letters A and B)
- **Single prints**: Price levels with only one letter -- potential breakout zones
- **Shape**: Normal distribution (balanced), elongated (trending), or double
  distribution (competing value areas)

### PineScript Implementation Approach

```pinescript
//@version=5
indicator("TPO Profile", overlay=true, max_boxes_count=500)

// Core concept: divide session into 30-min blocks (A-Z, a-z = 52 periods)
// For each block, mark which price rows were visited
// Stack counts per row; find POC and Value Area

sessionStart = input.session("0930-1600", "Session")
rowHeight    = input.float(1.0, "Tick Size", minval=0.01)
vaPct        = input.float(70.0, "Value Area %")

// Track TPO counts per price row using arrays
// On session change, reset arrays
// For each 30-min block, increment count for all rows between high and low
// POC = row with max count
// VA = expand from POC until vaPct of total TPOs included
```

The key open-source implementation is **"Market Profile with TPO" by chorse**
on TradingView, which:
- Finds POC with max TPOs, breaking ties by proximity to session midpoint
- Uses an iterative `fn_build_VA` function expanding from POC
- Supports configurable tick sizes and session times
- Draws letters A-Z and a-z for 30-minute blocks

### Trading Application
- **POC as magnet**: Price tends to return to POC
- **VAH/VAL as S/R**: Value area boundaries act as support and resistance
- **IB breakout**: Price exceeding Initial Balance range signals directional day
- **Single prints fill**: Single print areas often get revisited

### Sources
- [TradingView: Market Profile with TPO](https://ar.tradingview.com/script/7KaICyqz-Market-Profile-with-TPO-chorse/)

---

## 1.4 On-Balance Volume (OBV) Divergences

### Calculation
OBV is cumulative: add volume on up-closes, subtract on down-closes.

```pinescript
//@version=5
indicator("OBV Divergence", overlay=false)

// OBV calculation (also available as ta.obv)
var float obv = 0.0
obv += close > close[1] ? volume : close < close[1] ? -volume : 0

// Or simply:
obv_builtin = ta.obv

// Smoothed OBV for cleaner divergence detection
obv_sma = ta.sma(obv_builtin, 20)

// Divergence detection: compare swing points
// Bullish divergence: price lower low, OBV higher low
// Bearish divergence: price higher high, OBV lower high

// Find pivot lows in price and OBV
pricePivotLow  = ta.pivotlow(close, 5, 5)
obvPivotLow    = ta.pivotlow(obv_builtin, 5, 5)
pricePivotHigh = ta.pivothigh(close, 5, 5)
obvPivotHigh   = ta.pivothigh(obv_builtin, 5, 5)

// Store previous pivot values for comparison using var
var float prevPriceLow = na
var float prevObvLow = na
var float prevPriceHigh = na
var float prevObvHigh = na

bullish_div = false
bearish_div = false

if not na(pricePivotLow)
    if not na(prevPriceLow) and not na(prevObvLow)
        if close[5] < prevPriceLow and obv_builtin[5] > prevObvLow
            bullish_div := true
    prevPriceLow := close[5]
    prevObvLow   := obv_builtin[5]

if not na(pricePivotHigh)
    if not na(prevPriceHigh) and not na(prevObvHigh)
        if close[5] > prevPriceHigh and obv_builtin[5] < prevObvHigh
            bearish_div := true
    prevPriceHigh := close[5]
    prevObvHigh   := obv_builtin[5]

plot(obv_builtin, "OBV", color=color.blue)
plotshape(bullish_div, "Bull Div", shape.triangleup,
          location.bottom, color.green, size=size.small)
plotshape(bearish_div, "Bear Div", shape.triangledown,
          location.top, color.red, size=size.small)
```

### Key Insight
OBV divergence is one of the most reliable volume-based signals because volume
often leads price. Joe Granville's original insight: "Volume is the steam that
makes the choo-choo go." Key patterns:
- **Rising OBV + flat price** = accumulation (breakout likely)
- **Falling OBV + flat price** = distribution (breakdown likely)
- **OBV confirms new highs** = trend is healthy
- **OBV diverges from price** = trend exhaustion warning

### Sources
- [StockSharp OBV Divergence Strategy](https://doc.stocksharp.com/en/api-examples/0075_OBV_Divergence)
- [Forex Tester: OBV Guide](https://forextester.com/blog/on-balance-volume-obv/)

---

## 1.5 Volume Weighted Average Price (VWAP) & Anchored VWAP

### Standard VWAP
```pinescript
//@version=5
indicator("VWAP Suite", overlay=true)

// Built-in VWAP (resets each session by default)
vwapValue = ta.vwap(hlc3)
plot(vwapValue, "VWAP", color=color.purple, linewidth=2)

// VWAP with standard deviation bands
vwapBasis = ta.vwap(hlc3)
// For bands, we need cumulative calculations
var float sumPV  = 0.0
var float sumV   = 0.0
var float sumP2V = 0.0

if ta.change(time("D"))
    sumPV  := 0.0
    sumV   := 0.0
    sumP2V := 0.0

tp = hlc3
sumPV  += tp * volume
sumV   += volume
sumP2V += tp * tp * volume

vwapCalc = sumPV / math.max(sumV, 1)
variance = sumP2V / math.max(sumV, 1) - vwapCalc * vwapCalc
stdev    = math.sqrt(math.max(variance, 0))

plot(vwapCalc + stdev, "Upper 1", color=color.new(color.purple, 60))
plot(vwapCalc - stdev, "Lower 1", color=color.new(color.purple, 60))
plot(vwapCalc + 2 * stdev, "Upper 2", color=color.new(color.purple, 80))
plot(vwapCalc - 2 * stdev, "Lower 2", color=color.new(color.purple, 80))
```

### Anchored VWAP (AVWAP)
Anchored VWAP starts calculation from a specific event rather than the session
start. Common anchors: earnings dates, swing highs/lows, gap fills, FOMC
announcements.

```pinescript
//@version=5
indicator("Anchored VWAP", overlay=true)

anchorDate = input.time(timestamp("2026-01-01"), "Anchor Date")

var float cumPV = 0.0
var float cumV  = 0.0

if time >= anchorDate
    if time[1] < anchorDate
        cumPV := 0.0
        cumV  := 0.0
    cumPV += hlc3 * volume
    cumV  += volume

avwap = cumPV / math.max(cumV, 1)
plot(time >= anchorDate ? avwap : na, "AVWAP",
     color=color.orange, linewidth=2)
```

### Built-in Alternative
Pine Script has `ta.vwap(source, anchor)` where anchor can be a timeframe
change condition:
```pinescript
// Weekly-anchored VWAP
weeklyVwap = ta.vwap(hlc3, timeframe.change("W"))
```

### Trading Application
- **VWAP as institutional benchmark**: Institutions measure execution quality
  against VWAP. Price above VWAP = buyers in control.
- **Band touches**: 2nd standard deviation bands act as mean-reversion targets
- **Anchored VWAP from swing points**: Draw from significant highs/lows to track
  the average cost basis of all participants since that event

### Sources
- [Trading Strategies Academy: VWAP](https://trading-strategies.academy/archives/845)
- [Trading Strategies Academy: Anchored VWAP](https://trading-strategies.academy/archives/3529)
- [Pine Wizards: ta.vwap](https://pinewizards.com/technical-analysis-functions/ta-vwap-function-in-pine-script/)

---

## 1.6 Money Flow Index (MFI)

### Calculation
MFI is often called "volume-weighted RSI." It incorporates both price and volume
to measure buying and selling pressure.

```pinescript
//@version=5
indicator("MFI Analysis", overlay=false)

length = input.int(14, "MFI Length")

// Built-in:
mfiValue = ta.mfi(hlc3, length)

// Manual calculation for understanding:
// 1. Typical Price = (H + L + C) / 3
// 2. Raw Money Flow = Typical Price * Volume
// 3. Positive MF = sum of Raw MF on up periods over length
// 4. Negative MF = sum of Raw MF on down periods over length
// 5. Money Flow Ratio = Positive MF / Negative MF
// 6. MFI = 100 - (100 / (1 + Money Flow Ratio))

tp = hlc3
rawMF = tp * volume
posMF = math.sum(tp > tp[1] ? rawMF : 0, length)
negMF = math.sum(tp < tp[1] ? rawMF : 0, length)
mfRatio = posMF / math.max(negMF, 1)
mfiManual = 100 - (100 / (1 + mfRatio))

plot(mfiManual, "MFI", color=color.blue)
hline(80, "Overbought", color=color.red, linestyle=hline.style_dashed)
hline(20, "Oversold", color=color.green, linestyle=hline.style_dashed)
```

### "Smart Money" Detection Patterns
MFI alone cannot detect institutional flow, but composite approaches exist:
- **MFI divergence**: Price makes new high, MFI does not = distribution warning
- **MFI failure swing**: MFI rises above 80, pulls back, fails to reach 80 again,
  then breaks below previous trough = bearish
- **Composite scoring**: Some community scripts blend MFI (40%), CMF (30%), and
  VWAP-relative price (30%) into a 0-100 accumulation/distribution score

### Sources
- [TradingView: Smart Money Flow Pro](https://my.tradingview.com/script/alzxIDwY-smart-money-flow-pro-mfi-percent)

---

## 1.7 Chaikin Money Flow (CMF)

### Calculation
```pinescript
//@version=5
indicator("Chaikin Money Flow", overlay=false)

length = input.int(20, "CMF Length")

// Money Flow Multiplier: where close sits within the bar range
// Ranges from -1 (close at low) to +1 (close at high)
mfMultiplier = ((close - low) - (high - close)) / math.max(high - low, 0.0001)

// Money Flow Volume
mfVolume = mfMultiplier * volume

// CMF = sum(MFV, length) / sum(Volume, length)
cmf = math.sum(mfVolume, length) / math.sum(volume, length)

plot(cmf, "CMF", color=cmf >= 0 ? color.green : color.red, linewidth=2)
hline(0, "Zero", color=color.gray)
hline(0.25, "Strong Buy", color=color.new(color.green, 70))
hline(-0.25, "Strong Sell", color=color.new(color.red, 70))
```

### Interpretation
- **CMF > 0**: Buying pressure dominant (close tends to be near the high)
- **CMF < 0**: Selling pressure dominant (close tends to be near the low)
- **CMF > 0.25**: Very strong buying
- **CMF < -0.25**: Very strong selling
- **Breakout confirmation**: Wait for CMF to turn positive when price breaks
  above resistance for confirmation
- **Divergence**: Price new high + CMF lower high = bearish warning

### Key Difference from OBV
CMF considers WHERE the close is within the range, not just direction.
A bar that closes up but near its low gets a low or negative multiplier,
while OBV would count it as fully positive.

### Sources
- [TC2000 Help: Chaikin Money Flow](https://help.tc2000.com/a/755848)
- [Fidelity: CMF](https://fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/cmf)
- [WealthCharts: CMF Formula](https://wealthcharts.crunch.help/en/indicator-formulas/chaikin-money-flow-cmf)

---

## 1.8 Klinger Volume Oscillator (KVO)

### Calculation
The Klinger oscillator measures the long-term trend of money flow while remaining
sensitive enough to detect short-term fluctuations.

```pinescript
//@version=5
indicator("Klinger Volume Oscillator", overlay=false)

shortLen = input.int(34, "Short EMA Length")
longLen  = input.int(55, "Long EMA Length")
sigLen   = input.int(13, "Signal Length")

// Step 1: Trend direction based on typical price
tp = hlc3
trend = tp > tp[1] ? 1 : -1

// Step 2: dm (range)
dm = high - low

// Step 3: cm (cumulative measure) -- tracks trend continuation
var float cm = 0.0
cm := trend == trend[1] ? cm + dm : dm[1] + dm

// Step 4: Volume Force
vf = volume * math.abs(2 * (dm / math.max(cm, 0.0001)) - 1) * trend * 100

// Step 5: KVO = Short EMA of VF - Long EMA of VF
kvo = ta.ema(vf, shortLen) - ta.ema(vf, longLen)

// Step 6: Signal line
sig = ta.ema(kvo, sigLen)

plot(kvo, "KVO", color=color.blue, linewidth=2)
plot(sig, "Signal", color=color.orange, linewidth=1)
hline(0, "Zero", color=color.gray)
```

### Trading Signals
- **KVO crosses above signal**: Bullish
- **KVO crosses below signal**: Bearish
- **KVO divergence from price**: Early reversal warning
- **Zero-line cross**: Confirms trend direction change

### Key Parameters
- Short EMA: 34 (standard)
- Long EMA: 55 (standard)
- Signal: 13 (standard)

### Sources
- [Capital.com: Klinger Oscillator](https://capital.com/en-gb/learn/technical-analysis/klinger-oscillator)
- [CQG: Klinger Volume Oscillator](https://help.cqg.com/cqgic/25/Documents/klingervolumeoscillatorkvo.htm)
- [TradingView: Klinger Oscillator](https://cn.tradingview.com/script/41E5Ocgx-Klinger-Oscillator/)

---

# PART 2: SMART MONEY CONCEPTS (SMC)

## 2.1 LuxAlgo Smart Money Concepts -- Architecture

### Overview
LuxAlgo's SMC indicator is the most-liked free indicator on TradingView. It automates
the manual chart-reading techniques popularized by ICT (Inner Circle Trader) methodology.

### Core Components

**1. Swing Point Detection**
The foundation of all SMC logic. Uses `ta.pivothigh()` and `ta.pivotlow()` with
configurable swing lengths. Two levels operate simultaneously:
- **Internal structure**: Shorter swing length (e.g., 5) for micro moves
- **Swing structure**: Longer swing length (e.g., 50) for macro structure

**2. Market Structure Labels (BOS / CHoCH)**
- **BOS (Break of Structure)**: Continuation signal. In an uptrend, price breaks
  above the most recent swing high. In a downtrend, breaks below swing low.
- **CHoCH (Change of Character)**: Reversal signal. First break against the
  prevailing trend. E.g., in an uptrend, the first break below a swing low
  is a CHoCH (not a BOS).

**3. Order Blocks**
The last opposing candle before a displacement move:
- **Bullish OB**: Last bearish candle before a strong bullish impulse
- **Bearish OB**: Last bullish candle before a strong bearish impulse
- Drawn as zones from the candle's high to low
- Extend until "mitigated" (price returns and touches the zone)

**4. Fair Value Gaps (FVG)**
Three-candle imbalance pattern:
- **Bullish FVG**: Bar[2].low > Bar[0].high (gap between bar 2's low and
  current bar's high, with bar 1 being the impulse)
- **Bearish FVG**: Bar[2].high < Bar[0].low

**5. Equal Highs / Equal Lows**
Identifies liquidity pools where stops cluster.

**6. Premium / Discount Zones**
Splits the current dealing range at its 50% level (equilibrium).

### Sources
- [LuxAlgo SMC on TradingView](https://www.tradingview.com/script/CnB3fSph-Smart-Money-Concepts-SMC-LuxAlgo/)
- [LuxAlgo Library: SMC](https://www.luxalgo.com/library/indicator/SRsr9SLs-smart-money-concepts/)
- [LuxAlgo: Order Block Concept](https://www.luxalgo.com/library/concept/bullish-bearish-order-block/)

---

## 2.2 Order Block Detection Algorithm

### Logic

```pinescript
//@version=5
indicator("Order Blocks", overlay=true, max_boxes_count=500)

swingLen   = input.int(5, "Swing Length", minval=1)
maxOBCount = input.int(5, "Max Order Blocks", minval=1)
showBull   = input.bool(true, "Show Bullish OB")
showBear   = input.bool(true, "Show Bearish OB")

// Detect swing points (confirmed -- no repainting)
swingHigh = ta.pivothigh(high, swingLen, swingLen)
swingLow  = ta.pivotlow(low, swingLen, swingLen)

// Track trend via swing structure
var int trend = 0
var float lastSwingHigh = na
var float lastSwingLow = na

if not na(swingHigh)
    lastSwingHigh := high[swingLen]
if not na(swingLow)
    lastSwingLow := low[swingLen]

// BOS detection: close beyond last swing point
bullBOS = close > lastSwingHigh and close[1] <= lastSwingHigh
bearBOS = close < lastSwingLow  and close[1] >= lastSwingLow

// Order Block: find the last opposing candle before the BOS
// Bullish OB = last bearish candle before bullish BOS
// Bearish OB = last bullish candle before bearish BOS

if bullBOS and showBull
    // Walk back to find last bearish candle
    for i = 1 to 20
        if close[i] < open[i]  // bearish candle
            box.new(bar_index - i, high[i], bar_index + 20, low[i],
                     bgcolor=color.new(color.green, 85),
                     border_color=color.green, border_width=1)
            break

if bearBOS and showBear
    // Walk back to find last bullish candle
    for i = 1 to 20
        if close[i] > open[i]  // bullish candle
            box.new(bar_index - i, high[i], bar_index + 20, low[i],
                     bgcolor=color.new(color.red, 85),
                     border_color=color.red, border_width=1)
            break
```

### Refinements for Production
1. **Displacement filter**: Require the BOS candle body to be > 1.5x ATR
   (strong impulse, not a slow grind)
2. **FVG conjunction**: Only mark OBs that also created a Fair Value Gap
3. **Mitigation tracking**: Remove or fade OBs once price returns to the zone
4. **Multiple timeframe**: Check higher TF OBs on lower TF charts

### Sources
- [TradingView: BOS/CHoCH with Order Blocks](https://www.tradingview.com/script/fKfQG9es-BOS-CHoCH-Market-Structure-with-Order-Blocks/)
- [TradingView: Market Structure ZigZag](https://www.tradingview.com/script/NXgQEbZi-Market-Structure-ZigZag-Break-of-Structure-Order-Blocks/)
- [PineScript Market Structure Prompt](https://docsbot.ai/prompts/technical/pinescript-market-structure-indicator)
- [PineScript Market: BOS & CHoCH Explained](https://pinescriptmarket.com/learn/price-action/market-structure)

---

## 2.3 Fair Value Gap (FVG) Detection

### Algorithm

```pinescript
//@version=5
indicator("FVG Detector", overlay=true, max_boxes_count=500)

minGapATR = input.float(0.5, "Min Gap Size (ATR mult)", minval=0.0)
showBull  = input.bool(true, "Show Bullish FVG")
showBear  = input.bool(true, "Show Bearish FVG")

atrVal = ta.atr(14)

// Only detect on confirmed bars to prevent repainting
if barstate.isconfirmed
    // Bullish FVG: gap between bar[2] low and bar[0] high
    // (bar[1] is the impulse candle)
    bullGap = low[0] - high[2]  // positive = gap exists
    if bullGap > 0 and bullGap > minGapATR * atrVal and showBull
        box.new(bar_index - 1, low[0], bar_index + 50, high[2],
                 bgcolor=color.new(color.green, 90),
                 border_color=color.new(color.green, 60))

    // Bearish FVG: gap between bar[2] high and bar[0] low
    bearGap = low[2] - high[0]  // positive = gap exists
    if bearGap > 0 and bearGap > minGapATR * atrVal and showBear
        box.new(bar_index - 1, low[2], bar_index + 50, high[0],
                 bgcolor=color.new(color.red, 90),
                 border_color=color.new(color.red, 60))
```

### FVG Gap Fill Tracking
Track whether each FVG has been "mitigated" (price returned to the gap):
- **Full fill**: Price traverses the entire gap
- **Partial fill (CE)**: Price reaches the Consequent Encroachment (50% of gap)
- **Unfilled**: Gap remains open -- still a potential magnet

### Institutional FVG (IFVG)
An FVG that has been partially filled and then held becomes an "institutional" FVG.
The unfilled portion becomes a stronger support/resistance level.

### Sources
- [TradingView: Liquidity Sweep & FVG Strategy](https://www.tradingview.com/script/ZwDGpu55-Liquidity-Sweep-FVG-Strategy/)
- [TradingView: ICT Algo Sweep + MSS + FVG](https://www.tradingview.com/script/SD8VyvVg-ICT-Algo-Sweep-MSS-High-Prob-FVG-IFVG/)
- [GitHub: Gold FVG Entry](https://github.com/hasnocool/tradingview-pine-scripts/blob/main/Gold%20Fair%20Value%20Gap%20Entry(FVG%20GOLD).pine)
- [GitHub: ArunKBhaskar PineScript Collection](https://github.com/ArunKBhaskar/PineScript)

---

## 2.4 Break of Structure (BOS) / Change of Character (CHoCH)

### Definitions
- **BOS**: A continuation break. Price breaks the most recent swing high in an
  uptrend (or swing low in a downtrend), confirming the trend continues.
- **CHoCH**: A reversal break. The FIRST break against the prevailing trend.
  In an uptrend, when price breaks below a swing low for the first time, that
  is a CHoCH -- it signals a potential trend change.

### Detection Algorithm

```pinescript
//@version=5
indicator("Market Structure", overlay=true)

swingLen = input.int(5, "Swing Length")

// Detect confirmed swing points
sh = ta.pivothigh(high, swingLen, swingLen)
sl = ta.pivotlow(low, swingLen, swingLen)

var int bias = 0  // 1 = bullish, -1 = bearish, 0 = neutral
var float lastSH = na
var float lastSL = na
var float prevSH = na
var float prevSL = na

// Update swing points
if not na(sh)
    prevSH := lastSH
    lastSH := high[swingLen]

if not na(sl)
    prevSL := lastSL
    lastSL := low[swingLen]

// Detect structure breaks
bosUp   = false
bosDn   = false
chochUp = false
chochDn = false

// Bullish break of last swing high
if ta.crossover(close, lastSH)
    if bias >= 0
        bosUp := true  // continuation in uptrend
    else
        chochUp := true  // reversal from downtrend
    bias := 1

// Bearish break of last swing low
if ta.crossunder(close, lastSL)
    if bias <= 0
        bosDn := true  // continuation in downtrend
    else
        chochDn := true  // reversal from uptrend
    bias := -1

// Plot labels
plotshape(bosUp, "BOS Up", shape.labelup, location.belowbar,
          color.green, text="BOS", size=size.tiny)
plotshape(bosDn, "BOS Down", shape.labeldown, location.abovebar,
          color.red, text="BOS", size=size.tiny)
plotshape(chochUp, "CHoCH Up", shape.labelup, location.belowbar,
          color.lime, text="CHoCH", size=size.small)
plotshape(chochDn, "CHoCH Down", shape.labeldown, location.abovebar,
          color.orange, text="CHoCH", size=size.small)
```

### Implementation Notes
- Use `barstate.isconfirmed` to avoid repainting
- Strict mode: require close beyond the level (not just wick)
- Crossover mode: any touch counts (more signals, more noise)
- The swing length parameter controls sensitivity: longer = fewer, more
  significant structure breaks

---

## 2.5 Liquidity Sweeps and Stop Hunts

### Concept
Liquidity sweeps occur when price briefly breaks beyond a key level (where
stops cluster) then reverses back. The "sweep" triggers stop losses and
creates the liquidity for institutional entries in the opposite direction.

### Detection Algorithm

```pinescript
//@version=5
indicator("Liquidity Sweeps", overlay=true)

pivotLen    = input.int(10, "Pivot Length")
atrMult     = input.float(0.5, "ATR Tolerance for Equal Levels")
volumeFilter = input.bool(true, "Require Above-Average Volume")

atrVal = ta.atr(14)
avgVol = ta.sma(volume, 20)

// Find swing highs and lows
sh = ta.pivothigh(high, pivotLen, pivotLen)
sl = ta.pivotlow(low, pivotLen, pivotLen)

// Store recent levels
var float[] highLevels = array.new_float(0)
var float[] lowLevels  = array.new_float(0)

if not na(sh)
    array.push(highLevels, high[pivotLen])
    if array.size(highLevels) > 20
        array.shift(highLevels)

if not na(sl)
    array.push(lowLevels, low[pivotLen])
    if array.size(lowLevels) > 20
        array.shift(lowLevels)

// Check for sweep: wick beyond level but close back inside
sweepHigh = false
sweepLow  = false

for i = 0 to array.size(highLevels) - 1
    float level = array.get(highLevels, i)
    // High sweeps above level but close back below
    if high > level and close < level
        if not volumeFilter or volume > avgVol
            sweepHigh := true
            break

for i = 0 to array.size(lowLevels) - 1
    float level = array.get(lowLevels, i)
    // Low sweeps below level but close back above
    if low < level and close > level
        if not volumeFilter or volume > avgVol
            sweepLow := true
            break

plotshape(sweepHigh, "Sweep High", shape.triangledown,
          location.abovebar, color.red, size=size.small)
plotshape(sweepLow, "Sweep Low", shape.triangleup,
          location.belowbar, color.green, size=size.small)
```

### Equal Highs / Equal Lows (Liquidity Pools)
Two or more swing points at approximately the same price create a "liquidity
pool" because many traders place stops just beyond those levels.

Detection: compare each new pivot against previous pivots using an ATR-based
tolerance. E.g., if `math.abs(newPivotHigh - prevPivotHigh) < 0.5 * ATR`,
mark them as "equal highs."

### Sources
- [TradingView: Liquidity Sweep Probability JOAT](https://cn.tradingview.com/script/7UGYr5fB-Liquidity-Sweep-Probability-JOAT/)
- [LuxAlgo: Liquidity Hunter](https://www.luxalgo.com/library/indicator/ZddG4Oi8-liquidity-hunter)
- [TradingView: Equal Highs and Lows](https://www.tradingview.com/scripts/eqh/)

---

## 2.6 Premium / Discount Zones

### Concept
Split the current "dealing range" (a meaningful swing leg) at its 50% level:
- **Premium zone** (above 50%): Expensive territory -- look for sells
- **Discount zone** (below 50%): Cheap territory -- look for buys
- **Equilibrium** (50%): The fair value midpoint

### Calculation
```pinescript
//@version=5
indicator("Premium/Discount Zones", overlay=true)

pivotLen = input.int(20, "Pivot Length")

// Find the most recent significant swing high and swing low
recentHigh = ta.highest(high, pivotLen * 2)
recentLow  = ta.lowest(low, pivotLen * 2)

equilibrium = (recentHigh + recentLow) / 2
premium75   = recentLow + 0.75 * (recentHigh - recentLow)
discount25  = recentLow + 0.25 * (recentHigh - recentLow)

plot(equilibrium, "Equilibrium", color=color.gray, linewidth=1)
plot(recentHigh, "Range High", color=color.red, linewidth=1)
plot(recentLow, "Range Low", color=color.green, linewidth=1)

bgcolor(close > equilibrium ? color.new(color.red, 95) :
        color.new(color.green, 95))
```

### Optimal Trade Entry (OTE)
Within the premium or discount zone, ICT identifies the OTE as the
61.8% to 79% Fibonacci retracement of the dealing range:
- 62% retracement
- 70.5% retracement (midpoint of OTE band, commonly cited)
- 79% retracement

### Sources
- [LuxAlgo: Premium & Discount](https://www.luxalgo.com/library/concept/premium-and-discount.md)
- [LuxAlgo: Optimal Trade Entry](https://www.luxalgo.com/library/concept/optimal-trade-entry.md)
- [TradingView: ICT Premium/Discount Zones](https://kr.tradingview.com/script/9y2HpPzi-ICT-Premium-Discount-Zones-Exponential-X/)

---

## 2.7 Kill Zone Timing (Session Analysis)

### Standard ICT Kill Zone Times (New York Time)

| Session | Time (NY/ET) | Purpose |
|---------|-------------|---------|
| Asia Kill Zone | 20:00 - 00:00 | Sets the range for London to exploit |
| London Kill Zone | 02:00 - 05:00 | Main forex session; sweeps Asia range |
| NY AM Kill Zone | 07:00 - 10:00 | Highest-probability setups; overlaps London |
| NY Lunch | 12:00 - 13:30 | Low-probability, manipulation period |
| NY PM Kill Zone | 13:30 - 16:00 | Secondary setups; end-of-day positioning |

### PineScript Implementation
```pinescript
//@version=5
indicator("Kill Zones", overlay=true)

// Define sessions in exchange timezone format
asiaSession   = input.session("2000-0000", "Asia KZ")
londonSession = input.session("0200-0500", "London KZ")
nySession     = input.session("0700-1000", "NY AM KZ")

// Check if current bar is within session
inAsia   = not na(time(timeframe.period, asiaSession, "America/New_York"))
inLondon = not na(time(timeframe.period, londonSession, "America/New_York"))
inNY     = not na(time(timeframe.period, nySession, "America/New_York"))

// Color background by session
bgcolor(inAsia   ? color.new(color.yellow, 90) : na)
bgcolor(inLondon ? color.new(color.blue, 90) : na)
bgcolor(inNY     ? color.new(color.green, 90) : na)

// Track session ranges
var float asiaHigh = na
var float asiaLow  = na

if inAsia
    asiaHigh := na(asiaHigh) ? high : math.max(asiaHigh, high)
    asiaLow  := na(asiaLow) ? low : math.min(asiaLow, low)
else if inAsia[1] and not inAsia
    // Session ended -- plot the range for London/NY to sweep
    line.new(bar_index, asiaHigh, bar_index + 20, asiaHigh,
             color=color.yellow, style=line.style_dashed)
    line.new(bar_index, asiaLow, bar_index + 20, asiaLow,
             color=color.yellow, style=line.style_dashed)
    asiaHigh := na
    asiaLow  := na
```

### Trading Logic
- London session tends to sweep the Asia range, then reverse
- NY session tends to set the day's high or low within the first 90 minutes
- Avoid trading during NY lunch (12:00-13:30) -- low volume, manipulation

### Sources
- [TradingView: ICT Killzones EonMetrics](https://br.tradingview.com/script/oRPeSvXe-ICT-Killzones-EonMetrics/)

---

# PART 3: ADVANCED OSCILLATORS & FILTERS

## 3.1 Squeeze Momentum Indicator (LazyBear)

### Origin
Derived from John Carter's "TTM Squeeze" (Mastering the Trade, Chapter 11).
LazyBear's version replaces Carter's simple momentum with a linear regression
calculation for smoother, more responsive signals.

### Exact Calculation

```pinescript
//@version=5
indicator("Squeeze Momentum [LazyBear]", overlay=false)

// Inputs
length    = input.int(20, "BB Length")
multBB    = input.float(2.0, "BB MultFactor")
lengthKC  = input.int(20, "KC Length")
multKC    = input.float(1.5, "KC MultFactor")

// Bollinger Bands
src    = close
basis  = ta.sma(src, length)
dev    = multBB * ta.stdev(src, length)
upperBB = basis + dev
lowerBB = basis - dev

// Keltner Channels (using SMA + True Range, matching LazyBear original)
maBasis  = ta.sma(src, lengthKC)
trueRange = ta.tr(true)
rangeMa   = ta.sma(trueRange, lengthKC)
upperKC  = maBasis + rangeMa * multKC
lowerKC  = maBasis - rangeMa * multKC

// Squeeze detection
sqzOn  = lowerBB > lowerKC and upperBB < upperKC  // BB inside KC
sqzOff = lowerBB < lowerKC and upperBB > upperKC  // BB outside KC
noSqz  = not sqzOn and not sqzOff

// Momentum: linear regression of (close - avg(highest, lowest, SMA))
hl_avg = (ta.highest(high, lengthKC) + ta.lowest(low, lengthKC)) / 2
momSrc = close - (hl_avg + maBasis) / 2
val    = ta.linreg(momSrc, lengthKC, 0)

// Plot
plot(val, "Momentum", color=val > 0 ?
     (val > val[1] ? color.lime : color.green) :
     (val < val[1] ? color.red : color.maroon),
     style=plot.style_histogram, linewidth=4)

// Squeeze dots
plot(0, "Squeeze", color=sqzOn ? color.black :
     noSqz ? color.blue : color.gray,
     style=plot.style_cross, linewidth=2)
```

### Critical Implementation Notes
1. **SMA for Keltner basis** (not EMA) -- this matches LazyBear's original.
   Many rewrites incorrectly use EMA.
2. **True Range** for Keltner width (not just high-low range)
3. The momentum source is `close - average(highest_high, lowest_low, SMA) / 2`,
   not just close minus SMA
4. `ta.linreg()` produces a much smoother histogram than raw momentum

### Parameters
- BB Length: 20 (standard)
- BB Multiplier: 2.0 (standard)
- KC Length: 20 (standard)
- KC Multiplier: 1.5 (standard) -- lowering to 1.0 triggers more squeezes

### Trading Rules
- **Yellow/Black dots**: Squeeze is ON (consolidation). Energy building.
- **Gray dots**: Squeeze is OFF (breakout). Trade direction of histogram.
- **Green histogram rising**: Long momentum increasing
- **Red histogram falling**: Short momentum increasing
- **Histogram color change** (dark green to lime, or dark red to red):
  Momentum shift -- possible entry

### Sources
- [GitHub: LazyBear Squeeze Momentum](https://github.com/markshuang/PineScript/blob/master/Squeeze%20Momentum%20Indicator%5BLazyBear%5D)
- [HorizonTrading: Squeeze Momentum](https://www.horizontrading.ai/learn/squeeze-momentum-indicator-pine-script)
- [Indie Script: Squeeze Momentum](https://indie-script.github.io/indicators/Squeeze%20Momentum/)
- [Tradestie: Squeeze Momentum Guide](https://tradestie.com/apps/tradingview-indicators/squeeze-momentum-lazybear/)

---

## 3.2 WaveTrend Oscillator

### Exact Calculation

```pinescript
//@version=5
indicator("WaveTrend [LazyBear]", overlay=false)

// Inputs
n1       = input.int(10, "Channel Length")
n2       = input.int(21, "Average Length")
obLevel1 = input.int(60, "OB Level 1")
obLevel2 = input.int(53, "OB Level 2")
osLevel1 = input.int(-60, "OS Level 1")
osLevel2 = input.int(-53, "OS Level 2")

// Step 1: Source = HLC3 (typical price)
src = hlc3

// Step 2: EMA of source (baseline)
esa = ta.ema(src, n1)

// Step 3: EMA of absolute deviation (volatility measure)
d = ta.ema(math.abs(src - esa), n1)

// Step 4: Channel Index (normalized deviation)
ci = (src - esa) / (0.015 * d)

// Step 5: Main line = EMA of CI
wt1 = ta.ema(ci, n2)

// Step 6: Signal line = SMA of main line
wt2 = ta.sma(wt1, 4)

// Plot
plot(wt1, "WT1", color=color.green, linewidth=2)
plot(wt2, "WT2", color=color.red, linewidth=1)
plot(wt1 - wt2, "Diff", color=color.blue,
     style=plot.style_histogram)

hline(obLevel1, "OB1", color=color.red, linestyle=hline.style_dashed)
hline(obLevel2, "OB2", color=color.new(color.red, 50))
hline(osLevel1, "OS1", color=color.green, linestyle=hline.style_dashed)
hline(osLevel2, "OS2", color=color.new(color.green, 50))
hline(0, "Zero", color=color.gray)

// Signal generation
buySignal  = ta.crossover(wt1, wt2) and wt1 < osLevel2
sellSignal = ta.crossunder(wt1, wt2) and wt1 > obLevel2

plotshape(buySignal, "Buy", shape.triangleup,
          location.bottom, color.green, size=size.small)
plotshape(sellSignal, "Sell", shape.triangledown,
          location.top, color.red, size=size.small)
```

### The 0.015 Constant
The divisor `0.015 * d` normalizes the channel index. The 0.015 scales the
deviation so that the oscillator typically ranges between -100 and +100.
This is baked into the original formula and should not be changed.

### Recommended Settings by Market

| Market | Channel Length | Average Length | OB/OS Levels |
|--------|--------------|----------------|--------------|
| Default (all) | 10 | 21 | +/-60, +/-53 |
| Scalping (5M-15M) | 7 | 14 | +/-60, +/-53 |
| Swing (Daily) | 10 | 21 | +/-60, +/-53 |
| Position (Weekly) | 14 | 28 | +/-60, +/-53 |
| BTC/ETH | 10 | 21 | +/-65, +/-58 |

### Why It Is Better Than Standard RSI
- Uses EMA of deviation as a normalizer (adapts to volatility)
- Produces two lines (like MACD) enabling crossover signals
- Less prone to extended OB/OS readings during strong trends
- Used as one of 4 features in the Lorentzian ML classifier

### Sources
- [Pineify: WaveTrend Guide](https://pineify.app/resources/blog/wavetrend-oscillator-lazybears-momentum-indicator-guide)
- [Pineify: WaveTrend Pine Script](https://pineify.app/pine-script/indicators/wave-trend)
- [HorizonTrading: WaveTrend](https://www.horizontrading.ai/learn/wavetrend-oscillator-pine-script)

---

## 3.3 Schaff Trend Cycle (STC)

### Calculation
STC applies two rounds of stochastic smoothing to a MACD line, producing an
oscillator that cycles between 0 and 100 with less lag than MACD.

```pinescript
//@version=5
indicator("Schaff Trend Cycle", overlay=false)

// Inputs
fastLen  = input.int(23, "MACD Fast Length")
slowLen  = input.int(50, "MACD Slow Length")
cycleLen = input.int(10, "Cycle Length")
factor   = input.float(0.5, "Smoothing Factor")

// Step 1: MACD line
macd = ta.ema(close, fastLen) - ta.ema(close, slowLen)

// Step 2: First Stochastic of MACD
lowestMacd  = ta.lowest(macd, cycleLen)
highestMacd = ta.highest(macd, cycleLen)
stoch1Raw   = (highestMacd - lowestMacd) != 0 ?
              (macd - lowestMacd) / (highestMacd - lowestMacd) * 100 : 0

// Step 3: Smooth with exponential factor
var float pf = 0.0
pf := pf[1] + factor * (stoch1Raw - pf[1])

// Step 4: Second Stochastic of the smoothed result
lowestPF  = ta.lowest(pf, cycleLen)
highestPF = ta.highest(pf, cycleLen)
stoch2Raw = (highestPF - lowestPF) != 0 ?
            (pf - lowestPF) / (highestPF - lowestPF) * 100 : 0

// Step 5: Smooth again
var float stc = 0.0
stc := stc[1] + factor * (stoch2Raw - stc[1])

// Clamp to 0-100
stcClamped = math.max(0, math.min(100, stc))

plot(stcClamped, "STC", color=stcClamped > 50 ? color.green : color.red,
     linewidth=2)
hline(75, "OB", color=color.red, linestyle=hline.style_dashed)
hline(25, "OS", color=color.green, linestyle=hline.style_dashed)
hline(50, "Mid", color=color.gray)
```

### Key Parameters
- MACD Fast: 23 (standard)
- MACD Slow: 50 (standard)
- Cycle Length: 10 (standard) -- controls stochastic lookback
- Smoothing Factor: 0.5 (standard) -- higher = more responsive, more noise

### Trading Rules
- **STC crosses above 25**: Buy signal (leaving oversold)
- **STC crosses below 75**: Sell signal (leaving overbought)
- **STC above 50**: Bullish bias
- **STC below 50**: Bearish bias
- **Advantage over MACD**: Faster cycling between extremes, less lag

### Sources
- [ProRealCode: Schaff Trend Cycle](https://www.prorealcode.com/prorealtime-indicators/schaff-trend-cycle2/)
- [Quantified Strategies: STC](https://www.quantifiedstrategies.com/schaff-trend-cycle-indicator/)
- [Pineify: STC Pine Script](https://pineify.app/pine-script/indicators/stc)
- [TradingView: Schaff Trend Cycle ChuckBanger](https://jp.tradingview.com/script/AbclV6eG-Schaff-Trend-Cycle-ChuckBanger)

---

## 3.4 Commodity Channel Index (CCI) -- Advanced Usage

### Calculation
```pinescript
//@version=5
indicator("CCI Advanced", overlay=false)

length = input.int(20, "CCI Length")

// CCI = (Typical Price - SMA of TP) / (0.015 * Mean Deviation)
tp = hlc3
smaTP = ta.sma(tp, length)

// Mean Deviation (not standard deviation)
meanDev = ta.sma(math.abs(tp - smaTP), length)

cci = (tp - smaTP) / (0.015 * meanDev)

plot(cci, "CCI", color=color.blue, linewidth=2)
hline(100, "+100")
hline(-100, "-100")
hline(200, "+200", color=color.red, linestyle=hline.style_dotted)
hline(-200, "-200", color=color.green, linestyle=hline.style_dotted)
hline(0, "Zero")
```

### Advanced CCI Strategies (Woodies CCI)

**1. Zero-Line Reject (ZLR)**
- CCI approaches zero from positive territory but bounces back above 0 = bullish
- CCI approaches zero from negative territory but bounces back below 0 = bearish
- Entry: when CCI reverses away from zero line
- Stop: if CCI crosses through zero

**2. Trend-Line Break (TLB)**
- Draw trendlines directly on the CCI indicator
- Break of CCI trendline often precedes price trendline break

**3. Reverse Divergence**
- Unlike regular divergence, "hidden divergence" on CCI:
- Price higher low + CCI lower low = bullish continuation
- Price lower high + CCI higher high = bearish continuation

**4. Extreme Zones**
- CCI > +200 or < -200: "Extreme" -- trend is very strong
- Do NOT fade these; trade in the direction of the extreme
- Reversal signal: CCI hooks back from extreme toward zero

**5. Hook from Extreme**
- CCI rises above +100 then turns down but stays above +100 = weakening
- Combined with zero-line cross = full reversal signal

### Sources
- [StockSharp: CCI Divergence Strategy](https://doc.stocksharp.com/en/api-examples/0068_CCI_Divergence)
- [FXStreet: Channeling Trends](https://www.fxstreet.com/education/channeling-trends-in-stocks-201302140000)

---

## 3.5 Williams %R -- Larry Williams' Actual Usage

### Calculation
```pinescript
//@version=5
indicator("Williams %R", overlay=false)

length = input.int(14, "Length")

// Williams %R = -(Highest High - Close) / (Highest High - Lowest Low) * 100
// Ranges from -100 (oversold) to 0 (overbought)
// Note the negative sign -- this is inverted from Stochastic %K
hh = ta.highest(high, length)
ll = ta.lowest(low, length)
wr = -((hh - close) / math.max(hh - ll, 0.0001)) * 100

plot(wr, "Williams %R", color=color.blue, linewidth=2)
hline(-20, "Overbought", color=color.red)
hline(-80, "Oversold", color=color.green)
hline(-50, "Midline", color=color.gray)
```

### Larry Williams' Actual Trading Usage (from his book)
Williams himself did NOT use the indicator for simple overbought/oversold trades.
His method:
1. **Failure swing**: %R reaches -80 zone (oversold), bounces, pulls back to
   -80 zone again but does NOT make a new low = bullish failure swing
2. **Momentum pop**: %R shoots from below -80 to above -50 quickly = momentum
   entry, not a fade
3. **Multiple timeframes**: Use weekly %R for direction, daily %R for timing
4. **Not a standalone system**: Williams used %R in conjunction with his own
   COT (Commitments of Traders) analysis and seasonal patterns

### Key Insight
%R is mathematically identical to an inverted Fast Stochastic %K. The only
difference is the scale (-100 to 0 vs 0 to 100) and that it uses the high
rather than the close in its relationship to the range.

### Sources
- [Fidelity: Williams %R](https://www.fidelity.com/learning-center/trading-investing/)
- [StockSharp: Williams %R](https://doc.stocksharp.com/en/topics/api/indicators/list_of_indicators/williams_r)

---

## 3.6 Stochastic RSI

### Calculation
Applies the Stochastic formula to RSI values instead of prices.

```pinescript
//@version=5
indicator("Stochastic RSI", overlay=false)

rsiLen    = input.int(14, "RSI Length")
stochLen  = input.int(14, "Stochastic Length")
kSmooth   = input.int(3, "%K Smoothing")
dSmooth   = input.int(3, "%D Smoothing")

// Step 1: Calculate RSI
rsi = ta.rsi(close, rsiLen)

// Step 2: Apply Stochastic formula to RSI
lowestRSI  = ta.lowest(rsi, stochLen)
highestRSI = ta.highest(rsi, stochLen)
stochRSI   = (highestRSI - lowestRSI) != 0 ?
             (rsi - lowestRSI) / (highestRSI - lowestRSI) * 100 : 0

// Step 3: Smooth
k = ta.sma(stochRSI, kSmooth)
d = ta.sma(k, dSmooth)

plot(k, "%K", color=color.blue, linewidth=2)
plot(d, "%D", color=color.orange, linewidth=1)
hline(80, "OB", color=color.red)
hline(20, "OS", color=color.green)
hline(50, "Mid", color=color.gray)
```

### Advantages Over Standard RSI
- More sensitive: reaches OB/OS zones more frequently
- Clearer crossover signals between %K and %D
- Better for mean-reversion entries in ranging markets
- Problematic in strong trends (stays pegged at extremes)

### Best Settings
- Crypto: 14/14/3/3 (standard works well)
- Forex: 14/14/3/3
- Faster variant: 7/7/3/3 for scalping
- Combination: Use with ADX filter -- only take StochRSI signals when ADX < 25

### Sources
- [LuxAlgo: Stochastic RSI](https://www.luxalgo.com/library/concept/stochastic-rsi.md)
- [TA-Lib: STOCHRSI](https://ta-lib.org/functions/stochrsi/)

---

## 3.7 Relative Vigor Index (RVI)

### Calculation
Measures the tendency for prices to close higher (bullish vigor) or lower
(bearish vigor) than they opened, normalized by the bar range.

```pinescript
//@version=5
indicator("Relative Vigor Index", overlay=false)

length = input.int(10, "Length")

// Numerator: Close - Open (smoothed with symmetric weighting)
// Weight: [1, 2, 2, 1] over 4 bars
num = (close - open) +
      2 * (close[1] - open[1]) +
      2 * (close[2] - open[2]) +
      (close[3] - open[3])
num := num / 6

// Denominator: High - Low (same weighting)
den = (high - low) +
      2 * (high[1] - low[1]) +
      2 * (high[2] - low[2]) +
      (high[3] - low[3])
den := den / 6

// RVI = sum of numerator / sum of denominator over length
rvi = math.sum(num, length) / math.max(math.sum(den, length), 0.0001)

// Signal line: same symmetric weighting applied to RVI
sig = (rvi + 2 * rvi[1] + 2 * rvi[2] + rvi[3]) / 6

plot(rvi, "RVI", color=color.green, linewidth=2)
plot(sig, "Signal", color=color.red, linewidth=1)
hline(0, "Zero", color=color.gray)
```

### Interpretation
- **RVI crosses above signal**: Bullish
- **RVI crosses below signal**: Bearish
- **Best combined with RSI or other confirmation**: Standalone signals are noisy
- **Divergence**: Price new high + RVI lower high = weakening trend

### Note on Variants
LuxAlgo and MetaTrader 5 use slightly different smoothing approaches.
The version above uses the symmetric 4-bar weighting commonly attributed
to John Ehlers.

### Sources
- [LuxAlgo: Relative Vigor Index](https://www.luxalgo.com/library/concept/relative-vigor-index.md)
- [MetaTrader 5: RVI](https://www.metatrader5.com/es/terminal/help/indicators/oscillators/rvi)

---

## 3.8 Awesome Oscillator (Bill Williams)

### Calculation
```pinescript
//@version=5
indicator("Awesome Oscillator", overlay=false)

// AO = SMA(midpoint, 5) - SMA(midpoint, 34)
midpoint = (high + low) / 2
ao = ta.sma(midpoint, 5) - ta.sma(midpoint, 34)

// Color by direction
plot(ao, "AO",
     color=ao > ao[1] ? color.green : color.red,
     style=plot.style_histogram, linewidth=2)
hline(0, "Zero", color=color.gray)
```

### Bill Williams' Trading Signals

**1. Saucer Signal (Trend Continuation)**
- AO is above zero
- There's a dip (red bar followed by green bar) while staying above zero
- This is a pullback within an uptrend = buy

**2. Twin Peaks (Reversal)**
- Two peaks below zero line (bearish twin peaks)
- Second peak is shallower (closer to zero) than first
- Followed by a green bar = buy
- Mirror for bullish twin peaks above zero

**3. Zero-Line Cross**
- AO crosses from negative to positive = buy
- AO crosses from positive to negative = sell
- Simple but has more whipsaws in ranging markets

### Enhanced Version
Some community scripts replace the SMA with EMA (5/13) for less lag, and
add a Choppiness Index background color as a regime filter (only take AO
signals when CHOP is low, indicating a trending market).

### Sources
- [Upstox: Awesome Oscillator Guide](https://upstox.com/?p=46705)
- [ICMarkets: Awesome Oscillator](https://www.icmarkets.com/blog/awesome-oscillator/)
- [MotiveWave: Awesome Oscillator](https://motivewave.com/studies/awesome_oscillator.htm)

---

# PART 4: REGIME DETECTION

## 4.1 ADX (Average Directional Index) -- Optimal Thresholds

### Calculation
```pinescript
//@version=5
indicator("ADX Suite", overlay=false)

length = input.int(14, "ADX Length")
smooth = input.int(14, "ADX Smoothing")

// Built-in
[diPlus, diMinus, adxValue] = ta.dmi(length, smooth)

plot(adxValue, "ADX", color=color.blue, linewidth=2)
plot(diPlus, "+DI", color=color.green, linewidth=1)
plot(diMinus, "-DI", color=color.red, linewidth=1)
hline(20, "Weak", color=color.gray)
hline(25, "Strong", color=color.orange)
hline(50, "Extreme", color=color.red)
```

### Optimal Thresholds (Research Summary)

| ADX Range | Market State | Action |
|-----------|-------------|--------|
| 0-20 | Absent or very weak trend | Range-bound strategies only |
| 20-25 | Emerging trend | Watch for DI crossover confirmation |
| 25-50 | Strong trend | Trend-following strategies work well |
| 50-75 | Very strong trend | Trend may be overextended; tighten stops |
| 75-100 | Extremely strong (rare) | Exhaustion imminent; prepare for reversal |

### Important Caveats from Research
1. **ADX is non-directional**: It measures trend STRENGTH, not direction. Use
   +DI/-DI crossovers for direction.
2. **Fixed thresholds are unreliable**: Crypto markets may trend at ADX 20,
   while bond markets require ADX 30+ to confirm a trend. Always calibrate
   per instrument.
3. **Rising ADX vs falling ADX matters more than level**: Rising ADX from 15
   to 20 is more meaningful than flat ADX at 25.
4. **ADX lag**: It is a lagging indicator (derived from smoothed DI values).
   By the time ADX confirms trend, initial move may be half over.

### Practical Usage Pattern
```pinescript
// Regime filter: only allow trend-following signals when ADX rising and > 20
trendingRegime = adxValue > 20 and adxValue > adxValue[1]
rangingRegime  = adxValue < 20 or adxValue < adxValue[3]
```

### Sources
- [CrossTrade: ADX](https://crosstrade.io/learn/technical-indicators/adx)
- [Quantum Algo: ADX Guide](https://www.quantum-algo.com/blog/guides/adx-indicator-complete-guide/)
- [TradeAlgo: ADX Guide](https://www.tradealgo.com/trading-guides/technical-analysis/adx-average-directional-index-how-to-measure-trend-strength-like-a-pro)

---

## 4.2 Choppiness Index

### Calculation
```pinescript
//@version=5
indicator("Choppiness Index", overlay=false)

length = input.int(14, "Length")

// CHOP = 100 * LOG10(SUM(ATR(1), length) / (Highest High - Lowest Low)) / LOG10(length)
atrSum = math.sum(ta.atr(1), length)
hh = ta.highest(high, length)
ll = ta.lowest(low, length)

chop = 100 * math.log10(atrSum / math.max(hh - ll, 0.0001)) / math.log10(length)

plot(chop, "CHOP", color=chop > 61.8 ? color.red :
     chop < 38.2 ? color.green : color.gray, linewidth=2)
hline(61.8, "Choppy", color=color.red, linestyle=hline.style_dashed)
hline(38.2, "Trending", color=color.green, linestyle=hline.style_dashed)
hline(50, "Mid", color=color.gray)
```

### Interpretation
- **High values (>61.8)**: Market is choppy, ranging, consolidating.
  The ATR sum is large relative to the range = price is zigzagging.
- **Low values (<38.2)**: Market is trending strongly. The ATR sum is
  small relative to the range = price moved in one direction.
- **The 61.8 and 38.2 thresholds** come from Fibonacci ratios and are
  the standard values, but can be adjusted.

### Origin
Developed in 1993 by E.W. Dreiss, an Australian commodity trader. Based on
the concept that a perfectly straight trend would have CHOP = 0 (all movement
is directional) and a perfectly choppy market would have CHOP = 100 (all
movement is non-directional).

### Trading Application
- **As a filter**: Only take trend-following signals when CHOP < 38.2
- **As a setup detector**: When CHOP rises above 61.8, energy is building
  for a breakout. Look for direction cues (e.g., from ADX +DI/-DI).
- **Combination with Squeeze**: High CHOP + Squeeze ON = maximum energy
  compression. When both release simultaneously, the move tends to be large.

### Sources
- [TradingView: Choppiness Index Scripts](https://tr.tradingview.com/scripts/choppinessindex)
- [TradingView: Choppiness Index CipherDecoded](https://ar.tradingview.com/script/tjYmtv2S-Choppiness-Index-CipherDecoded)

---

## 4.3 Hurst Exponent

### What It Measures
The Hurst exponent H classifies time series behavior:
- **H > 0.5**: Persistent / trending (momentum strategies work)
- **H = 0.5**: Random walk (no exploitable pattern)
- **H < 0.5**: Anti-persistent / mean-reverting (mean-reversion strategies work)

### Calculation Methods

**Method 1: Rescaled Range (R/S) -- Standard**
```pinescript
//@version=5
indicator("Hurst Exponent (R/S)", overlay=false)

length = input.int(100, "Lookback", minval=20)

// Simplified R/S method for Pine Script
// Full R/S requires log-log regression across multiple sub-periods
// This is an approximation using a single window

// 1. Calculate returns
ret = math.log(close / close[1])

// 2. Mean of returns over window
meanRet = ta.sma(ret, length)

// 3. Cumulative deviation from mean
var float maxCumDev = -1e10
var float minCumDev = 1e10
var float cumDev = 0.0

cumDev := 0.0
maxCumDev := -1e10
minCumDev := 1e10
for i = 0 to length - 1
    cumDev += (ret[i] - meanRet)
    maxCumDev := math.max(maxCumDev, cumDev)
    minCumDev := math.min(minCumDev, cumDev)

// 4. Range
rs_range = maxCumDev - minCumDev

// 5. Standard deviation
stdDev = ta.stdev(ret, length)

// 6. R/S ratio
rs = rs_range / math.max(stdDev, 0.0001)

// 7. Hurst estimate = log(R/S) / log(N)
hurst = math.log(rs) / math.log(length)

// Clamp to reasonable range
hurstClamped = math.max(0, math.min(1, hurst))

plot(hurstClamped, "Hurst", color=hurstClamped > 0.55 ? color.green :
     hurstClamped < 0.45 ? color.orange : color.gray, linewidth=2)
hline(0.5, "Random Walk", color=color.gray, linestyle=hline.style_dashed)
hline(0.6, "Trending", color=color.green, linestyle=hline.style_dotted)
hline(0.4, "Mean-Reverting", color=color.orange, linestyle=hline.style_dotted)
```

**Method 2: Variance Ratio (simpler)**
```pinescript
// Variance ratio approach
// Compare variance at lag q vs lag 1
q = 10
varQ = ta.variance(close - close[q], length)
var1 = ta.variance(close - close[1], length)
hurstVR = math.log(varQ / math.max(var1 * q, 0.0001)) / (2 * math.log(q))
hurstVR := 0.5 + hurstVR  // center at 0.5
```

### Practical Application
- Use H > 0.55 as a filter for trend-following entries
- Use H < 0.45 as a filter for mean-reversion entries
- Around 0.5: market is random -- reduce position size or stay flat
- Relationship to Fractal Dimension: H ≈ 2 - D

### Caveats
- Estimates vary significantly by method and lookback window
- The R/S method is known to be biased for small samples
- No published backtests showing profitable Hurst-based strategies
- Best used as a regime filter, not a signal generator

### Sources
- [Robot Wealth: Hurst Exponent Part 1](https://robotwealth.com/demystifying-the-hurst-exponent-part-1/)
- [Robot Wealth: Hurst Exponent Part 2](https://robotwealth.com/demystifying-the-hurst-exponent-part-2/)
- [AlgoTradingLib: Hurst Analysis](https://algotradinglib.com/en/pedia/h/hurst_exponent_analysis.html)
- [Medium: Hurst Exponent in Trading](https://medium.com/@hrishikeshkini/unlocking-market-insights-the-hurst-exponent-of-momentum-in-trading-ff5678429d9f)

---

## 4.4 Fractal Dimension

### What It Measures
The Fractal Dimension (FD) of a price series measures its "complexity" or
"roughness" on a scale from 1.0 to 2.0:
- **FD near 1.0**: Smooth, straight line = strong trend
- **FD near 1.5**: Random walk (Brownian motion)
- **FD near 2.0**: Very complex, space-filling = very choppy, noisy

### Calculation Methods

**Method 1: Fractal Dimension Index (FDI) -- Path Length**
```pinescript
//@version=5
indicator("Fractal Dimension Index", overlay=false)

length = input.int(30, "Length", minval=5)

// Path length method:
// Sum the absolute changes over the window and compare
// to the straight-line distance

pathLen = 0.0
for i = 1 to length - 1
    pathLen += math.abs(close[i] - close[i - 1])

// Normalize by price range
straightLine = math.abs(close - close[length - 1])

// Scale factor
n = float(length)
fdi = 1 + (math.log(pathLen / math.max(straightLine, 0.0001)) +
     math.log(2)) / math.log(2 * n)

fdiClamped = math.max(1.0, math.min(2.0, fdi))

plot(fdiClamped, "FDI", color=fdiClamped < 1.4 ? color.green :
     fdiClamped > 1.6 ? color.red : color.gray, linewidth=2)
hline(1.5, "Random Walk", color=color.gray)
hline(1.4, "Trending", color=color.green, linestyle=hline.style_dotted)
hline(1.6, "Choppy", color=color.red, linestyle=hline.style_dotted)
```

**Method 2: Higuchi Method (used by FDA indicator)**
Uses fractal curves at different scales to estimate dimension. More
computationally intensive but considered more accurate for financial data.
Low FD (1.2-1.45) = smooth/trending, High FD (1.55-2.0) = rough/choppy.

### Thresholds (Vary by Method)
| FDI Range | Interpretation | Strategy Type |
|-----------|---------------|---------------|
| 1.0 - 1.35 | Strong trend | Trend-following |
| 1.35 - 1.50 | Weak trend / emerging | Cautious trend-following |
| 1.50 | Random walk | Stay flat |
| 1.50 - 1.65 | Mild choppiness | Cautious mean-reversion |
| 1.65 - 2.0 | Very choppy | Mean-reversion or flat |

### Relationship to Hurst
H = 2 - D (approximately). So FDI of 1.3 implies H of 0.7 (strongly trending).

### Sources
- [MQL5: Chaos Theory in Trading Part 2](https://www.mql5.com/en/articles/15445)
- [TradingView: Advanced Fractal Dimension Index DW](https://www.tradingview.com/script/idBpFWMz-Advanced-Fractal-Dimension-Index-DW/)
- [TradingView: Fractal Dimension Adaptive FDA](https://www.tradingview.com/script/Bn4NGek6-Fractal-Dimension-Adaptive-FDA/)
- [Quantified Strategies: FDI](https://www.quantifiedstrategies.com/fractal-dimension-index/)
- [BeoForex: Fractal Dimension](https://www.beoforexacademy.com/fractal-dimension-in-forex/)

---

## 4.5 Random Walk Index (RWI)

### Calculation
RWI tests whether a price move is statistically larger than what a random
walk of equal volatility would produce.

```pinescript
//@version=5
indicator("Random Walk Index", overlay=false)

length = input.int(14, "Length", minval=2)

// RWI High = max over n of: (High - Low[n]) / (ATR(n) * sqrt(n))
// RWI Low  = max over n of: (High[n] - Low) / (ATR(n) * sqrt(n))

var float rwiHigh = 0.0
var float rwiLow  = 0.0

maxH = 0.0
maxL = 0.0

for n = 2 to length
    atrN = ta.atr(n)
    sqrtN = math.sqrt(n)
    denom = math.max(atrN * sqrtN, 0.0001)

    rH = (high - low[n]) / denom
    rL = (high[n] - low) / denom

    maxH := math.max(maxH, rH)
    maxL := math.max(maxL, rL)

rwiHigh := maxH
rwiLow  := maxL

plot(rwiHigh, "RWI High", color=color.green, linewidth=2)
plot(rwiLow, "RWI Low", color=color.red, linewidth=2)
hline(1.0, "Threshold", color=color.gray, linestyle=hline.style_dashed)
```

### Interpretation
- **RWI High > 1.0**: Uptrend is non-random (statistically significant)
- **RWI Low > 1.0**: Downtrend is non-random (statistically significant)
- **Both < 1.0**: Market movement is consistent with random walk -- no trend
- **RWI High > RWI Low**: Bullish bias
- **RWI Low > RWI High**: Bearish bias

### Key Parameters
- Short-term lookback: 2-7 periods (for short-term trading)
- Long-term lookback: 8-64 periods (for trend validation)
- Threshold: 1.0 (theoretical), but 1.2-1.5 for higher confidence

### Origin
Introduced by Michael Poulos in the early 1990s, published in Technical
Analysis of Stocks & Commodities magazine.

### Sources
- [LuxAlgo: Random Walk Index](https://www.luxalgo.com/library/concept/random-walk-index/)
- [Capital.com: Random Walk Index](https://capital.com/random-walk-index-definition)
- [wraquant: RWI Source Code](https://wraquant.readthedocs.io/en/latest/_modules/wraquant/ta/exotic.html)

---

# IMPLEMENTATION PRIORITY MATRIX

## Tier 1: Highest Value-Add (Implement First)

| Indicator | Category | Complexity | Why Priority |
|-----------|----------|-----------|-------------|
| WaveTrend Oscillator | Oscillator | Low | Best oscillator for entry timing; used in ML classifier |
| Squeeze Momentum (LazyBear) | Oscillator | Low | Already have basic version; upgrade to exact LazyBear |
| CVD (Cumulative Volume Delta) | Order Flow | Medium | Only order flow proxy available on TV |
| FVG Detection | SMC | Medium | Clean signal; easy to validate on chart |
| BOS/CHoCH Market Structure | SMC | Medium | Foundation for all SMC logic |

## Tier 2: High Value-Add (Implement Second)

| Indicator | Category | Complexity | Why Priority |
|-----------|----------|-----------|-------------|
| Order Blocks | SMC | Medium-High | Builds on BOS/CHoCH foundation |
| Anchored VWAP | Volume | Low | Institutional benchmark |
| Choppiness Index | Regime | Low | Simple, effective filter |
| ADX Regime Filter | Regime | Low | Calibrate per-market thresholds |
| Schaff Trend Cycle | Oscillator | Medium | Faster than MACD with less noise |

## Tier 3: Complementary (Implement When Core is Done)

| Indicator | Category | Complexity | Why Priority |
|-----------|----------|-----------|-------------|
| Liquidity Sweeps | SMC | Medium | Pairs with equal highs/lows |
| Kill Zones | SMC | Low | Session-based filter |
| Hurst Exponent | Regime | High | Sophisticated regime detection |
| Volume Profile | Volume | High | Complex; Pine limitations |
| Klinger Volume Oscillator | Volume | Medium | Alternative volume confirmation |
| Fractal Dimension | Regime | High | Academic; validate before using |
| Random Walk Index | Regime | Medium | Unique statistical approach |
| Market Profile (TPO) | Volume | Very High | Pine limitations significant |

## Tier 4: Reference / Situational

| Indicator | Category | Complexity | Notes |
|-----------|----------|-----------|-------|
| OBV Divergence | Volume | Low | Classic but less novel |
| Chaikin Money Flow | Volume | Low | Simpler than CVD |
| Money Flow Index | Volume | Low | Volume-weighted RSI |
| CCI Advanced | Oscillator | Low | Woodies setups useful |
| Williams %R | Oscillator | Low | Identical to Fast Stoch |
| Stochastic RSI | Oscillator | Low | Built-in available |
| Relative Vigor Index | Oscillator | Low | Niche use cases |
| Awesome Oscillator | Oscillator | Low | Bill Williams specific |
| Premium/Discount Zones | SMC | Low | Pairs with OTE |

---

# CROSS-REFERENCE: INDICATOR COMBINATIONS

## Proven Combinations (from community and research)

1. **Squeeze Momentum + WaveTrend**: LazyBear himself recommends this pairing.
   Squeeze identifies the compression; WaveTrend times the entry direction.

2. **CVD Divergence + BOS**: When CVD diverges from price AND market structure
   breaks (CHoCH), the reversal probability is higher than either signal alone.

3. **ADX + Choppiness Index**: Double regime filter. ADX > 25 AND CHOP < 38.2
   = high-confidence trending environment.

4. **FVG + Order Block + Kill Zone**: Entry framework: identify FVG within an
   order block, during a kill zone session. This is the core ICT confluence setup.

5. **VWAP Bands + Volume Profile POC**: Institutional traders use both. When
   VWAP aligns with Volume Profile POC, the level has double significance.

6. **Hurst + Fractal Dimension**: H > 0.55 AND FD < 1.4 = high-confidence
   trending regime. Use trend-following only in this state.

7. **Stochastic RSI + ADX Filter**: Only take StochRSI mean-reversion signals
   when ADX < 20 (confirmed ranging environment).

---

# APPENDIX: KEY OPEN-SOURCE REPOSITORIES

| Repository | Language | Stars | Key Indicators |
|-----------|---------|-------|---------------|
| [pandas-ta](https://github.com/twopirllc/pandas-ta) | Python | 5k+ | 130+ indicators, including Squeeze |
| [ta](https://github.com/bukosabino/ta) | Python | 4k+ | Technical Analysis library |
| [freqtrade](https://github.com/freqtrade/freqtrade) | Python | 30k+ | Trading bot with strategy examples |
| [ArunKBhaskar/PineScript](https://github.com/ArunKBhaskar/PineScript) | Pine | -- | ICT indicators collection (MPL 2.0) |
| [hasnocool/tradingview-pine-scripts](https://github.com/hasnocool/tradingview-pine-scripts) | Pine | -- | FVG, Order Block scripts |
| [markshuang/PineScript](https://github.com/markshuang/PineScript) | Pine | -- | LazyBear Squeeze original |
| [smart-money-concepts](https://github.com/joshyattridge/smart-money-concepts) | Python | -- | SMC backtesting library |

---

# APPENDIX: PINESCRIPT v5 FUNCTION REFERENCE (Key Built-ins)

| Function | What It Does | Used In |
|---------|-------------|---------|
| `ta.pivothigh(src, leftbars, rightbars)` | Confirmed swing high | SMC, OB, Sweeps |
| `ta.pivotlow(src, leftbars, rightbars)` | Confirmed swing low | SMC, OB, Sweeps |
| `ta.atr(length)` | Average True Range | ATR filters, KC, RWI |
| `ta.linreg(source, length, offset)` | Linear regression | Squeeze momentum |
| `ta.vwap(source, anchor)` | VWAP with anchor | VWAP Suite |
| `ta.obv` | On-Balance Volume | OBV divergence |
| `ta.mfi(source, length)` | Money Flow Index | MFI analysis |
| `ta.rsi(source, length)` | RSI | StochRSI input |
| `ta.dmi(length, smooth)` | ADX, +DI, -DI | Regime detection |
| `ta.stdev(source, length)` | Standard deviation | Bollinger Bands, Hurst |
| `ta.cum(source)` | Cumulative sum | CVD simple |
| `ta.tr(handle_na)` | True Range | Keltner Channels |
| `request.security_lower_tf()` | Lower TF data | CVD intrabar, Vol Profile |
| `barstate.isconfirmed` | Bar closed check | Anti-repainting |

---

*Research compiled from TradingView community scripts, GitHub repositories, LuxAlgo documentation, quantitative finance blogs, and platform documentation. All code snippets are for educational reference and should be validated through backtesting before live use.*
