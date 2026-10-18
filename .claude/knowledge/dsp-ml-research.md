# Advanced DSP, Kalman, GARCH & ML Indicator Research

> **Research Date:** 2026-10-18
> **Purpose:** Reference document for building PineScript v5 indicators on TradingView
> **Scope:** John Ehlers DSP indicators, Kalman filters, GARCH/volatility models, ML indicators

---

## PART 1: JOHN EHLERS DSP INDICATORS

John Ehlers is the foremost authority on applying Digital Signal Processing (DSP) techniques to financial markets. His work spans multiple books -- *Rocket Science for Traders* (2001), *Cybernetic Analysis for Stocks and Futures* (2004), *Cycle Analytics for Traders* (2013) -- and ongoing publications in *Technical Analysis of Stocks & Commodities* (TASC) magazine. He continues to publish new indicators through 2025-2026.

### Core Philosophy

Ehlers treats price data as a composite signal containing:
1. **Trend** (low-frequency component)
2. **Cycles** (mid-frequency, tradeable component)
3. **Noise** (high-frequency, untradeable component)

His filters isolate these components using techniques borrowed from electrical engineering: high-pass filters remove trend, low-pass filters remove noise, and bandpass filters extract the cycle component.

---

### 1.1 Ehlers Instantaneous Trendline

**Source:** *Rocket Science for Traders*, Chapter 10; TASC V.20:2
**What it does:** Uses the Hilbert Transform to estimate the dominant cycle period, then computes a moving average over that period. The result is a trendline that adapts its length to market conditions.

**Algorithm Pipeline:**
1. Detrend price using a smoothed (High+Low)/2
2. Compute in-phase (I) and quadrature (Q) components via Hilbert-style FIR filters
3. Find the instantaneous phase via arctangent(Q/I)
4. Sum phase deltas to estimate the dominant cycle period
5. Average price over that period to get the trendline

**Key Properties:**
- Adapts its smoothing period to the dominant market cycle
- Less lag than fixed-period moving averages in trending conditions
- More responsive at cycle turning points

**PineScript v5 Implementation (Simplified form from TASC):**

```pinescript
//@version=5
indicator("Ehlers Instantaneous Trendline", overlay=true)

length = input.int(14, "Lookback")

// Simplified form: SMA plus half-weighted smoothed slope
src = (high + low) / 2.0
sma_val = ta.sma(src, length)
slope = (sma_val - sma_val[length]) / length
iTrend = sma_val + slope * length / 2.0

plot(iTrend, "Instantaneous Trendline", color=color.blue, linewidth=2)
plot(iTrend[2], "Trigger", color=color.red)
```

**Full Hilbert Version Notes:**
The full implementation requires the Hilbert Transform pipeline (see Section 1.6). Library implementations exist in:
- Python: bta-lib (`btalib/indicators/ht_trendline.py`)
- C#: Stockindicators.dev
- R: TA-Lib wrapper (`talib::trendline`)
- TradingView: blackcat1402's L2 script

**Best for:** Trend-following on all markets, especially where cycle lengths vary.

---

### 1.2 Ehlers MESA Adaptive Moving Average (MAMA/FAMA)

**Source:** TASC article "MAMA -- The Mother of Adaptive Moving Averages"; Ehlers' paper at mesasoftware.com
**What it does:** An adaptive EMA whose alpha (smoothing factor) is controlled by the rate of change of the instantaneous phase. Fast phase changes (trending) produce a high alpha (responsive); slow changes (cycling) produce a low alpha (smooth).

**Core Algorithm:**

```
Step 1: Compute Hilbert Transform components
  - Smooth price: Smooth = (4*Price + 3*Price[1] + 2*Price[2] + Price[3]) / 10
  - Detrend using high-pass filter
  - Compute In-Phase (I1) and Quadrature (Q1) via weighted FIR

Step 2: Compute Phase
  - Phase = arctan(Q1 / I1) [in degrees]
  - DeltaPhase = Phase[1] - Phase
  - Clamp DeltaPhase: if < 1, set to 1

Step 3: Compute adaptive alpha
  - alpha = FastLimit / DeltaPhase
  - Clamp: max(alpha, SlowLimit), min(alpha, FastLimit)
  - Default: FastLimit = 0.5, SlowLimit = 0.05

Step 4: MAMA and FAMA
  - MAMA = alpha * Price + (1 - alpha) * MAMA[1]
  - FAMA = (alpha/2) * MAMA + (1 - alpha/2) * FAMA[1]
```

**Signals:**
- **Buy:** MAMA crosses above FAMA
- **Sell:** MAMA crosses below FAMA
- The spread between MAMA and FAMA indicates trend strength

**PineScript v5 Implementation (Core Logic):**

```pinescript
//@version=5
indicator("Ehlers MAMA/FAMA", overlay=true)

fastLimit = input.float(0.5, "Fast Limit", step=0.01)
slowLimit = input.float(0.05, "Slow Limit", step=0.01)

src = (high + low) / 2.0

// Smoothing
var float smooth = 0.0
smooth := (4.0 * src + 3.0 * nz(src[1]) + 2.0 * nz(src[2]) + nz(src[3])) / 10.0

// Detrender coefficients
var float period = 0.0
var float detrender = 0.0
var float I1 = 0.0
var float Q1 = 0.0
var float I2 = 0.0
var float Q2 = 0.0
var float Re = 0.0
var float Im = 0.0
var float phase = 0.0
var float MAMA = 0.0
var float FAMA = 0.0

// Hilbert Transform approximation
coeff = 0.0962
coeff2 = 0.5769

detrender := (coeff * smooth + coeff2 * nz(smooth[2]) - coeff2 * nz(smooth[4]) - coeff * nz(smooth[6])) * (0.075 * nz(period[1]) + 0.54)

// In-phase and Quadrature
Q1 := (coeff * detrender + coeff2 * nz(detrender[2]) - coeff2 * nz(detrender[4]) - coeff * nz(detrender[6])) * (0.075 * nz(period[1]) + 0.54)
I1 := nz(detrender[3])

// Advance the phase by 90 degrees
I2 := I1 - coeff * nz(I1[2]) + coeff2 * nz(I2[2])
Q2 := Q1 - coeff * nz(Q1[2]) + coeff2 * nz(Q2[2])

// Homodyne Discriminator
Re := I2 * nz(I2[1]) + Q2 * nz(Q2[1])
Im := I2 * nz(Q2[1]) - Q2 * nz(I2[1])
Re := 0.2 * Re + 0.8 * nz(Re[1])
Im := 0.2 * Im + 0.8 * nz(Im[1])

if Im != 0.0 and Re != 0.0
    period := 2.0 * math.pi / math.atan(Im / Re)
if period > 1.5 * nz(period[1])
    period := 1.5 * nz(period[1])
if period < 0.67 * nz(period[1])
    period := 0.67 * nz(period[1])
if period < 6.0
    period := 6.0
if period > 50.0
    period := 50.0

period := 0.2 * period + 0.8 * nz(period[1])

// Phase calculation
float phaseVal = 0.0
if I1 != 0.0
    phaseVal := math.todegrees(math.atan(Q1 / I1))

float deltaPhase = nz(phase) - phaseVal
if deltaPhase < 1.0
    deltaPhase := 1.0

phase := phaseVal

float alpha = fastLimit / deltaPhase
if alpha < slowLimit
    alpha := slowLimit
if alpha > fastLimit
    alpha := fastLimit

MAMA := alpha * src + (1.0 - alpha) * nz(MAMA[1])
FAMA := 0.5 * alpha * MAMA + (1.0 - 0.5 * alpha) * nz(FAMA[1])

plot(MAMA, "MAMA", color=color.green, linewidth=2)
plot(FAMA, "FAMA", color=color.red, linewidth=2)

bgcolor(MAMA > FAMA ? color.new(color.green, 90) : color.new(color.red, 90))
```

**Parameter Notes:**
- `FastLimit = 0.5` corresponds roughly to a 3-bar EMA
- `SlowLimit = 0.05` corresponds roughly to a 40-bar EMA
- For crypto: try FastLimit=0.5, SlowLimit=0.03 (slower floor for noise)
- For forex: defaults work well on 4H and Daily
- For commodities: try FastLimit=0.4, SlowLimit=0.05

**TradingView Scripts:** DasanC's MAMA (Pine v4), DCAUT version, everget version
**PineScript Conversion:** Moderate -- requires Hilbert Transform chain

---

### 1.3 Ehlers Cyber Cycle

**Source:** *Cybernetic Analysis for Stocks and Futures*, Chapter 4
**What it does:** Isolates the cycle component from price by applying a high-pass filter to remove trend, then smoothing to remove noise. The result oscillates around zero, with crossovers of a signal line generating entries.

**Algorithm:**
1. Apply a 2-pole high-pass filter to price to remove trend
2. Apply a smoothing filter (Ehlers uses a specific 4-bar weighted average)
3. The cycle component oscillates between roughly -1 and +1
4. A trigger line (1-bar lag of the cycle) provides crossover signals

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Cyber Cycle", overlay=false)

length = input.int(8, "Cycle Period", minval=2)
src = (high + low) / 2.0

// High-pass filter coefficients
alpha = (math.cos(math.toradians(360.0 / length)) + math.sin(math.toradians(360.0 / length)) - 1.0) / math.cos(math.toradians(360.0 / length))

