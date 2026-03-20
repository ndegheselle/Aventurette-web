import { ref, shallowRef, type Component } from 'vue';

const dialog = ref<HTMLDialogElement | null>(null);

const title = ref('');
const message = ref('');
const icon = shallowRef<Component | null>(null);
let resolver: ((value: boolean) => void) | null = null;

export function useConfirmation() {

  function registerDialog(el: HTMLDialogElement) {
    dialog.value = el;
  }

  function show(t: string, m: string, i?: Component): Promise<boolean> {
    title.value = t;
    message.value = m;
    icon.value = i ?? null;

    return new Promise<boolean>((resolve) => {
      resolver = resolve;
      dialog.value?.showModal();      // <-- directly open the modal here
    });
  }

  function confirm() {
    resolver?.(true);
    cleanup();
  }

  function cancel() {
    resolver?.(false);
    cleanup();
  }

  function cleanup() {
    dialog.value?.close();
    resolver = null;
  }

  return {
    registerDialog,
    title,
    message,
    icon,
    show,
    confirm,
    cancel,
  };
}