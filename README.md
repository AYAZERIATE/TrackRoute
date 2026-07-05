#  TrackRoute

**Plateforme de gestion et de suivi logistique** — Gestion des marchés publics, agenda, lois de finance et cartographie des projets, avec tableau de bord analytique en temps réel.

---

##  Sommaire

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Installation](#-installation)
  - [Backend (Laravel)](#backend-laravel)
  - [Frontend (React)](#frontend-react)
- [Configuration](#-configuration)
- [API — Routes principales](#-api--routes-principales)
- [Authentification](#-authentification)
- [Scripts utiles](#-scripts-utiles)
- [Roadmap](#-roadmap)
- [Auteur](#-auteur)

---

##  Aperçu

TrackRoute est une application web full-stack destinée au suivi de projets logistiques et administratifs. Elle centralise dans un même tableau de bord :

- le suivi des **marchés publics** (avancement, montants, statuts),
- la gestion des **lois de finance** et de leur exécution budgétaire,
- un **agenda** d'événements et d'échéances,
- une **carte interactive** des projets géolocalisés,
- des **statistiques et graphiques** de pilotage (budgets engagés/payés, répartition par type, taux d'exécution).

---

##  Fonctionnalités

| Module | Description |
|---|---|
|  **Authentification** | Connexion sécurisée par token (Laravel Sanctum) |
|  **Dashboard** | KPIs, graphiques de tendance budgétaire, activité récente |
|  **Marchés** | CRUD complet (nom, type, objet, montant, avancement, statut) |
|  **Lois de finance** | Suivi détaillé des montants, cautions, dates d'approbation/visa/liquidation |
|  **Agenda** | Création et suivi d'événements avec priorité, statut, catégorie |
|  **Cartographie** | Visualisation des projets sur carte (localisation, budget, statut) |

---

##  Stack technique

**Backend**
- [Laravel 11+](https://laravel.com/) (PHP 8.2)
- Laravel Sanctum (authentification par token API)
- MySQL

**Frontend**
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- React Router DOM
- [Recharts](https://recharts.org/) (graphiques)
- Axios
- React Icons (`react-icons`)

---

##  Architecture du projet

```
TrackRoute/
├── trackroute/              # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── AgendaController.php
│   │   │   ├── MarcheController.php
│   │   │   ├── LoiFinanceController.php
│   │   │   ├── DashboardController.php
│   │   │   └── MapController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Agenda.php
│   │       ├── Marche.php
│   │       ├── LoiFinance.php
│   │       └── Mappage.php
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/DatabaseSeeder.php
│   └── bootstrap/app.php
│
└── front/                   # Frontend React
    ├── src/
    │   ├── api/axios.js
    │   ├── layouts/Layout.jsx
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Footer.jsx
    │   │   └── Loading.jsx
    │   ├── pages/
    │   │   ├── login.jsx
    │   │   ├── dashboard.jsx
    │   │   ├── gestion-marche.jsx
    │   │   ├── gestion-loi-finance.jsx
    │   │   ├── agenda.jsx
    │   │   └── mappage.jsx
    │   └── App.jsx
    └── vite.config.js
```

---

##  Installation

### Prérequis

- PHP >= 8.2
- Composer
- Node.js >= 18 & npm
- MySQL (ex. via XAMPP/Laragon/WAMP)

### Backend (Laravel)

```bash
cd trackroute
composer install
cp .env.example .env
php artisan key:generate
```

Configurer la base de données dans `.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trackroute
DB_USERNAME=root
DB_PASSWORD=
```

Lancer les migrations et le seeder (crée un utilisateur de test) :

```bash
php artisan migrate --seed
```

Démarrer le serveur :

```bash
php artisan serve
```

>  Assurez-vous que **MySQL est démarré** avant de lancer `php artisan serve`, sinon les requêtes échoueront (erreur 502 côté frontend).

### Frontend (React)

```bash
cd front
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

---

##  Configuration

Le frontend utilise un proxy Vite pour rediriger les appels `/api` vers Laravel en développement. Vérifiez que `vite.config.js` pointe vers le bon port :

```js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }
  }
}
```

---

##  API — Routes principales

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | Connexion utilisateur |
| `POST` | `/api/logout` | Déconnexion (authentifié) |
| `GET` | `/api/me` | Utilisateur courant (authentifié) |
| `GET` | `/api/dashboard` | Statistiques globales |
| `GET/POST/PUT/DELETE` | `/api/agenda` | CRUD Agenda |
| `GET/POST/PUT/DELETE` | `/api/marche` | CRUD Marchés |
| `GET/POST/PUT/DELETE` | `/api/loifinance` | CRUD Lois de finance |
| `GET` | `/api/map` | Localisations des projets |

Toutes les routes (hors `/login`) sont protégées par le middleware `auth:sanctum`.

---

##  Authentification

L'authentification repose sur **Laravel Sanctum** (tokens API) :

1. L'utilisateur envoie `email` / `password` à `POST /api/login`.
2. Le backend renvoie un token (`plainTextToken`) stocké côté client dans `localStorage`.
3. Chaque requête suivante inclut le header `Authorization: Bearer <token>` (géré automatiquement par l'intercepteur Axios).
4. Le frontend vérifie la validité du token via `GET /api/me` avant de donner accès aux pages protégées (`ProtectedLayout` + `Layout`).

---

##  Scripts utiles

```bash
# Backend
php artisan route:list --path=api   # Lister les routes API
php artisan migrate:status          # Vérifier l'état des migrations
php artisan route:clear             # Vider le cache des routes
php artisan config:clear            # Vider le cache de config

# Frontend
npm run dev                         # Lancer le serveur de dev
npm run build                       # Build de production
```

---

##  Roadmap

- [ ] Connecter les données réelles du dashboard (actuellement mockées côté frontend)
- [ ] Gestion des rôles et permissions (admin / utilisateur)
- [ ] Export PDF/Excel des marchés et lois de finance
- [ ] Notifications en temps réel (échéances, alertes)
- [ ] Tests automatisés (backend & frontend)

---

##  Auteur

**Aya** — Étudiante en Développement Digital, 

Projet développé dans le cadre d'un stage au sein du Ministère de l'Équipement, du Transport et de l'Eau.

---

##  Licence

Ce projet est distribué à des fins pédagogiques et de démonstration.
