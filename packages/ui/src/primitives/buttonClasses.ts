import type { InjectionKey } from 'vue';

/**
 * Provided by <ButtonGroup> and injected by <Button>, so grouped buttons pick up daisyUI's
 * join-item themselves instead of every call site remembering a modifier.
 */
export const BUTTON_GROUP: InjectionKey<boolean> = Symbol('chapelure.buttonGroup');

export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'error';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'square' | 'circle';

export interface ButtonStyleOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    shape?: ButtonShape;
    active?: boolean;
    block?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
    default: '',
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    error: 'btn-error',
};

const SIZES: Record<ButtonSize, string> = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
};

const SHAPES: Record<ButtonShape, string> = {
    default: '',
    square: 'btn-square',
    circle: 'btn-circle',
};

/**
 * Shared by <Button> and <DropdownTrigger>, which must render different elements
 * (a <button>/router link vs a <summary>) but look identical.
 */
export function buttonClasses({
    variant = 'default',
    size = 'md',
    shape = 'default',
    active = false,
    block = false,
}: ButtonStyleOptions = {}): string[] {
    return [
        'btn',
        VARIANTS[variant],
        SIZES[size],
        SHAPES[shape],
        active ? 'btn-active' : '',
        block ? 'w-full' : '',
    ].filter(Boolean);
}
