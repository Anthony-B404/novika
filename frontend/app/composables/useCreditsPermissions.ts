/**
 * Composable for managing credits page permissions based on user role
 * in the current organization and the credit mode.
 */
export const useCreditsPermissions = () => {
  const { isOwner, isAdministrator } = useSettingsPermissions()
  const creditsStore = useCreditsStore()

  // Permission checks

  /**
   * Only owner can change credit mode
   */
  const canChangeMode = computed(() => isOwner.value)

  /**
   * Owner and Administrator can view member credits list
   */
  const canViewMemberCredits = computed(() => isOwner.value || isAdministrator.value)

  /**
   * Owner and Administrator can distribute credits
   */
  const canDistributeCredits = computed(() => isOwner.value || isAdministrator.value)

  /**
   * Only owner can recover credits from members
   */
  const canRecoverCredits = computed(() => isOwner.value)

  /**
   * Owner and Administrator can configure auto-refill for members
   */
  const canConfigureAutoRefill = computed(() => isOwner.value || isAdministrator.value)

  /**
   * Only owner can configure global auto-refill settings
   */
  const canConfigureGlobalAutoRefill = computed(() => isOwner.value)

  // Conditional display

  /**
   * Show member management section only in individual mode for Owner/Admin
   */
  const showMemberManagement = computed(
    () => creditsStore.isIndividualMode && (isOwner.value || isAdministrator.value),
  )

  /**
   * Owner and Administrator can see all transactions (including other users)
   * Members only see their own transactions
   */
  const showAllTransactions = computed(() => isOwner.value || isAdministrator.value)

  /**
   * In individual mode, show personal balance for non-owner users
   */
  const showPersonalBalance = computed(
    () => creditsStore.isIndividualMode && !isOwner.value,
  )

  /**
   * Show organization pool balance (always visible for owner/admin, only in shared mode for members)
   */
  const showOrganizationPool = computed(
    () => isOwner.value || isAdministrator.value || creditsStore.isSharedMode,
  )

  return {
    // Permissions
    canChangeMode,
    canViewMemberCredits,
    canDistributeCredits,
    canRecoverCredits,
    canConfigureAutoRefill,
    canConfigureGlobalAutoRefill,

    // Conditional display
    showMemberManagement,
    showAllTransactions,
    showPersonalBalance,
    showOrganizationPool,
  }
}
