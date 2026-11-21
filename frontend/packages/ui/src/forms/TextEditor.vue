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
import { Button } from '@chapelure/ui/shadcn/button';
import { Separator } from '@chapelure/ui/shadcn/separator';
import { Toggle } from '@chapelure/ui/shadcn/toggle';
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { onBeforeUnmount, onMounted, shallowRef, watch, type Component } from 'vue';

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

/** A toolbar button: lit while the selection has the mark, applying or lifting it when pressed. */
interface Tool {
    icon: Component;
    isActive: (editor: Editor) => boolean;
    run: (editor: Editor) => void;
}

const toolGroups: Tool[][] = [
    [
        { icon: BoldIcon, isActive: e => e.isActive('bold'), run: e => e.chain().focus().toggleBold().run() },
        { icon: ItalicIcon, isActive: e => e.isActive('italic'), run: e => e.chain().focus().toggleItalic().run() },
        { icon: StrikethroughIcon, isActive: e => e.isActive('strike'), run: e => e.chain().focus().toggleStrike().run() },
        { icon: CodeIcon, isActive: e => e.isActive('code'), run: e => e.chain().focus().toggleCode().run() },
    ],
    [
        { icon: Heading1Icon, isActive: e => e.isActive('heading', { level: 1 }), run: e => e.chain().focus().toggleHeading({ level: 1 }).run() },
        { icon: Heading2Icon, isActive: e => e.isActive('heading', { level: 2 }), run: e => e.chain().focus().toggleHeading({ level: 2 }).run() },
        { icon: Heading3Icon, isActive: e => e.isActive('heading', { level: 3 }), run: e => e.chain().focus().toggleHeading({ level: 3 }).run() },
    ],
    [
        { icon: ListIcon, isActive: e => e.isActive('bulletList'), run: e => e.chain().focus().toggleBulletList().run() },
        { icon: ListOrderedIcon, isActive: e => e.isActive('orderedList'), run: e => e.chain().focus().toggleOrderedList().run() },
        { icon: QuoteIcon, isActive: e => e.isActive('blockquote'), run: e => e.chain().focus().toggleBlockquote().run() },
    ],
];
</script>

<template>
    <div class="flex h-full flex-col overflow-hidden rounded-md border border-input shadow-xs">
        <div v-if="editor" class="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-1">
            <template v-for="(tools, index) in toolGroups" :key="index">
                <Separator v-if="index > 0" orientation="vertical" class="mx-0.5 data-[orientation=vertical]:h-5" />
                <Toggle v-for="(tool, toolIndex) in tools" :key="toolIndex"
                        size="sm"
                        :model-value="tool.isActive(editor)"
                        @update:model-value="tool.run(editor)">
                    <component :is="tool.icon" />
                </Toggle>
            </template>

            <div class="ms-auto flex gap-0.5">
                <Button variant="ghost" size="icon-sm" :disabled="!editor.can().undo()"
                    @click="editor.chain().focus().undo().run()">
                    <UndoIcon />
                </Button>
                <Button variant="ghost" size="icon-sm" :disabled="!editor.can().redo()"
                    @click="editor.chain().focus().redo().run()">
                    <RedoIcon />
                </Button>
            </div>
        </div>
        <!-- `prose` is @tailwindcss/typography. The app's stylesheet has to register the plugin
             or the editor renders unstyled. -->
        <editor-content :editor="editor" class="prose prose-p:my-1 dark:prose-invert max-w-none flex-1 bg-background px-2" />
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