// Smooth price first
smooth = (src + 2.0 * nz(src[1]) + 2.0 * nz(src[2]) + nz(src[3])) / 6.0

// Cyber Cycle calculation
var float cycle = 0.0
if bar_index < 7
    cycle := (src - 2.0 * nz(src[1]) + nz(src[2])) / 4.0
else
    cycle := (1.0 - 0.5 * alpha) * (1.0 - 0.5 * alpha) * (smooth - 2.0 * nz(smooth[1]) + nz(smooth[2])) + 2.0 * (1.0 - alpha) * nz(cycle[1]) - (1.0 - alpha) * (1.0 - alpha) * nz(cycle[2])

trigger = cycle[1]

plot(cycle, "Cyber Cycle", color=color.blue, linewidth=2)
plot(trigger, "Trigger", color=color.red)
hline(0, "Zero")
```

**Signals:**
- Buy when Cyber Cycle crosses above Trigger
- Sell when Cyber Cycle crosses below Trigger
- Works best in markets with clear cyclical behavior

**Best for:** Forex pairs (EUR/USD, GBP/USD) on 1H-4H timeframes; less effective in strongly trending crypto.

---

### 1.4 Ehlers Fisher Transform

**Source:** *Cybernetic Analysis for Stocks and Futures*; TASC article
**What it does:** Converts any indicator (typically normalized price) into a Gaussian-like distribution. This sharpens turning points -- the Fisher Transform produces sharp, well-defined peaks and valleys.

**Formula:**
```
x = 0.33 * 2 * ((Price - MinLow) / (MaxHigh - MinLow) - 0.5) + 0.67 * x[1]
x = clamp(x, -0.999, +0.999)
Fisher = 0.5 * ln((1 + x) / (1 - x))
Fisher = 0.5 * Fisher + 0.5 * Fisher[1]
```

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Fisher Transform", overlay=false)

length = input.int(10, "Period", minval=2)
src = hl2

maxH = ta.highest(src, length)
minL = ta.lowest(src, length)

var float value = 0.0
var float fisher = 0.0
var float fisher1 = 0.0

// Normalize to -1..+1 range with smoothing
rawValue = maxH != minL ? 2.0 * ((src - minL) / (maxH - minL) - 0.5) : 0.0
value := 0.33 * rawValue + 0.67 * nz(value[1])

// Clamp to avoid log(0)
value := math.max(-0.999, math.min(0.999, value))

// Fisher Transform
fisher1 := nz(fisher)
fisher := 0.5 * math.log((1.0 + value) / (1.0 - value)) + 0.5 * nz(fisher[1])

plot(fisher, "Fisher", color=color.blue, linewidth=2)
plot(fisher1, "Trigger", color=color.red)
hline(0, "Zero", color=color.gray)
hline(1.5, "OB", color=color.red, linestyle=hline.style_dotted)
hline(-1.5, "OS", color=color.green, linestyle=hline.style_dotted)
```

**Key Properties:**
- Produces sharp peaks/valleys -- easier to identify turning points than raw oscillators
- Overbought above +1.5, Oversold below -1.5 (adjustable)
- Reversal signals when Fisher crosses its trigger line
- No lag penalty vs the source indicator

**Best for:** All markets. Particularly useful for crypto (BTC, ETH) where momentum extremes are common.

---

### 1.5 Ehlers Inverse Fisher Transform

**Source:** mesasoftware.com paper "The Inverse Fisher Transform"; TASC 2004
**What it does:** The opposite operation -- compresses any value into the range -1 to +1. Applied to indicators like RSI or Stochastic, it creates cleaner binary-like signals.

**Formula:**
```
IFT(y) = (e^(2y) - 1) / (e^(2y) + 1)
```
This is the hyperbolic tangent: `tanh(y)`.

**Classic Application (IFT of RSI):**
1. Compute RSI(5) of close
2. Scale: `x = 0.1 * (RSI - 50)`
3. Smooth with 9-period WMA
4. Apply IFT: result oscillates between -1 and +1

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Inverse Fisher Transform of RSI", overlay=false)

rsiLen = input.int(5, "RSI Length")
wmaLen = input.int(9, "WMA Smoothing")

// Scale RSI to center around zero
rsiVal = ta.rsi(close, rsiLen)
scaledRSI = 0.1 * (rsiVal - 50.0)

// Smooth with WMA
smoothed = ta.wma(scaledRSI, wmaLen)

// Inverse Fisher Transform (= tanh)
ift = (math.exp(2.0 * smoothed) - 1.0) / (math.exp(2.0 * smoothed) + 1.0)

plot(ift, "IFT RSI", color=ift > 0 ? color.green : color.red, linewidth=2)
hline(0.5, "Buy Threshold", color=color.green, linestyle=hline.style_dotted)
hline(-0.5, "Sell Threshold", color=color.red, linestyle=hline.style_dotted)
hline(0, "Zero", color=color.gray)
```

**Signals:**
- Buy when IFT crosses above +0.5 (or 0)
- Sell when IFT crosses below -0.5 (or 0)
- The squashing creates flat regions in overbought/oversold zones, reducing whipsaw

**Newer Application (Elegant Oscillator, TASC Feb 2022):**
Takes the 2-bar close difference, normalizes by its RMS, applies IFT, then smooths with a Super Smoother. Published in Pine v5 by PineCoders.

---

### 1.6 Ehlers Hilbert Transform

**Source:** *Rocket Science for Traders*, Chapters 8-10
**What it does:** The Hilbert Transform is not an indicator itself but the mathematical engine behind many Ehlers indicators (MAMA, Instantaneous Trendline, Dominant Cycle). It creates a 90-degree phase-shifted version of the signal, enabling instantaneous phase and frequency measurement.

**Core Components:**
1. **Smoothing:** 4-bar WMA: `(4*P + 3*P[1] + 2*P[2] + P[3]) / 10`
2. **Detrender:** FIR filter with coefficients [0.0962, 0, 0.5769, 0, -0.5769, 0, -0.0962], scaled by `0.075 * Period + 0.54`
3. **Quadrature:** Same FIR applied to the detrendered signal
4. **In-Phase:** 3-bar delay of detrendered signal
5. **Homodyne Discriminator:** Combines I and Q to estimate period without phase ambiguity

**Implementation Note:**
The Hilbert Transform approximation Ehlers uses is a discrete FIR filter, not the true continuous Hilbert Transform. This is intentional -- it trades mathematical purity for computational efficiency and causality (no future data needed).

The coefficients `0.0962` and `0.5769` come from a specific FIR design that approximates the ideal 90-degree phase shift over typical market cycle periods (10-48 bars).

**PineScript Building Block:**

```pinescript
// Hilbert Transform components (reusable in MAMA, ITrend, etc.)
hilbert_transform(src, period) =>
    c = 0.0962
    c2 = 0.5769
    adj = 0.075 * period + 0.54
    result = (c * src + c2 * nz(src[2]) - c2 * nz(src[4]) - c * nz(src[6])) * adj
    result
```

---

### 1.7 Ehlers Super Smoother Filter

**Source:** *Cybernetic Analysis for Stocks and Futures*, Chapter 13
**What it does:** A low-pass filter designed specifically for financial data. It removes high-frequency noise while introducing minimal lag. Superior to simple or exponential moving averages because it has a sharper frequency cutoff -- it removes noise without smearing the signal.

**Two-Pole Version:**

The 2-pole Super Smoother is derived from a Butterworth low-pass filter with additional input averaging.

```
a1 = exp(-sqrt(2) * pi / Period)
b1 = 2 * a1 * cos(sqrt(2) * pi / Period)
c2 = b1
c3 = -a1 * a1
c1 = 1 - c2 - c3
SS = c1 * (Price + Price[1]) / 2 + c2 * SS[1] + c3 * SS[2]
```

**Three-Pole Version:**

The 3-pole version provides heavier smoothing with slightly more lag.

```
a1 = exp(-pi / Period)
b1 = 2 * a1 * cos(1.738 * pi / Period)
c1 = a1 * a1
c2 = b1 + c1
c3 = -(c1 + b1 * c1)
c4 = c1 * c1
coef = 1 - c2 - c3 - c4
SS = coef * (Price + Price[1]) / 2 + c2 * SS[1] + c3 * SS[2] + c4 * SS[3]
```

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Super Smoother", overlay=true)

period = input.int(10, "Period", minval=2)
poles = input.int(2, "Poles", options=[2, 3])

src = close

// Two-pole Super Smoother
superSmoother2(source, len) =>
    a1 = math.exp(-math.sqrt(2.0) * math.pi / len)
    b1 = 2.0 * a1 * math.cos(math.sqrt(2.0) * math.pi / len)
    c2 = b1
    c3 = -a1 * a1
    c1 = 1.0 - c2 - c3
    var float ss = 0.0
    ss := c1 * (source + nz(source[1])) / 2.0 + c2 * nz(ss[1]) + c3 * nz(ss[2])
    ss

// Three-pole Super Smoother
superSmoother3(source, len) =>
    a1 = math.exp(-math.pi / len)
    b1 = 2.0 * a1 * math.cos(1.738 * math.pi / len)
    c1_coeff = a1 * a1
    c2 = b1 + c1_coeff
    c3 = -(c1_coeff + b1 * c1_coeff)
    c4 = c1_coeff * c1_coeff
    coef = 1.0 - c2 - c3 - c4
    var float ss = 0.0
    ss := coef * (source + nz(source[1])) / 2.0 + c2 * nz(ss[1]) + c3 * nz(ss[2]) + c4 * nz(ss[3])
    ss

result = poles == 2 ? superSmoother2(src, period) : superSmoother3(src, period)
plot(result, "Super Smoother", color=color.blue, linewidth=2)
plot(close, "Close", color=color.new(color.gray, 70))
```

