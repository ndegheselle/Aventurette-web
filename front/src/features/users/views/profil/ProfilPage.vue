<script setup lang="ts">
import Container from '@common/components/layout/Container.vue';
import ChildrensList from '@features/users/views/childrens/ChildrensList.vue';
import UserProfil from '@features/users/views/profil/UserProfil.vue';

</script>

<template>
    <Container>
        <UserProfil />
        <ChildrensList />
    </Container>
</template>