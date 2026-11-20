<!--
    The confetti ball from Noto's animated emoji (Google, CC BY 4.0), played in a loop.
    https://googlefonts.github.io/noto-emoji-animation/
-->
<script setup lang="ts">
import type { AnimationItem } from 'lottie-web';
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';

const container = useTemplateRef<HTMLElement>('container');
let animation: AnimationItem | null = null;

onMounted(async () => {
    // Fetched on demand: the player and the animation are only ever needed on this screen.
    const [{ default: lottie }, { default: animationData }] = await Promise.all([
        import('lottie-web/build/player/lottie_light'),
        import('@features/activities/ui/activity/_parts/confetti.lottie.json'),
    ]);
    // Left before they arrived: there is nothing to play into.
    if (!container.value) return;

    animation = lottie.loadAnimation({
        container: container.value,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData,
    });
});

onBeforeUnmount(() => animation?.destroy());
</script>

<template>
    <div ref="container" role="img" aria-label="🎊"></div>
</template>