**Key Advantages over EMA/SMA:**
- Sharper frequency cutoff (less noise passes through)
- Less lag for equivalent smoothing
- No Gibbs phenomenon (ringing) that plagues simple filters
- Mathematically designed frequency response

**TradingView Library:** FatTailAlgo's `Ehlers_Super_Smoother` library (Pine v5)

---

### 1.8 Ehlers Decycler and Decycler Oscillator

**Source:** TASC September 2015
**What it does:**
- **Decycler:** Removes cycle components, leaving only the trend. Computed as `Price - HighPass(Price)`.
- **Decycler Oscillator:** Shows the difference between two high-pass filters with different cutoff periods, highlighting cycle activity.

**High-Pass Filter (2-pole, Ehlers):**

```
alpha1 = (cos(360/Period) + sin(360/Period) - 1) / cos(360/Period)
HP = (1 - alpha1/2)^2 * (Price - 2*Price[1] + Price[2]) + 2*(1-alpha1)*HP[1] - (1-alpha1)^2*HP[2]
Decycler = Price - HP
```

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Decycler", overlay=true)

hpPeriod = input.int(125, "High-Pass Period", minval=10)
src = close

// High-pass filter
alpha1 = (math.cos(math.toradians(360.0 / hpPeriod)) + math.sin(math.toradians(360.0 / hpPeriod)) - 1.0) / math.cos(math.toradians(360.0 / hpPeriod))

var float hp = 0.0
hp := math.pow(1.0 - alpha1 / 2.0, 2) * (src - 2.0 * nz(src[1]) + nz(src[2])) + 2.0 * (1.0 - alpha1) * nz(hp[1]) - math.pow(1.0 - alpha1, 2) * nz(hp[2])

// Decycler = price minus high-frequency component
decycler = src - hp

plot(decycler, "Decycler", color=color.blue, linewidth=2)
plot(src, "Price", color=color.new(color.gray, 70))
```

**Decycler Oscillator:**

```pinescript
//@version=5
indicator("Ehlers Decycler Oscillator", overlay=false)

hp1Period = input.int(125, "HP Period 1")
hp2Period = input.int(100, "HP Period 2")
k1 = input.float(1.0, "Multiplier 1")
k2 = input.float(1.0, "Multiplier 2")
src = close

ehlers_hp(source, period) =>
    a = (math.cos(math.toradians(360.0 / period)) + math.sin(math.toradians(360.0 / period)) - 1.0) / math.cos(math.toradians(360.0 / period))
    var float h = 0.0
    h := math.pow(1.0 - a / 2.0, 2) * (source - 2.0 * nz(source[1]) + nz(source[2])) + 2.0 * (1.0 - a) * nz(h[1]) - math.pow(1.0 - a, 2) * nz(h[2])
    h

hp1 = ehlers_hp(src, hp1Period)
hp2 = ehlers_hp(src, hp2Period)

// Normalize as percentage of price
dec1 = 100.0 * hp1 / src * k1
dec2 = 100.0 * hp2 / src * k2

plot(dec1, "Decycler Osc 1", color=color.red)
plot(dec2, "Decycler Osc 2", color=color.yellow)
hline(0, "Zero")
```

**Usage:** When both oscillator lines are above zero, the market is in an uptrend. When both are below zero, downtrend. Divergence between the two lines indicates a potential regime change.

---

### 1.9 Ehlers Bandpass Filter

**Source:** *Cycle Analytics for Traders*, Chapter 7
**What it does:** Passes only the frequency components within a specified band (e.g., cycles of 10 to 48 bars). This isolates the tradeable cycle while removing both trend (too slow) and noise (too fast).

**Formula:**

```
BandWidth = (UpperPeriod - LowerPeriod) / CenterPeriod
beta = cos(2*pi / CenterPeriod)
gamma = 1 / cos(2*pi * BandWidth / CenterPeriod)
alpha = gamma - sqrt(gamma^2 - 1)

BP = 0.5*(1-alpha)*(Price - Price[2]) + beta*(1+alpha)*BP[1] - alpha*BP[2]
```

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Bandpass Filter", overlay=false)

centerPeriod = input.int(20, "Center Period", minval=5)
bandwidth = input.float(0.3, "Bandwidth", minval=0.1, maxval=1.0, step=0.05)

src = close
beta_val = math.cos(2.0 * math.pi / centerPeriod)
gamma_val = 1.0 / math.cos(2.0 * math.pi * bandwidth / centerPeriod)
alpha_val = gamma_val - math.sqrt(gamma_val * gamma_val - 1.0)

var float bp = 0.0
bp := 0.5 * (1.0 - alpha_val) * (src - nz(src[2])) + beta_val * (1.0 + alpha_val) * nz(bp[1]) - alpha_val * nz(bp[2])

// Normalize for display
var float peak = 0.0
peak := 0.991 * nz(peak[1])
if math.abs(bp) > peak
    peak := math.abs(bp)

signal = peak != 0 ? bp / peak : 0.0

plot(signal, "Bandpass", color=color.blue, linewidth=2)
hline(0, "Zero")
hline(0.8, "OB", linestyle=hline.style_dotted)
hline(-0.8, "OS", linestyle=hline.style_dotted)
```

**Key Properties:**
- Zero lag at the center frequency
- Excellent for identifying cyclic turning points
- When output touches zero, a cycle turning point is occurring
- The trigger (1-bar lag) crossover generates signals

---

### 1.10 Ehlers Autocorrelation Periodogram

**Source:** *Cycle Analytics for Traders*, Chapter 8; TASC September 2016
**What it does:** Measures the dominant cycle period of the market by computing autocorrelation at various lags, then finding the spectral peak. This is Ehlers' preferred method for dominant cycle detection.

**Algorithm:**
1. Apply a Roofing Filter to price (high-pass + Super Smoother)
2. Compute autocorrelation for lags from 0 to MaxPeriod
3. Apply DFT (Discrete Fourier Transform) to the autocorrelation
4. Find spectral peaks
5. Compute the dominant cycle as the center-of-gravity of the spectrum

**Key Implementation Notes:**
- The spectrum is normalized so the peak power = 1.0
- Only bins with normalized power >= 0.5 are counted for the CoG calculation
- Typical period range: 10 to 48 bars
- The dominant cycle is inherently noisy and shifts constantly

**PineScript v5 Implementation (Simplified):**

```pinescript
//@version=5
indicator("Ehlers Autocorrelation Periodogram", overlay=false)

minPeriod = input.int(10, "Min Period")
maxPeriod = input.int(48, "Max Period")
avgLength = input.int(3, "Averaging Length")

src = close

// Step 1: Roofing Filter (HP + SS)
// High-pass
alpha1HP = (math.cos(math.toradians(360.0 / 48.0)) + math.sin(math.toradians(360.0 / 48.0)) - 1.0) / math.cos(math.toradians(360.0 / 48.0))
var float hp = 0.0
hp := math.pow(1.0 - alpha1HP / 2.0, 2) * (src - 2.0 * nz(src[1]) + nz(src[2])) + 2.0 * (1.0 - alpha1HP) * nz(hp[1]) - math.pow(1.0 - alpha1HP, 2) * nz(hp[2])

// Super Smoother (2-pole, period=10)
a1 = math.exp(-math.sqrt(2.0) * math.pi / 10.0)
b1 = 2.0 * a1 * math.cos(math.sqrt(2.0) * math.pi / 10.0)
c2 = b1
c3 = -a1 * a1
c1 = 1.0 - c2 - c3
var float filt = 0.0
filt := c1 * (hp + nz(hp[1])) / 2.0 + c2 * nz(filt[1]) + c3 * nz(filt[2])

// Step 2: Autocorrelation
// (Simplified -- full version requires nested loops for DFT)
var float domCycle = 20.0
float maxCorr = 0.0
float bestPeriod = 20.0

for lag = minPeriod to maxPeriod
    float corr = 0.0
    float sumX = 0.0
    float sumY = 0.0
    float sumXX = 0.0
    float sumYY = 0.0
    float sumXY = 0.0
    int N = avgLength * lag
    for i = 0 to N - 1
        x = nz(filt[i])
        y = nz(filt[i + lag])
        sumX += x
        sumY += y
        sumXX += x * x
        sumYY += y * y
        sumXY += x * y
    denom = (N * sumXX - sumX * sumX) * (N * sumYY - sumY * sumY)
    if denom > 0
        corr := (N * sumXY - sumX * sumY) / math.sqrt(denom)
    if corr > maxCorr
        maxCorr := corr
        bestPeriod := lag

domCycle := 0.2 * bestPeriod + 0.8 * nz(domCycle[1])

plot(domCycle, "Dominant Cycle", color=color.blue, linewidth=2)
hline(20, "Default")
```

