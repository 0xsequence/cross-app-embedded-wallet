import { NetworkImage, Modal, Image, TokenImage, Collapsible, nativeTokenImageUrl } from '@0xsequence/design-system'
import { SendIcon } from '../../../design-system-patch/icons'
import { useInventory } from '../helpers/use-inventory'
import { TokenTileProps, TokenTypeProps } from '../types'

export function TokenDetailModal() {
  const { showInventoryItem, setShowInventoryItem, contractInfo } = useInventory()

  if (!showInventoryItem) {
    return null
  }

  const { contractAddress, tokenId } = showInventoryItem

  const item = contractInfo(contractAddress, tokenId)

  return (
    <>
      {item && (
        <Modal scroll={false} autoHeight onClose={() => setShowInventoryItem(false)} className="bg-white">
          <TokenDetails item={item} />
        </Modal>
      )}
    </>
  )
}

function TokenDetails({ item }: { item: TokenTypeProps }) {
  if (!item) {
    return null
  }

  // Implementation
  switch (item?.tokenClass) {
    case 'nativeBalance':
    case 'erc20':
      return <CoinDetails {...item} />
    case 'collectable':
      return <TokenDetailsCollectable {...item} />
    default:
      return null
  }
}

function CoinDetails(props: TokenTypeProps) {
  const style = {
    '--background': `url(${import.meta.env.VITE_PROJECT_BACKGROUND})`
  } as React.CSSProperties

  const { tokenMetadata, chainId, chain, contractInfo } = props
  const logoURI = contractInfo?.logoURI || nativeTokenImageUrl(props.chainId)

  return (
    <div className="w-full flex flex-col gap-6 p-6 text-black">
      <div
        className="py-8 h-[240px] [background-image:var(--background)] bg-cover bg-center rounded-sm"
        style={style}
      >
        <div className='grid gap-2 place-items-center'>
          <TokenImage src={logoURI} size="xl" withNetwork={chainId} />
          <p className='flex-1 text-style-lg font-bold'>3.976812 USDC.e</p>
          <span className="inline-flex mx-auto items-center gap-2 font-bold text-[9px] bg-black/10 px-1.25 py-1 rounded-xs">
            <NetworkImage chainId={chainId} size="xs" /> {chain?.title || props?.title}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-center justify-center">
        <div className='grid justify-items-start gap-2 '>
          <span className="text-seq-grey-500 text-xs font-bold">Balance</span>
          <div className="w-full flex items-center gap-2">
            <TokenImage className='h-7 w-7' src={logoURI} size="xl" withNetwork={chainId} />
            <p className='flex-1 text-start text-style-lg font-bold'>3.976812 USDC.e</p>
            <p className='text-style-sm font-bold text-seq-grey-500'>$5.67</p>
          </div>
        </div>
        <span className="text-xl font-bold">{tokenMetadata?.name}</span>
      </div>
      <button className="bg-black text-white rounded-full flex items-center justify-center gap-2 text-sm font-bold h-12 p-4">
        <SendIcon />
        Send
      </button>
      <Collapsible label="Details" className='bg-gray-300'>
        <div className="text-seq-grey-500 text-xs font-bold">{contractInfo?.extensions?.description}</div>
      </Collapsible>
    </div>
  )
}

function TokenDetailsCollectable(props: TokenTileProps) {
  const style = {
    '--background': `url(${import.meta.env.VITE_PROJECT_BACKGROUND})`
  } as React.CSSProperties

  const { tokenMetadata, chainId, chain, contractInfo } = props

  return (
    <div className="w-full flex flex-col text-black py-12 px-6">
      <div
        className="flex items-center justify-center h-[300px] [background-image:var(--background)] bg-cover bg-center rounded-sm"
        style={style}
      >
        <Image src={tokenMetadata?.image} className="max-w-[300px] aspect-square" />
      </div>
      <div className="p-6 flex flex-col gap-1 text-center justify-center">
        <span className="text-xl font-bold">{tokenMetadata?.name}</span>
        <span className="inline-flex mx-auto items-center gap-2 font-bold text-[9px] bg-black/10 px-1.25 py-1 rounded-xs">
          <NetworkImage chainId={chainId} size="xs" /> {chain?.title}
        </span>
      </div>
      <div className='grid gap-2'>
        <button className="bg-black text-white rounded-full flex items-center justify-center gap-2 text-sm font-bold min-h-[3rem] py-2 px-3">
          <SendIcon />
          Send
        </button>

        <Collapsible label="Details" className='bg-gray-300'>
          <span className="text-seq-grey-500 text-xs font-bold">{contractInfo?.extensions?.description}</span>
        </Collapsible>
      </div>
    </div>
  )
}
