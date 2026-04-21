<script setup lang="ts">
import LoginForm from '@chapelure/auth/components/LoginForm.vue';
import { routesNames } from '@features/users/routes';
</script>

<template>
    <div class="flex flex-1 my-2">
        <LoginForm :register-route="routesNames.register" />
    </div>
</template>