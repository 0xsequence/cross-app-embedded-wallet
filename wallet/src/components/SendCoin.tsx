import {
  Button,
  Card,
  CloseIcon,
  CopyIcon,
  GradientAvatar,
  NumericInput,
  Spinner,
  TextInput,
  nativeTokenImageUrl,
  useToast
} from '@0xsequence/design-system'
import { NativeTokenBalance, TokenBalance } from '@0xsequence/indexer'
import { ChainId, networks } from '@0xsequence/network'
import {
  MaySentTransactionResponse,
  SentTransactionResponse,
  Transaction,
  isSentTransactionResponse
} from '@0xsequence/waas'
import { ethers } from 'ethers'
import { ChangeEvent, SyntheticEvent, useRef, useState } from 'react'

import { computeBalanceFiat, createNativeTokenBalance, isNativeCoinBalance } from '../utils/balance'
import { isEthAddress, limitDecimals, truncateAtMiddle } from '../utils/helpers'
import { TransactionFeeOptionsResult } from '../utils/txn'

import { useCoinPrices, useExchangeRate } from '../hooks/useCoinPrices'
import { useConfig } from '../hooks/useConfig'
import { checkTransactionFeeOptions } from '../hooks/useTransactionHandler'

import { ERC_20_ABI } from '../constants'
import { sequenceWaas } from '../waasSetup'

import { SendItemInfo } from './SendItemInfo'
import { TransactionConfirmation } from './TransactionConfirmation'
import { SendIcon } from '../design-system-patch/icons'
import { WrappedInput } from './wrapped-input'
import { TIME } from '../utils/time.const'

interface SendCoinProps {
  chainId: number
  balance: NativeTokenBalance | TokenBalance
  onSuccess: (txnResponse: SentTransactionResponse) => void
}

const SendCoinSkeleton = () => {
  return (
    <div className="p-4 gap-2 flex flex-col">
      <Card className="bg-black/10 text-black rounded-md p-4 gap-2 flex flex-col">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black/5 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-black/5 rounded animate-pulse mb-1" />
            <div className="h-3 w-16 bg-black/5 rounded animate-pulse" />
          </div>
        </div>
        <WrappedInput>
          <div className="flex items-center justify-between w-full h-12 px-3">
            <div className="h-6 w-32 bg-black/5 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-black/5 rounded animate-pulse" />
              <div className="h-6 w-12 bg-black/5 rounded animate-pulse" />
            </div>
          </div>
        </WrappedInput>
      </Card>
      <div className="bg-black/10 rounded-md p-4 gap-2 flex flex-col">
        <span className="text-black text-sm font-bold">To</span>
        <WrappedInput>
          <div className="h-12 w-full bg-black/5 rounded animate-pulse" />
        </WrappedInput>
      </div>
      <div className="h-12 w-full bg-black/50 rounded animate-pulse" />
    </div>
  )
}

