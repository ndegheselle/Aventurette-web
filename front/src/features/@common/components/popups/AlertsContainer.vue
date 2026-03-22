<script setup lang="ts">
import { EnumAlertType, useAlert } from '@common/composables/popups/alert.ts';
import { BrushCleaningIcon, CircleAlertIcon, CircleCheckIcon, TriangleAlertIcon, XIcon } from 'lucide-vue-next';
const { alerts, close } = useAlert();
</script>

<template>
    <div class="toast">
        <div role="alert border" class="alert" v-for="alert in alerts" :key="alert.id" :class="{
            'alert-warning alert-dash': alert.type === EnumAlertType.Debug,
            'alert-warning': alert.type === EnumAlertType.Warning,
            'alert-error': alert.type === EnumAlertType.Error,
            'alert-success': alert.type === EnumAlertType.Success
        }">
            <CircleAlertIcon v-if="alert.type === EnumAlertType.Info" />
            <TriangleAlertIcon v-else-if="alert.type === EnumAlertType.Warning || alert.type === EnumAlertType.Error" />
            <CircleCheckIcon v-else-if="alert.type === EnumAlertType.Success" />
            <BrushCleaningIcon v-else-if="alert.type === EnumAlertType.Debug" />

            <span>{{ alert.message }}</span>
            <button @click="close(alert.id)" class="btn btn-sm btn-ghost btn-circle" aria-label="close">
                <XIcon class="icon-sm" />
            </button>
        </div>
    </div>
</template>