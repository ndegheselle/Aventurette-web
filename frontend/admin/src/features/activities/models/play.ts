// ── Where the run is ────────────────────────────────────────────────────────────────────────

/**
 * The step a run is at, from the route's 1-based `step` param. A missing or unreadable param is
 * the first step, and one past either end is the nearest end.
 */
export function playStepIndexOf(param: unknown, stepCount: number): number {
    const position = Number(param);
    if (!Number.isInteger(position)) return 0;

    return Math.min(Math.max(position - 1, 0), Math.max(stepCount - 1, 0));
}
