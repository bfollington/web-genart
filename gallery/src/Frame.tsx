import { ReactNode } from 'react'

export function Frame({ children }: { children: ReactNode }) {
  return <div className="display-frame">{children}</div>
}
