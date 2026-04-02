<script setup lang="ts">
import { LOCALE_STORAGE_KEY } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { RouterView } from 'vue-router'

const { locale, t } = useI18n()

watch(
  locale,
  (l) => {
    document.documentElement.lang = l
    localStorage.setItem(LOCALE_STORAGE_KEY, l)
    document.title = t('meta.title')
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
