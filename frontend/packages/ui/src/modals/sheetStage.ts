/** Where an expandable sheet rests: on part of the screen, or all of it. */
export type SheetStage = 'partial' | 'full';

/** Where a sheet goes once pulled `way`: another stage, or closed. `null` when the pull does nothing. */
export function stageAfterPull(stage: SheetStage, way: 'up' | 'down'): SheetStage | 'closed' | null {
    if (way === 'up') return stage === 'partial' ? 'full' : null;
    return stage === 'full' ? 'partial' : 'closed';
}