**Caveat:** The full autocorrelation periodogram with DFT is computationally expensive. Pine Script's loop limits may require limiting the period range or using approximations. Community scripts by ImmortalFreedom ("Excalibur" ACP) and blackcat1402 ("L2 Ehlers Autocorrelation Periodogram") provide more complete implementations.

---

### 1.11 Ehlers Dominant Cycle Period Detection

**Source:** Multiple Ehlers books and TASC articles
**Methods available:**
1. **Hilbert Transform Discriminator** -- Fastest but noisiest (from MAMA algorithm)
2. **Bandpass Filter Bank** -- Multiple filters; the one with highest output indicates the dominant period
3. **Autocorrelation Periodogram** -- Most reliable; Ehlers' preferred method
4. **Zero-Crossing Counter** -- Simple but crude: count bars between zero crossings of bandpass output, multiply by 2

**Practical Recommendation:**
Use the Autocorrelation Periodogram for offline analysis and the Hilbert Discriminator (from the MAMA code) for real-time adaptive indicators. The Hilbert version is faster but the ACP is more stable.

**Application:** Feed the dominant cycle period into other indicators (RSI, Stochastic, etc.) as an adaptive length parameter. Example: `RSI(DominantCycle / 2)` adapts RSI to the current market rhythm.

---

### 1.12 Ehlers Roofing Filter

**Source:** *Cycle Analytics for Traders*, Chapter 3
**What it does:** Combines a high-pass filter and a low-pass (Super Smoother) filter to create a bandpass effect. It "puts a roof" on the frequency response, passing only cycle components in the 10-48 bar range.

**Structure:**
```
HP(48-bar) -> SuperSmoother(10-bar) = Roofing Filter
```

The high-pass removes everything slower than 48 bars (trend).
The Super Smoother removes everything faster than 10 bars (noise).

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Roofing Filter", overlay=false)

hpLength = input.int(48, "HP Cutoff Period")
ssLength = input.int(10, "SS Cutoff Period")
src = close

// High-pass filter (2-pole)
alphaHP = (math.cos(math.toradians(360.0 / hpLength)) + math.sin(math.toradians(360.0 / hpLength)) - 1.0) / math.cos(math.toradians(360.0 / hpLength))
var float hp = 0.0
hp := math.pow(1.0 - alphaHP / 2.0, 2) * (src - 2.0 * nz(src[1]) + nz(src[2])) + 2.0 * (1.0 - alphaHP) * nz(hp[1]) - math.pow(1.0 - alphaHP, 2) * nz(hp[2])

// Super Smoother (2-pole)
a1 = math.exp(-math.sqrt(2.0) * math.pi / ssLength)
b1 = 2.0 * a1 * math.cos(math.sqrt(2.0) * math.pi / ssLength)
coeff2 = b1
coeff3 = -a1 * a1
coeff1 = 1.0 - coeff2 - coeff3
var float roofing = 0.0
roofing := coeff1 * (hp + nz(hp[1])) / 2.0 + coeff2 * nz(roofing[1]) + coeff3 * nz(roofing[2])

plot(roofing, "Roofing Filter", color=color.blue, linewidth=2)
hline(0, "Zero")
```

---

### 1.13 Ehlers Even Better Sinewave (EBSW)

**Source:** *Cycle Analytics for Traders*, Chapter 12
**What it does:** Determines whether the market is in a cycle mode or a trend mode. It uses a simplified Roofing Filter variant with automatic gain control, normalizing the output between approximately -1 and +1.

**Algorithm:**
1. High-pass filter for detrending
2. Super Smoother for cycle extraction
3. Compute wave power (RMS of recent values)
4. Normalize the cycle output by its power
5. Result: near +1/-1 in cycles, railed at extremes in trends

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Even Better Sinewave", overlay=false)

duration = input.int(40, "Duration", minval=10)

src = close

// High-pass filter
alpha1 = (1.0 - math.sin(2.0 * math.pi / duration)) / math.cos(2.0 * math.pi / duration)
var float hp = 0.0
hp := 0.5 * (1.0 + alpha1) * (src - nz(src[1])) + alpha1 * nz(hp[1])

// Super Smoother (2-pole, period = duration/2 capped at minimum of 10)
ssLen = math.max(duration / 2.0, 10.0)
a1 = math.exp(-math.sqrt(2.0) * math.pi / ssLen)
b1 = 2.0 * a1 * math.cos(math.sqrt(2.0) * math.pi / ssLen)
c2 = b1
c3 = -a1 * a1
c1 = 1.0 - c2 - c3
var float filt = 0.0
filt := c1 * (hp + nz(hp[1])) / 2.0 + c2 * nz(filt[1]) + c3 * nz(filt[2])

// Automatic Gain Control via RMS
var float wave = 0.0
float pwr = 0.0
for i = 0 to duration - 1
    pwr += nz(filt[i]) * nz(filt[i])
pwr := pwr / duration

if pwr > 0
    wave := filt / math.sqrt(pwr)

// Clamp
wave := math.max(-1.0, math.min(1.0, wave))

plot(wave, "EBSW", color=wave > 0 ? color.green : color.red, linewidth=2)
hline(0.85, "OB", linestyle=hline.style_dotted, color=color.red)
hline(-0.85, "OS", linestyle=hline.style_dotted, color=color.green)
hline(0, "Zero", color=color.gray)
```

**Interpretation:**
- Values near +1 or -1 indicate a cycle mode -- prepare for reversal
- Values that stay railed at extremes indicate a strong trend -- follow it
- Crossovers of zero provide entry/exit signals
- The indicator has "stochastic-like qualities" per Ehlers

**TradingView Scripts:** mihakralj (EBSW), blackcat1402 (L2 translation), ImmortalFreedom (MTF version)

---

### 1.14 Ehlers Stochastic Center of Gravity

**Source:** *Cybernetic Analysis for Stocks and Futures*, pp. 79-80
**What it does:** Computes the Center of Gravity (balance point) of price over a lookback window, then applies a Stochastic normalization to bound it.

**Center of Gravity Formula:**
```
CG = -Sum(Price[i] * (i+1), i=0..Length-1) / Sum(Price[i], i=0..Length-1) + (Length+1)/2
```

The CG identifies turning points with minimal lag because it measures where price "weight" is concentrated in the lookback window. A low CG means recent prices dominate (bullish); a high CG means older prices dominate (bearish).

**Stochastic Normalization:**
```
MaxCG = Highest(CG, StochLength)
MinCG = Lowest(CG, StochLength)
StochCG = (CG - MinCG) / (MaxCG - MinCG) if range > 0
```

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Ehlers Stochastic Center of Gravity", overlay=false)

cgLength = input.int(8, "CG Length", minval=2)
stochLength = input.int(8, "Stochastic Length", minval=2)
smoothLength = input.int(3, "Smoothing", minval=1)

src = close

// Center of Gravity
float num = 0.0
float denom = 0.0
for i = 0 to cgLength - 1
    num += nz(src[i]) * (i + 1)
    denom += nz(src[i])

cg = denom != 0 ? -num / denom + (cgLength + 1.0) / 2.0 : 0.0

// Stochastic of CG
maxCG = ta.highest(cg, stochLength)
minCG = ta.lowest(cg, stochLength)
stochCG = maxCG != minCG ? (cg - minCG) / (maxCG - minCG) : 0.0

// Smooth
trigger = ta.sma(stochCG, smoothLength)

