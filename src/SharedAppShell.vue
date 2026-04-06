<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  heading: string
  description: string
  sessionLabel: string
  roleLabel: string
  email: string | null
  isAuthenticated: boolean
  shellVariant?: 'default' | 'admin'
}>()

defineEmits<{ logout: [] }>()

const resolvedEmail = computed(() => props.email ?? 'Not signed in')
const isMobileNavOpen = ref(false)

function toggleMobileNav() {
  if (props.shellVariant !== 'admin') {
    return
  }

  isMobileNavOpen.value = !isMobileNavOpen.value
}

function closeMobileNav() {
  if (props.shellVariant !== 'admin') {
    return
  }

  isMobileNavOpen.value = false
}
</script>

<template>
  <div class="app-shell" :class="[`app-shell--${shellVariant ?? 'default'}`, { 'app-shell--nav-open': isMobileNavOpen }]">
    <header v-if="shellVariant === 'admin'" class="shell-topbar">
      <div class="shell-topbar__spacer"></div>
      <div class="identity-card shell-topbar__session">
        <div class="shell-topbar__session-copy">
          <span class="identity-card__label">{{ sessionLabel }}</span>
          <div class="shell-topbar__session-meta">
            <strong>{{ roleLabel }}</strong>
            <small>{{ resolvedEmail }}</small>
          </div>
        </div>
        <button v-if="isAuthenticated" class="identity-card__logout shell-topbar__logout" @click="$emit('logout')">
          Sign out
        </button>
      </div>
      <button class="shell-topbar__menu-toggle" :aria-expanded="isMobileNavOpen" aria-label="Toggle admin menu" @click="toggleMobileNav">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <aside class="sidebar-panel">
      <div>
        <p class="eyebrow">Rocket Alpha</p>
        <h1>{{ heading }}</h1>
        <p class="sidebar-copy">
          {{ description }}
        </p>
      </div>

      <nav class="roadmap-nav" aria-label="Product roadmap" @click="closeMobileNav">
        <slot name="nav" />
      </nav>
    </aside>

    <div class="content-panel" @click="closeMobileNav">
      <slot />
    </div>
  </div>
</template>
