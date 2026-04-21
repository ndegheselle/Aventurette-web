<script setup lang="ts">
import Container from '@chapelure/common/components/layout/Container.vue';
import ChildrensList from '@features/users/pages/childrens/ChildrensList.vue';
import UserProfil from '@features/users/pages/profil/UserProfil.vue';

</script>

<template>
    <Container>
        <UserProfil />
        <ChildrensList />
    </Container>
</template>