plot(stochCG, "Stoch CG", color=color.blue, linewidth=2)
plot(trigger, "Trigger", color=color.red)
hline(0.8, "OB")
hline(0.2, "OS")
hline(0.5, "Mid")
```

---

### 1.15 Ehlers Indicators: Market Suitability Guide

Based on research across Stonehill Forex backtests, Financial Hacker analysis, and community feedback:

#### For Crypto (BTC, ETH, SOL)
**Best Ehlers indicators:**
- **Fisher Transform** -- Sharpens momentum extremes common in crypto
- **MAMA/FAMA** -- Adaptive smoothing handles volatile regime changes (use SlowLimit=0.03)
- **Super Smoother** -- Excellent noise reduction for noisy crypto data
- **Even Better Sinewave** -- Identifies cycle/trend mode (crypto trends hard)
- **Roofing Filter** -- Isolates tradeable cycles from crypto noise

**Challenges:**
- Dominant cycle period detection is unreliable -- crypto cycles are irregular
- Default parameters usually need adjustment (wider ranges, longer periods)
- Stonehill Forex found default BTC parameters "incredibly poor" -- tuning is essential

#### For Forex (EUR/USD, GBP/USD)
**Best Ehlers indicators:**
- **Cyber Cycle** -- Forex pairs exhibit cleaner cyclical behavior on 1H-4H
- **MAMA/FAMA** -- Default parameters work well on 4H and Daily
- **Bandpass Filter** -- Cleaner cycles in forex make this more reliable
- **Autocorrelation Periodogram** -- More stable cycle detection in forex
- **Decycler** -- Excellent trend identification for session-based trading

**Advantages:**
- Forex has more regular cycles than crypto
- Session overlaps create identifiable patterns that DSP filters can isolate

#### For Commodities (WTI, Gold)
**Best Ehlers indicators:**
- **MAMA/FAMA** with FastLimit=0.4, SlowLimit=0.05
- **Decycler + Decycler Oscillator** -- Good for trending commodity markets
- **Even Better Sinewave** -- Gold showed strong results in backtests
- **Super Smoother** -- Useful for reducing noise in oil market data

**Notes:**
- Gold consistently tested well across multiple Ehlers indicators (Stonehill Forex)
- Commodity cycles are often driven by fundamentals (inventory, OPEC) not just price dynamics
- Seasonal patterns can create predictable cycle periods

---

### 1.16 Recent Ehlers Indicators (2024-2026)

Ehlers continues publishing new indicators through TASC. Recent additions include:

| Indicator | Date | Description |
|-----------|------|-------------|
| Ultimate Channels/Bands | May 2024 | Keltner/Bollinger variants using Ultimate Smoother |
| Precision Trend Analysis | Sep 2024 | DSP-based trend detection |
| Ultimate Strength Index | Dec 2024 | RSI replacement with symmetry (-1 to +1), less lag |
| Griffiths Predictor | Jan 2025 | Linear predictive filter for price forecasting |
| Griffiths Dominant Cycle | Jan 2025 | Alternative cycle detection |
| Autocorrelation (Drunkard's Walk) | Feb 2025 | Market efficiency measurement |
| Projected Moving Average (PMA) | Mar 2025 | Moving average with reduced lag via projection |
| Cybernetic Oscillator | Jun 2025 | HP filter + LP filter + normalization |
| Continuation Index | Sep 2025 | Trend onset and exhaustion detection |
| AutoTune Filter | May 2026 | Self-adapting bandpass filter using autocorrelation |

**PineCoders TASC** publishes official Pine v5/v6 implementations of each new TASC article indicator.

---

## PART 2: KALMAN FILTERS IN TRADING

### 2.1 Standard Kalman Filter for Price Smoothing

**What it is:** An optimal recursive estimator that processes noisy observations (prices) to estimate an underlying state (true price/trend). It balances between trusting the model's prediction and trusting the observation, based on their respective uncertainties.

**Core Equations (Scalar Case for Price):**

```
Prediction Step:
  x_pred = x_est                    (state stays same -- random walk model)
  P_pred = P_est + Q                (error covariance grows by process noise)

Update Step:
  K = P_pred / (P_pred + R)         (Kalman gain)
  x_est = x_pred + K * (price - x_pred)  (update estimate)
  P_est = (1 - K) * P_pred          (update error covariance)
```

Where:
- `x_est` = estimated price/state
- `P_est` = estimation error covariance
- `Q` = process noise (how much we expect the true state to change)
- `R` = measurement noise (how noisy the price observations are)
- `K` = Kalman gain (auto-adjusts between 0 and 1)

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("Kalman Filter", overlay=true)

Q = input.float(0.01, "Process Noise (Q)", minval=0.0001, step=0.001, tooltip="How much the true price is expected to change per bar")
R = input.float(1.0, "Measurement Noise (R)", minval=0.01, step=0.1, tooltip="How noisy the price observations are")

src = input.source(close, "Source")

// Persistent state variables
var float x_est = na
var float P_est = 1.0

// Initialize on first bar
if na(x_est)
    x_est := src
    P_est := 1.0

// Only update on confirmed bars to prevent repainting
if barstate.isconfirmed
    // Prediction step
    float x_pred = x_est
    float P_pred = P_est + Q

    // Update step
    float K = P_pred / (P_pred + R)
    x_est := x_pred + K * (src - x_pred)
    P_est := (1.0 - K) * P_pred

plot(x_est, "Kalman Estimate", color=color.blue, linewidth=2)
plot(src, "Source", color=color.new(color.gray, 70))

// Plot Kalman gain for diagnostics
// plot(K, "Kalman Gain", color=color.orange)
```

**Parameter Tuning:**

| Parameter | Effect of Increasing | Crypto | Forex | Commodities |
|-----------|---------------------|--------|-------|-------------|
| Q (Process Noise) | More responsive, more noise | 0.05-0.1 | 0.01-0.03 | 0.02-0.05 |
| R (Measurement Noise) | Smoother, more lag | 0.5-2.0 | 1.0-5.0 | 1.0-3.0 |

**Ratio Q/R is what matters:**
- High Q/R: filter trusts observations more (responsive, noisy)
- Low Q/R: filter trusts model more (smooth, laggy)
- At steady state, the Kalman filter with constant Q and R converges to an EMA

---

### 2.2 Extended Kalman Filter (EKF)

**What it is:** An extension of the Kalman filter for non-linear systems. Instead of assuming linear state transitions and observations, the EKF linearizes around the current estimate using Jacobian matrices.

**Why it matters for trading:**
- Price dynamics are fundamentally non-linear
- Volatility, momentum, and mean-reversion are non-linear effects
- The EKF can model states like [price, velocity, acceleration] where the observation model or state transition is non-linear

**Limitations:**
- Requires computing Jacobian matrices (analytical derivatives)
- The linearization approximation can introduce significant errors when non-linearity is strong
- Can diverge if the model is poorly specified

**Academic Findings:**
- Lautier and Galli (2004) applied EKF to commodity term structures and found it useful but noted the approximation must be carefully validated
- A 2014 Management Science study found the EKF was significantly outperformed by the UKF for bond pricing

**PineScript Feasibility:** Moderate. The EKF requires matrix operations. Pine Script v5/v6 has matrix support, and the igor_sinkovec Kalman filter library on TradingView implements a multi-state variant with level, velocity, and acceleration states, with separate process noise terms for each.

---

### 2.3 Unscented Kalman Filter (UKF)

**What it is:** A more sophisticated approach to non-linear estimation. Instead of linearizing (like the EKF), the UKF propagates a carefully chosen set of "sigma points" through the non-linear function, then reconstructs the mean and covariance from the transformed points.

**Advantages over EKF:**
- No Jacobian computation required
- Better accuracy for strongly non-linear systems
- Easier to implement (no derivatives needed)
- Academic evidence (Christoffersen et al., 2014) shows it outperforms EKF and rivals particle filters

**Trading Applications:**
- Estimating hidden volatility states
- Tracking regime changes
- Multi-factor models where state transitions are non-linear

**PineScript Feasibility:** Complex but possible. Requires 2n+1 sigma points for n state variables, matrix operations, and careful numerical handling. The KalmanEngineLib on TradingView stores covariance matrices as packed upper triangles to save memory, which demonstrates the feasibility of matrix operations in Pine.

---

### 2.4 Kalman Filter vs. Moving Averages

**Theoretical Advantages:**

| Feature | Kalman Filter | Moving Average |
|---------|--------------|----------------|
| Lag | Adaptive (adjusts K) | Fixed for given length |
| Noise Reduction | Optimal for Gaussian | Good but not optimal |
| Parameter Count | 2 (Q, R) | 1 (length) |
| Adaptivity | Auto-adjusting gain | Fixed response |
| Theoretical Basis | Bayesian optimal | Heuristic |

**Practical Reality:**
- With constant Q and R, the Kalman filter converges to an EMA at steady state (LuxAlgo)
- The edge depends entirely on how well the noise variances are chosen
- A mis-specified Kalman filter can lag or overshoot more than a simple MA
- No published out-of-sample evidence shows the Kalman filter consistently outperforms MAs in terms of trading returns
- The MA is far easier to validate, explain, and debug

**When the Kalman Filter Wins:**
- When process noise varies (make Q adaptive based on ATR or volatility)
- When measurement noise varies (make R larger during high-volume/news periods)
- When you need a probabilistic estimate (the error covariance P gives a confidence interval)
- When you model multiple states (trend + velocity + acceleration)

**Practical Tips:**
- Always update only on `barstate.isconfirmed` to prevent repainting
- The standard filter is causal (uses only current and past data)
- The Kalman *smoother* runs a backward pass and revises history -- avoid for live signals
- Start with the ratio Q/R = 0.01 and adjust from there

---

### 2.5 Kalman Filter Variants on TradingView

**Key community implementations:**

1. **Kalman Filter [DCAUT]** -- Basic implementation with Q and R inputs
2. **KalmanEngineLib (cybermediaboy)** -- Pine v6 library for multi-state filtering, packed covariance storage
3. **Kalman Filter (igor_sinkovec)** -- Multi-state (level, velocity, acceleration) with EKF variant, separate process noise terms
4. **Kalman Trend Estimator (ZurvanEG)** -- Scalar filter treating price as noisy measurement of hidden trend
5. **Kalman Regime (Jamallo, 2025)** -- Gaussian kernel + adaptive Kalman with ATR-based volatility awareness
6. **Adaptive Kalman Trend Strength (Zeiierman)** -- Tunable process noise, volume-adjusted and Parkinson-adjusted noise models
7. **VWAP Kalman Filter** -- Applies Kalman smoothing to VWAP
8. **Rocky-Studio Kalmanfilter Library** -- Includes adaptive measurement noise helper

---

### 2.6 Optimal Noise Parameters by Market

These are starting points based on community experience. Always validate on your own data.

**Crypto (BTC, ETH):**
```
Q = 0.05 to 0.10     (high process noise -- prices move a lot)
R = 0.5 to 2.0       (moderate measurement noise)
Q/R ratio: ~0.05 to 0.10
```