export const SendCoin = ({ chainId, balance, onSuccess }: SendCoinProps) => {
  const { fiatCurrency } = useConfig()
  const toast = useToast()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState<string>('0')
  const [toAddress, setToAddress] = useState<string>('')
  const [isSendTxnPending, setIsSendTxnPending] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [feeOptions, setFeeOptions] = useState<TransactionFeeOptionsResult>()
  const [isCheckingFeeOptions, setIsCheckingFeeOptions] = useState(false)
  const isNativeCoin = isNativeCoinBalance(balance)
  const [selectedFeeTokenAddress, setSelectedFeeTokenAddress] = useState<string | null>(null)

  const transactionsFeeOption = feeOptions?.feeOptions?.find(feeOption => {
    if (selectedFeeTokenAddress === ethers.ZeroAddress && feeOption.token.contractAddress === null)
      return true

    return feeOption.token.contractAddress === selectedFeeTokenAddress
  })

  const contractAddress = isNativeCoin
    ? ethers.ZeroAddress
    : 'contractAddress' in balance
      ? balance.contractAddress
      : ethers.ZeroAddress
  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useCoinPrices([
    {
      chainId,
      contractAddress
    }
  ])

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(
    fiatCurrency.symbol
  )

  const isPending = isPendingCoinPrices || isPendingConversionRate

  if (isPending) {
    return <SendCoinSkeleton />
  }

  const {
    name: nativeTokenName = 'Native Token',
    symbol: nativeTokenSymbol = '???',
    decimals: nativeTokenDecimals = 18
  } = networks[chainId as ChainId].nativeToken

  const decimals = isNativeCoin
    ? nativeTokenDecimals
    : ('contractInfo' in balance ? balance.contractInfo?.decimals : undefined) || 18
  const name = isNativeCoin
    ? nativeTokenName
    : ('contractInfo' in balance ? balance.contractInfo?.name : undefined) || ''
  const imageUrl = isNativeCoin
    ? nativeTokenImageUrl(chainId)
    : 'contractInfo' in balance
      ? balance.contractInfo?.logoURI
      : undefined
  const symbol = isNativeCoin
    ? nativeTokenSymbol
    : ('contractInfo' in balance ? balance.contractInfo?.symbol : undefined) || ''
  const amountToSendFormatted = amount === '' ? '0' : amount
  const amountRaw = ethers.parseUnits(amountToSendFormatted, decimals)

  const amountToSendFiat = computeBalanceFiat({
    balance: isNativeCoin
      ? createNativeTokenBalance(chainId, balance.accountAddress, amountRaw.toString())
      : {
          ...(balance as TokenBalance),
          balance: amountRaw.toString()
        },
    prices: coinPrices,
    conversionRate,
    decimals
  })

  const insufficientFunds = amountRaw > BigInt(balance.balance || '0')
  const isNonZeroAmount = amountRaw > 0n

  const handleChangeAmount = (ev: ChangeEvent<HTMLInputElement>) => {
    // Prevent value from having more decimals than the token supports
    const formattedValue = limitDecimals(ev.target.value, decimals)
    setAmount(formattedValue)
  }

  const handleMax = () => {
    amountInputRef.current?.focus()
    const maxAmount = ethers.formatUnits(balance.balance || 0, decimals).toString()

    setAmount(maxAmount)
  }

  const handlePaste = async () => {
    const result = await navigator.clipboard.readText()
    setToAddress(result)
  }

  const handleSendClick = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setIsCheckingFeeOptions(true)

      const sendAmount = ethers.parseUnits(amountToSendFormatted, decimals).toString()
      let transaction: Transaction

      if (isNativeCoin) {
        transaction = {
          to: toAddress,
          value: ethers.parseEther(amount)
        }
      } else {
        transaction = {
          to: balance?.accountAddress,
          data: new ethers.Interface(ERC_20_ABI).encodeFunctionData('transfer', [
            toAddress,
            ethers.toQuantity(sendAmount)
          ]) as `0x${string}`
        }
      }

      // Check fee options before showing confirmation
      const feeOptionsResult = await checkTransactionFeeOptions({ transactions: [transaction], chainId })

      setFeeOptions(feeOptionsResult)
      setShowConfirmation(true)
    } catch {
      // TODO error handling
    } finally {
      setIsCheckingFeeOptions(false)
    }
  }

  const executeTransaction = async () => {
    try {
      setIsSendTxnPending(true)

      let txResponse: MaySentTransactionResponse | undefined
      if (isNativeCoin) {
        txResponse = await sequenceWaas.sendTransaction({
          transactions: [
            {
              to: toAddress,
              value: ethers.parseEther(amount)
            }
          ],
          network: chainId,
          transactionsFeeOption,
          transactionsFeeQuote: feeOptions?.feeQuote
        })
      } else if ('contractAddress' in balance) {
        txResponse = await sequenceWaas.sendERC20({
          token: balance.contractAddress,
          to: toAddress,
          value: ethers.parseUnits(amountToSendFormatted, decimals),
          network: chainId,
          transactionsFeeOption,
          transactionsFeeQuote: feeOptions?.feeQuote
        })
      }
      if (isSentTransactionResponse(txResponse)) {
        onSuccess(txResponse)
        toast({
          title: 'Transaction successful',
          variant: 'success',
          duration: TIME.SECOND * 5
        })
      } else {
        toast({
          title: 'Transaction failed',
          variant: 'error',
          duration: TIME.SECOND * 5
        })
      }
    } catch {
      toast({
        title: 'Transaction failed',
        variant: 'error',
        duration: TIME.SECOND * 5
      })
    } finally {
      setIsSendTxnPending(false)
    }
  }

  return (
    <form
      data-txn-pending={isSendTxnPending ? true : undefined}
      className="data-txn-pending:pointer-events-none pointer-events-auto"
      onSubmit={handleSendClick}
    >
      {!showConfirmation && (
        <div className="p-4 gap-2 flex flex-col">
          <Card className="bg-black/10 text-black rounded-md p-4 gap-2 flex flex-col">
            <SendItemInfo
              imageUrl={imageUrl}
              decimals={decimals}
              name={name}
              symbol={symbol}
              balance={balance?.balance || '0'}
              fiatValue={computeBalanceFiat({
                balance: isNativeCoin
                  ? createNativeTokenBalance(chainId, balance.accountAddress, balance.balance || '0')
                  : (balance as TokenBalance),
                prices: coinPrices,
                conversionRate,
                decimals
              })}
              chainId={chainId}
            />
            <WrappedInput>
              <NumericInput
                ref={amountInputRef}
                className="text-xl font-bold text-black"
                name="amount"
                value={amount}
                onChange={handleChangeAmount}
                controls={
                  <>
                    <span className="whitespace-nowrap text-style-sm text-black">
                      {`~${fiatCurrency.sign}${amountToSendFiat}`}
                    </span>
                    <Button
                      className="shrink-0 text-black bg-black/5"
                      size="xs"
                      shape="square"
                      label="Max"
                      onClick={handleMax}
                      data-id="maxCoin"
                    />
                    <span className="text-style-sm font-bold text-black">{symbol}</span>
                  </>
                }
              />
            </WrappedInput>

            {insufficientFunds && <span className="text-seq-red-700 text-sm">Insufficient Funds</span>}
          </Card>
          <div className="bg-black/10 rounded-md p-4 gap-2 flex flex-col">
            <span className="text-black text-sm font-bold">To</span>

            {isEthAddress(toAddress) ? (
              <Card
                className="w-full flex flex-row items-center rounded-md min-h-[3rem] px-3 py-2 bg-black/10 justify-between"
                clickable
                width="full"
                onClick={() => setToAddress('')}
                style={{ height: '52px' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <GradientAvatar address={toAddress} style={{ width: '20px' }} />
                  <span className="text-black">{`0x${truncateAtMiddle(toAddress.substring(2), 10)}`}</span>
                </div>
                <CloseIcon size="sm" color="black" />
              </Card>
            ) : (
              <WrappedInput>
                <TextInput
                  value={toAddress}
                  onChange={(ev: SyntheticEvent) => setToAddress((ev.target as HTMLInputElement).value)}
                  placeholder="Ethereum Address (0x...)"
                  name="to-address"
                  className="text-black"
                  data-1p-ignore
                  controls={
                    <Button
                      size="xs"
                      shape="square"
                      label="Paste"
                      onClick={handlePaste}
                      data-id="to-address"
                      className="shrink-0 text-black bg-black/5"
                      leftIcon={CopyIcon}
                    />
                  }
                />
              </WrappedInput>
            )}
          </div>

          <div className="grid grid-cols-1 grid-rows-1 justify-center items-center min-h-[3rem]">
            {isCheckingFeeOptions ? (
              <div className="flex-shrink-0 rounded-md bg-black/50 flex items-center justify-center w-full col-start-1 row-start-1  min-h-[3rem]">
                <Spinner className="text-white" />
              </div>
            ) : (
              <Button
                className="flex-shrink-0 rounded-md bg-black w-full text-white col-start-1 row-start-1  min-h-[3rem]"
                width="full"
                variant="primary"
                type="submit"
                disabled={!isNonZeroAmount || !isEthAddress(toAddress) || insufficientFunds}
                label="Send"
                leftIcon={SendIcon}
              />
            )}
          </div>
        </div>
      )}

      {showConfirmation && (
        <TransactionConfirmation
          name={name}
          symbol={symbol}
          imageUrl={imageUrl}
          amount={amountToSendFormatted}
          toAddress={toAddress}
          chainId={chainId}
          balance={balance.balance || '0'}
          decimals={decimals}
          fiatValue={amountToSendFiat}
          feeOptions={{ options: feeOptions?.feeOptions || [], chainId }}
          onSelectFeeOption={setSelectedFeeTokenAddress}
          isLoading={isSendTxnPending}
          onConfirm={executeTransaction}
          onCancel={() => {
            setShowConfirmation(false)
          }}
        />
      )}
    </form>
  )
}
