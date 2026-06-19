<script lang="ts" setup>
import type { NominatimResult } from "~~/lib/types";
import type { FetchError } from "ofetch";

const emit = defineEmits<{
  select: [location: { name: string; lat: number; lng: number }];
}>();

const toast = useToast();

const searchQuery = ref("");
const searchResults = ref<NominatimResult[]>([]);
const searchLoading = ref(false);
// Tracks whether a search has completed, so we only show the "no results"
// message after the user has actually searched (not on first render).
const hasSearched = ref(false);

async function searchLocations() {
  if (!searchQuery.value)
    return;

  try {
    searchLoading.value = true;
    searchResults.value = await $fetch<NominatimResult[]>("/api/search-location", {
      query: { q: searchQuery.value },
    });
    hasSearched.value = true;
  }
  catch (e) {
    const error = e as FetchError;
    searchResults.value = [];
    toast.add({
      title: "Search failed",
      description: getFetchErrorMessage(error),
      color: "error",
      icon: "tabler:alert-triangle",
    });
  }
  finally {
    searchLoading.value = false;
  }
}

// Pick a name to show as the result title — Nominatim's `name` can be empty
// for some entries, so fall back to the first part of the full address.
function resultTitle(result: NominatimResult) {
  return result.name || result.display_name.split(",")[0] || result.display_name;
}

function selectResult(result: NominatimResult) {
  emit("select", {
    name: resultTitle(result),
    lat: Number(result.lat),
    lng: Number(result.lon),
  });
  searchResults.value = [];
  hasSearched.value = false;
}
</script>

<template>
  <div class="location-search">
    <div class="location-search__bar">
      <UInput
        v-model="searchQuery"
        icon="tabler:search"
        placeholder="Search for a location..."
        class="location-search__input"
        :disabled="searchLoading"
        @keydown.enter.prevent="searchLocations"
      />
      <UButton
        icon="tabler:search"
        :loading="searchLoading"
        :disabled="!searchQuery"
        @click="searchLocations"
      >
        Search
      </UButton>
    </div>

    <p v-if="searchLoading" class="location-search__status">
      <Icon name="tabler:loader-2" class="location-search__spinner" />
      Searching…
    </p>

    <ul v-else-if="searchResults.length" class="location-search__results">
      <li v-for="result in searchResults" :key="result.place_id">
        <button
          type="button"
          class="location-search__result"
          @click="selectResult(result)"
        >
          <Icon name="tabler:map-pin" class="location-search__result-icon" />
          <span class="location-search__result-body">
            <span class="location-search__result-name">{{ resultTitle(result) }}</span>
            <span class="location-search__result-address">{{ result.display_name }}</span>
          </span>
        </button>
      </li>
    </ul>

    <p v-else-if="hasSearched" class="location-search__status location-search__status--empty">
      <Icon name="tabler:mood-empty" class="location-search__status-icon" />
      No locations found for “{{ searchQuery }}”. Try a different search.
    </p>
  </div>
</template>

<style scoped>
/* Location search — input + button row with a results dropdown. */
.location-search {
  max-width: 42rem;
}

.location-search__bar {
  display: flex;
  gap: 0.5rem;
}

.location-search__input {
  flex: 1;
}

.location-search__results {
  margin-top: 0.5rem;
  list-style: none;
  padding: 0.25rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg-elevated);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  overflow: hidden;
}

.location-search__result {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  text-align: left;
  color: var(--ui-text);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.location-search__result:hover {
  background: var(--ui-bg-muted);
}

.location-search__result-icon {
  flex-shrink: 0;
  margin-top: 0.15rem;
  font-size: 1rem;
  color: var(--ui-primary);
}

.location-search__result-body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.location-search__result-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.location-search__result-address {
  overflow: hidden;
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--ui-text-muted);
}

/* Shared row for the "searching…" and "no results" states. */
.location-search__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
}

.location-search__status--empty {
  padding: 0.625rem 0.75rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--ui-bg-muted) 50%, transparent);
}

.location-search__status-icon {
  flex-shrink: 0;
  font-size: 1rem;
  color: var(--ui-text-dimmed);
}

.location-search__spinner {
  font-size: 1rem;
  color: var(--ui-primary);
  animation: location-search-spin 0.8s linear infinite;
}

@keyframes location-search-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
