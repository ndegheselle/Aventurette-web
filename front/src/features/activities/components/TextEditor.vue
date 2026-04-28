<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  RedoIcon,
  StrikethroughIcon,
  UndoIcon,
} from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

// ⬇️ rename prop
const props = withDefaults(defineProps<{ modelValue?: string }>(), {
  modelValue: '',
})

// ⬇️ rename emit
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = shallowRef<Editor | undefined>(undefined)

// ⬇️ watch modelValue instead of content
watch(
  () => props.modelValue,
  (value) => {
    if (editor.value?.getHTML() === value) return
    editor.value?.commands.setContent(value)
  },
)

onMounted(() => {
  editor.value = new Editor({
    extensions: [StarterKit],
    content: props.modelValue,
    onUpdate: () => {
      emit('update:modelValue', editor.value!.getHTML())
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="border border-base-300 rounded-box overflow-hidden flex flex-col h-full">
    <div v-if="editor" class="flex flex-wrap gap-1 p-1 border-b border-base-300">
      <div class="join">
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <BoldIcon />
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <ItalicIcon />
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <StrikethroughIcon />
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('code') }"
          @click="editor.chain().focus().toggleCode().run()"
        >
          <CodeIcon />
        </button>
      </div>

      <div class="join">
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <Heading1Icon />
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <Heading2Icon />
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('heading', { level: 3 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <Heading3Icon />
        </button>
      </div>

      <div class="join">
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <ListIcon />
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <ListOrderedIcon />
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{ 'btn-active': editor.isActive('blockquote') }"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <QuoteIcon />
        </button>
      </div>

      <div class="join">
        <button
          class="btn btn-sm join-item"
          :disabled="!editor.can().undo()"
          @click="editor.chain().focus().undo().run()"
        >
          <UndoIcon />
        </button>
        <button
          class="btn btn-sm join-item"
          :disabled="!editor.can().redo()"
          @click="editor.chain().focus().redo().run()"
        >
          <RedoIcon />
        </button>
      </div>
    </div>
    <editor-content :editor="editor" class="prose prose-p:my-1 max-w-none bg-base-100 p-3 h-full" />
  </div>
</template>

<style scoped>
:deep(.ProseMirror) {
  flex: 1;
  height: 100%;
}

:deep(.ProseMirror:focus) {
  outline: none;
}
</style>
