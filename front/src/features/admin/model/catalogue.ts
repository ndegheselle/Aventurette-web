import type { AttributeData, GroupData } from "@features/activities/model/attribute";

/**
 * The catalogue as the administration screen lists it: every group, everything defined under
 * it, and the vocabulary under that.
 *
 * The shape itself belongs to `activities` — this feature reads the catalogue, it does not
 * redefine it.
 */

/** A group and what is defined under it. */
export interface CatalogueGroup {
    /** Null for the attributes whose group is missing: see `catalogueOf`. */
    group: GroupData | null;
    attributes: AttributeData[];
}

/**
 * Group the attributes under the groups that define them, in the order the groups arrive.
 *
 * Two rules, both because this screen exists to show what is there rather than what reads well:
 * a group with no attributes is still listed, and an attribute whose group is missing is
 * gathered at the end rather than dropped — a catalogue that silently hides a row is worse than
 * one that looks untidy.
 */
export function catalogueOf(groups: GroupData[], attributes: AttributeData[]): CatalogueGroup[] {
    const known = new Set(groups.map(group => group.id));

    const listed: CatalogueGroup[] = groups.map(group => ({
        group,
        attributes: attributes.filter(attribute => attribute.group === group.id),
    }));

    const orphans = attributes.filter(attribute => !known.has(attribute.group));

    return orphans.length ? [...listed, { group: null, attributes: orphans }] : listed;
}

/** How many options the whole catalogue holds — the one total worth a line of its own. */
export function optionCount(attributes: AttributeData[]): number {
    return attributes.reduce((total, attribute) => total + attribute.options.length, 0);
}
