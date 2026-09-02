<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import ChildrenList from '@features/users/components/children/ChildrenList.vue';
import UserProfil from '@features/users/components/UserProfil.vue';

</script>

<template>
    <Container>
        <UserProfil />
        <ChildrenList />
    </Container>
</template>