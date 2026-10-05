import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import AuthForm from './pages/AuthForm.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewPlan from './pages/NewPlan.jsx';
import PlanDetail from './pages/PlanDetail.jsx';
import Compare from './pages/Compare.jsx';

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/register" element={<AuthForm mode="register" />} />
          <Route path="/dashboard" element={guard(<Dashboard />)} />
          <Route path="/new" element={guard(<NewPlan />)} />
          <Route path="/plans/:id" element={guard(<PlanDetail />)} />
          <Route path="/compare" element={guard(<Compare />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
