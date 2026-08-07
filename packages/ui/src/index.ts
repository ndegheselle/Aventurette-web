// @chapelure/ui — Vue 3 design system built on Tailwind + daisyUI.
//
// Components are deep-imported so bundlers can drop what an app does not use:
//   import Modal from '@chapelure/ui/overlays/Modal.vue';
//   import { XIcon } from '@chapelure/ui/icons';
//
// This barrel carries the non-component surface: composables, directives and their types.

export { Alert, EnumAlertType, useAlert } from './composables/useAlert';
export { useConfirmation } from './composables/useConfirmation';
export { useEditableList } from './composables/useEditableList';
export type { IEditableListOptions } from './composables/useEditableList';
export { useEditModal } from './composables/useEditModal';
export { useModal } from './composables/useModal';
export type { IEditModal, IModalController, IModalOptions } from './composables/useModal';
export { useValidationErrors } from './composables/useValidationErrors';

export { useMultipleFiles, useOneFile } from './files/useFiles';

export { EnumTheme, SETTINGS_STORAGE_KEYS, useSettings } from './settings/useSettings';

export { vClickOutside } from './directives/clickOutside';
export type { ClickOutsideElement } from './directives/clickOutside';
