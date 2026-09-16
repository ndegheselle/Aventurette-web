// @chapelure/ui — Vue 3 on Tailwind + daisyUI. Composables, directives and their types.
// Components are deep-imported: import Modal from '@chapelure/ui/modals/Modal.vue';

export { Alert, EnumAlertType, useAlert } from './alerts/useAlert';

export { useConfirmation } from './modals/useConfirmation';
export { useEditModal } from './modals/useEditModal';
export { useModal } from './modals/useModal';
export type { IEditModal, IModalController, IModalOptions } from './modals/useModal';

export { useFilters } from './filter/useFilters';
export type { Filters } from './filter/useFilters';
export {
    clearedCriteria,
    cloneCriteria,
    criterionFilters,
    describeCriterion,
    formatRange,
    isCriterionSet,
    optionsCriterion,
    rangeCriterion,
    tagsCriterion,
    withChoices,
    withoutCriterion,
} from './filter/criteria';
export type {
    ChoiceCriterion,
    Criterion,
    CriterionChoice,
    CriterionType,
    RangeCriterion,
    RangeValue,
    Translate,
} from './filter/criteria';

export { useValidationErrors } from './forms/useValidationErrors';

export { vClickOutside } from './dropdown/clickOutside';
export type { ClickOutsideElement } from './dropdown/clickOutside';

export { useMultipleFiles, useOneFile } from './files/useFiles';

export { EnumTheme, SETTINGS_STORAGE_KEYS, useSettings } from './settings/useSettings';
