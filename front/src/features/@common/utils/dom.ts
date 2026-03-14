
/**
 * Apply default behaviors and events on DOM.
 */
export function applyDefaultBehaviors() {
    // Handle details auto close
    document.addEventListener('click', (e: MouseEvent) => {
        const target = e.target;
        const details = [...document.querySelectorAll('details')];

        if (!(target instanceof Node)) {
            return;
        }

        if (!details.some(f => f.contains(target))) {
            details.forEach(f => f.removeAttribute('open'));
        } else {
            details.forEach(f => {
                if (!f.contains(target)) {
                    f.removeAttribute('open');
                }
            });
        }
    });
}