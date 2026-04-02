import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'

export const SIMULATOR_COLORS = {
    fuel: '#993C1D',
    ev: '#0F6E56',
    savings: '#185FA5',
    savingsNeg: '#993C1D',
} as const

/** Options durée simulation (années), affichage UI */
export const SIMULATION_YEAR_OPTIONS = [3, 4, 5, 6, 7, 8] as const

/** Durées de crédit proposées (années) */
export const FINANCING_DURATION_YEAR_OPTIONS = [2, 3, 4, 5, 6, 7] as const
export type FinancingDurationYears = (typeof FINANCING_DURATION_YEAR_OPTIONS)[number]

/** Même plage que le mode « km/an direct » ; le trajet est contraint pour tomber dedans */
export const KM_PER_YEAR_MIN = 3000
export const KM_PER_YEAR_MAX = 45_000

const ABS_KM_DAY_MIN = 20
const ABS_KM_DAY_MAX = 200
const ABS_DAYS_MIN = 5
const ABS_DAYS_MAX = 31

export function formatFrInt(n: number): string {
    return Math.round(n).toLocaleString('fr-FR')
}

export function formatFrDec(n: number, digits: number): string {
    return n.toFixed(digits).replace('.', ',')
}

/** Mensualité crédit amortissable (TAEG → mensuel), capital sur n mois */
export function monthlyPaymentFromRate(principal: number, annualRatePercent: number, nMonths: number): number {
    if (principal <= 0 || nMonths <= 0) return 0
    const i = annualRatePercent / 100 / 12
    if (i <= 0) return principal / nMonths
    const f = (1 + i) ** nMonths
    return (principal * i * f) / (f - 1)
}

/** Capital restant après k mensualités (prêt à taux) */
export function remainingLoanAnnuity(
    principal: number,
    annualRatePercent: number,
    nMonths: number,
    paymentsDone: number,
): number {
    if (principal <= 0 || nMonths <= 0) return 0
    const k = Math.min(Math.max(0, paymentsDone), nMonths)
    const i = annualRatePercent / 100 / 12
    if (i <= 0) return Math.max(0, principal * (1 - k / nMonths))
    const f = (1 + i) ** nMonths
    const fk = (1 + i) ** k
    return (principal * (f - fk)) / (f - 1)
}

/** Capital restant — mensualité saisie, intérêts 0 (remboursement linéaire sur la durée) */
export function remainingLoanLinear(
    principal: number,
    monthlyPayment: number,
    nMonths: number,
    paymentsDone: number,
): number {
    if (principal <= 0 || nMonths <= 0) return 0
    const k = Math.min(Math.max(0, paymentsDone), nMonths)
    return Math.max(0, principal - monthlyPayment * k)
}

export type MileageInputMode = 'trip' | 'direct'

export interface SimulatorData {
    mileageInputMode: MileageInputMode
    /** Horizon tableau + graphique (années), 3–8 */
    simulationYears: number
    evLabel: string
    iceLabel: string
    kmPerDay: number
    daysPerMonth: number
    evKmPerYear: number
    iceKmPerYear: number
    evInitialKm: number
    iceInitialKm: number
    financingDurationYears: FinancingDurationYears
    evUseFinancing: boolean
    iceUseFinancing: boolean
    evFinanceUseRate: boolean
    iceFinanceUseRate: boolean
    evAnnualRatePercent: number
    iceAnnualRatePercent: number
    evMonthlyPaymentInput: number
    iceMonthlyPaymentInput: number
    evPurchasePrice: number
    icePurchasePrice: number
    evReprise: number
    iceReprise: number
    elecKwhPer100: number
    elecPricePerKwh: number
    fuelLitersPer100: number
    fuelPricePerLiter: number
    maintElecPerYear: number
    maintFuelPerYear: number
    insElecPerYear: number
    insFuelPerYear: number
}

/** Une ligne du tableau annuel simplifié */
export interface YearlyBreakdownRow {
    year: number
    evKm: number
    iceKm: number
    /** Énergie + entretien + assurance (sans crédit ni amort compté ici) */
    evUsageYear: number
    iceUsageYear: number
    /** Crédit ou part amortissement véhicule sur l’année */
    evVehicleYear: number
    iceVehicleYear: number
    /** Total annuel élec = usage + véhicule (équivalent colonne « coût élec ») */
    evCostYear: number
    iceCostYear: number
    /** coût therm − coût élec : positif = l’électrique coûte moins cher cette année (gain avec l’électrique) */
    deltaYear: number
    deltaCumulative: number
}

