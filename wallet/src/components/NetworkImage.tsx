import { NetworkImage as DesignSystemNetworkImage, Tooltip } from '@0xsequence/design-system';
import { NetworkType, allNetworks } from '@0xsequence/network'

export const NetworkImage = ({
  chainId,
  size = 'md',
  disableAnimation = true,
  shouldShowTooltip
}: {
  chainId: number
  size?: 'sm' | 'md' | 'lg' | 'xs'
  disableAnimation?: boolean
  shouldShowTooltip?: boolean
}) => {
  const chain = allNetworks.find(c => c.chainId === chainId)

  return (
    (<NetworkImageWrapper chainId={chainId} shouldShowTooltip={shouldShowTooltip}>
      <DesignSystemNetworkImage chainId={chainId} disableAnimation={disableAnimation} size={size} />
      {chain?.type === NetworkType.TESTNET && (
        <div
          className="absolute bg-warning w-2 h-2 rounded-full"
          style={{
            border: '2px solid #1a1a1a',
            left: '-2px',
            top: '-2px'
          }} />
      )}
    </NetworkImageWrapper>)
  );
}

export const NetworkImageWrapper = ({
  children,
  chainId,
  shouldShowTooltip = false
}: {
  children: React.ReactNode
  chainId: number
  shouldShowTooltip?: boolean
}) => {
  const network = allNetworks.find(c => c.chainId === chainId)

  const networkTitle = network?.title || network?.name || 'Unknown Network'
  if (shouldShowTooltip) {
    return (
      (<Tooltip message={`${networkTitle}${network?.testnet ? ' (Testnet)' : ''}`} vOffset={2}>
        <div className="relative w-fit h-fit bg-transparent">
          {children}
        </div>
      </Tooltip>)
    );
  }
  return (
    (<div className="relative w-fit h-fit bg-transparent">
      {children}
    </div>)
  );
}
