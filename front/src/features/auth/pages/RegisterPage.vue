<script setup lang="ts">
import RegisterForm from '@features/auth/components/RegisterForm.vue';
import { routesNames } from '@features/auth/routes';
</script>

<template>
    <div class="flex flex-1 my-2">
        <RegisterForm :login-route="routesNames.login" />
    </div>
</template>