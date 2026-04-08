import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import store from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import StockManagement from './pages/StockManagement';
import SupplierManagement from './pages/SupplierManagement';
import DayEndReporting from './pages/DayEndReporting';
import GoodsReceivedVoucher from './pages/GoodsReceivedVoucher';
import ResponsiveLayout from './components/shared/ResponsiveLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

const App = () => {
  console.log('App component mounted');

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/auth" element={<Auth />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={
                    <ResponsiveLayout>
                      <Home />
                    </ResponsiveLayout>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ResponsiveLayout>
                      <Orders />
                    </ResponsiveLayout>
                  }
                />
                <Route
                  path="/tables"
                  element={
                    <ResponsiveLayout>
                      <Tables />
                    </ResponsiveLayout>
                  }
                />
                <Route
                  path="/menu"
                  element={
                    <ResponsiveLayout>
                      <Menu />
                    </ResponsiveLayout>
                  }
                />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route
                  path="/inventory"
                  element={
                    <ResponsiveLayout>
                      <StockManagement />
                    </ResponsiveLayout>
                  }
                />
                <Route
                  path="/suppliers"
                  element={
                    <ResponsiveLayout>
                      <SupplierManagement />
                    </ResponsiveLayout>
                  }
                />
                <Route
                  path="/grv"
                  element={
                    <ResponsiveLayout>
                      <GoodsReceivedVoucher />
                    </ResponsiveLayout>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ResponsiveLayout>
                      <DayEndReporting />
                    </ResponsiveLayout>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
