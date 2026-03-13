<script setup lang="ts">
import { EnumAlertType, useAlert } from '@common/composables/popups/alert.ts';
const { alerts, close } = useAlert();
</script>

<template>
    <div class="toast toast-top toast-center">
        <div role="alert" class="alert m-2" v-for="alert in alerts" :key="alert.id" :class="{
            'alert-info': alert.type === EnumAlertType.Info,
            'alert-warning': alert.type === EnumAlertType.Warning,
            'alert-error': alert.type === EnumAlertType.Error,
            'alert-success': alert.type === EnumAlertType.Success
        }">
            <i :class="{
                'fa-solid fa-circle-info ': alert.type === EnumAlertType.Info,
                'fa-solid fa-circle-exclamation': alert.type === EnumAlertType.Warning || alert.type === EnumAlertType.Error,
                'fa-solid fa-circle-check': alert.type === EnumAlertType.Success
            }" />
            <span>{{ alert.message }}</span>
            <button @click="close(alert.id)" class="btn btn-sm btn-ghost btn-circle" aria-label="close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    </div>
</template>