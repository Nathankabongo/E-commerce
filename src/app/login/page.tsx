'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Lock, Mail, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // In a real app, CSRF header is needed for login too
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        setError("Identifiants invalides ou erreur système.");
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOAuth = () => {
    // Simulate OAuth redirect
    window.location.href = '/api/auth/github';
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="form-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Lock color="var(--primary)" size={28} />
          </div>
          <h1 style={{ fontSize: '1.8rem' }}>Connexion Sécurisée</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Accédez à votre espace E-commerce</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
          </div>
          
          <button type="submit" className="btn btn-glow" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }}></div>
          <span style={{ margin: '0 1rem', fontSize: '0.9rem' }}>OU</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }}></div>
        </div>

        <button onClick={handleOAuth} className="btn btn-secondary" style={{ width: '100%', padding: '0.8rem' }}>
          <Github size={20} />
          Se connecter avec GitHub
        </button>
      </div>
    </div>
  );
}
