'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || '';
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({ name, email, password })
      });

      if (res.ok) {
        await refreshUser();
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="form-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <ShieldCheck color="var(--primary)" size={28} />
          </div>
          <h1 style={{ fontSize: '1.8rem' }}>Créer un compte</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Rejoignez notre plateforme sécurisée</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                id="name" 
                className="form-input" 
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                id="email" 
                className="form-input" 
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                style={{ width: '100%', paddingLeft: '3rem' }}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Le mot de passe doit contenir au moins 8 caractères.
            </p>
          </div>
          
          <button type="submit" className="btn btn-glow" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Création en cours...' : 'S\'inscrire'}
          </button>
        </form>
      </div>
    </div>
  );
}
