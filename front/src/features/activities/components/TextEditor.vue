<script setup lang="ts">
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
} from 'lucide-vue-next';
import Button from '@chapelure/ui/primitives/Button.vue';
import ButtonGroup from '@chapelure/ui/primitives/ButtonGroup.vue';
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';

const model = defineModel<string>({ default: '' })

const editor = shallowRef<Editor | undefined>(undefined)

watch(model, (value) => {
    if (editor.value?.getHTML() === value) return
    editor.value?.commands.setContent(value ?? '')
})

onMounted(() => {
    editor.value = new Editor({
        extensions: [StarterKit],
        content: model.value,
        onUpdate: () => {
            model.value = editor.value!.getHTML()
        },
    })
})

onBeforeUnmount(() => {
    editor.value?.destroy()
})
</script>

<template>
    <div class="border border-base-300 rounded-box overflow-hidden flex flex-col h-full">
        <div v-if="editor" class="flex flex-wrap gap-1 p-0.5 border-b border-base-300">
            <ButtonGroup>
                <Button shape="square" :active="editor.isActive('bold')"
                    @click="editor.chain().focus().toggleBold().run()">
                    <BoldIcon />
                </Button>
                <Button shape="square" :active="editor.isActive('italic')"
                    @click="editor.chain().focus().toggleItalic().run()">
                    <ItalicIcon />
                </Button>
                <Button shape="square" :active="editor.isActive('strike')"
                    @click="editor.chain().focus().toggleStrike().run()">
                    <StrikethroughIcon />
                </Button>
                <Button shape="square" :active="editor.isActive('code')"
                    @click="editor.chain().focus().toggleCode().run()">
                    <CodeIcon />
                </Button>
            </ButtonGroup>

            <ButtonGroup>
                <Button shape="square" :active="editor.isActive('heading', { level: 1 })"
                    @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
                    <Heading1Icon />
                </Button>
                <Button shape="square" :active="editor.isActive('heading', { level: 2 })"
                    @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
                    <Heading2Icon />
                </Button>
                <Button shape="square" :active="editor.isActive('heading', { level: 3 })"
                    @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
                    <Heading3Icon />
                </Button>
            </ButtonGroup>

            <ButtonGroup>
                <Button shape="square" :active="editor.isActive('bulletList')"
                    @click="editor.chain().focus().toggleBulletList().run()">
                    <ListIcon />
                </Button>
                <Button shape="square" :active="editor.isActive('orderedList')"
                    @click="editor.chain().focus().toggleOrderedList().run()">
                    <ListOrderedIcon />
                </Button>
                <Button shape="square" :active="editor.isActive('blockquote')"
                    @click="editor.chain().focus().toggleBlockquote().run()">
                    <QuoteIcon />
                </Button>
            </ButtonGroup>

            <ButtonGroup class="ms-auto">
                <Button shape="square" :disabled="!editor.can().undo()"
                    @click="editor.chain().focus().undo().run()">
                    <UndoIcon />
                </Button>
                <Button shape="square" :disabled="!editor.can().redo()"
                    @click="editor.chain().focus().redo().run()">
                    <RedoIcon />
                </Button>
            </ButtonGroup>
        </div>
        <!-- `prose` comes from @tailwindcss/typography, not daisyUI: it styles the
             user-authored rich text rendered by tiptap. -->
        <editor-content :editor="editor" class="prose prose-p:my-1 max-w-none bg-base-100 px-2 flex-1" />
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