**Forex (EUR/USD):**
```
Q = 0.001 to 0.01    (low process noise -- less volatile)
R = 1.0 to 5.0       (higher measurement noise relative to Q)
Q/R ratio: ~0.001 to 0.005
```

**Commodities (WTI, Gold):**
```
Q = 0.01 to 0.05     (moderate process noise)
R = 1.0 to 3.0       (moderate measurement noise)
Q/R ratio: ~0.01 to 0.03
```

**Adaptive approach (recommended):**
```pinescript
// Make Q proportional to recent volatility
atr_val = ta.atr(14)
Q_adaptive = 0.01 * atr_val / close  // Scale by ATR
R_adaptive = R_base  // Keep R fixed or based on longer-term volatility
```

---

## PART 3: GARCH / VOLATILITY MODELS

### 3.1 GARCH(1,1) for Volatility Forecasting

**What it is:** Generalized Autoregressive Conditional Heteroskedasticity. Models how volatility clusters over time -- large moves tend to follow large moves, and calm periods tend to follow calm periods.

**The GARCH(1,1) Equation:**

```
sigma^2(t) = omega + alpha * epsilon^2(t-1) + beta * sigma^2(t-1)
```

Where:
- `sigma^2(t)` = conditional variance at time t
- `omega` = long-run variance weight (intercept)
- `alpha` = weight on last squared return (reaction to shocks)
- `beta` = weight on last variance (persistence)
- `epsilon(t-1)` = last return (often log return)
- Constraint: alpha + beta < 1 for stationarity

**Long-run variance:** `sigma_LR^2 = omega / (1 - alpha - beta)`

**Typical Parameter Ranges:**
- omega: 0.000001 to 0.0001
- alpha: 0.05 to 0.15 (higher = more reactive)
- beta: 0.80 to 0.95 (higher = more persistent)
- alpha + beta: usually 0.95 to 0.99

**PineScript v5 Implementation:**

```pinescript
//@version=5
indicator("GARCH(1,1) Volatility", overlay=false)

omega = input.float(0.00001, "Omega (long-run weight)", minval=0.0, step=0.000001)
alpha = input.float(0.10, "Alpha (shock reaction)", minval=0.0, maxval=0.5, step=0.01)
beta = input.float(0.85, "Beta (persistence)", minval=0.0, maxval=0.99, step=0.01)
annualize = input.bool(true, "Annualize?")

// Log returns
logReturn = math.log(close / nz(close[1], close))

// Initialize conditional variance from sample variance
var float sigma2 = 0.0
if bar_index == 0
    sigma2 := logReturn * logReturn
else
    // GARCH(1,1) recursion
    sigma2 := omega + alpha * logReturn[1] * logReturn[1] + beta * nz(sigma2[1], omega / (1.0 - alpha - beta))

// Ensure positivity
sigma2 := math.max(sigma2, 0.000000001)

// Conditional volatility (standard deviation)
float condVol = math.sqrt(sigma2)

// Annualize if requested (assuming daily bars)
float displayVol = annualize ? condVol * math.sqrt(252.0) * 100.0 : condVol * 100.0

plot(displayVol, "GARCH Vol (%)", color=color.orange, linewidth=2)

// Long-run volatility
longRunVar = omega / (1.0 - alpha - beta)
longRunVol = annualize ? math.sqrt(longRunVar) * math.sqrt(252.0) * 100.0 : math.sqrt(longRunVar) * 100.0
hline(longRunVol, "Long-Run Vol", color=color.gray, linestyle=hline.style_dotted)
```

**The Hard Part -- Parameter Estimation:**
GARCH parameters are typically estimated via Maximum Likelihood Estimation (MLE), which PineScript cannot do directly. Approaches:
1. **Fixed parameters:** Fit offline in Python (`arch` library) and hardcode
2. **SSE method:** The TradingView script by SegaRKO minimizes Sum of Squared Errors in real-time
3. **Rolling window:** Re-estimate parameters periodically offline
4. **Approximation:** Use typical values (alpha=0.1, beta=0.85) as starting points

**TradingView Scripts:**
- **GARCH Volatility Estimation (The Quant Science)** -- Claims MLE fitting with Student-t distributions
- **GARCH(1,1) (SegaRKO)** -- Uses SSE for real-time parameter estimation
- **SGM GARCH Volatility (Sigaud)** -- Simplified approximation (essentially rolling std dev)

---

### 3.2 EGARCH for Asymmetric Volatility

**What it is:** Exponential GARCH models the *log* of conditional variance, capturing the asymmetric response where negative returns increase volatility more than positive returns of the same magnitude (the "leverage effect").

**EGARCH(1,1) Equation:**

```
ln(sigma^2(t)) = omega + alpha * [|z(t-1)| - E|z(t-1)|] + gamma * z(t-1) + beta * ln(sigma^2(t-1))
```

Where:
- `z(t-1)` = standardized residual = epsilon(t-1) / sigma(t-1)
- `gamma` = leverage parameter (negative means negative shocks increase vol more)
- All other terms as in standard GARCH

**Advantages over GARCH:**
- No positivity constraints needed (log guarantees sigma^2 > 0)
- Captures leverage effect naturally
- gamma < 0 means bad news increases volatility more than good news

**Implementation Approach:**
- Full EGARCH requires MLE fitting -- best done offline in Python (`arch.arch_model(returns, vol='EGARCH')`)
- For a PineScript approximation, fit parameters offline and run the recursion on new bars with fixed coefficients
- Francis Dube's MQL5 implementation includes logarithmic backcasting and diagnostic tests

**PineScript Feasibility:** Moderate. The recursion itself is simple (just log and exp), but parameter estimation needs Python. Run the recursion in Pine with pre-fitted parameters.

---

### 3.3 Approximating GARCH in PineScript

Since PineScript lacks an optimizer, here are practical approaches:

**Approach 1: Simplified GARCH with Fixed Parameters**
```pinescript
// Use academically common parameters
omega = 0.00001
alpha = 0.10
beta = 0.85
sigma2 = omega + alpha * ret^2 + beta * sigma2[1]
```

**Approach 2: Exponentially Weighted Moving Variance (EWMA)**
```pinescript
// RiskMetrics-style (lambda = 0.94, no omega term)
lambda_val = 0.94
sigma2 = lambda_val * sigma2[1] + (1 - lambda_val) * ret^2
```
This is equivalent to GARCH(1,1) with omega=0, alpha=1-lambda, beta=lambda.

**Approach 3: Adaptive GARCH via ATR Proxy**
```pinescript
// Use ATR as a volatility proxy and GARCH-style smoothing
fast_vol = ta.atr(5) / close
slow_vol = ta.atr(50) / close
garch_proxy = alpha * fast_vol + beta * slow_vol
```

**Approach 4: Fit in Python, Deploy in Pine**
```python
# In Python (offline):
from arch import arch_model
model = arch_model(returns, vol='GARCH', p=1, q=1)
result = model.fit()
print(result.params)
# Output: omega=X, alpha=Y, beta=Z
# Then hardcode these into PineScript
```

---

### 3.4 Volatility Regime Detection

**Purpose:** Classify the current market as low-volatility, normal, or high-volatility to adapt trading strategy.

**Methods:**

**Method 1: Percentile-Based (Realized Volatility Regime Indicator)**
```pinescript
//@version=5
indicator("Volatility Regime", overlay=false)

volLen = input.int(20, "Vol Window")
rankLen = input.int(252, "Ranking Window")

// Realized vol from log returns
logRet = math.log(close / nz(close[1], close))
realVol = ta.stdev(logRet, volLen) * math.sqrt(252.0)

// Percentile rank
rank = ta.percentrank(realVol, rankLen)

regime = rank < 25 ? 1 : rank < 75 ? 2 : 3  // 1=Low, 2=Normal, 3=High

col = regime == 1 ? color.green : regime == 2 ? color.yellow : color.red
plot(realVol * 100, "Realized Vol %", color=col, linewidth=2)
```

**Method 2: K-Means Clustering (Volatility Regime Clustering script)**
Uses k-means on ATR values (in basis points) over 200 bars to classify regimes into calm, normal, nervous, and extreme.

**Method 3: Short vs Long Volatility Comparison**
```pinescript
// Compare 20-day vs 60-day realized vol
shortVol = ta.stdev(logRet, 20)
longVol = ta.stdev(logRet, 60)
volRatio = shortVol / longVol
// > 1.5 = expanding vol (high regime)
// < 0.5 = contracting vol (low regime)
```

**TradingView Scripts:**
- **Realized Volatility Regime Indicator [v1]** (Novaque_Research)
- **Volatility Regime Clustering** (Smart-Day-Trader)
- **Volatility Regime Classifier [JOAT]** (officialjackofalltrades)
- **Regime Map** (open source, z-score based)

---

### 3.5 Realized Volatility vs. Implied Volatility

**Realized Volatility (RV):**
- Computed from actual price returns
- Backward-looking
- Can be computed in PineScript: `stdev(log_returns, N) * sqrt(252)`
- Higher frequency data gives better estimates

