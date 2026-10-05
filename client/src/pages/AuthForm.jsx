import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';
import Alert from '../components/Alert.jsx';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-1 text-muted">{isRegister ? 'Save plans and come back to them any time.' : 'Log in to see your saved plans.'}</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Alert>{error}</Alert>
        {isRegister && (
          <div><label className="label" htmlFor="name">Name</label><input id="name" className="input" value={form.name} onChange={set('name')} required autoComplete="name" /></div>
        )}
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" value={form.email} onChange={set('email')} required autoComplete="email" /></div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} autoComplete={isRegister ? 'new-password' : 'current-password'} />
          {isRegister && <p className="hint">At least 6 characters.</p>}
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isRegister ? 'Already have an account? ' : 'New here? '}
        <Link className="font-semibold text-pine hover:underline" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link>
      </p>
    </div>
  );
}
