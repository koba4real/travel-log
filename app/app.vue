<template>
  <UApp>
    <div class="flex flex-col items-center gap-4 p-8">
      <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1>

      <UColorModeButton />        <!-- sun/moon toggle button -->
      <!-- or -->
      <UColorModeSwitch />        <!-- switch style -->
      <!-- or -->
      <UColorModeSelect />        <!-- System / Light / Dark dropdown -->
      <Icon name="tabler:map" size="24" />

      <UButton icon="i-lucide-rocket" size="lg">
        Nuxt UI is working
      </UButton>
    </div>
  </UApp>
</template>
