<script setup lang="ts">
import SimulatorEnergyCard from '@/components/simulator/SimulatorEnergyCard.vue'
import SimulatorFinancingCard from '@/components/simulator/SimulatorFinancingCard.vue'
import SimulatorHeader from '@/components/simulator/SimulatorHeader.vue'
import SimulatorInsuranceCard from '@/components/simulator/SimulatorInsuranceCard.vue'
import SimulatorMaintenanceCard from '@/components/simulator/SimulatorMaintenanceCard.vue'
import SimulatorMileageCard from '@/components/simulator/SimulatorMileageCard.vue'
import SimulatorPurchaseCard from '@/components/simulator/SimulatorPurchaseCard.vue'
import SimulatorResultsPanel from '@/components/simulator/SimulatorResultsPanel.vue'
import SimulatorYearlyTable from '@/components/simulator/SimulatorYearlyTable.vue'
import { useSimulatorQuerySync } from '@/composables/useSimulatorQuerySync'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'SimulatorView' })

const { activeTab } = useSimulatorQuerySync()
const { t } = useI18n()
</script>

<template>
  <div class="sim-page">
    <SimulatorHeader />

    <Tabs v-model:value="activeTab" scrollable class="sim-tabs">
      <TabList>
        <Tab value="financing">{{ t('tabs.financing') }}</Tab>
        <Tab value="mileage">{{ t('tabs.mileage') }}</Tab>
        <Tab value="purchase">{{ t('tabs.purchase') }}</Tab>
        <Tab value="costs">{{ t('tabs.costs') }}</Tab>
        <Tab value="results">{{ t('tabs.results') }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="financing">
          <SimulatorFinancingCard />
        </TabPanel>
        <TabPanel value="mileage">
          <SimulatorMileageCard />
        </TabPanel>
        <TabPanel value="purchase">
          <SimulatorPurchaseCard />
        </TabPanel>
        <TabPanel value="costs">
          <SimulatorEnergyCard />
          <SimulatorMaintenanceCard />
          <SimulatorInsuranceCard />
        </TabPanel>
        <TabPanel value="results">
          <SimulatorResultsPanel />
          <SimulatorYearlyTable />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style scoped>
.sim-page {
  box-sizing: border-box;
  min-height: 100vh;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: #f5f4f0;
  color: #1a1a18;
  padding: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.sim-page *,
.sim-page *::before,
.sim-page *::after {
  box-sizing: border-box;
}

.sim-tabs :deep(.p-tabpanels) {
  padding-top: 1rem;
}

.sim-tabs :deep(.p-tablist) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f5f4f0;
  padding-bottom: 0.25rem;
}
</style>
