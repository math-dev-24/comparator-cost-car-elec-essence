<script setup lang="ts">
import { LOCALE_STORAGE_KEY } from '@/i18n'
import { applyDocumentMeta } from '@/utils/documentMeta'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { RouterView } from 'vue-router'

const { locale, t } = useI18n()

watch(
  locale,
  (l) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, l)
    applyDocumentMeta({
      htmlLang: l === 'en' ? 'en' : 'fr',
      title: t('meta.title'),
      description: t('meta.description'),
      keywords: t('meta.keywords'),
    })
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
