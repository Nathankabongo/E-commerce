'use client';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, ShieldCheck, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

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
            <Link href="/orders" className="nav-link" aria-label="Commandes">
              <Package size={22} />
              <span>Commandes</span>
            </Link>
            <span style={{color: 'var(--accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <User size={18} /> {user.name}
            </span>
            <button onClick={logout} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }}>
              <LogOut size={16} /> 
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/login" className="btn btn-glow">
              Connexion
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Inscription
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
