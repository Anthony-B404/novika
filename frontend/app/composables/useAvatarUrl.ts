/**
 * Composable for transforming avatar URLs
 * Handles different avatar sources: uploaded files, Google OAuth, blob URLs
 */
export function useAvatarUrl () {
  const config = useRuntimeConfig()

  /**
   * Get the full URL for an avatar
   * @param avatar - The avatar value (filename, full URL, or blob URL)
   * @returns The full avatar URL or undefined if no avatar
   */
  const getAvatarUrl = (avatar: string | null | undefined): string | undefined => {
    // No avatar set - return undefined to show fallback
    if (!avatar) {
      return undefined
    }

    // If it's already a full URL (Google OAuth), use it directly
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }

    // If it's a blob URL (local preview), use it directly
    if (avatar.startsWith('blob:')) {
      return avatar
    }

    // Otherwise, it's an uploaded file - construct backend URL
    return `${config.public.apiUrl}/user-avatar/${avatar}`
  }

  return { getAvatarUrl }
}
