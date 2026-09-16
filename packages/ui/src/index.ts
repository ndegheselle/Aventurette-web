// @chapelure/ui — Vue 3 design system built on Tailwind + daisyUI.
//
// Components are deep-imported so bundlers can drop what an app does not use:
//   import Modal from '@chapelure/ui/modals/Modal.vue';
//
// This barrel carries the non-component surface: composables, directives and their types.

export { Alert, EnumAlertType, useAlert } from './alerts/useAlert';

export { useConfirmation } from './modals/useConfirmation';
export { useEditModal } from './modals/useEditModal';
export { useModal } from './modals/useModal';
export type { IEditModal, IModalController, IModalOptions } from './modals/useModal';

export { useValidationErrors } from './forms/useValidationErrors';

export { vClickOutside } from './dropdown/clickOutside';
export type { ClickOutsideElement } from './dropdown/clickOutside';

export { useMultipleFiles, useOneFile } from './files/useFiles';

export { EnumTheme, SETTINGS_STORAGE_KEYS, useSettings } from './settings/useSettings';