const defaultKmPerYear = Math.min(
    KM_PER_YEAR_MAX,
    Math.max(KM_PER_YEAR_MIN, Math.round(72 * 22 * 12)),
)

export const useSimulatorStore = defineStore('simulator', () => {
    const data = reactive<SimulatorData>({
        mileageInputMode: 'trip',
        simulationYears: 5,
        evLabel: 'Electrique',
        iceLabel: 'Essence',
        kmPerDay: 72,
        daysPerMonth: 22,
        evKmPerYear: defaultKmPerYear,
        iceKmPerYear: defaultKmPerYear,
        evInitialKm: 0,
        iceInitialKm: 0,
        financingDurationYears: 5,
        evUseFinancing: false,
        iceUseFinancing: false,
        evFinanceUseRate: true,
        iceFinanceUseRate: true,
        evAnnualRatePercent: 4.5,
        iceAnnualRatePercent: 4.5,
        evMonthlyPaymentInput: 650,
        iceMonthlyPaymentInput: 520,
        evPurchasePrice: 42_000,
        icePurchasePrice: 32_000,
        evReprise: 22_000,
        iceReprise: 14_000,
        elecKwhPer100: 14,
        elecPricePerKwh: 0.17,
        fuelLitersPer100: 6.1,
        fuelPricePerLiter: 1.75,
        maintElecPerYear: 200,
        maintFuelPerYear: 900,
        insElecPerYear: 800,
        insFuelPerYear: 800,
    })

    const horizonMonths = computed(() => data.simulationYears * 12)

    const loanMonths = computed(() => data.financingDurationYears * 12)

    const distanceKmMonthFromTrip = computed(() => data.kmPerDay * data.daysPerMonth)

    /** Bornes sliders trajet : km/jour (selon jours/mois), pour rester dans [KM_PER_YEAR_MIN, KM_PER_YEAR_MAX] */
    const tripKmPerDayMin = computed(() =>
        Math.max(ABS_KM_DAY_MIN, Math.ceil(KM_PER_YEAR_MIN / (data.daysPerMonth * 12))),
    )
    const tripKmPerDayMax = computed(() =>
        Math.min(ABS_KM_DAY_MAX, Math.floor(KM_PER_YEAR_MAX / (data.daysPerMonth * 12))),
    )
    /** Bornes sliders trajet : jours/mois (selon km/jour) */
    const tripDaysMin = computed(() =>
        Math.max(ABS_DAYS_MIN, Math.ceil(KM_PER_YEAR_MIN / (data.kmPerDay * 12))),
    )
    const tripDaysMax = computed(() =>
        Math.min(ABS_DAYS_MAX, Math.floor(KM_PER_YEAR_MAX / (data.kmPerDay * 12))),
    )

    /** Km/an issu du trajet (après normalisation : identique élec / therm.) */
    const annualKmFromTrip = computed(() =>
        Math.min(
            KM_PER_YEAR_MAX,
            Math.max(KM_PER_YEAR_MIN, Math.round(data.kmPerDay * data.daysPerMonth * 12)),
        ),
    )

    function normalizeTripMileage(): void {
        if (data.mileageInputMode !== 'trip') return
        let safety = 0
        while (safety++ < 48) {
            let kdMin = Math.max(ABS_KM_DAY_MIN, Math.ceil(KM_PER_YEAR_MIN / (data.daysPerMonth * 12)))
            let kdMax = Math.min(ABS_KM_DAY_MAX, Math.floor(KM_PER_YEAR_MAX / (data.daysPerMonth * 12)))
            if (kdMax < kdMin) {
                if (data.daysPerMonth < ABS_DAYS_MAX) {
                    data.daysPerMonth += 1
                    continue
                }
                kdMax = kdMin
            }
            data.kmPerDay = Math.min(Math.max(data.kmPerDay, kdMin), kdMax)

            let dMin = Math.max(ABS_DAYS_MIN, Math.ceil(KM_PER_YEAR_MIN / (data.kmPerDay * 12)))
            let dMax = Math.min(ABS_DAYS_MAX, Math.floor(KM_PER_YEAR_MAX / (data.kmPerDay * 12)))
            if (dMax < dMin) {
                if (data.kmPerDay < ABS_KM_DAY_MAX) {
                    data.kmPerDay += 1
                    continue
                }
                dMax = dMin
            }
            data.daysPerMonth = Math.min(Math.max(data.daysPerMonth, dMin), dMax)
            break
        }
        for (let i = 0; i < 5; i++) {
            const kdMin2 = Math.max(ABS_KM_DAY_MIN, Math.ceil(KM_PER_YEAR_MIN / (data.daysPerMonth * 12)))
            const kdMax2 = Math.min(ABS_KM_DAY_MAX, Math.floor(KM_PER_YEAR_MAX / (data.daysPerMonth * 12)))
            data.kmPerDay = Math.min(Math.max(data.kmPerDay, kdMin2), kdMax2)
            const dMin2 = Math.max(ABS_DAYS_MIN, Math.ceil(KM_PER_YEAR_MIN / (data.kmPerDay * 12)))
            const dMax2 = Math.min(ABS_DAYS_MAX, Math.floor(KM_PER_YEAR_MAX / (data.kmPerDay * 12)))
            data.daysPerMonth = Math.min(Math.max(data.daysPerMonth, dMin2), dMax2)
        }
        const annual = Math.round(data.kmPerDay * data.daysPerMonth * 12)
        const c = Math.min(KM_PER_YEAR_MAX, Math.max(KM_PER_YEAR_MIN, annual))
        data.evKmPerYear = c
        data.iceKmPerYear = c
    }

    watch(
        () => [data.mileageInputMode, data.kmPerDay, data.daysPerMonth] as const,
        (curr, prev) => {
            if (data.mileageInputMode !== 'trip') return
            const prevMode = prev?.[0]
            if (prev !== undefined && prevMode === 'direct') {
                const mid = Math.round((data.evKmPerYear + data.iceKmPerYear) / 2)
                const c = Math.min(KM_PER_YEAR_MAX, Math.max(KM_PER_YEAR_MIN, mid))
                const kd = Math.round(c / (data.daysPerMonth * 12))
                data.kmPerDay = Math.min(ABS_KM_DAY_MAX, Math.max(ABS_KM_DAY_MIN, kd))
            }
            normalizeTripMileage()
        },
        { immediate: true },
    )

    const evDistanceKmMonth = computed(() => data.evKmPerYear / 12)
    const iceDistanceKmMonth = computed(() => data.iceKmPerYear / 12)

    const energyCostElecMonth = computed(
        () => (evDistanceKmMonth.value / 100) * data.elecKwhPer100 * data.elecPricePerKwh,
    )
    const energyCostFuelMonth = computed(
        () => (iceDistanceKmMonth.value / 100) * data.fuelLitersPer100 * data.fuelPricePerLiter,
    )

    const fixedElecMonth = computed(() => (data.maintElecPerYear + data.insElecPerYear) / 12)
    const fixedFuelMonth = computed(() => (data.maintFuelPerYear + data.insFuelPerYear) / 12)

    const runningElecMonth = computed(() => energyCostElecMonth.value + fixedElecMonth.value)
    const runningFuelMonth = computed(() => energyCostFuelMonth.value + fixedFuelMonth.value)

    const amortEvMonth = computed(() => {
        const m = horizonMonths.value
        return m > 0 ? (data.evPurchasePrice - data.evReprise) / m : 0
    })
    const amortIceMonth = computed(() => {
        const m = horizonMonths.value
        return m > 0 ? (data.icePurchasePrice - data.iceReprise) / m : 0
    })

    const evMonthlyPayment = computed(() => {
        if (!data.evUseFinancing) return 0
        const P = data.evPurchasePrice
        const n = loanMonths.value
        if (P <= 0 || n <= 0) return 0
        if (data.evFinanceUseRate) {
            return monthlyPaymentFromRate(P, data.evAnnualRatePercent, n)
        }
        return Math.max(0, data.evMonthlyPaymentInput)
    })

    const iceMonthlyPayment = computed(() => {
        if (!data.iceUseFinancing) return 0
        const P = data.icePurchasePrice
        const n = loanMonths.value
        if (P <= 0 || n <= 0) return 0
        if (data.iceFinanceUseRate) {
            return monthlyPaymentFromRate(P, data.iceAnnualRatePercent, n)
        }
        return Math.max(0, data.iceMonthlyPaymentInput)
    })

    function creditPortionElecMonth(monthIndex: number): number {
        const cap = horizonMonths.value
        if (!data.evUseFinancing || monthIndex < 1 || monthIndex > cap) return 0
        return monthIndex <= loanMonths.value ? evMonthlyPayment.value : 0
    }

    function creditPortionIceMonth(monthIndex: number): number {
        const cap = horizonMonths.value
        if (!data.iceUseFinancing || monthIndex < 1 || monthIndex > cap) return 0
        return monthIndex <= loanMonths.value ? iceMonthlyPayment.value : 0
    }

    function vehiclePortionElecMonth(monthIndex: number): number {
        if (data.evUseFinancing) return creditPortionElecMonth(monthIndex)
        return amortEvMonth.value
    }

    function vehiclePortionIceMonth(monthIndex: number): number {
        if (data.iceUseFinancing) return creditPortionIceMonth(monthIndex)
        return amortIceMonth.value
    }

    function elecMonthTotal(monthIndex: number): number {
        return runningElecMonth.value + vehiclePortionElecMonth(monthIndex)
    }

    function fuelMonthTotal(monthIndex: number): number {
        return runningFuelMonth.value + vehiclePortionIceMonth(monthIndex)
    }

    function resaleLinear(purchase: number, reprise: number, yearEnd: number): number {
        const Y = data.simulationYears
        if (yearEnd <= 0 || Y <= 0) return purchase
        return purchase - (purchase - reprise) * (yearEnd / Y)
    }

    function remainingDebtEv(monthsPaid: number): number {
        if (!data.evUseFinancing) return 0
        const P = data.evPurchasePrice
        const n = loanMonths.value
        if (P <= 0 || n <= 0) return 0
        const k = Math.min(monthsPaid, n)
        if (data.evFinanceUseRate) {
            return remainingLoanAnnuity(P, data.evAnnualRatePercent, n, k)
        }
        return remainingLoanLinear(P, evMonthlyPayment.value, n, k)
    }

    function remainingDebtIce(monthsPaid: number): number {
        if (!data.iceUseFinancing) return 0
        const P = data.icePurchasePrice
        const n = loanMonths.value
        if (P <= 0 || n <= 0) return 0
        const k = Math.min(monthsPaid, n)
        if (data.iceFinanceUseRate) {
            return remainingLoanAnnuity(P, data.iceAnnualRatePercent, n, k)
        }
        return remainingLoanLinear(P, iceMonthlyPayment.value, n, k)
    }

    const costAverageYear1Elec = computed(() => {
        let s = 0
        for (let m = 1; m <= 12; m++) s += elecMonthTotal(m)
        return s / 12
    })

    const costAverageYear1Fuel = computed(() => {
        let s = 0
        for (let m = 1; m <= 12; m++) s += fuelMonthTotal(m)
        return s / 12
    })

    const totalElecMonth = computed(() => costAverageYear1Elec.value)
    const totalFuelMonth = computed(() => costAverageYear1Fuel.value)

    const savingsMonth = computed(() => totalFuelMonth.value - totalElecMonth.value)

    const totalSimulationElec = computed(() => {
        const cap = horizonMonths.value
        let s = 0
        for (let m = 1; m <= cap; m++) s += elecMonthTotal(m)
        return Math.round(s)
    })

    const totalSimulationFuel = computed(() => {
        const cap = horizonMonths.value
        let s = 0
        for (let m = 1; m <= cap; m++) s += fuelMonthTotal(m)
        return Math.round(s)
    })

    /** Économie : coût thermique − coût élec sur la période (positif = l’électrique est moins cher) */
    const savingsSimulation = computed(() => totalSimulationFuel.value - totalSimulationElec.value)

    const runningPeriodElec = computed(() =>
        Math.round(runningElecMonth.value * horizonMonths.value),
    )
    const runningPeriodFuel = computed(() =>
        Math.round(runningFuelMonth.value * horizonMonths.value),
    )
    const savingsRunningOnly = computed(() => runningPeriodFuel.value - runningPeriodElec.value)

    const evKmEndOfHorizon = computed(() => data.evInitialKm + data.evKmPerYear * data.simulationYears)
    const iceKmEndOfHorizon = computed(() => data.iceInitialKm + data.iceKmPerYear * data.simulationYears)

    const netVehicleCostEv = computed(() => data.evPurchasePrice - data.evReprise)
    const netVehicleCostIce = computed(() => data.icePurchasePrice - data.iceReprise)

    /** Estim. valeur reprise fin d’horizon & équité (cession − crédit) — pour synthèse achat/vente */
    const equityEvAtHorizon = computed(() => {
        const y = data.simulationYears
        const v = resaleLinear(data.evPurchasePrice, data.evReprise, y)
        const d = remainingDebtEv(horizonMonths.value)
        return Math.round(v - d)
    })

    const equityIceAtHorizon = computed(() => {
        const y = data.simulationYears
        const v = resaleLinear(data.icePurchasePrice, data.iceReprise, y)
        const d = remainingDebtIce(horizonMonths.value)
        return Math.round(v - d)
    })

    /** Positif = meilleure position « revente nette » pour l’électrique à la fin */
    const equityDeltaAtHorizon = computed(() => equityEvAtHorizon.value - equityIceAtHorizon.value)

    const yearlyBreakdown = computed((): YearlyBreakdownRow[] => {
        const rows: YearlyBreakdownRow[] = []
        let cumDelta = 0
        const evUAnnual = runningElecMonth.value * 12
        const iceUAnnual = runningFuelMonth.value * 12
        for (let y = 1; y <= data.simulationYears; y++) {
            const mStart = (y - 1) * 12 + 1
            const mEnd = Math.min(y * 12, horizonMonths.value)
            let evVeh = 0
            let iceVeh = 0
            for (let m = mStart; m <= mEnd; m++) {
                evVeh += vehiclePortionElecMonth(m)
                iceVeh += vehiclePortionIceMonth(m)
            }
            const evUsage = Math.round(evUAnnual)
            const iceUsage = Math.round(iceUAnnual)
            const evCost = Math.round(evUsage + evVeh)
            const iceCost = Math.round(iceUsage + iceVeh)
            const delta = iceCost - evCost
            cumDelta += delta

            rows.push({
                year: y,
                evKm: data.evInitialKm + data.evKmPerYear * y,
                iceKm: data.iceInitialKm + data.iceKmPerYear * y,
                evUsageYear: evUsage,
                iceUsageYear: iceUsage,
                evVehicleYear: Math.round(evVeh),
                iceVehicleYear: Math.round(iceVeh),
                evCostYear: evCost,
                iceCostYear: iceCost,
                deltaYear: delta,
                deltaCumulative: Math.round(cumDelta),
            })
        }
        return rows
    })

    const chartProjection = computed(() => {
        const labels: string[] = []
        const elec: number[] = []
        const fuel: number[] = []
        const eco: number[] = []
        let cumE = 0
        let cumF = 0
        const cap = horizonMonths.value
        for (let m = 1; m <= cap; m++) {
            const d = new Date(2025, 3 + m - 1, 1)
            labels.push(
                m === 1 || m % 6 === 0
                    ? d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
                    : '',
            )
            cumE += elecMonthTotal(m)
            cumF += fuelMonthTotal(m)
            elec.push(Math.round(cumE))
            fuel.push(Math.round(cumF))
            eco.push(Math.round(cumF - cumE))
        }
        return { labels, elec, fuel, eco }
    })

    function applyQuerySnapshot(patch: Record<string, unknown>): void {
        const p = patch
        const num = (
            key: keyof SimulatorData,
            min: number,
            max: number,
        ) => {
            const v = p[key as string]
            if (typeof v === 'number' && Number.isFinite(v))
                (data[key] as number) = Math.min(max, Math.max(min, v))
        }
        const str = (key: keyof SimulatorData, maxLen: number) => {
            const v = p[key as string]
            if (typeof v === 'string') (data[key] as string) = v.slice(0, maxLen)
        }
        const bool = (key: keyof SimulatorData) => {
            const v = p[key as string]
            if (typeof v === 'boolean') (data[key] as boolean) = v
        }

        const mode = p.mileageInputMode
        if (mode === 'trip' || mode === 'direct') data.mileageInputMode = mode

        const sy = p.simulationYears
        if (typeof sy === 'number' && Number.isFinite(sy)) {
            const y = Math.round(sy)
            if ((SIMULATION_YEAR_OPTIONS as readonly number[]).includes(y)) data.simulationYears = y
        }

        str('evLabel', 80)
        str('iceLabel', 80)
        num('kmPerDay', ABS_KM_DAY_MIN, ABS_KM_DAY_MAX)
        num('daysPerMonth', ABS_DAYS_MIN, ABS_DAYS_MAX)
        num('evKmPerYear', KM_PER_YEAR_MIN, KM_PER_YEAR_MAX)
        num('iceKmPerYear', KM_PER_YEAR_MIN, KM_PER_YEAR_MAX)
        num('evInitialKm', 0, 2_000_000)
        num('iceInitialKm', 0, 2_000_000)

        const fd = p.financingDurationYears
        if (
            typeof fd === 'number' &&
            Number.isFinite(fd) &&
            (FINANCING_DURATION_YEAR_OPTIONS as readonly number[]).includes(fd)
        )
            data.financingDurationYears = fd as FinancingDurationYears

        bool('evUseFinancing')
        bool('iceUseFinancing')
        bool('evFinanceUseRate')
        bool('iceFinanceUseRate')
        num('evAnnualRatePercent', 0, 30)
        num('iceAnnualRatePercent', 0, 30)
        num('evMonthlyPaymentInput', 0, 20_000)
        num('iceMonthlyPaymentInput', 0, 20_000)
        num('evPurchasePrice', 0, 800_000)
        num('icePurchasePrice', 0, 800_000)
        num('evReprise', 0, 800_000)
        num('iceReprise', 0, 800_000)
        num('elecKwhPer100', 5, 80)
        num('elecPricePerKwh', 0.01, 0.99)
        num('fuelLitersPer100', 2, 30)
        num('fuelPricePerLiter', 0.5, 4)
        num('maintElecPerYear', 0, 30_000)
        num('maintFuelPerYear', 0, 30_000)
        num('insElecPerYear', 0, 30_000)
        num('insFuelPerYear', 0, 30_000)

        normalizeTripMileage()
    }

    return {
        data,
        horizonMonths,
        loanMonths,
        distanceKmMonthFromTrip,
        evDistanceKmMonth,
        iceDistanceKmMonth,
        energyCostElecMonth,
        energyCostFuelMonth,
        fixedElecMonth,
        fixedFuelMonth,
        amortEvMonth,
        amortIceMonth,
        evMonthlyPayment,
        iceMonthlyPayment,
        runningElecMonth,
        runningFuelMonth,
        totalElecMonth,
        totalFuelMonth,
        savingsMonth,
        totalSimulationElec,
        totalSimulationFuel,
        savingsSimulation,
        runningPeriodElec,
        runningPeriodFuel,
        savingsRunningOnly,
        evKmEndOfHorizon,
        iceKmEndOfHorizon,
        netVehicleCostEv,
        netVehicleCostIce,
        equityEvAtHorizon,
        equityIceAtHorizon,
        equityDeltaAtHorizon,
        chartProjection,
        yearlyBreakdown,
        KM_PER_YEAR_MIN,
        KM_PER_YEAR_MAX,
        tripKmPerDayMin,
        tripKmPerDayMax,
        tripDaysMin,
        tripDaysMax,
        annualKmFromTrip,
        normalizeTripMileage,
        /** @deprecated compat — utiliser totalSimulationElec */
        total5yElec: totalSimulationElec,
        total5yFuel: totalSimulationFuel,
        savings5y: savingsSimulation,
        running5yElec: runningPeriodElec,
        running5yFuel: runningPeriodFuel,
        savings5yRunning: savingsRunningOnly,
        evKmAfter5y: evKmEndOfHorizon,
        iceKmAfter5y: iceKmEndOfHorizon,
        /** @deprecated utiliser normalizeTripMileage */
        syncKmPerYearFromTrip: normalizeTripMileage,
        applyQuerySnapshot,
    }
})
