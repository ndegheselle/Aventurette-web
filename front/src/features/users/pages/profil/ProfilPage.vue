<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import ChildrenList from '@features/users/pages/children/ChildrenList.vue';
import UserProfil from '@features/users/pages/profil/UserProfil.vue';

</script>

<template>
    <Container>
        <UserProfil />
        <ChildrenList />
    </Container>
</template>