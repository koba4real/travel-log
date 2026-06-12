<script lang="ts" setup>
import type { PageFeatureProps } from "@nuxt/ui";

// Primary call-to-action reused by the hero and the closing CTA section.
const signInLink = {
  label: "Sign in with GitHub",
  to: "/sign-in",
  icon: "tabler:brand-github",
  size: "xl" as const,
};

const heroLinks = [
  signInLink,
  {
    label: "See how it works",
    to: "#features",
    icon: "tabler:arrow-down",
    color: "neutral" as const,
    variant: "subtle" as const,
    size: "xl" as const,
  },
];

const features: PageFeatureProps[] = [
  {
    icon: "tabler:map-pin",
    title: "Pin your places",
    description:
      "Drop a marker on every destination and watch a map of everywhere "
      + "you've been take shape.",
  },
  {
    icon: "tabler:route",
    title: "Organize trips",
    description:
      "Group locations into trips so each adventure keeps its own story, "
      + "dates, and route.",
  },
  {
    icon: "tabler:notebook",
    title: "Capture memories",
    description:
      "Add notes, dates, and details to every spot so no memory ever fades "
      + "with time.",
  },
  {
    icon: "tabler:share",
    title: "Share your journey",
    description:
      "Show friends and family where you've wandered with a link to your "
      + "personal travel map.",
  },
];
</script>

<template>
  <div>
    <UPageHero
      headline="Your personal travel journal"
      title="Map every place your story takes you"
      description="Travel Log helps you remember every journey. Pin the places you've
        visited, organize them into trips, and relive your adventures on a
        beautiful interactive map — all in one place."
      :links="heroLinks"
    />

    <UPageSection
      id="features"
      title="Everything you need to remember the journey"
      description="From a single pin to a lifetime of trips, Travel Log keeps every
        adventure organized and within reach."
      :features="features"
    />

    <UPageCTA
      title="Ready to start your travel log?"
      description="Sign in with GitHub and drop your first pin in seconds. It's free."
      variant="subtle"
      :links="[signInLink]"
    />
  </div>
</template>
