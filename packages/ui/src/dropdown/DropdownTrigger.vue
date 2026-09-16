<!--
  Button-styled trigger for <Dropdown>. Keep it a <summary>: the dropdown is a native
  <details> disclosure, so a <button> would break it.
-->
<template>
    <summary class="btn btn-ghost btn-square">
        <slot />
    </summary>
</template>
