# InvestAnswers DCAS & IA Decision Support System -- Deep Research

Compiled from five primary sources: IA DCAS User Guide PDF, rhettre GitHub Gist, and three InvestAnswers Substack recaps.

---

## 1. DCAS (DCA on Steroids) -- Core Concept

DCAS builds on standard dollar-cost averaging (DCA) by optimizing buy timing. It accumulates more when prices are low, avoids highly volatile periods, and reduces purchases during bull markets. It is implemented as a TradingView invite-only indicator with two components:

- **IA-DCAS-Model** -- the signal/visual indicator
- **IA-DCA-Calculator** -- backtesting tool that compares DCA vs DCAS results

### Timeframe & Data Requirements
- Designed for the **DAILY** timeframe only
- Requires a minimum of **~2 years** of historical price data to calculate properly
- Assets with less than 2 years of history will error out
- Recommended data feeds: large exchanges (Coinbase, Binance) or NASDAQ for stocks

---

## 2. Signal Logic -- Green/Red Line and Baseline

### The Baseline (Blue Line at Zero)
- The blue line at y=0.00 represents the baseline
- **Above baseline** = bullish zone, asset is creating new all-time highs
- **Below baseline** = bearish zone, price is significantly below ATH

### Color Signals
- **Green candles/bars**: Buy signal is active
- **Red areas**: Caution zones where price volatility is relatively high -- **no purchasing**

### Three Trading States
| State | Position | Action |
|-------|----------|--------|
| Green + Above baseline | Bullish zone | "Nibble" -- small/reduced purchases |
| Green + Below baseline | Bearish zone | **Amplified purchases** -- the deeper below, the larger the buy |
| Red (any position) | High volatility | **No buying** -- avoid entirely |

### Key Principle
> "When DCAS is above the line and green, you nibble. You amplify your purchase if the chart is below the line and green. There is no buy when it is red."

---

## 3. The Multiplier System

The multiplier adjusts the dollar amount of each purchase relative to your base buy amount.

### How Multipliers Work
- Standard DCA always buys at **1.00x** (fixed amount every period)
- DCAS multipliers range from **0.5x to 3.0x or more**
- When DCAS signals no buy, the multiplier is effectively **0x** (skip that period)

### Example
- Base budget: $100/week
- DCAS signal shows multiplier of **x2.39** --> buy $239 worth
- DCAS signal shows multiplier of **x3.19** --> buy $319 worth
- DCAS signal is red --> buy $0 (skip)

### From the GitHub Gist (rhettre) -- Distance-from-ATH Multiplier Table
This is an earlier/alternative community implementation using Glassnode data:

| Distance from ATH | Buy Factor (Multiplier) |
|-------------------|------------------------|
| 0% - 34.9% | **0** (no buy) |
| 35% - 39.9% | **1.66x** |
| 40% - 44.9% | **2.64x** |
| 45% - 49.9% | **4.26x** |
| 50% - 100% | **2.00x** |

**Note:** The gist uses Glassnode's `price_drawdown_relative` metric to determine how far below ATH the current price is. This is a simplified community approximation, not the official TradingView indicator logic.

---

## 4. DCA Calculator Settings (from Official PDF)

| Setting | Description |
|---------|-------------|
| Show Results | Toggle DCA comparison table on chart |
| Label Style | "Hover" or "Display" for buy amount visibility |
| Label Size | Text size adjustment |
| Strategy | Toggle between DCA and DCAS |
| Buy Amount | Base dollar amount per buy period |
| Frequency | How often buys occur (daily, weekly, bi-weekly, monthly) |
| Start Date | Calculator start date |
| End Date | Calculator stop date |
| Trading Style | Conservative to Aggressive accumulation posture |
| Bull Market Behavior | "Buy less" or "Buy more" during new ATH periods |

### DCAS Model Settings
| Setting | Description |
|---------|-------------|
| Trading Style | Conservative / Neutral / Aggressive -- should match calculator setting |

### Recommended Defaults
- Trading Style: **Neutral**
- Bull Market Behavior: **Neutral**
- Frequency: Weekly (Mondays recommended for entry day)
- Only switch to Aggressive if "late to an asset" (e.g., missed Solana under $20)

---

