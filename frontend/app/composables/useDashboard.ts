export const useDashboard = () => {
  const isNotificationsSlideoverOpen = useState('dashboard-notifications-slideover', () => false)

  return {
    isNotificationsSlideoverOpen
  }
}
