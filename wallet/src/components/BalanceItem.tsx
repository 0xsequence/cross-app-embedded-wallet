import {
  ChevronRightIcon,
  Text,
  TokenImage,
  compareAddress,
  nativeTokenImageUrl
} from '@0xsequence/design-system'
import { TokenBalance } from '@0xsequence/indexer'
import { ChainId, networks } from '@0xsequence/network'
import { ethers } from 'ethers'

import { formatDisplay } from '../utils/helpers'

interface BalanceItemProps {
  balance: TokenBalance
}

export const BalanceItem = ({ balance }: BalanceItemProps) => {
  const isNativeToken = compareAddress(balance.contractAddress, ethers.ZeroAddress)
  const {
    name: nativeTokenName = 'Native Token',
    symbol: nativeTokenSymbol = '???',
    decimals: nativeTokenDecimals = 18
  } = networks[balance.chainId as ChainId].nativeToken

  const logoURI = isNativeToken ? nativeTokenImageUrl(balance.chainId) : balance?.contractInfo?.logoURI
  const tokenName = isNativeToken ? nativeTokenName : balance?.contractInfo?.name || 'Unknown'
  const symbol = isNativeToken ? nativeTokenSymbol : balance?.contractInfo?.symbol

  const getQuantity = () => {
    if (balance.contractType === 'ERC721' || balance.contractType === 'ERC1155') {
      return balance.uniqueCollectibles
    }
    const decimals = isNativeToken ? nativeTokenDecimals : balance?.contractInfo?.decimals
    const bal = ethers.formatUnits(balance.balance, decimals || 0)
    const displayBalance = formatDisplay(bal)
    const symbol = isNativeToken ? nativeTokenSymbol : balance?.contractInfo?.symbol

    return `${displayBalance} ${symbol}`
  }

  const onClick = () => {
    const isCollection = balance.contractType === 'ERC721' || balance.contractType === 'ERC1155'
    if (isCollection) {
      // collection details
    } else {
      // coin details
    }
  }

  return (
    <div
      className="flex w-full flex-row justify-between items-center select-none cursor-pointer"
      key={balance.contractAddress}
      onClick={onClick}
    >
      <div className="flex gap-3 flex-row items-center justify-center min-w-0">
        <TokenImage src={logoURI} symbol={symbol} size="md" withNetwork={balance.chainId} />
        <Text
          className="overflow-hidden whitespace-nowrap"
          variant="normal"
          color="text100"
          fontWeight="bold"
          ellipsis
        >
          {tokenName}
        </Text>
      </div>
      <div className="flex flex-row items-center justify-center gap-1 max-w-1/2">
        <Text
          className="text-right whitespace-nowrap"
          variant="normal"
          color="text50"
          fontWeight="bold"
          ellipsis
        >
          {getQuantity()}
        </Text>
        <ChevronRightIcon className="text-text50" />
      </div>
    </div>
  )
}
