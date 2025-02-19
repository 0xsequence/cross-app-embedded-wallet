import { cn } from '@0xsequence/design-system'
import { TokenTileEmptyProps } from '../types'

export function TokenTileEmpty(props: TokenTileEmptyProps) {
  const { className = '', ...rest } = props

  return <div className={cn('aspect-square bg-black/5 rounded-md', className)} {...rest}></div>
}
