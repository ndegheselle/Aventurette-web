<script setup lang="ts">
import { MinusIcon, PlusIcon } from 'lucide-vue-next';

</script>

<template>
    <div class="container mx-auto flex flex-col my-2">
        <div class="bg-base-200 rounded-box">
            <svg viewBox="0 0 100 100" width="80px">
                <circle cx="50" cy="50" r="30" />
                <rect width="100" height="50" x="0" y="50" ry="20" />
            </svg>
        </div>
        <button class="btn btn-primary mx-auto">
            <PlusIcon />
            Ajouter
        </button>
        <ul class="list rounded-box border border-base-300 mt-2">
            <li class="list-row">
                <div><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64" />
                </div>
                <div>
                    <div>Dio Lupa</div>
                    <div class="text-xs uppercase font-semibold opacity-60">8 ans</div>
                </div>
                <button class="btn btn-square btn-ghost">
                    <MinusIcon />
                </button>
            </li>
        </ul>
    </div>
</template>