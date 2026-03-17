#!/bin/bash
# Ralph Wiggum Loop - Stop Hook for Claude Code
# Implements the autonomous iteration loop technique by Geoffrey Huntley
# This hook intercepts Claude's exit and re-feeds the prompt for another iteration
#
# Usage: Configure in settings.json as a Stop hook
# The RALPH_PROMPT.md file in the project root defines the task
# Set RALPH_MAX_ITERATIONS and RALPH_COMPLETION_PROMISE in the prompt

set -euo pipefail

# Read stdin (Claude Code passes context via stdin)
input=$(cat)

# Configuration
RALPH_DIR="${RALPH_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
RALPH_STATE_FILE="$RALPH_DIR/.ralph-state"
RALPH_PROMPT_FILE="$RALPH_DIR/RALPH_PROMPT.md"
RALPH_LOG_FILE="$RALPH_DIR/.ralph-log"

# Check if Ralph mode is active
if [[ ! -f "$RALPH_PROMPT_FILE" ]]; then
    # No Ralph prompt file = Ralph mode is not active, let Claude exit normally
    exit 0
fi

# Read configuration from state file or initialize
if [[ -f "$RALPH_STATE_FILE" ]]; then
    source "$RALPH_STATE_FILE"
else
    RALPH_ITERATION=0
    RALPH_MAX_ITERATIONS=10
    RALPH_COMPLETION_PROMISE="RALPH_COMPLETE"
    RALPH_STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
fi

# Check if max iterations reached
if [[ "$RALPH_ITERATION" -ge "$RALPH_MAX_ITERATIONS" ]]; then
    echo "Ralph loop complete: reached max iterations ($RALPH_MAX_ITERATIONS)" >> "$RALPH_LOG_FILE"
    echo "[RALPH] Max iterations ($RALPH_MAX_ITERATIONS) reached. Loop complete." >&2
    # Clean up state
    rm -f "$RALPH_STATE_FILE"
    exit 0
fi

# Check if the last output contained the completion promise
LAST_OUTPUT=$(echo "$input" | jq -r '.transcript // empty' 2>/dev/null || echo "")
if echo "$LAST_OUTPUT" | grep -q "${RALPH_COMPLETION_PROMISE:-RALPH_COMPLETE}"; then
    echo "Ralph loop complete: completion promise found at iteration $RALPH_ITERATION" >> "$RALPH_LOG_FILE"
    echo "[RALPH] Completion promise detected. Research complete after $RALPH_ITERATION iterations." >&2
    rm -f "$RALPH_STATE_FILE"
    exit 0
fi

# Increment iteration
RALPH_ITERATION=$((RALPH_ITERATION + 1))

# Save state
cat > "$RALPH_STATE_FILE" << STATEEOF
RALPH_ITERATION=$RALPH_ITERATION
RALPH_MAX_ITERATIONS=${RALPH_MAX_ITERATIONS:-10}
RALPH_COMPLETION_PROMISE="${RALPH_COMPLETION_PROMISE:-RALPH_COMPLETE}"
RALPH_STARTED_AT="${RALPH_STARTED_AT:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}"
STATEEOF

# Log iteration
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Iteration $RALPH_ITERATION/$RALPH_MAX_ITERATIONS starting" >> "$RALPH_LOG_FILE"

# Signal that Claude should not exit — re-feed the prompt
echo "[RALPH] Iteration $RALPH_ITERATION/$RALPH_MAX_ITERATIONS — continuing research. Do NOT stop until you output '$RALPH_COMPLETION_PROMISE' or reach max iterations." >&2
echo "" >&2
echo "Continue your task from RALPH_PROMPT.md. This is iteration $RALPH_ITERATION of $RALPH_MAX_ITERATIONS." >&2
echo "Review what you've done so far (check git log, read files you've written), then go DEEPER." >&2
echo "Find things you MISSED in previous iterations. Search NEW queries. Update your findings." >&2
echo "When you have EXHAUSTIVELY completed the research, output: $RALPH_COMPLETION_PROMISE" >&2

# Exit code 2 = block Claude from exiting, re-feed
exit 2