**Implied Volatility (IV):**
- Derived from option prices (Black-Scholes model)
- Forward-looking (market's expectation of future vol)
- Cannot be directly computed in PineScript (needs options data)
- Available as indices: VIX (SPX), BVOL (BTC), OVX (Oil)

**IV-RV Spread:**
```pinescript
// Use VIX as IV proxy, compute RV from SPX
rv = ta.stdev(math.log(close / close[1]), 20) * math.sqrt(252) * 100
// Request VIX (implied vol)
iv = request.security("CBOE:VIX", timeframe.period, close)
spread = iv - rv
// Positive spread = options are expensive (vol sellers' advantage)
// Negative spread = options are cheap (vol buyers' advantage)
```

---

### 3.6 Volatility Clustering Detection

Volatility clustering is the empirical observation that large returns tend to cluster together. GARCH captures this, but simpler methods exist:

**Method 1: Autocorrelation of Squared Returns**
```pinescript
// High autocorrelation = strong clustering
sqRet = math.pow(math.log(close / close[1]), 2)
clustering = ta.correlation(sqRet, sqRet[1], 50)
// Values near 1.0 indicate strong clustering
```

**Method 2: Runs Test**
Count consecutive bars where |return| exceeds a threshold. Long runs = clustering.

**Method 3: GARCH Alpha + Beta**
The sum alpha + beta in GARCH(1,1) measures persistence. Values > 0.95 indicate strong clustering.

---

## PART 4: MACHINE LEARNING INDICATORS

### 4.1 Nadaraya-Watson Kernel Regression

**Source:** Widely published on TradingView; based on classic nonparametric statistics
**What it does:** Estimates the conditional mean of price at each point using a weighted average where weights are determined by a kernel function (typically Gaussian). Closer historical bars get more weight.

**Formula:**
```
y_hat(x) = Sum(K((x - x_i) / h) * y_i) / Sum(K((x - x_i) / h))
```
Where K is the kernel function and h is the bandwidth parameter.

**Kernel Options:**
- **Gaussian:** `K(u) = exp(-u^2/2)` -- most common
- **Epanechnikov:** `K(u) = 0.75*(1-u^2)` for |u| <= 1
- **Rational Quadratic:** `K(u) = 1 / (1 + u^2)^alpha`

**Envelope Bands:**
Upper and lower bands are derived from ATR applied to the regression line, creating dynamic support/resistance.

**Key Properties:**
- Non-parametric: makes no assumption about price distribution
- Bandwidth controls smoothness vs responsiveness
- Lookback 50-100: high responsiveness, short-cycle sensitivity
- Lookback 200+: very smooth, captures major trends

**Repainting Warning:**
- Most NW implementations recalculate the entire curve on each bar
- Non-repainting versions lock values once each bar closes
- Causal versions use only current and past bars (verify before trading)

**Parameters:**
- `bandwidth (h)`: 8.0 (default for Gaussian kernel)
- `lookback`: 200-500 bars
- `kernel type`: Gaussian or Rational Quadratic

**TradingView Scripts:**
- **Nadaraya-Watson Envelope** -- Multiple versions, some repainting
- **Nadaraya-Watson Oscillator** (FractalTrade_) -- Oscillator form
- **Nadaraya-Watson Trend** (QuantAlgo) -- Trend-following variant
- **Non-Repainting version** -- Uses only confirmed bars

---

### 4.2 Kernel Density Estimation for Support/Resistance

**What it does:** Estimates the probability density function of price, identifying areas where price has concentrated (high density = strong S/R level).

**Algorithm:**
1. Collect pivot highs and lows over a lookback window
2. For each pivot, add a kernel (Gaussian bump) centered at that price level
3. Sum all kernels to get the density function
4. Find peaks in the density function -- these are S/R levels
5. Rank peaks by prominence and display the top N levels

**PineScript Implementation Approach:**
```pinescript
// Conceptual approach (simplified)
// 1. Identify pivots
pivotH = ta.pivothigh(high, leftBars, rightBars)
pivotL = ta.pivotlow(low, leftBars, rightBars)

// 2. Store pivot prices in an array
// 3. For each price level in a grid:
//    density = sum of gaussian(price - pivot_price, bandwidth) for all pivots
// 4. Find local maxima of density
// 5. Draw lines at maxima
```

**TradingView Scripts:**
- **Support & Resistance KDE** (open source) -- Uses pivot H/L, ATR-based spacing, top N levels
- **KDE Value Clouds (LuxAlgo)** -- Density exceeding 50th percentile shown as zones
- **Heatmap Suite (PhenLabs)** -- Pine v6, multiple kernel methods, color-coded density

**Bandwidth Selection:**
- Too narrow: picks up noise, too many levels
- Too wide: merges distinct levels, too few
- Common approach: use ATR as bandwidth

---

### 4.3 K-Nearest Neighbors (KNN) for Pattern Matching

**What it does:** For each bar, finds the K most similar historical bars (based on feature similarity), then uses their outcomes to predict the current bar's direction.

**Why it works in Pine:**
- No explicit training phase
- Classification is based on distance calculation (simple math)
- Pine Script has loops and arrays to handle the distance computation

**Typical Features:**
- RSI value
- MACD histogram
- ATR (volatility)
- Volume ratio
- Price change over N bars

**Distance Metrics:**
- **Euclidean:** `sqrt(sum((f1 - f2)^2))`
- **Lorentzian:** `sum(log(1 + |f1 - f2|))` -- less sensitive to outliers
- **Manhattan:** `sum(|f1 - f2|)`

**PineScript Feasibility:** Fully feasible. Multiple KNN implementations exist on TradingView. The main constraint is the lookback depth (how many historical bars to search) and the number of features (more features = slower).

**Limitations:**
- Sensitive to the choice of distance metric
- Curse of dimensionality with many features
- Computational cost scales with lookback length
- No way to validate statistical significance within PineScript

---

### 4.4 Lorentzian Classification Indicator

**Source:** GitHub `artificial-intelligence-edge/lorentzian-classification`; TradingView by jdehorty
**What it does:** A KNN classifier that uses Lorentzian distance instead of Euclidean distance. The Lorentzian metric is less sensitive to outliers, making it more robust for financial data.

**Lorentzian Distance:**
```
d(x, y) = sum(log(1 + |x_i - y_i|)) for each feature i
```

**Why Lorentzian over Euclidean:**
- Financial features often have fat-tailed distributions
- Euclidean distance is dominated by outliers
- Lorentzian compresses large differences via the log function
- Results in more stable neighbor selection

**Algorithm:**
1. Extract features per bar: normalized RSI, Wave Trend, CCI, ADX (up to 5 in free, 15 in premium)
2. For each historical bar, compute Lorentzian distance to current bar
3. Find the K nearest neighbors
4. Sum their outcomes (up vote or down vote)
5. Generate signal when model vote agrees with kernel trend direction

**Signal Generation:**
- Buy: majority of neighbors were followed by price increase AND kernel trend is up
- Sell: majority of neighbors were followed by price decrease AND kernel trend is down
- The dual confirmation (KNN + kernel) reduces false signals

**Implementation Status:**
- Original: Pine Script v5 (now updated to v6)
- Open source: GitHub repo with Python, Rust, Lean 4, and MQL5 ports
- Premium version: up to 15 features

**Key Parameters:**
- `k` (neighbors): 8 (default)
- `lookback`: 2000 bars
- `features`: RSI(14), WT(10,11), CCI(20), ADX(20)
- `kernel bandwidth`: 8.0
- `kernel type`: Rational Quadratic

**Performance Caveats:**
- No independently verified backtest results published
- TradeSearcher lists a strategy version but results are marketing material
- The indicator was recognized in the 2025 Pine Script Wizards awards
- Always test with proper out-of-sample validation

---

### 4.5 Random Forest / Decision Tree Approaches

**What they are:** Ensemble methods that build many decision trees and aggregate their predictions. Each tree sees a random subset of data and features, reducing overfitting.

**PineScript Feasibility:**
- **Single decision tree:** Feasible (simple if/else chains)
- **Random forest (full):** Very challenging due to memory and computation limits
- **Gradient boosting (XGBoost-style):** Now possible via the **Arbor_Gradient_Boosting_GainzAlgo** library

**The Arbor Library (GainzAlgo):**
- XGBoost-style gradient boosting in Pine Script
- Trees are depth-1 stumps (one split per round)
- Features: Newton leaf steps, L2 regularization (lambda), minimum gain pruning (gamma), minimum child weight
- Row subsampling via Fisher-Yates shuffling
- Three tiers: GBM (1 feature), GBM3 (3 features, classification), GBM4 (4 features, classification + regression)
- Includes feature importance calculation

**Practical Constraints:**
- Pine Script has no way to import Python ML libraries
- No built-in optimizer (gradient descent, grid search, etc.)
- Loop count limits restrict tree depth and ensemble size
- Memory limits restrict the training set size
- No cross-validation framework

---

### 4.6 What Can Be Implemented in PineScript vs. What Needs Python

| Technique | PineScript | Python | Notes |
|-----------|-----------|--------|-------|
| KNN (k-Nearest Neighbors) | Yes | Yes | Limited lookback in Pine |
| Lorentzian Classification | Yes | Yes | Full implementation exists |
| Nadaraya-Watson Regression | Yes | Yes | Watch for repainting |
| Kernel Density Estimation | Yes | Yes | Limited grid resolution in Pine |
| Decision Trees (single) | Yes | Yes | Manual split logic |
| Gradient Boosting (XGBoost) | Partial | Yes | Via Arbor library, depth-1 stumps |
| Random Forest | Barely | Yes | Too memory-intensive for full implementation |
| Neural Networks | No | Yes | No matrix multiplication support efficient enough |
| LSTM/RNN | No | Yes | Requires backpropagation |
| Support Vector Machines | No | Yes | Requires quadratic programming |
| PCA/Factor Models | Partial | Yes | Matrix ops possible but limited |
| GARCH Parameter Fitting | No | Yes | MLE optimization not available |
| Kalman Filter (scalar) | Yes | Yes | Full implementations exist |
| Kalman Filter (matrix) | Partial | Yes | Via KalmanEngineLib |
| Reinforcement Learning | No | Yes | Requires environment simulation |
| Hidden Markov Models | No | Yes | Requires Baum-Welch algorithm |

**PineScript v5/v6 Constraints:**
- **Loops:** for, while, and for...in all supported
- **Arrays:** Fully supported with dynamic sizing
- **Matrices:** Supported in v5/v6
- **Maps:** Supported
- **Request limit:** ~40 `request.*()` calls per script
- **Execution time:** Hard limit (unspecified but real)
- **Memory:** Limited (v6 documentation mentions 32,768 bytes and 1,000 variables per scope, though this may be outdated)
- **No external imports:** Cannot call Python, JS, or any external library
- **No file I/O:** Cannot read/write files
- **No HTTP requests:** Cannot call APIs

**Recommended Workflow for Complex ML:**
1. Develop and train model in Python (scikit-learn, PyTorch, etc.)
2. Extract the decision rules or weights
3. Hardcode the model into PineScript as a static set of rules
4. Use PineScript for inference only, not training

---

## APPENDIX A: COMPREHENSIVE EHLERS FILTER LIBRARY (PineScript v5)

This section provides a reusable library of Ehlers building blocks.

```pinescript
//@version=5
// Ehlers DSP Building Blocks
// Reference: John Ehlers, "Cycle Analytics for Traders" (2013)
//            John Ehlers, "Cybernetic Analysis for Stocks and Futures" (2004)

// === HIGH-PASS FILTER (2-pole) ===
// Removes frequencies below the cutoff period (removes trend)
ehlers_highpass(float src, int period) =>
    float alpha = (math.cos(math.toradians(360.0 / period)) + math.sin(math.toradians(360.0 / period)) - 1.0) / math.cos(math.toradians(360.0 / period))
    var float hp = 0.0
    hp := math.pow(1.0 - alpha / 2.0, 2) * (src - 2.0 * nz(src[1]) + nz(src[2])) + 2.0 * (1.0 - alpha) * nz(hp[1]) - math.pow(1.0 - alpha, 2) * nz(hp[2])
    hp

// === SUPER SMOOTHER (2-pole) ===
// Low-pass filter with sharp cutoff (removes noise)
ehlers_supersmoother(float src, int period) =>
    float a1 = math.exp(-math.sqrt(2.0) * math.pi / period)
    float b1 = 2.0 * a1 * math.cos(math.sqrt(2.0) * math.pi / period)
    float c2 = b1
    float c3 = -a1 * a1
    float c1 = 1.0 - c2 - c3
    var float ss = 0.0
    ss := c1 * (src + nz(src[1])) / 2.0 + c2 * nz(ss[1]) + c3 * nz(ss[2])
    ss

// === ROOFING FILTER ===
// Bandpass via HP + SS cascade (passes cycles in period range)
ehlers_roofing(float src, int hpPeriod, int ssPeriod) =>
    float hp = ehlers_highpass(src, hpPeriod)
    float rf = ehlers_supersmoother(hp, ssPeriod)
    rf

// === BANDPASS FILTER ===
ehlers_bandpass(float src, int centerPeriod, float bandwidth) =>
    float beta_val = math.cos(2.0 * math.pi / centerPeriod)
    float gamma_val = 1.0 / math.cos(2.0 * math.pi * bandwidth / centerPeriod)
    float alpha_val = gamma_val - math.sqrt(gamma_val * gamma_val - 1.0)
    var float bp = 0.0
    bp := 0.5 * (1.0 - alpha_val) * (src - nz(src[2])) + beta_val * (1.0 + alpha_val) * nz(bp[1]) - alpha_val * nz(bp[2])
    bp

// === FISHER TRANSFORM ===
ehlers_fisher(float src, int length) =>
    float maxH = ta.highest(src, length)
    float minL = ta.lowest(src, length)
    var float value = 0.0
    var float fisher = 0.0
    float rawVal = maxH != minL ? 2.0 * ((src - minL) / (maxH - minL) - 0.5) : 0.0
    value := 0.33 * rawVal + 0.67 * nz(value[1])
    value := math.max(-0.999, math.min(0.999, value))
    fisher := 0.5 * math.log((1.0 + value) / (1.0 - value)) + 0.5 * nz(fisher[1])
    fisher

// === INVERSE FISHER TRANSFORM ===
ehlers_ift(float src) =>
    (math.exp(2.0 * src) - 1.0) / (math.exp(2.0 * src) + 1.0)

// === DECYCLER ===
ehlers_decycler(float src, int hpPeriod) =>
    src - ehlers_highpass(src, hpPeriod)
```

---

## APPENDIX B: KEY REFERENCES AND SOURCES

### Books by John Ehlers
1. *Rocket Science for Traders* (2001) -- Hilbert Transform, Instantaneous Trendline
2. *Cybernetic Analysis for Stocks and Futures* (2004) -- Cyber Cycle, Fisher Transform, Center of Gravity, Super Smoother
3. *Cycle Analytics for Traders* (2013) -- Even Better Sinewave, Autocorrelation Periodogram, Bandpass Filter, Roofing Filter

### Key Online Resources
- MESA Software papers: https://mesasoftware.com/papers/
- Traders' Tips (TASC implementations): https://traders.com/Documentation/FEEDbk_docs/
- Financial Hacker (Ehlers analysis): https://financial-hacker.com/tag/ehlers/
- Stonehill Forex (backtests): https://stonehillforex.com/
- LuxAlgo Library (concepts): https://www.luxalgo.com/library/
- Robot Wealth (DSP in trading): https://robotwealth.com/

### TradingView Script Authors (Ehlers Specialists)
- **blackcat1402** -- Faithful translations of Ehlers' book code
- **everget** -- Clean implementations of classic Ehlers indicators
- **ImmortalFreedom** -- "Excalibur" series with enhanced ACP and MTF variants
- **PineCodersTASC** -- Official TASC Traders' Tips implementations
- **LazyBear** -- Early Ehlers ports (Cyber Cycle, Fisher)
- **FatTailAlgo** -- Super Smoother library

### GitHub Repositories
- `artificial-intelligence-edge/lorentzian-classification` -- Lorentzian KNN classifier
- `mementum/bta-lib` -- Python TA library with Hilbert Transform trendline
- `MathisWellmann/go_ehlers_indicators` -- Go implementations of Ehlers filters
- `thetestspecimen/ehlers-indicators-mql5` -- MQL5 ports
- `aticio/legitindicators` -- Python implementations including Super Smoother and Roofing Filter

### Academic References
- Christoffersen, Dorion, Jacobs & Karoui (2014) "Nonlinear Kalman Filtering in Affine Term Structure Models" -- Management Science (UKF vs EKF comparison)
- Lautier & Galli (2004) -- EKF on commodity term structures
- Nelson (1991) -- Original EGARCH paper
- Bollerslev (1986) -- Original GARCH paper

### TradingView Indicator Links
- MAMA/FAMA: https://in.tradingview.com/scripts/mama/
- Lorentzian Classification: https://www.tradingview.com/script/WhBzgfDu-Machine-Learning-Lorentzian-Classification/
- Kalman Filter: https://www.tradingview.com/script/u5C3sDUc-Kalman-Filter-DCAUT
- KalmanEngineLib: https://www.tradingview.com/script/pfbNpPsQ-KalmanEngineLib/
- Ehlers Super Smoother Library: https://www.tradingview.com/script/u47JU3ZR-Ehlers-Super-Smoother/
- Even Better Sinewave: https://www.tradingview.com/script/thzgGKyQ-Ehlers-Even-Better-Sinewave-EBSW/
- GARCH(1,1): https://www.tradingview.com/script/bEpsKze3-Garch-1-1-Model/
- GARCH Volatility Estimation: https://www.tradingview.com/script/a6jqpmu4-GARCH-Volatility-Estimation-The-Quant-Science/
- Support & Resistance KDE: https://www.tradingview.com/script/4XYcYFbA-Support-Resistance-KDE/
- AutoTune Filter (2026): https://www.tradingview.com/script/GqKlw3yv-TASC-2026-05-The-AutoTune-Filter/
- Nadaraya-Watson Trend: https://www.tradingview.com/script/DyPTog1C-Nadaraya-Watson-Trend-QuantAlgo/
- Volatility Regime Clustering: https://www.tradingview.com/script/aXyFjDVd-Volatility-Regime-Clustering/
- Realized Volatility Regime: https://www.tradingview.com/script/Y2jiMFnx-Realized-Volatility-Regime-Indicator-v1/
