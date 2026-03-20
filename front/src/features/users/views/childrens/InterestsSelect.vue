<script setup lang="ts">

</script>

<template>
    <div class="w-full">
        <!-- Input -->
        <input type="text"
               placeholder="Add tag"
               class="input input-bordered w-full" />

        <!-- Selected tags -->
        <div class="flex flex-wrap gap-2 mb-2">
            <span class="badge badge-primary">
                Vue
                <button class="ml-1">✕</button>
            </span>
            <span class="badge badge-secondary">
                Tailwind
                <button class="ml-1">✕</button>
            </span>
        </div>
    </div>
</template>