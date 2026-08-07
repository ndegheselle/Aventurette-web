/**
 * The single icon-set import in the whole workspace.
 *
 * Everything — including this package's own components — imports icons from here, so swapping
 * icon libraries is a change to this file plus a name mapping, not a sweep across ~27 files.
 * Re-exporting rather than wrapping in a generic <Icon name> keeps tree-shaking and typing intact.
 */
export * from 'lucide-vue-next';
