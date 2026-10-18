---
name: indicator-report
description: Generate a full indicator effectiveness report for a specific market or asset
allowed-tools: Read, Grep, Glob, WebSearch, Bash
---

Generate a comprehensive indicator effectiveness report for: $ARGUMENTS

## Report Structure

1. **Market Profile**: Characterize the asset's behavior (trending vs ranging, volatility, liquidity)
2. **Indicator Rankings**: Rank all major indicators by effectiveness for this specific market
3. **Parameter Recommendations**: Exact parameters tuned for this market
4. **Strategy Fit**: Which known systems (Trading Alpha, Invest Answers, Wicks) work best here
5. **Timeframe Analysis**: Which timeframes produce the most reliable signals
6. **PineScript Availability**: Note which indicators are available in the project's PineScript collection

Reference the indicator knowledge base at `.claude/knowledge/indicator-guide.md` and PineScript files in `pinescript/indicators/`.
