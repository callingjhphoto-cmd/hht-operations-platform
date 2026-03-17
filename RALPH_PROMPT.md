# RALPH PROMPT: Exhaustive Trading Indicator Research

## Mission
You are in Ralph Wiggum autonomous loop mode. Your mission is to EXHAUSTIVELY research and improve the trading indicator collection in this repository. Each iteration, you must go DEEPER than the last.

## Completion Promise
When you have truly exhausted all research avenues, output: `RALPH_COMPLETE`
Do NOT output this until you are confident there is nothing left to find.

## Max Iterations: 10

## What To Do Each Iteration

### Iteration Checklist
1. **Read what exists** — Check `pinescript/indicators/` and `.claude/knowledge/indicator-guide.md`
2. **Review git log** — See what was added in previous iterations
3. **Search for NEW things** — Use web search with queries you haven't tried before
4. **Improve existing indicators** — Fix inaccuracies, add missing features
5. **Add new indicators** — If you find something valuable, implement it in PineScript v5
6. **Update the knowledge base** — Add new findings to the indicator guide

### Research Targets (Go Deeper Each Iteration)

**Iteration 1-2: Trading Alpha Deep Dive**
- Search Trading Alpha's GitBook documentation exhaustively
- Find every YouTube tutorial about their indicators
- Search Reddit r/TradingView, r/algotrading for user experiences
- Find any TradingView scripts that clone their approach
- Compare our implementations and fix inaccuracies

**Iteration 3-4: Invest Answers Deep Dive**
- Find every video where James Mullarney shows his screen/indicators
- Research DCAS mathematical model in detail
- Find his exact ATR parameters and usage
- Search for community recreations of his tools
- Research what's on investanswers.io (his platform tools)

**Iteration 5-6: Wicks Trading + ICT Deep Dive**
- Research ICT (Inner Circle Trader) methodology completely
- Fair Value Gaps, Order Blocks, Breaker Blocks, Liquidity concepts
- Find the best TradingView ICT scripts (Smart Money Concepts by LuxAlgo, etc.)
- Statistical research on wick/pin bar effectiveness
- Implement missing ICT concepts in PineScript

**Iteration 7-8: Open Source Indicator Discovery**
- Search GitHub for the most starred trading indicator repos
- Find novel indicators not in our collection
- Research academic papers on indicator effectiveness
- Look for machine learning-based indicators
- Evaluate and implement the best finds

**Iteration 9-10: Optimization & Gap Filling**
- Review EVERYTHING found so far
- Fill any remaining gaps
- Optimize PineScript code for performance
- Ensure all market-specific parameters are documented
- Final update to knowledge base
- Run accuracy assessment on all indicators

### Search Query Bank (Use Different Ones Each Iteration)
- "Trading Alpha VIP indicator" exact behavior
- "Trading Alpha HTF Suite" parameters settings
- "Alpha RSI" vs standard RSI differences
- "Alpha Thrust" indicator calculation
- "Invest Answers" DCAS formula
- "James Mullarney" ATR trading method
- "ICT Smart Money Concepts" indicator TradingView
- "Fair Value Gap" PineScript implementation
- "Order Block" detection algorithm
- "Liquidity sweep" indicator
- "TTM Squeeze" optimal parameters by market
- "best indicator for crude oil" 2025 2026
- "most accurate RSI settings" for crypto
- "Bollinger Band squeeze" vs "Keltner squeeze" comparison
- "volume profile" indicator PineScript
- "VWAP anchored" indicator logic
- "market structure break" indicator
- "Wyckoff accumulation" indicator
- "on-chain indicator" Bitcoin PineScript
- "funding rate" indicator crypto
- pandas-ta indicators list effectiveness
- "supertrend" optimal settings by market
- "Heikin Ashi" smoothed indicator
- "Ehlers" John Ehlers digital signal processing indicators
- "Larry Williams" %R indicator optimization

### Output Requirements
Each iteration, write your findings to:
- New PineScript files in `pinescript/indicators/`
- Updates to `.claude/knowledge/indicator-guide.md`
- New agent knowledge in `.claude/agents/*/AGENT.md` if relevant
- Commit your changes with a descriptive message

### Quality Standards
- Every PineScript indicator must compile in TradingView Pine v5
- Every indicator must have proper alerts configured
- Every indicator must document which markets it works best for
- No duplicate functionality — each indicator must add unique value
