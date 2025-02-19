import { Navigate, Route, Routes } from 'react-router'

import { AppLayout, ProtectedLayout } from './Layout'
import { Auth } from './pages/Auth'
// import { Home } from './pages/Home'
import { InventoryPage } from './pages/inventory/InventoryPage'
import { SendPage } from './pages/SendPage'
import { TransactionsPage } from './pages/TransactionsPage'
// import { ReceivePage } from './pages/ReceivePage'
import { ROUTES } from './routes'
import { DiscoverPage } from './pages/DiscoverPage'

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AppLayout />}>
        <Route path={ROUTES.AUTH} element={<Auth />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route index element={<InventoryPage />} />
        <Route path={ROUTES.SEND} element={<SendPage />} />
        <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
        {/* <Route path={ROUTES.HISTORY} element={<HistoryPage />} /> */}
        <Route path={ROUTES.DISCOVER} element={<DiscoverPage />} />
        <Route path={ROUTES.MARKET} element={<></>} />
      </Route>

      {/* Redirect unknown routes to index */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
