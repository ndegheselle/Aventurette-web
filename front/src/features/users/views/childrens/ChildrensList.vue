<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';
import { type ChildrenData } from '@features/users/data/childrens';
import ChildrensEditModal from '@features/users/views/childrens/ChildrensEditModal.vue';
import { useTemplateRef } from 'vue';
import { useAuth } from '@features/users/composables/auth';
import { useAlert } from '@common/composables/popups/alert';

const modal = useTemplateRef('modal');
const auth = useAuth();
const alert = useAlert();

let counter = 1;
function test()
{
    counter ++;
    alert.success("afafarf afafaf " + counter);
}

</script>

<template>
    <div class="container mx-auto flex flex-col my-2">
        <div class="bg-base-200 rounded-box">
            <svg viewBox="0 0 100 100" width="80px">
                <circle cx="50" cy="50" r="30" />
                <rect width="100" height="50" x="0" y="50" ry="20" />
            </svg>
        </div>

        <button @click="test">
            test
        </button>

        <button class="btn btn-primary mt-1"  @click="() => modal?.show({ user: auth.currentId() } as ChildrenData)">
            <PlusIcon />
            {{ $t("actions.add") }}
        </button>

        <ChildrensEditModal ref="modal" />
    </div>
</template>