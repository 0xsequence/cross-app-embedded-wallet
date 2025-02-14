import { Image, Text, useMediaQuery } from '@0xsequence/design-system'
import { Link, Outlet } from 'react-router'

import { AccountMenu } from './components/AccountMenu'
import { PoweredBySequence } from './components/PoweredBySequence'
import { PrivateRoute } from './components/PrivateRoute'
import { ROUTES } from './routes'

const PROJECT_SMALL_LOGO = import.meta.env.VITE_PROJECT_SMALL_LOGO

const AppHeader = () => {
  const isDesktop = useMediaQuery('isDesktop')
  return (
    <div className="flex flex-row gap-4 bg-background-raised backdrop-blur-md p-4 items-center justify-between">
      {PROJECT_SMALL_LOGO && (
        <Link to={ROUTES.HOME}>
          <Image src={PROJECT_SMALL_LOGO} style={{ width: '30px', height: '30px' }} />
        </Link>
      )}
      {isDesktop && (
        <>
          <div className="flex grow flex-row gap-10 justify-center">
            <Link to={ROUTES.INVENTORY}>
              <Text variant="large" color="text100" fontWeight="bold">
                Inventory
              </Text>
            </Link>
            <Link to={ROUTES.DISCOVER}>
              <Text variant="large" color="text100" fontWeight="bold">
                Discover
              </Text>
            </Link>
            <Link to={ROUTES.MARKET}>
              <Text variant="large" color="text100" fontWeight="bold">
                Market
              </Text>
            </Link>
          </div>
          <AccountMenu />
        </>
      )}
    </div>
  )
}

export const AppLayout = ({ showHeader = false }: { showHeader?: boolean }) => {
  return (
    <div className="min-h-screen relative pb-14">
      {showHeader && <AppHeader />}
      <Outlet />
      <PoweredBySequence />
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
