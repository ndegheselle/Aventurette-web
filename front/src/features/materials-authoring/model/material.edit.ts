/**
 * The catalogue seen from the screen that names its materials.
 */

/**
 * The name to write when a material's field is left: what was typed, trimmed — or nothing when
 * that is blank or the name it already has, so an untouched field costs no write.
 *
 * @param saved the name the catalogue holds
 * @param typed what the field holds now
 */
export function renamedTo(saved: string, typed: string): string | null {
    const name = typed.trim();
    return name && name !== saved ? name : null;
}
