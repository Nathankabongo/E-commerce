'use client';
import { ShoppingCart, Shield, Lock, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Laptop SecurOS Ultra', price: 3899970, image: '/images/laptop.png', desc: 'Haute performance. Chiffrement disque natif et puce TPM 2.0.' },
  { id: 2, name: 'Casque Audio SecureSound', price: 749970, image: '/images/casque.png', desc: 'Réduction de bruit active, communications chiffrées de bout en bout.' },
  { id: 3, name: 'Clé USB Cryptée 256Go', price: 269970, image: '/images/usb.png', desc: 'Chiffrement matériel AES-256 bits avec clavier physique intégré.' },
  { id: 4, name: 'Serveur NAS Domestique', price: 1350000, image: '/images/nas.png', desc: 'Stockage privé ultra-sécurisé avec configuration RAID 1 et accès VPN.' },
  { id: 5, name: 'Switch Réseau Gigabit Sécurisé', price: 120000, image: '/images/switch.png', desc: 'Switch 8 ports avec protection contre les attaques ARP spoofing.' },
  { id: 6, name: 'Répéteur WiFi Longue Portée', price: 85000, image: '/images/router.png', desc: 'Extension de réseau avec chiffrement WPA3 obligatoire.' },
];

export default function Home() {
  const [msg, setMsg] = useState('');

  const addToCart = (product: any) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
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
          return (
            <div key={p.id} className="card">
              <div style={{ 
                width: '100%', height: '220px', 
                borderRadius: '8px', 
                overflow: 'hidden',
                marginBottom: '1rem',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}>
                <img src={p.image} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <h2 className="product-title">{p.name}</h2>
              <p style={{ color: 'var(--text-muted)', flex: 1, lineHeight: 1.6 }}>{p.desc}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
                <span className="product-price">{p.price.toLocaleString('fr-CD')} FC</span>
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
