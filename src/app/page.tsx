'use client';
import { ShoppingCart, Shield, Lock, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Laptop SecurOS Ultra', price: 1299.99, icon: Cpu, desc: 'Haute performance. Chiffrement disque natif et puce TPM 2.0.' },
  { id: 2, name: 'Casque Audio SecureSound', price: 249.99, icon: Shield, desc: 'Réduction de bruit active, communications chiffrées de bout en bout.' },
  { id: 3, name: 'Clé USB Cryptée 256Go', price: 89.99, icon: Lock, desc: 'Chiffrement matériel AES-256 bits avec clavier physique intégré.' },
  { id: 4, name: 'Serveur NAS Domestique', price: 450.00, icon: HardDrive, desc: 'Stockage privé ultra-sécurisé avec configuration RAID 1 et accès VPN.' },
];

export default function Home() {
  const [msg, setMsg] = useState('');

  const addToCart = (product: any) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      // In a real app, we group by ID to add quantity. Here we just push.
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));
      setMsg(`${product.name} ajouté au panier !`);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      console.error("Erreur lors de l'ajout au panier", e);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header className="page-header">
        <h1>Protégez votre vie numérique</h1>
        <p>Découvrez notre sélection de matériel hautement sécurisé conçu pour les professionnels exigeants.</p>
      </header>
      
      {msg && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          {msg}
        </div>
      )}

      <div className="product-grid">
        {PRODUCTS.map(p => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="card">
              <div style={{ 
                background: 'rgba(139, 92, 246, 0.1)', 
                width: '3rem', height: '3rem', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.5rem'
              }}>
                <Icon color="var(--primary)" size={24} />
              </div>
              <h2 className="product-title">{p.name}</h2>
              <p style={{ color: 'var(--text-muted)', flex: 1, lineHeight: 1.6 }}>{p.desc}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
                <span className="product-price">{p.price.toFixed(2)} €</span>
                <button className="btn" onClick={() => addToCart(p)} aria-label="Ajouter au panier">
                  <ShoppingCart size={18} /> Ajouter
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
