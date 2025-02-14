import {
  Button,
  Card,
  ChevronDownIcon,
  GradientAvatar,
  ReceiveIcon,
  SignoutIcon,
  Text,
  TransactionIcon,
  truncateAddress
} from '@0xsequence/design-system'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { useAuth } from '../context/AuthContext'

import { useConfirmDialog } from './ConfirmDialogProvider'

export const AccountMenu = () => {
  const navigate = useNavigate()
  const [isOpen, toggleOpen] = useState(false)
  const { address, signOut } = useAuth()
  const { confirmAction } = useConfirmDialog()

  const handleSignOut = () => {
    confirmAction({
      title: 'Signing out',
      warningMessage: 'Are you sure you want to sign out?',
      confirmLabel: 'Sign out',
      onConfirm: async () => {
        signOut()
      },
      cancelLabel: 'Cancel',
      onCancel: () => {}
    })
  }

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={toggleOpen}>
      <PopoverPrimitive.Trigger asChild>
        <div
          className="flex border-1 border-solid rounded-xl px-4 py-3 cursor-pointer gap-2 items-center select-none"
          style={{ height: 52 }}
        >
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 justify-end items-center">
              <GradientAvatar address={String(address)} size="sm" />
              <Text variant="normal" fontWeight="bold" color="text100">
                {truncateAddress(String(address), 4)}
              </Text>
            </div>
          </div>

          <div className="text-text50">
            <ChevronDownIcon />
          </div>
        </div>
      </PopoverPrimitive.Trigger>
      {isOpen && (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content side="bottom" sideOffset={8} align="end" asChild>
            <Card
              className="z-20 bg-background-raised backdrop-blur-md relative p-2"
              style={{ minWidth: 360 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <Text variant="normal" fontWeight="bold" color="text100">
                    Account
                  </Text>
                </div>

                <Text className="mt-2" variant="normal" color="text80" asChild>
                  <div>{address}</div>
                </Text>
              </Card>

              <div className="mt-2">
                <Button
                  className="w-full"
                  shape="square"
                  variant="emphasis"
                  rightIcon={ReceiveIcon}
                  label="Receive"
                  onClick={() => navigate('/receive')}
                />
              </div>
              <div className="mt-2">
                <Button
                  className="w-full"
                  shape="square"
                  variant="emphasis"
                  rightIcon={TransactionIcon}
                  label="History"
                  onClick={() => navigate('/history')}
                />
              </div>
              <div className="mt-2">
                <Button
                  className="w-full"
                  shape="square"
                  variant="emphasis"
                  rightIcon={SignoutIcon}
                  label="Sign out"
                  onClick={handleSignOut}
                />
              </div>
            </Card>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      )}
    </PopoverPrimitive.Root>
  )
}
