/**
 * The minimum a record must expose for the generic data layer to work with it.
 *
 * Deliberately just an id: anything more (timestamps, collection metadata, soft-delete flags)
 * is backend-specific and belongs in the adapter or in the consuming app's generated types.
 * Richer app types satisfy this structurally, so no wrapping is needed.
 */
export type BaseEntity = {
    id: string;
};
