'use client';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || '';
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: { 'x-csrf-token': csrfToken }
      });
      setUser(null);
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="navbar">
      <Link href="/" className="nav-link" style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--text-color)' }}>
        <ShieldCheck color="var(--primary)" size={28} />
        SecureShop
      </Link>
      
      <div className="nav-links">
        <Link href="/cart" className="nav-link" aria-label="Panier">
          <ShoppingCart size={22} />
          <span>Panier</span>
        </Link>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--card-border)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
            <span style={{color: 'var(--accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <User size={18} /> {user.name}
            </span>
            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }}>
              <LogOut size={16} /> 
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn btn-glow">
            <User size={18} /> Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}
