<script setup lang="ts">
import { activities, type ActivityData } from '@features/activities/data/activities';
import { ref } from 'vue';
import Group from '@chapelure/common/components/layout/Group.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import { CalendarIcon, ClockIcon, FileTextIcon, HeartIcon, ListOrderedIcon, PackageOpenIcon, PlayIcon, ScrollTextIcon, UserRoundIcon } from 'lucide-vue-next';
import List from '@chapelure/common/components/data/List.vue';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activity = ref<ActivityData | null>();

watch(
    () => route.params.id,
    async (id) => {
        console.log(id);
        if (typeof id != 'string')
            return;
        activity.value = await activities.getById(id);
    },
    { immediate: true }
);
</script>
<template>
    <div class="flex gap-2 justify-end">
        <button></button>
    </div>
    <Container>
        <Group class="sticky">
            <div class="flex gap-2">
                <div><img class="size-32 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" /></div>
                <div class="flex flex-1 gap-1 flex-col">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl">Nom</h2>
                        <div class="flex gap-1">
                            <button class="btn btn-circle">
                                <HeartIcon />
                            </button>
                            <button class="btn btn-circle">
                                <CalendarIcon />
                            </button>
                            <button class="btn btn-primary btn-circle">
                                <PlayIcon />
                            </button>
                        </div>
                    </div>
                    <p>Description courte</p>
                    <div>
                        <span class="badge badge-lg">
                            <UserRoundIcon /> 12-15 ans
                        </span>
                        <span class="badge badge-lg">
                            <ClockIcon /> 45 min
                        </span>
                    </div>
                    <div class="flex gap-1">
                        <span class="badge badge-soft">Compétence 1</span>
                        <span class="badge badge-soft">Compétence 1</span>
                        <span class="badge badge-soft">Compétence 1</span>
                        <span class="badge badge-soft">Compétence 1</span>
                        <span class="badge badge-soft">Compétence 1</span>
                    </div>
                </div>
            </div>
        </Group>
        <Group>
            <h2 class="text-2xl flex items-center gap-2">
                <PackageOpenIcon /> {{ $t('activities.materials') }}
            </h2>
            <div class="flex gap-2">
                <div class="text-center">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>Ciseaux</span>
                </div>
                <div class="text-center">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>Ciseaux</span>
                </div>
                <div class="text-center">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>Ciseaux</span>
                </div>
            </div>
        </Group>
        <Group>
            <h2 class="text-2xl flex items-center gap-2">
                <FileTextIcon /> {{ $t('activities.resources') }}
            </h2>
            <div class="flex gap-2">
                <div class="text-center">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>PDF 1</span>
                </div>
                <div class="text-center">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>Image 2</span>
                </div>
                <div class="text-center">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>Image 3</span>
                </div>
            </div>
        </Group>
        <Group>
            <h2 class="text-2xl flex items-center gap-2">
                <ScrollTextIcon /> {{ $t('activities.description') }}
            </h2>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla auctor ullamcorper faucibus. Etiam nec
                dolor
                quis mauris ornare scelerisque. Nullam sit amet sem tortor. Phasellus placerat, eros eu luctus
                venenatis,
                dui nisl rutrum dui, et placerat ligula diam ut odio. Quisque nec odio et orci placerat vulputate nec at
                justo. Nullam hendrerit venenatis sapien, non eleifend urna sagittis ut. Aliquam vitae accumsan odio.
                Vestibulum in sem semper, finibus augue vitae, luctus nibh. Sed venenatis eleifend ultricies.

                Quisque vestibulum orci commodo sapien aliquam, nec hendrerit ante iaculis. Donec condimentum mauris sit
                amet elit laoreet maximus. Integer a orci scelerisque, pretium libero ac, fringilla mi. Maecenas sed
                ante
                volutpat lorem eleifend sagittis. Donec non aliquet diam. Duis nulla augue, mattis quis auctor sed,
                convallis ac libero. Donec posuere at odio ut dictum. Vestibulum sed odio nec sapien scelerisque
                bibendum.
                Nam consequat mi in augue cursus, ut venenatis mi tristique. Maecenas a orci eget ipsum fringilla
                viverra
                vitae a tortor. Maecenas eget ornare ligula, vitae sagittis dui. Sed sodales dui non nunc lacinia
                porttitor.
                Cras vel lectus quis mi lacinia sollicitudin sed eu velit. Sed eget arcu vitae dolor elementum vulputate
                id
                sit amet sem. Quisque imperdiet ac tortor sed volutpat. Aliquam erat volutpat.
            </p>
        </Group>
        <Group>
            <h2 class="text-2xl flex items-center gap-2">
                <ListOrderedIcon /> {{ $t('activities.steps') }}
            </h2>
            <List :items="activity?.expand.steps">
                <div class="text-4xl font-thin opacity-30 tabular-nums">01</div>
                <div>
                    <h3>Étape 1</h3>
                    <p class="text-xs">
                        "Remaining Reason" became an instant hit, praised for its haunting sound and emotional depth. A
                        viral performance brought it widespread recognition, making it one of Dio Lupa’s most iconic
                        tracks.
                    </p>
                </div>
            </List>
        </Group>
    </Container>
</template>