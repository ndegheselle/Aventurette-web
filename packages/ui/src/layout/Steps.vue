<!--
  Horizontal progress indicator for a multi-step flow.

    <Steps>
      <Step :done="true"><FileTextIcon /> Description</Step>
      <Step><ListTreeIcon /> Steps</Step>
    </Steps>
-->
<template>
    <ul class="steps">
        <slot />
    </ul>
</template>
