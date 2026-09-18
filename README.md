# PROJET DE PROTOCOLES DE SÉCURITÉ RÉSEAU

## GROUPE 02 — E-COMMERCE

### Thème du projet
Boutique e-commerce avec authentification et panier sécurisés

### Membres du groupe
1. **KABONGO MUKOLA NATHAN** — Frontend & sécurité côté client
2. **LOSONGO KINGOMBE VICTOR** — Backend & authentification
3. **JULIETTE** — E-commerce & panier

---

## 1. Objectifs
Concevoir, développer et déployer une application web démontrant concrètement l’utilisation de protocoles de sécurité réseau ou de mécanismes cryptographiques. L'application est une simulation de e-commerce où la priorité absolue est la sécurité des échanges et de l'identité.

## 2. Architecture Globale
L'application repose sur une architecture moderne Full-Stack (Next.js) :
- **Frontend** : Composants React sécurisés (validation des entrées, échappement XSS par défaut, requêtes authentifiées).
- **Backend (API REST)** : Middleware de sécurité strict, routes API protégées, génération de JWT.
- **Stockage** : Démonstration sans base de données persistante pour des raisons d'anonymat, avec simulation en mémoire/localStorage côté client.

## 3. Protocoles et Mécanismes de Sécurité Choisis

1. **HTTPS/TLS** : Imposé sur toute l'application via le déploiement sur Vercel. Empêche l'interception des données (Man-in-the-Middle).
2. **OAuth 2.0 / OpenID Connect** : Délégation de l'authentification à un fournisseur tiers (GitHub) via la route `/api/auth/github`. Ne stocke aucun mot de passe utilisateur.
3. **JWT à courte durée** : Signé cryptographiquement avec `jose` (HMAC SHA-256). Valable 1 heure pour réduire la fenêtre d'attaque en cas de vol de session.
4. **Cookies Sécurisés** : Le JWT est placé dans un cookie avec les attributs :
   - `Secure` : Transmis uniquement sur HTTPS.
   - `HttpOnly` : Impossible à lire via JavaScript (protection contre XSS).
   - `SameSite=Strict` : Bloque l'envoi du cookie lors d'une requête inter-site.
5. **Protection CSRF** : Un token dynamique est généré (`uuid`), stocké côté client, et doit être renvoyé en header (`x-csrf-token`) pour toute requête POST mutante (Panier, Déconnexion). Le middleware rejette toute asymétrie.
6. **CSP et Headers de sécurité** : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, et une Content Security Policy stricte pour bloquer les scripts malveillants.

## 4. Menaces Traitées et Limites

### Menaces traitées
- **Cross-Site Scripting (XSS)** : Atténué par React (échappement) et `HttpOnly` (vol de cookie impossible).
- **Cross-Site Request Forgery (CSRF)** : Bloqué par la vérification du token CSRF couplée au cookie `SameSite=Strict`.
- **Man-in-the-Middle (MitM)** : Rendu inopérant par l'usage exclusif du TLS.
- **Fuites d'informations** : Les erreurs serveurs (`500`) renvoient des messages génériques. Aucune clé n'est présente dans le code source (`.env` exclus).

### Limites de la démonstration
- La base de données est simulée.
- En cas d'absence de configuration OAuth, l'application utilise un mock local (compte fictif) pour ne pas bloquer la démonstration du professeur.

## 5. Données de démonstration
- Vous pouvez utiliser le bouton **OAuth GitHub** pour vous connecter.
- Alternative (Mock) : 
  - **Email** : `demo@example.com`
  - **Mot de passe** : `Password123!`

*Note Éthique : Aucune donnée personnelle, carte de crédit ou collecte n'est effectuée de manière réelle.*

## 6. Installation & Déploiement

### Installation Locale
1. Cloner ce dépôt.
2. Installer les dépendances : `npm install`
3. Copier le fichier `.env.example` vers `.env` et configurer la clé secrète :
   ```env
   JWT_SECRET=une_cle_secrete_longue_et_aleatoire
   GITHUB_CLIENT_ID=votre_client_id
   GITHUB_CLIENT_SECRET=votre_client_secret
   ```
4. Lancer le serveur : `npm run dev`

### Déploiement (Vercel)
L'application est configurée pour être déployée sur **Vercel** en un clic. Vercel gère nativement le certificat TLS/SSL.
Les variables d'environnement (`JWT_SECRET`, etc.) doivent être saisies manuellement dans le tableau de bord Vercel pour ne jamais fuiter dans le code source.

## 7. Captures d'écran et Tests
*À ajouter : Insérez ici les captures d'écran de l'application en mode sombre, du panier, et une capture réseau montrant le cookie HttpOnly et le header CSRF.*
