import { Image, Modal } from '@0xsequence/design-system'
import { Link, NavLink, Outlet } from 'react-router'

import { AccountMenu } from './components/AccountMenu'
import { PrivateRoute } from './components/PrivateRoute'
import { ExploreIcon, InventoryIcon, TransactionIcon } from './design-system-patch/icons'
import { isPublicRoute, ROUTES } from './routes'
import { useEffect, useState } from 'react'
import { WalletConnectModal } from './pages/WalletConnectModal'
import { useWalletConnect } from './context/WalletConnectContext'

const PROJECT_HEADER_LOGO = import.meta.env.VITE_PROJECT_HEADER_LOGO

const AppHeader = () => {
  return (
    <div className="bg-background-raised backdrop-blur-md w-full border-b border-black/20 text-black">
      <header className="flex flex-row gap-4 px-6  items-center justify-between min-h-[4.5rem] text-style-normal font-bold w-full max-w-screen-xl mx-auto">
        {PROJECT_HEADER_LOGO && (
          <Link to={ROUTES.INVENTORY}>
            <Image src={PROJECT_HEADER_LOGO} className="max-w-[96px] sm:max-w-[128px] transition-all" />
          </Link>
        )}
        <nav className="flex-row gap-10 h-full justify-center md:flex hidden mx-auto flex-shrink-0 absolute left-[50%] translate-x-[-50%] -mb-[2px]">
          <NavLink
            to={ROUTES.INVENTORY}
            className="flex items-center gap-2 border-b-3 border-b-transparent aria-[current='page']:border-b-black self-stretch "
          >
            <InventoryIcon className="size-4.5" />
            Inventory
          </NavLink>
          <NavLink
            to={ROUTES.DISCOVER}
            className="flex items-center gap-2 border-b-3 border-b-transparent aria-[current='page']:border-b-black self-stretch "
          >
            <ExploreIcon className="size-4.5" />
            Discover
          </NavLink>
          <NavLink
            to={ROUTES.HISTORY}
            className="flex items-center gap-2 border-b-3 border-b-transparent aria-[current='page']:border-b-black self-stretch"
          >
            <TransactionIcon className="size-4.5" />
            History
          </NavLink>
        </nav>
        <AccountMenu />
      </header>
    </div>
  )
}

export const AppLayout = ({ showHeader = false }: { showHeader?: boolean }) => {
  const style = {
    '--background': `url(${import.meta.env.VITE_PROJECT_BACKGROUND})`
  } as React.CSSProperties
  const isPopup = window.opener !== null
  const { connectionHandler, signMessageHandler, transactionHandler } = useWalletConnect()
  const [walletConnectModalOpen, setWalletConnectModalOpen] = useState(false)
  const { connectionRequest, isConnectionHandlerRegistered } = connectionHandler
  const { transactionRequest, isSendingTxn, isTransactionHandlerRegistered } = transactionHandler
  const { signRequest, isSigningMessage, isSignHandlerRegistered } = signMessageHandler
  const allHandlersRegistered =
    isConnectionHandlerRegistered && isTransactionHandlerRegistered && isSignHandlerRegistered

  const sendInProgress = isSendingTxn || isSigningMessage

  useEffect(() => {
    if (isPopup) return

    setWalletConnectModalOpen(!!connectionRequest || !!transactionRequest || !!signRequest)
  }, [allHandlersRegistered, connectionRequest, isPopup, sendInProgress, signRequest, transactionRequest])

  return (
    <div
      className="flex flex-col flex-1 [background-image:var(--background)] bg-cover bg-no-repeat"
      style={style}
    >
      {showHeader && <AppHeader />}
      <div className="flex flex-col flex-1">
        <Outlet />

        {walletConnectModalOpen && (
          <Modal
            title
            contentProps={{
              style: {
                maxWidth: '400px',
                minHeight: '600px',
                padding: 0,
                height: 'fit-content',
                scrollbarColor: 'gray white',
                scrollbarWidth: 'thin'
              }
            }}
            scroll={false}
            onClose={() => {
              setWalletConnectModalOpen(false)
            }}
          >
            <WalletConnectModal />
          </Modal>
        )}
      </div>
      <nav
        data-is-popup={isPopup}
        className="flex data-[is-popup='true']:hidden md:hidden mt-auto mb-0 gap-2 justify-around w-full sticky text-black bottom-0 bg-white/80 backdrop-blur-xl p-1 shadow-[0_-1px_3px_-1.5px_theme(color.black/10%)]"
        style={{ display: isPublicRoute(window.location.pathname) ? 'none' : undefined }}
      >
        <NavLink
          to={ROUTES.INVENTORY}
          className="flex flex-col items-center text-xs flex-1 gap-1 font-medium aria-[current='page']:font-semibold aria-[current='page']:bg-black/10 py-3 px-4 rounded-md self-stretch"
        >
          <InventoryIcon className="size-4" />
          Inventory
        </NavLink>
        <NavLink
          to={ROUTES.DISCOVER}
          className="flex flex-col items-center text-xs gap-1  flex-1 font-medium aria-[current='page']:font-semibold aria-[current='page']:bg-black/10 py-3 px-4 rounded-md self-stretch "
        >
          <ExploreIcon className="size-4" />
          Discover
        </NavLink>
        <NavLink
          to={ROUTES.HISTORY}
          className="flex flex-col items-center text-xs gap-1 flex-1 font-medium aria-[current='page']:font-semibold aria-[current='page']:bg-black/10 py-3 px-4 rounded-md self-stretch disabled:opacity-45"
        >
          <TransactionIcon className="size-4" />
          Market
        </NavLink>
      </nav>
    </div>
  )
}

export const ProtectedLayout = () => {
  return (
    <PrivateRoute>
      <AppLayout showHeader />
    </PrivateRoute>
  )
}
