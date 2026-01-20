import type { BusinessSector } from '~/types/reseller'
import { BUSINESS_SECTORS } from '~/types/reseller'
import { useConfigStore } from '~/stores/config'

export interface SectorConfig {
  code: BusinessSector | string
  icon: string
  color: 'purple' | 'green' | 'blue' | 'orange' | 'pink' | 'gray'
  bgClass: string
  textClass: string
}

/**
 * Default configuration for unknown sectors.
 * This provides graceful handling when new sectors are added
 * to the backend but not yet configured in the frontend.
 */
const DEFAULT_SECTOR_CONFIG: Omit<SectorConfig, 'code'> = {
  icon: 'i-lucide-building-2',
  color: 'gray',
  bgClass: 'bg-gray-100 dark:bg-gray-900/30',
  textClass: 'text-gray-700 dark:text-gray-300'
}

export const useBusinessSectors = () => {
  const { t } = useI18n()
  const configStore = useConfigStore()

  /**
   * Sector configuration with icons and colors
   */
  const sectorConfigs: Record<BusinessSector, SectorConfig> = {
    psychology: {
      code: 'psychology',
      icon: 'i-lucide-brain',
      color: 'purple',
      bgClass: 'bg-purple-100 dark:bg-purple-900/30',
      textClass: 'text-purple-700 dark:text-purple-300'
    },
    finance: {
      code: 'finance',
      icon: 'i-lucide-calculator',
      color: 'green',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      textClass: 'text-green-700 dark:text-green-300'
    },
    legal: {
      code: 'legal',
      icon: 'i-lucide-scale',
      color: 'blue',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      textClass: 'text-blue-700 dark:text-blue-300'
    },
    sales: {
      code: 'sales',
      icon: 'i-lucide-shopping-cart',
      color: 'orange',
      bgClass: 'bg-orange-100 dark:bg-orange-900/30',
      textClass: 'text-orange-700 dark:text-orange-300'
    },
    hr: {
      code: 'hr',
      icon: 'i-lucide-users',
      color: 'pink',
      bgClass: 'bg-pink-100 dark:bg-pink-900/30',
      textClass: 'text-pink-700 dark:text-pink-300'
    }
  }

  /**
   * Check if a sector is known/configured
   */
  const isKnownSector = (sector: string): sector is BusinessSector => {
    return BUSINESS_SECTORS.includes(sector as BusinessSector)
  }

  /**
   * Get localized sector label
   * Falls back to the sector code if translation is not found
   */
  const getSectorLabel = (sector: BusinessSector | string): string => {
    if (!isKnownSector(sector)) {
      console.warn(`[useBusinessSectors] Unknown sector: "${sector}". Using raw value as label.`)
      return sector
    }
    return t(`reseller.sectors.${sector}`)
  }

  /**
   * Get sector configuration with fallback for unknown sectors
   * This provides graceful degradation when new sectors are added to the backend
   */
  const getSectorConfig = (sector: BusinessSector | string): SectorConfig => {
    if (!isKnownSector(sector)) {
      console.warn(`[useBusinessSectors] Unknown sector: "${sector}". Using default configuration.`)
      return {
        ...DEFAULT_SECTOR_CONFIG,
        code: sector
      }
    }
    return sectorConfigs[sector]
  }

  /**
   * Get all sectors as options for select components.
   * Uses sectors from API via config store, with static fallback.
   */
  const sectorOptions = computed(() =>
    configStore.availableSectors.map(sector => ({
      label: getSectorLabel(sector),
      value: sector,
      icon: getSectorConfig(sector).icon
    }))
  )

  /**
   * Get all sector configs as array.
   * Uses sectors from API via config store, with static fallback.
   */
  const allSectorConfigs = computed(() =>
    configStore.availableSectors.map(sector => ({
      ...getSectorConfig(sector),
      label: getSectorLabel(sector)
    }))
  )

  return {
    sectorConfigs,
    getSectorLabel,
    getSectorConfig,
    sectorOptions,
    allSectorConfigs,
    isKnownSector,
    BUSINESS_SECTORS
  }
}
