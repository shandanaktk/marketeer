import { createContext, useContext } from 'react'

// The workspace brand every preview renders as (name, handle, initials, logo, website).
export const BrandContext = createContext({ name: 'Your brand', handle: 'yourbrand', initials: 'YB', logo: '', domain: '' })
export const useBrand = () => useContext(BrandContext)
