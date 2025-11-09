# Calculateur d'Effet Composé

Un calculateur bidirectionnel pour comprendre et planifier la croissance exponentielle de vos investissements.

## Démo

**[Essayer l'application](https://mickaelbentz.github.io/compound/)**

## Fonctionnalités

### Deux modes de calcul

#### 1. Calculer la Valeur Finale
À partir d'une valeur de départ et d'un taux de croissance, calculez combien vous aurez à terme.

**Paramètres:**
- Valeur de départ
- Taux de croissance par période
- Versement régulier (optionnel)
- Durée (en semaines, mois ou années)
- Taux d'inflation annuel (optionnel)

**Résultats:**
- Valeur finale nominale
- Valeur finale réelle (ajustée à l'inflation)
- Gains totaux
- Rendement en pourcentage
- Timeline détaillée période par période

#### 2. Trouver le Taux Nécessaire
À partir d'un objectif final et d'une valeur de départ, calculez le taux de croissance nécessaire.

**Paramètres:**
- Valeur de départ
- Valeur cible (en pouvoir d'achat futur)
- Versement régulier (optionnel)
- Durée (en semaines, mois ou années)
- Taux d'inflation annuel (optionnel)

**Résultats:**
- Taux de croissance nécessaire par période
- Taux réel (hors inflation)
- Valeur nominale à atteindre (si inflation)
- Timeline détaillée période par période

### Gestion de l'inflation

L'application intègre l'inflation de manière intelligente:

**Mode Forward (Calcul de la valeur finale):**
- Affiche la valeur nominale ET la valeur réelle (pouvoir d'achat)
- Convertit l'inflation annuelle en taux par période (semaine/mois/année)
- Timeline avec valeurs nominales et réelles

**Mode Reverse (Calcul du taux nécessaire):**
- L'objectif saisi représente le pouvoir d'achat souhaité
- Calcule automatiquement la valeur nominale à atteindre
- Exemple: pour 100 000€ de pouvoir d'achat dans 10 ans avec 2% d'inflation, il faudra atteindre 121 899€ nominaux

### Versements réguliers

Ajoutez des versements périodiques constants pour simuler:
- Épargne mensuelle
- Investissements programmés
- Plans d'épargne retraite

L'algorithme utilise une méthode itérative (Newton-Raphson) en mode reverse pour trouver le taux optimal avec versements.

### Export des données

Exportez vos résultats en:
- **CSV** - Compatible Excel, Google Sheets
- **JSON** - Pour analyse programmatique

## Formules utilisées

### Mode Forward (sans versements)
```
VF = VI × (1 + r)^n
```

### Mode Forward (avec versements)
```
VF = VI × (1 + r)^n + PMT × Σ(1 + r)^i
```

### Mode Reverse (sans versements)
```
r = (VF / VI)^(1/n) - 1
```

### Mode Reverse (avec versements)
Résolution itérative par méthode de Newton-Raphson

### Ajustement inflation
```
Valeur réelle = Valeur nominale / (1 + inflation)^n
```

## Technologies

- **HTML5** - Structure sémantique
- **CSS3** - Design Batch.com (Inter font, #0968AC)
- **JavaScript Vanilla** - Calculs côté client, aucune donnée envoyée à un serveur

## Design

L'application utilise le système de design de **[Batch.com](https://www.batch.com)**:
- Police: Inter
- Couleur principale: #0968AC
- Boutons arrondis (52px border-radius)
- Interface clean et moderne

## Confidentialité

L'application fonctionne **100% côté client**. Aucune donnée n'est envoyée à un serveur. Tous les calculs se font localement dans votre navigateur.

## Installation locale

```bash
git clone https://github.com/mickaelbentz/compound.git
cd compound
open index.html
```

## Exemples d'utilisation

### Exemple 1: Épargne mensuelle
- Mode: Calculer la valeur finale
- Valeur de départ: 1 000€
- Taux: 7% par an → 0.583% par mois
- Versement mensuel: 200€
- Durée: 120 mois (10 ans)
- Inflation: 2% par an

### Exemple 2: Objectif retraite
- Mode: Trouver le taux nécessaire
- Valeur de départ: 50 000€
- Valeur cible: 500 000€ (pouvoir d'achat)
- Versement mensuel: 500€
- Durée: 240 mois (20 ans)
- Inflation: 2% par an
- → Calcule le taux de rendement annuel nécessaire

### Exemple 3: Placement simple
- Mode: Calculer la valeur finale
- Valeur de départ: 10 000€
- Taux: 5% par an
- Durée: 10 ans
- → Valeur finale: 16 288,95€

## Licence

MIT

## Auteur

Mickaël Bentz
