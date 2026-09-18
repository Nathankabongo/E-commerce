'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Chargement...</div>;
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header className="page-header">
        <h1>Suivi des Commandes</h1>
        <p>Retrouvez l'historique de vos achats et suivez vos livraisons.</p>
      </header>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>Aucune commande</h2>
          <p>Vous n'avez pas encore passé de commande.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order, idx) => (
            <div key={order.id} className="card" style={{ padding: '0', overflow: 'hidden', border: idx === 0 ? '1px solid var(--primary)' : '1px solid var(--card-border)' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Commande #{order.id}</div>
                  <div style={{ fontWeight: 600 }}>Effectuée le {new Date(order.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Moyen de paiement</div>
                  <div style={{ fontWeight: 600 }}>{order.paymentMethod}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total</div>
                  <div className="product-price" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{order.total.toLocaleString('fr-CD')} FC</div>
                </div>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={20} color="var(--accent)" /> Statut de la Livraison
                  </h3>
                  
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {order.status === 'En cours de préparation' ? <Clock size={24} color="var(--primary)" /> : <CheckCircle2 size={24} color="#10b981" />}
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.2rem' }}>{order.status}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Temps de livraison estimé : <strong>{order.deliveryDays} jours ouvrés</strong>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={14} color="#10b981" /> Livraison sécurisée et cryptée
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ flex: '2 1 400px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Articles ({order.items.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {order.items.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '0.5rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qté: {item.quantity || 1}</div>
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {((item.quantity || 1) * item.price).toLocaleString('fr-CD')} FC
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
