# Fonctionnalités CRUD pour les Points d'Intérêt

## Vue d'ensemble

Ce document décrit les nouvelles fonctionnalités d'ajout, modification et suppression de points d'intérêt implémentées dans l'application V-élo Facile.

## Fonctionnalités implémentées

### 1. Interface utilisateur

#### Composant `PointInteretForm.vue`
- **Modal réutilisable** pour l'ajout et la modification de points d'intérêt
- **Formulaire adaptatif** selon le type de point d'intérêt
- **Validation des champs** avec règles personnalisées
- **Champs conditionnels** : longitude/latitude affichés uniquement pour les fontaines
- **Dropdown pour les arrondissements** : sélection depuis la liste complète des arrondissements de Montréal

#### Vue `Points_Interet.vue` mise à jour
- **Bouton "Ajouter"** en haut de la page
- **Colonne "Actions"** dans le tableau avec boutons modifier/supprimer
- **Intégration du formulaire modal**
- **Mise à jour automatique** de l'interface après les opérations CRUD

### 2. API Backend

#### Endpoints implémentés
- `GET /gti525/v1/pointsdinteret` - Liste paginée des points d'intérêt
- `GET /gti525/v1/pointsdinteret/:id` - Récupération d'un point d'intérêt spécifique
- `GET /gti525/v1/pointsdinteret/arrondissements` - Liste des arrondissements de Montréal
- `POST /gti525/v1/pointsdinteret` - Ajout d'un nouveau point d'intérêt
- `PATCH /gti525/v1/pointsdinteret/:id` - Modification d'un point d'intérêt
- `DELETE /gti525/v1/pointsdinteret/:id` - Suppression d'un point d'intérêt

#### Validation des données
- **Champs obligatoires** : Arrondissement, Type, Nom_parc_lieu, Proximite_jeux_repere
- **Champs conditionnels** : Longitude/Latitude requis pour les fontaines
- **Gestion d'erreurs** avec messages appropriés

### 3. Base de données

#### Table `points_interets`
- **Structure complète** avec tous les champs nécessaires
- **Import automatique** des données depuis le fichier CSV
- **Support des opérations CRUD** complètes

## Utilisation

### Ajouter un point d'intérêt
1. Cliquer sur le bouton "Ajouter un point d'intérêt" en haut de la page
2. Remplir le formulaire avec les informations requises
3. Choisir le type (Fontaine, Atelier, Stationnement, Autre)
4. Pour les fontaines, remplir obligatoirement longitude et latitude
5. Cliquer sur "Ajouter"

### Modifier un point d'intérêt
1. Cliquer sur l'icône crayon (✏️) dans la colonne Actions
2. Modifier les champs souhaités dans le formulaire
3. Cliquer sur "Modifier"

### Supprimer un point d'intérêt
1. Cliquer sur l'icône poubelle (🗑️) dans la colonne Actions
2. Confirmer la suppression dans la boîte de dialogue

## Tests

Un script de test complet (`test_api.js`) a été créé pour vérifier toutes les fonctionnalités CRUD :

```bash
node test_api.js
```

Le script teste :
- Récupération des données
- Ajout d'un nouveau point d'intérêt
- Modification d'un point d'intérêt
- Vérification des modifications
- Suppression d'un point d'intérêt
- Confirmation de la suppression

## Architecture technique

### Frontend (Vue.js 3 + Vuetify)
- **Composition API** pour la logique réactive
- **Composants modulaires** pour la réutilisabilité
- **Validation de formulaire** intégrée
- **Gestion d'état** avec refs et computed properties

### Backend (Node.js + Express + SQLite)
- **Routes modulaires** pour une meilleure organisation
- **Middleware de validation** pour les données
- **Gestion d'erreurs** centralisée
- **Base de données SQLite** pour la persistance

### Communication
- **Axios** pour les requêtes HTTP
- **CORS** configuré pour le développement
- **Format JSON** pour l'échange de données

## Sécurité

- **Validation côté serveur** pour toutes les opérations
- **Sanitisation des données** avant insertion en base
- **Gestion des erreurs** appropriée
- **Confirmation** pour les opérations destructives

## Déploiement

### Prérequis
- Node.js v18+
- npm ou yarn

### Installation
```bash
# Backend
cd server
npm install
node server.js

# Frontend
cd ..
npm install
npm run dev
```

### Accès
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8000

## Améliorations futures

- [ ] Authentification et autorisation
- [ ] Validation plus stricte des coordonnées géographiques
- [ ] Upload d'images pour les points d'intérêt
- [ ] Historique des modifications
- [ ] Interface d'administration avancée 