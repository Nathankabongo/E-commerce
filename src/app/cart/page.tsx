'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, ShieldCheck, AlertTriangle, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Carte Bancaire');
  const router = useRouter();

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(c);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    let newCart = [...cart];
    const index = newCart.findIndex(item => item.id === id);
    if (index !== -1) {
      newCart[index].quantity = (newCart[index].quantity || 1) + delta;
      if (newCart[index].quantity <= 0) {
        newCart.splice(index, 1);
      }
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeItem = (id: number) => {
    let newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const checkout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || '';
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({ items: cart, paymentMethod })
      });

      if (res.ok) {
        alert('Commande validée avec succès ! Vous allez être redirigé vers le suivi de votre commande.');
        localStorage.removeItem('cart');
        setCart([]);
        router.push('/orders');
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
              <div key={i} className="cart-item" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 500, display: 'block' }}>{item.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.price.toLocaleString('fr-CD')} FC l'unité</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '0.5rem' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', padding: '0.2rem' }}>
                      <Minus size={16} />
                    </button>
                    <span style={{ minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', padding: '0.2rem' }}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="product-price" style={{ fontSize: '1.25rem', minWidth: '120px', textAlign: 'right' }}>
                    {((item.quantity || 1) * item.price).toLocaleString('fr-CD')} FC
                  </span>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.5rem' }} title="Supprimer">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--card-bg)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--primary)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
              <CreditCard size={24} color="var(--primary)" />
              <div style={{ flex: 1 }}>
                <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mode de paiement</label>
                <select 
                  id="paymentMethod" 
                  className="form-input" 
                  style={{ width: '100%', maxWidth: '300px' }}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Carte Bancaire">Carte Bancaire (Sécurisé 3D Secure)</option>
                  <option value="Mobile Money (M-Pesa)">Mobile Money (M-Pesa)</option>
                  <option value="Mobile Money (Airtel)">Mobile Money (Airtel Money)</option>
                  <option value="Crypto (Bitcoin/USDT)">Crypto (Bitcoin/USDT)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total à payer</div>
                <div style={{ fontSize: '2rem' }}><strong className="product-price">{total.toLocaleString('fr-CD')} FC</strong></div>
              </div>
              <button className="btn btn-glow" onClick={checkout} disabled={loading} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                {loading ? 'Traitement...' : 'Payer la commande'} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
