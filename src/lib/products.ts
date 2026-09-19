/**
 * Catalogue officiel des produits — SOURCE DE VÉRITÉ CÔTÉ SERVEUR
 *
 * ⚠️  Les prix NE doivent JAMAIS être lus depuis la requête client.
 *      Un attaquant peut modifier n'importe quelle valeur du body JSON
 *      (ex : "price":0) comme le montre l'image Burp Suite.
 *
 * Ce fichier est la SEULE référence de prix utilisée pour les commandes.
 * Le frontend affiche ces prix mais ne peut pas les modifier.
 */

export interface Product {
  id: number;
  name: string;
  price: number; // en Francs Congolais (FC)
  image: string;
  desc: string;
}

// Catalogue synchronisé avec src/app/page.tsx
export const PRODUCT_CATALOG: ReadonlyMap<number, Product> = new Map([
  [1, { id: 1, name: 'Laptop SecurOS Ultra',          price: 3899970, image: '/images/laptop.png',  desc: 'Haute performance. Chiffrement disque natif et puce TPM 2.0.' }],
  [2, { id: 2, name: 'Casque Audio SecureSound',       price: 749970,  image: '/images/casque.png',  desc: 'Réduction de bruit active, communications chiffrées de bout en bout.' }],
  [3, { id: 3, name: 'Clé USB Cryptée 256Go',          price: 269970,  image: '/images/usb.png',     desc: 'Chiffrement matériel AES-256 bits avec clavier physique intégré.' }],
  [4, { id: 4, name: 'Serveur NAS Domestique',         price: 1350000, image: '/images/nas.png',     desc: 'Stockage privé ultra-sécurisé avec configuration RAID 1 et accès VPN.' }],
  [5, { id: 5, name: 'Switch Réseau Gigabit Sécurisé', price: 120000,  image: '/images/switch.png',  desc: 'Switch 8 ports avec protection contre les attaques ARP spoofing.' }],
  [6, { id: 6, name: 'Répéteur WiFi Longue Portée',    price: 85000,   image: '/images/router.png',  desc: 'Extension de réseau avec chiffrement WPA3 obligatoire.' }],
]);

/** Quantité maximale autorisée par article (anti-abus) */
export const MAX_QUANTITY_PER_ITEM = 10;

/** Nombre maximum d'articles différents dans une commande */
export const MAX_ITEMS_IN_ORDER = 20;

/**
 * Récupère le prix officiel d'un produit par son ID.
 * Retourne null si le produit est inconnu.
 */
export function getOfficialPrice(productId: number): number | null {
  return PRODUCT_CATALOG.get(productId)?.price ?? null;
}

/**
 * Récupère les informations complètes d'un produit.
 */
export function getProduct(productId: number): Product | null {
  return PRODUCT_CATALOG.get(productId) ?? null;
}
