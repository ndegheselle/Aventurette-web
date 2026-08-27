<!--
  Button-styled trigger for <Dropdown>.

  It has to stay a real <summary>, because the dropdown is a native <details> disclosure —
  swapping in a <button> would break it. So the button look is written out in daisyUI classes
  here rather than borrowed from a shared helper.
-->
<template>
    <summary class="btn btn-ghost btn-square">
        <slot />
    </summary>
</template>
