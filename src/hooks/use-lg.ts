import * as React from "react"

const LG_BREAKPOINT = 1024

export function useIsLg() {
  const [isLg, setIsLg] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsLg(window.innerWidth < LG_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsLg(window.innerWidth < LG_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !isLg
}
