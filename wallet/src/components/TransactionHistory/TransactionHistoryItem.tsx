import { TokenPrice } from '@0xsequence/api'
import {
  Image,
  NetworkImage,
  Skeleton,
  Text,
  compareAddress,
  nativeTokenImageUrl
} from '@0xsequence/design-system'
import { Transaction, TxnTransfer, TxnTransferType } from '@0xsequence/indexer'
import { ChainId, networks } from '@0xsequence/network'
import dayjs from 'dayjs'
import { ethers } from 'ethers'

import { useCoinPrices, useExchangeRate } from '../../hooks/useCoinPrices'
import { useConfig, FiatCurrency } from '../../hooks/useConfig'
import { formatDisplay } from '../../utils/helpers'
import { getTransactionLabelByType } from './helpers/getTransactionLabelByType'
import { TransactionIconByType } from './TransactionIconByType'

interface TransactionHistoryItemProps {
  transaction: Transaction
  onClickTransaction: (transaction: Transaction) => void
}

export const TransactionHistoryItem = ({ transaction, onClickTransaction }: TransactionHistoryItemProps) => {
  const { fiatCurrency } = useConfig()

  const tokenContractAddresses: string[] = []

  transaction.transfers?.forEach(transfer => {
    const tokenContractAddress = transfer.contractAddress
    if (!tokenContractAddresses.includes(tokenContractAddress)) {
      tokenContractAddresses.push(tokenContractAddress)
    }
  })

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useCoinPrices(
    tokenContractAddresses.map(contractAddress => ({
      contractAddress,
      chainId: transaction.chainId
    }))
  )

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useExchangeRate(
    fiatCurrency.symbol
  )

  const isPending = isPendingCoinPrices || isPendingConversionRate

  const { transfers } = transaction

  return (
    <div
      className="bg-black/5 rounded-md p-4 gap-2 items-center justify-center flex flex-col cursor-pointer hover:opacity-80"
      onClick={() => onClickTransaction(transaction)}
    >
      {transfers?.map((transfer, position) => {
        return (
          <div key={`${transaction.txnHash}-${position}`} className="w-full">
            <Transfer
              isPending={isPending}
              fiatCurrency={fiatCurrency}
              conversionRate={conversionRate}
              coinPrices={coinPrices}
              transaction={transaction}
              transfer={transfer}
              isFirstItem={position === 0}
            />
          </div>
        )
      })}
    </div>
  )
}

interface TransferProps {
  isPending: boolean
  fiatCurrency: FiatCurrency
  conversionRate: number
  coinPrices: TokenPrice[]
  transaction: Transaction
  transfer: TxnTransfer
  isFirstItem: boolean
}
function Transfer({
  isPending,
  fiatCurrency,
  conversionRate,
  coinPrices,
  transaction,
  transfer,
  isFirstItem
}: TransferProps) {
  const { amounts } = transfer
  const date = dayjs(transaction.timestamp).format('MMM DD, YYYY')
  return (
    <div className="flex flex-col gap-2 w-full justify-between">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-1 justify-center items-center text-gray-500">
          <TransactionIconByType transferType={transfer.transferType} />
          <Text variant="normal" fontWeight="medium" className="text-gray-900">
            {getTransactionLabelByType(transfer.transferType)}
          </Text>
          <NetworkImage chainId={transaction.chainId} size="xs" />
        </div>
        {isFirstItem && (
          <div>
            <Text variant="normal" fontWeight="medium" className="text-gray-500">
              {date}
            </Text>
          </div>
        )}
      </div>
      {amounts.map((amount, index) => {
        const { symbol: nativeTokenSymbol = '???', decimals: nativeTokenDecimals = 18 } =
          networks[transaction.chainId as ChainId].nativeToken
        const isNativeToken = compareAddress(transfer.contractAddress, ethers.ZeroAddress)
        const isCollectible =
          transfer.contractInfo?.type === 'ERC721' || transfer.contractInfo?.type === 'ERC1155'
        let decimals
        const tokenId = transfer.tokenIds?.[index]
        if (isCollectible && tokenId) {
          decimals = transfer.tokenMetadata?.[tokenId]?.decimals || 0
        } else {
          decimals = isNativeToken ? nativeTokenDecimals : transfer.contractInfo?.decimals
        }
        const amountValue = ethers.formatUnits(amount, decimals)
        const symbol = isNativeToken ? nativeTokenSymbol : transfer.contractInfo?.symbol || ''
        const tokenLogoUri = isNativeToken
          ? nativeTokenImageUrl(transaction.chainId)
          : transfer.contractInfo?.logoURI

        const fiatConversionRate = coinPrices.find((coinPrice: TokenPrice) =>
          compareAddress(coinPrice.token.contractAddress, transfer.contractAddress)
        )?.price?.value

        return (
          <div key={index} className="flex flex-row justify-between">
            <div className="flex flex-row gap-2 justify-center items-center">
              {tokenLogoUri && <Image src={tokenLogoUri} className="size-6" alt="token logo" />}
              <TransferAmountLabel
                amount={formatDisplay(amountValue)}
                symbol={symbol}
                transferType={transfer.transferType}
              />
            </div>
            {isPending && <Skeleton className="w-9 h-5" />}
            {fiatConversionRate && (
              <Text variant="normal" fontWeight="medium" className="text-gray-500">
                {`${fiatCurrency.sign}${(Number(amountValue) * fiatConversionRate * conversionRate).toFixed(
                  2
                )}`}
              </Text>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TransferAmountLabel({
  amount,
  symbol,
  transferType
}: {
  amount: string
  symbol: string
  transferType: TxnTransferType
}) {
  let sign = ''
  if (transferType === TxnTransferType.SEND) {
    sign = '-'
  } else if (transferType === TxnTransferType.RECEIVE) {
    sign = '+'
  }

  return (
    <Text
      variant="normal"
      fontWeight="bold"
      data-transfer-type={transferType}
      className="data-[transfer-type='SEND']:text-red-500 text-black data-[transfer-type='RECEIVE']:text-green-700"
    >{`${sign}${amount} ${symbol}`}</Text>
  )
}
