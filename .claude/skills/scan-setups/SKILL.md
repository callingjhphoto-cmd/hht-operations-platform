---
name: scan-setups
description: Scan for active indicator setups across markets using web research
allowed-tools: WebSearch, Read, Bash
---

Scan for active trading setups across markets: $ARGUMENTS

If no arguments provided, scan all major markets (crypto, WTI, forex majors, equities).

## Scan Process

1. Web search for current technical analysis on each asset
2. Identify which indicators are firing (squeeze, divergence, wick rejection, trend confirmation)
3. Cross-reference with the indicator knowledge base
4. Report setups ranked by confluence score (number of confirming indicators)

## Output Format

Report setups in a table:
| Asset | Direction | Confirming Indicators | Timeframe | Confluence | System Match |

System Match = which known system (Trading Alpha / Invest Answers / Wicks) aligns with this setup.
