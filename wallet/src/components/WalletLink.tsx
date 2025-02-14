import { ChevronRightIcon, Text } from '@0xsequence/design-system'
import { useNavigate } from 'react-router'

import { AppRoute } from '../routes'

interface WalletLinkProps {
  toLocation: AppRoute
  label: string
}

export const WalletLink = ({ toLocation, label }: WalletLinkProps) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate(toLocation)
  }

  return (
    <div
      className="flex w-full flex-row justify-between items-center select-none cursor-pointer"
      onClick={onClick}
    >
      <Text variant="normal" color="text50" fontWeight="medium">
        {label}
      </Text>
      <div className="flex flex-row justify-center items-center">
        <Text variant="normal" color="text50" fontWeight="medium">
          View all
        </Text>
        <ChevronRightIcon className="text-text50" size="sm" />
      </div>
    </div>
  )
}
