import { useBreakpoints } from '@vueuse/core'

export function useBreakpoint() {
  const breakpoints = useBreakpoints({ mobile: 768, tablet: 1024 })
  return {
    isMobile: breakpoints.smaller('mobile'),
    isTablet: breakpoints.between('mobile', 'tablet'),
    isDesktop: breakpoints.greaterOrEqual('tablet'),
  }
}
