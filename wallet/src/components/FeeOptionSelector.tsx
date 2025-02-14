import { Button, Text } from '@0xsequence/design-system';
import { FeeOption } from '@0xsequence/waas'
import { ZeroAddress, formatUnits, parseUnits } from 'ethers'
import React, { ComponentProps } from 'react'

import { useTransactionHandler } from '../hooks/useTransactionHandler'

interface FeeOptionSelectorProps {
  txnFeeOptions: FeeOption[]
  feeOptionBalances: { tokenName: string; decimals: number; balance: string }[]
  selectedFeeOptionAddress: string | undefined
  setSelectedFeeOptionAddress: (address: string) => void
}

const isBalanceSufficient = (balance: string, fee: string, decimals: number) => {
  const balanceBN = parseUnits(balance, decimals)
  const feeBN = parseUnits(fee, decimals)
  return balanceBN >= feeBN
}

export const FeeOptionSelector: React.FC<FeeOptionSelectorProps> = ({
  txnFeeOptions,
  feeOptionBalances,
  selectedFeeOptionAddress,
  setSelectedFeeOptionAddress
}) => {
  const { checkTokenBalancesForFeeOptions, isRefreshingBalance } = useTransactionHandler()
  const [feeOptionAlert, setFeeOptionAlert] = React.useState<AlertProps | undefined>()

  const sortedOptions = [...txnFeeOptions].sort((a, b) => {
    const balanceA = feeOptionBalances.find(balance => balance.tokenName === a.token.name)
    const balanceB = feeOptionBalances.find(balance => balance.tokenName === b.token.name)
    const isSufficientA = balanceA
      ? isBalanceSufficient(balanceA.balance, a.value, a.token.decimals || 0)
      : false
    const isSufficientB = balanceB
      ? isBalanceSufficient(balanceB.balance, b.value, b.token.decimals || 0)
      : false
    return isSufficientA === isSufficientB ? 0 : isSufficientA ? -1 : 1
  })

  return (
    (<div className="my-3 w-full">
      <Text variant="medium" color="text100" fontWeight="bold">
        Select a fee option
      </Text>
      <div className="flex flex-col mt-2 gap-2">
        {sortedOptions.map((option, index) => {
          const balance = feeOptionBalances.find(b => b.tokenName === option.token.name)
          const isSufficient = isBalanceSufficient(
            balance?.balance || '0',
            option.value,
            option.token.decimals || 0
          )
          return (
            (<div
              className="p-3 rounded-xl"
              key={index}
              onClick={() => {
                if (isSufficient) {
                  setSelectedFeeOptionAddress(option.token.contractAddress ?? ZeroAddress)
                  setFeeOptionAlert(undefined)
                } else {
                  setFeeOptionAlert({
                    title: 'Insufficient balance',
                    description: `You do not have enough balance to pay the fee with ${option.token.name}.`,
                    secondaryDescription: 'Please select another fee option or add funds to your wallet.',
                    variant: 'warning'
                  })
                }
              }}>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <Text variant="small" color="text100" fontWeight="bold">
                    {option.token.name}
                  </Text>
                  <Text variant="xsmall" color="text80">
                    Fee:{' '}
                    {parseFloat(formatUnits(BigInt(option.value), option.token.decimals || 0)).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 6 }
                    )}
                  </Text>
                </div>
                <div className="flex flex-col items-end">
                  <Text variant="xsmall" color="text80">
                    Balance:
                  </Text>
                  <Text variant="xsmall" color="text100">
                    {parseFloat(
                      formatUnits(BigInt(balance?.balance || '0'), option.token.decimals || 0)
                    ).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </Text>
                </div>
              </div>
            </div>)
          );
        })}
      </div>
      <div className="flex my-2 items-end justify-center flex-col">
        <Button
          size="sm"
          onClick={checkTokenBalancesForFeeOptions}
          label={isRefreshingBalance ? 'Refreshing...' : 'Refresh Balance'}
          disabled={isRefreshingBalance}
        />
        {feeOptionAlert && (
          <div className="mt-3">
            <Alert
              title={feeOptionAlert.title}
              description={feeOptionAlert.description}
              secondaryDescription={feeOptionAlert.secondaryDescription}
              variant={feeOptionAlert.variant}
            />
          </div>
        )}
      </div>
    </div>)
  );
}

export type AlertProps = {
  title: string
  description: string
  secondaryDescription?: string
  variant: 'negative' | 'warning' | 'positive'
  buttonProps?: ComponentProps<typeof Button>
  children?: React.ReactNode
}

export const Alert = ({
  title,
  description,
  secondaryDescription,
  variant,
  buttonProps,
  children
}: AlertProps) => {
  return (
    (<div className="rounded-xl">
      <div
        className="flex bg-background-overlay rounded-xl py-4 w-full flex-col gap-3">
        <div className="flex w-full gap-2 justify-between">
          <div className="flex flex-col gap-1">
            <Text variant="normal" color="text100" fontWeight="medium">
              {title}
            </Text>

            <Text variant="normal" color="text50" fontWeight="medium">
              {description}
            </Text>

            {secondaryDescription && (
              <Text variant="normal" color="text80" fontWeight="medium">
                {secondaryDescription}
              </Text>
            )}
          </div>

          {buttonProps ? (
            <div className="rounded-lg w-min h-min">
              <Button className="shrink-0" variant="emphasis" shape="square" {...buttonProps} />
            </div>
          ) : null}
        </div>

        {children}
      </div>
    </div>)
  );
}
