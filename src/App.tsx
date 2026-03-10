import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shops from './pages/Shops';
import Recipes from './pages/Recipes';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            padding: '12px 16px',
            color: '#363636',
            borderRadius: '12px',
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontSize: '14px',
            maxWidth: '90vw',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shops" element={<Shops />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="profile" element={<AuthGuard><Profile /></AuthGuard>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
