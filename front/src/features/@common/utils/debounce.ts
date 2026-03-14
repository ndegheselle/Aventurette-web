export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay = 300
): (...args: Parameters<T>) => void {
    let timer: number | undefined;
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = window.setTimeout(() => {
            fn(...args)
        }, delay)
    }
};