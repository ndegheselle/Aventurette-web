import { ref } from 'vue';

const dialog = ref<HTMLDialogElement | null>(null);

const title = ref('');
const message = ref('');
const icon = ref('');
let resolver: ((value: boolean) => void) | null = null;

export function useConfirmation() {

  function registerDialog(el: HTMLDialogElement) {
    dialog.value = el;
  }

  function show(t: string, m: string, i?: string): Promise<boolean> {
    title.value = t;
    message.value = m;
    icon.value = i || '';

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