## 5. GitHub Gist Implementation Details (rhettre/ac171045a32dc4e7c0b37d69543779e8)

### Complete Python Code

```python
import json
import gemini
import requests

GEMINI_PUBLIC_KEY = ""
GEMINI_PRIVATE_KEY = ""
symbol = "BTCUSD"
tick_size = 8
quote_currency_price_increment = 2
buy_amount = 100

GLASSNODE_API_KEY = ''
GLASSNODE_TOKEN = "BTC"

# Fetch distance from ATH via Glassnode
resp = requests.get(
    'https://api.glassnode.com/v1/metrics/market/price_drawdown_relative',
    params={'a': GLASSNODE_TOKEN, 'api_key': GLASSNODE_API_KEY}
)
distance_from_ath = round(resp.json()[-1]['v'] * -1, 3)

def _setBuyFactor(dist_ath):
    print(f"Distance from ATH: {dist_ath}")
    if dist_ath >= .35 and dist_ath < .4:
        buy_factor = 1.66
    elif dist_ath >= .4 and dist_ath < .45:
        buy_factor = 2.64
    elif dist_ath >= .45 and dist_ath < .5:
        buy_factor = 4.26
    elif dist_ath >= .5 and dist_ath < 1:
        buy_factor = 2
    else:
        buy_factor = 0
    print(f"Buy Factor: {buy_factor}")
    return buy_factor

def _buyCrypto(pub_key, priv_key):
    buy_factor = _setBuyFactor(distance_from_ath)
    if buy_factor > 0:
        trader = gemini.PrivateClient(pub_key, priv_key)
        symbol_spot_price = float(trader.get_ticker(symbol)['ask'])
        factor = 0.999  # slight discount for quick fill on limit order
        execution_price = str(round(symbol_spot_price * factor, quote_currency_price_increment))
        amount = round((buy_amount * buy_factor * 0.998) / float(execution_price), tick_size)
        buy = trader.new_order(symbol, str(amount), execution_price, "buy", ["maker-or-cancel"])
        print(f'Maker Buy: {buy}')
    else:
        print("No buy because buy factor was 0.")

def lambda_handler(event, context):
    _buyCrypto(GEMINI_PUBLIC_KEY, GEMINI_PRIVATE_KEY)
    return {'statusCode': 200, 'body': json.dumps('End of script')}
```

### Key Implementation Notes
- **Exchange**: Gemini (via `gemini` Python library)
- **Data source**: Glassnode API `price_drawdown_relative` metric
- **Order type**: Limit buy with "maker-or-cancel" option
- **Price factor**: 0.999x ask price (0.1% below ask for quick fill)
- **Amount factor**: 0.998x (0.2% reduction, likely to account for fees)
- **Execution formula**: `amount = (buy_amount * buy_factor * 0.998) / execution_price`
- **Deployment**: AWS Lambda function (lambda_handler)
- **No technical indicators**: This gist has no moving averages, no green/red lines, no standard deviation bands -- it is purely distance-from-ATH based position sizing

---

## 6. Mean Reversion Indicator (from 90.7% Win Rate Recap)

A separate indicator within the **IADSS** (InvestAnswers Decision Support System).

### Core Premise
> "All assets mean revert, so avoid buying after a significant daily gain."
> "The premise of this strategy is that assets will revert to their respective average price over time."

### Signal Logic -- Dots System
| Signal | Meaning | Action |
|--------|---------|--------|
| **Green Dot below** the mean reversion line | Price trend turning up | **BUY** signal |
| **Red Dot above** the mean reversion line | Price trend turning down | **SELL** signal |

### Win Rate
- Claimed **90.7% win rate** across tested assets

### Parameter Settings (Default Configuration)
| Parameter | Default/Description |
|-----------|-------------------|
| Noise Suppression | Adjustable (~30 default), filters false signals |
| Entry Type | 30% (double-tap methodology) |
| Exit Type | LIFO (Last In, First Out) at 30% increments |
| Trading Style | Conservative (stocks like Walmart) to Very Aggressive (crypto, Tesla) |
| Standard Deviations | Adjustable to suppress noise and identify extreme price movements |

### Entry Methodology (Double-Tap / Layered Entry)
1. First buy: **30%** of intended position size
2. Second buy: Another **30%** (totaling 60% of intended position)
3. Remaining 40% is held in reserve

