import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shops from './pages/Shops';
import Recipes from './pages/Recipes';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shops" element={<Shops />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
