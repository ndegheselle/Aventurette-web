<script setup lang="ts">
import { EnumAlertType, useAlert } from '@common/composables/popups/alert.ts';
import { CircleAlertIcon, CircleCheckIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { computed } from 'vue';
const { alerts, close } = useAlert();
const reversedAlerts = computed(() => [...alerts.value].reverse());
</script>

<template>
    <div class="toast toast-top toast-center">
        <div class="stack stack-top">
        <div role="alert" class="alert" v-for="alert in reversedAlerts" :key="alert.id" :class="{
            'alert-info': alert.type === EnumAlertType.Info,
            'alert-warning': alert.type === EnumAlertType.Warning,
            'alert-error': alert.type === EnumAlertType.Error,
            'alert-success': alert.type === EnumAlertType.Success
        }">
            <TriangleAlertIcon v-if="alert.type === EnumAlertType.Info" />
            <CircleAlertIcon v-else-if="alert.type === EnumAlertType.Warning || alert.type === EnumAlertType.Error" />
            <CircleCheckIcon v-else-if="alert.type === EnumAlertType.Success" />

            <span>{{ alert.message }}</span>
            <button @click="close(alert.id)" class="btn btn-sm btn-ghost btn-circle" aria-label="close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        </div>

    </div>
</template>