### Exit Methodology (LIFO at 30% increments)
1. Sell the **most recently purchased** shares first (Last In, First Out)
2. Each sell is **30%** of holdings
3. Gradual exit rather than all-at-once

### Assets Tested
Tesla, Bitcoin, Meta, Coinbase, CLSK (CleanSpark), Google, Solana, Cardano (ADA)

---

## 7. IADSS (InvestAnswers Decision Support System) -- Full Suite

The Mean Reversion indicator is one component of a broader system:

| Component | Purpose |
|-----------|---------|
| **DCAS Model** | Optimized DCA entry timing and position sizing |
| **DCA Calculator** | Backtest DCA vs DCAS performance |
| **Trend Indicator** | Trend direction/strength |
| **Optimized Trend** | Enhanced trend following |
| **Mean Reversion** | Overbought/oversold signals (90.7% win rate) |
| **Confluence Model** | Combines multiple signals for highest-probability trades |

### Confluence Principle
> "When you can align high levels of WIN% probability in the Trend, Reversion, and Confluence indicators... you are going to win in that trade in almost every situation."

---

## 8. Backtesting Results (from Substack Recaps)

### DCAS vs DCA Performance
- Tested across **35 different assets** (crypto, stocks, commodities, indices) over 3 years
- DCAS outperformed standard DCA in **all incidents tested**

### Specific Results
| Asset / Period | DCAS ROI | DCA ROI |
|---------------|----------|---------|
| Bitcoin (Nov 2021 - Mar 2023) | 16.7% - 33.5% | 7.3% - 11% |
| Solana (bear market) | +1.4% to +1.9% | -27.8% to -28% |

### Key Finding
> "The more volatile the asset, the better the tool performs. It works in all 3 market scenarios: Bear, Bull and Neutral."

### Break-Even Note
> "Deploy at least $1,113 into the market to offset the model license fees" (at $19/month subscription)

---

## 9. What Is NOT Publicly Disclosed (Proprietary)

The following details are proprietary to the TradingView indicator and are NOT available in any public source:

- Exact moving average type and period used for the mean in DCAS
- The precise formula that generates the green/red coloring
- The exact standard deviation multiplier values for mean reversion bands
- The internal calculation that produces the variable multiplier (0.5x - 3.0x+)
- The noise suppression algorithm
- The confluence model scoring methodology
- How the "Trading Style" setting (Conservative/Neutral/Aggressive) modifies internal parameters
- How "Bull Market Behavior" modifies the multiplier curve

The GitHub gist (rhettre) represents a community-built approximation using distance-from-ATH as a proxy, not the official indicator logic.

---

## 10. Summary of Mathematical Formulas (Known)

### From GitHub Gist (Community Implementation)
```
distance_from_ath = abs(glassnode_price_drawdown_relative) # as decimal 0.0 to 1.0

buy_factor = lookup_table(distance_from_ath)  # see multiplier table in section 3

execution_price = spot_ask_price * 0.999  # 0.1% below ask

buy_amount_usd = base_amount * buy_factor

order_quantity = (buy_amount_usd * 0.998) / execution_price
```

### From Official System (Conceptual, Exact Parameters Unknown)
```
baseline = 0  (the zero line)
signal_color = f(price_history, volatility, distance_from_ATH)  # green or red
multiplier = f(depth_below_baseline, trading_style, bull_market_behavior)  # 0.5x to 3.0x+

if signal_color == GREEN:
    if position > baseline:
        action = "nibble" (reduced multiplier)
    else:
        action = "amplify" (increased multiplier, deeper = more)
elif signal_color == RED:
    action = "no buy"

purchase_amount = base_buy_amount * multiplier
```

### Mean Reversion (Conceptual)
```
mean = moving_average(price, period)  # period unknown
upper_band = mean + (N * standard_deviation)  # N unknown
lower_band = mean - (N * standard_deviation)  # N unknown

if price crosses below lower_band AND trend turning up:
    signal = GREEN DOT (buy)
if price crosses above upper_band AND trend turning down:
    signal = RED DOT (sell)

entry_size = 30% of intended position (buy twice = 60% total)
exit_size = 30% of holdings (LIFO order)
```
