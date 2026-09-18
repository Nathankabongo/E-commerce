'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(c);
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    } catch (e) {
      console.error(e);
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const checkout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || '';
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({ items: cart })
      });

      if (res.ok) {
        alert('Commande validée de manière sécurisée ! (Simulation)');
        localStorage.removeItem('cart');
        setCart([]);
      } else {
        const err = await res.json();
        setError(err.error || 'Erreur lors de la validation.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header className="page-header">
        <h1>Votre Panier</h1>
        <p>Vérifiez vos articles avant de finaliser la commande sécurisée.</p>
      </header>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      
      {cart.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>Votre panier est vide</h2>
          <p>Naviguez vers le catalogue pour découvrir nos solutions.</p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {cart.map((item, i) => (
              <div key={i} className="cart-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                    <ShieldCheck size={24} color="var(--accent)" />
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{item.name}</span>
                </div>
                <span className="product-price" style={{ fontSize: '1.25rem' }}>{item.price.toFixed(2)} €</span>
              </div>
            ))}
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '2rem', 
            padding: '2rem', 
            background: 'var(--card-bg)', 
            borderRadius: '1.25rem', 
            border: '1px solid var(--primary)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)'
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total à payer</div>
              <div style={{ fontSize: '2rem' }}><strong className="product-price">{total.toFixed(2)} €</strong></div>
            </div>
            <button className="btn btn-glow" onClick={checkout} disabled={loading} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              {loading ? 'Traitement...' : 'Valider la commande'} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
