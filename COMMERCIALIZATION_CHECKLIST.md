# SubSnooze — Checklist de Commercialisation

> Audit complet de l'application. Chaque section liste ce qui existe (✅), ce qui est partiel (⚠️) et ce qui manque (❌).
> Priorité : 🔴 Bloquant | 🟠 Important | 🟡 Souhaitable

---

## Table des matières

1. [Infrastructure & DevOps](#1-infrastructure--devops)
2. [Sécurité](#2-sécurité)
3. [Légal & Conformité](#3-légal--conformité)
4. [Paiement & Monétisation](#4-paiement--monétisation)
5. [Tests & Qualité](#5-tests--qualité)
6. [Monitoring & Analytics](#6-monitoring--analytics)
7. [SEO & ASO](#7-seo--aso)
8. [PWA & Mobile](#8-pwa--mobile)
9. [UI/UX — États & Feedback](#9-uiux--états--feedback)
10. [UI/UX — Navigation & Interactions](#10-uiux--navigation--interactions)
11. [UI/UX — Design Système](#11-uiux--design-système)
12. [Fonctionnalités Manquantes](#12-fonctionnalités-manquantes)
13. [UX TDAH — Améliorations](#13-ux-tdah--améliorations)
14. [Accessibilité (a11y)](#14-accessibilité-a11y)
15. [Performance](#15-performance)
16. [Bugs & Edge Cases Connus](#16-bugs--edge-cases-connus)
17. [Internationalisation](#17-internationalisation)

---

## 1. Infrastructure & DevOps

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 1.1 | Pipeline CI/CD (GitHub Actions : lint, build, test, deploy) | 🔴 | ❌ |
| 1.2 | Configuration de déploiement (Vercel / Netlify / Docker) | 🔴 | ❌ |
| 1.3 | Environnements staging + production séparés | 🔴 | ❌ |
| 1.4 | Variables d'environnement gérées par le provider (pas de `.env` committés) | 🟠 | ⚠️ `.env.local.example` existe |
| 1.5 | Dockerfile / docker-compose pour dev local reproductible | 🟡 | ❌ |
| 1.6 | Health check endpoint (`/api/health`) | 🟠 | ❌ |
| 1.7 | Backups automatiques de la base de données | 🔴 | ❌ (dépend du plan Supabase) |
| 1.8 | CDN pour les assets statiques | 🟡 | ⚠️ Next.js gère via `_next/static` |
| 1.9 | Domain name + certificat SSL | 🔴 | ❌ |
| 1.10 | Documentation de déploiement (README déploiement) | 🟠 | ❌ |

---

## 2. Sécurité

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 2.1 | Content Security Policy (CSP) headers | 🔴 | ❌ |
| 2.2 | CORS configuré correctement | 🟠 | ❌ |
| 2.3 | Rate limiting sur endpoints auth et API | 🔴 | ❌ |
| 2.4 | Protection CSRF | 🟠 | ⚠️ Supabase gère via tokens |
| 2.5 | Validation et sanitisation des inputs côté serveur | 🔴 | ❌ pas de validation serveur |
| 2.6 | Headers sécurité (X-Content-Type-Options, X-Frame-Options, etc.) | 🟠 | ❌ |
| 2.7 | Audit des dépendances (`pnpm audit`) | 🟠 | ❌ pas automatisé |
| 2.8 | MFA (authentification multi-facteurs) | 🟡 | ❌ |
| 2.9 | Session timeout / expiration configurable | 🟠 | ⚠️ JWT 1h, refresh rotation activé |
| 2.10 | Politique de mots de passe (longueur min, complexité) | 🟠 | ⚠️ minLength=6 seulement |
| 2.11 | Protection contre le brute force login | 🔴 | ❌ |
| 2.12 | Logs d'audit des actions sensibles | 🟡 | ❌ |
| 2.13 | Catch-all wildcard `*.com` dans next.config images | 🟠 | ⚠️ trop permissif, risque de SSRF |

---

## 3. Légal & Conformité

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 3.1 | Page Politique de Confidentialité | 🔴 | ❌ (mentionnée dans le footer mais inexistante) |
| 3.2 | Page Conditions d'Utilisation (CGU) | 🔴 | ❌ (mentionnée dans le footer mais inexistante) |
| 3.3 | Bannière de consentement cookies (RGPD) | 🔴 | ❌ |
| 3.4 | Conformité RGPD — droit à l'oubli (suppression de compte) | 🔴 | ❌ aucune suppression de compte |
| 3.5 | Conformité RGPD — export des données personnelles | 🟠 | ❌ |
| 3.6 | Mentions légales / page À propos | 🟠 | ❌ |
| 3.7 | Checkbox de consentement CGU lors de l'inscription | 🔴 | ❌ |
| 3.8 | Politique de remboursement (pour l'offre premium) | 🟠 | ❌ |
| 3.9 | Conformité App Store / Play Store (si publication mobile) | 🟡 | ❌ |

---

## 4. Paiement & Monétisation

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 4.1 | Intégration Stripe (ou autre processeur de paiement) | 🔴 | ❌ |
| 4.2 | Webhook handler pour les événements de paiement | 🔴 | ❌ |
| 4.3 | Page de paiement / checkout sécurisé | 🔴 | ❌ |
| 4.4 | Gestion des abonnements premium (activation/expiration) | 🟠 | ⚠️ champs DB existent, logique absente |
| 4.5 | Historique des paiements | 🟠 | ❌ |
| 4.6 | Gestion des remboursements | 🟠 | ❌ |
| 4.7 | Facturation / reçus par email | 🟡 | ❌ |
| 4.8 | Période d'essai gratuite | 🟡 | ❌ |
| 4.9 | Limitations du tier gratuit réellement appliquées | 🔴 | ❌ `is_premium` existe mais rien n'est limité |
| 4.10 | Portail de gestion d'abonnement premium (annulation, changement) | 🟠 | ❌ |
| 4.11 | Prix affiché « $39 lifetime » dans UpgradeModal mais aucun achat possible | 🔴 | ⚠️ promesse non tenue |

---

## 5. Tests & Qualité

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 5.1 | Framework de tests configuré (Vitest ou Jest) | 🔴 | ❌ |
| 5.2 | Tests unitaires des utilitaires (`date-utils`, `utils`, `services`) | 🔴 | ❌ |
| 5.3 | Tests unitaires des hooks (`useSubscriptions`, `useUser`, etc.) | 🟠 | ❌ |
| 5.4 | Tests des composants (React Testing Library) | 🟠 | ❌ |
| 5.5 | Tests E2E (Playwright ou Cypress) | 🟠 | ❌ |
| 5.6 | Tests des Edge Functions Supabase | 🟡 | ❌ |
| 5.7 | Couverture de code minimale (>70%) | 🟠 | ❌ |
| 5.8 | Tests de snapshot pour les composants UI | 🟡 | ❌ |
| 5.9 | Tests d'accessibilité automatisés (axe-core) | 🟡 | ❌ |
| 5.10 | Linting strict (ESLint sans `eslint-disable` injustifiés) | 🟠 | ⚠️ quelques `eslint-disable` |

---

## 6. Monitoring & Analytics

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 6.1 | Error tracking (Sentry ou Bugsnag) | 🔴 | ❌ |
| 6.2 | Analytics utilisateur (PostHog, Mixpanel, ou GA4) | 🟠 | ❌ |
| 6.3 | Monitoring des performances (Web Vitals) | 🟠 | ❌ |
| 6.4 | Uptime monitoring (Pingdom, UptimeRobot) | 🟠 | ❌ |
| 6.5 | Logging structuré côté serveur | 🟡 | ❌ |
| 6.6 | Alertes automatiques (erreurs, downtime, pics) | 🟠 | ❌ |
| 6.7 | Dashboard de métriques business (MRR, churn, activations) | 🟡 | ❌ |
| 6.8 | Tracking des événements clés (signup, add_sub, cancel, upgrade) | 🟠 | ❌ |

---

## 7. SEO & ASO

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 7.1 | `robots.txt` | 🟠 | ❌ |
| 7.2 | `sitemap.xml` | 🟠 | ❌ |
| 7.3 | Open Graph meta tags (og:title, og:description, og:image) | 🟠 | ❌ |
| 7.4 | Twitter Card meta tags | 🟡 | ❌ |
| 7.5 | JSON-LD structured data (Schema.org) | 🟡 | ❌ |
| 7.6 | Meta description par page | 🟠 | ⚠️ seulement le layout global |
| 7.7 | Landing page publique (marketing, features, pricing) | 🔴 | ❌ |
| 7.8 | Favicon complet (16x16, 32x32, apple-touch-icon) | 🟠 | ⚠️ seulement SVG + 192px PNG |

---

## 8. PWA & Mobile

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 8.1 | Icônes PWA complètes (192, 256, 384, 512, maskable) | 🟠 | ⚠️ seulement SVG + 192 PNG |
| 8.2 | Screenshots dans le manifest (pour install prompt) | 🟡 | ❌ |
| 8.3 | Splash screens / launch images | 🟡 | ❌ |
| 8.4 | Page offline dédiée | 🟠 | ❌ |
| 8.5 | Service worker avec stratégie de cache (stale-while-revalidate) | 🟠 | ⚠️ SW existe mais uniquement pour FCM |
| 8.6 | Install prompt UI personnalisé (beforeinstallprompt) | 🟡 | ❌ |
| 8.7 | App Shortcuts dans le manifest | 🟡 | ❌ |
| 8.8 | Orientation paysage gérée | 🟡 | ⚠️ `portrait` forcé dans manifest |
| 8.9 | Gestion du safe-area (notch iPhone, barre de navigation) | 🟠 | ⚠️ padding-bottom fixe dans TabBar |

---

## 9. UI/UX — États & Feedback

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 9.1 | **Skeleton loaders** pour Dashboard, AllSubscriptions, Notifications | 🔴 | ❌ spinner générique seulement |
| 9.2 | **Empty states** avec illustration et CTA (Dashboard vide, premier lancement) | 🟠 | ⚠️ basique dans AllSubscriptions |
| 9.3 | **Toast notifications** pour confirmations (ajout, modif, suppression réussis) | 🔴 | ❌ aucun feedback de succès |
| 9.4 | **Error boundaries** React (crash gracieux par section) | 🔴 | ❌ un crash = app cassée |
| 9.5 | **Error states** visuels pour les échecs réseau/API | 🟠 | ❌ erreurs silencieuses |
| 9.6 | **Loading state** sur les boutons pendant les soumissions de formulaire | 🟠 | ❌ double-clic possible |
| 9.7 | **Confirmation dialog** pour actions destructives (supprimer, tout effacer) | 🟠 | ⚠️ double-tap sur delete, mais pas de modal |
| 9.8 | **Détection offline** avec bannière explicative | 🟠 | ❌ |
| 9.9 | **Retry automatique** sur échec réseau | 🟡 | ❌ |
| 9.10 | **Validation inline** en temps réel sur les formulaires (prix > 0, date valide) | 🟠 | ❌ validation HTML5 basique |

---

## 10. UI/UX — Navigation & Interactions

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 10.1 | **Transitions de pages** (animation entre écrans) | 🟠 | ❌ changement instantané |
| 10.2 | **Pull-to-refresh** sur Dashboard et listes | 🟠 | ❌ |
| 10.3 | **Swipe-to-action** sur les lignes d'abonnement (pas juste notifications) | 🟡 | ❌ |
| 10.4 | **Scroll position restoration** en revenant en arrière | 🟠 | ❌ |
| 10.5 | **Haptic feedback** sur mobile (vibration sur actions) | 🟡 | ❌ |
| 10.6 | **Focus trap** dans les modales (accessibilité clavier) | 🔴 | ❌ |
| 10.7 | **Tri** des abonnements (par prix, nom, date de renouvellement) | 🟠 | ❌ |
| 10.8 | **Filtres avancés** (par cycle, par fourchette de prix) | 🟡 | ❌ |
| 10.9 | **Navigation directe** depuis une notification vers l'abonnement concerné | 🟠 | ❌ click = markAsRead seulement |
| 10.10 | **Bouton « Scroll to top »** sur les listes longues | 🟡 | ❌ |

---

## 11. UI/UX — Design Système

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 11.1 | **Dark mode** | 🟠 | ❌ thème clair uniquement |
| 11.2 | **Layout tablette** (iPad, grille 2 colonnes, sidebar) | 🟡 | ❌ mobile-only |
| 11.3 | **Layout desktop** (centré, navigation latérale) | 🟡 | ❌ |
| 11.4 | **Tailles de police responsive** (clamp, fluid typography) | 🟡 | ⚠️ tailles fixes mobile |
| 11.5 | **Animations d'entrée/sortie** des modales | 🟡 | ⚠️ fade basique |
| 11.6 | **Ripple effect / press state** sur les boutons | 🟡 | ❌ |
| 11.7 | **Consistance des padding/margins** dans les modales | 🟡 | ⚠️ p-6 vs p-8 incohérents |
| 11.8 | **Icônes haute résolution** pour tous les services | 🟡 | ⚠️ fallback lettre colorée |

---

## 12. Fonctionnalités Manquantes

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 12.1 | **Onboarding / tutoriel** pour les nouveaux utilisateurs | 🔴 | ❌ |
| 12.2 | **Suppression de compte** (RGPD obligatoire) | 🔴 | ❌ |
| 12.3 | **Export des données** (CSV / PDF) | 🟠 | ❌ |
| 12.4 | **Mot de passe oublié** — flow complet (email envoyé + page de reset) | 🟠 | ⚠️ bouton existe, flow incomplet |
| 12.5 | **Vérification email** obligatoire à l'inscription | 🟠 | ⚠️ supporté mais pas forcé |
| 12.6 | **Notifications SMS** réellement intégrées | 🟡 | ⚠️ toggle existe, backend non implémenté |
| 12.7 | **Templates d'emails** personnalisés (rappels, bienvenue) | 🟡 | ❌ emails Supabase par défaut |
| 12.8 | **Heures « Ne pas déranger »** pour les notifications | 🟡 | ❌ |
| 12.9 | **Catégories d'abonnements** (divertissement, productivité, etc.) | 🟡 | ❌ |
| 12.10 | **Partage / multi-utilisateur** (famille, couple) | 🟡 | ❌ |
| 12.11 | **Brouillons** — sauvegarder un ajout d'abonnement en cours | 🟡 | ❌ |
| 12.12 | **Ajout rapide en chaîne** (ajouter plusieurs abonnements sans revenir au dashboard) | 🟠 | ❌ |
| 12.13 | **Calcul automatique du prix** (mensuel ↔ annuel) dans le formulaire | 🟡 | ❌ |
| 12.14 | **Rappel de suivi** après tentative d'annulation (3 jours) | 🟠 | ⚠️ Edge Function existe, `remindMe` non branché |
| 12.15 | **Landing page marketing** (avant le login, présentation du produit) | 🔴 | ❌ |
| 12.16 | **Page de pricing** publique | 🟠 | ❌ |
| 12.17 | **Changelog / What's new** in-app | 🟡 | ❌ |
| 12.18 | **Support / Contact** (formulaire ou lien) | 🟠 | ❌ |
| 12.19 | **FAQ** | 🟡 | ❌ |

---

## 13. UX TDAH — Améliorations

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 13.1 | **« Décider plus tard »** — bouton disponible sur toutes les décisions | 🟠 | ❌ principe CLAUDE.md non appliqué |
| 13.2 | **Renforcement positif** — célébrations visuelles (confetti, animation) | 🟡 | ❌ |
| 13.3 | **Gamification** — streak de connexion, badges d'économies | 🟡 | ❌ |
| 13.4 | **Résumé hebdomadaire** — notification récap des économies réalisées | 🟡 | ❌ |
| 13.5 | **Économies potentielles** — afficher combien on économiserait en annulant les « renewing soon » | 🟡 | ❌ |
| 13.6 | **Détail des économies** — breakdown par service annulé | 🟡 | ❌ |
| 13.7 | **Formulaire progressif** — champs révélés étape par étape, pas tous d'un coup | 🟡 | ⚠️ 2 étapes mais Step 2 montre tout |
| 13.8 | **Indicateur de progression** visible dans le flow d'ajout | 🟡 | ❌ |
| 13.9 | **Langage bienveillant** — remplacer « Cancelled » par « Paused » ou « Freed up » | 🟡 | ⚠️ globalement correct |
| 13.10 | **Jours avant renouvellement** très visibles sur le Dashboard (gros chiffre) | 🟠 | ⚠️ affiché mais pas proéminent |

---

## 14. Accessibilité (a11y)

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 14.1 | **Focus trap** dans toutes les modales | 🔴 | ❌ |
| 14.2 | **Skip links** (aller au contenu principal) | 🟠 | ❌ |
| 14.3 | **Hiérarchie des headings** (h1 > h2 > h3 cohérente) | 🟠 | ⚠️ incohérent |
| 14.4 | **ARIA live regions** pour le contenu dynamique | 🟠 | ❌ |
| 14.5 | **Alt text** sur toutes les images (ServiceIcon) | 🟠 | ⚠️ fallback texte sans aria-label |
| 14.6 | **Contraste des couleurs** vérifié WCAG 2.1 AA | 🟠 | ⚠️ non vérifié |
| 14.7 | **Swipe des notifications** accessible au clavier | 🟠 | ❌ |
| 14.8 | **Bouton fermer (X)** visible sur toutes les modales | 🟡 | ⚠️ certaines n'en ont pas |
| 14.9 | **Annonces d'erreurs** de formulaire aux lecteurs d'écran | 🟠 | ❌ |
| 14.10 | **Tests automatisés a11y** (axe-core, Lighthouse) | 🟡 | ❌ |

---

## 15. Performance

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 15.1 | **Pagination serveur** pour les abonnements (si 1000+) | 🟡 | ❌ tout chargé d'un coup |
| 15.2 | **Lazy loading des modales** (code splitting) | 🟡 | ⚠️ import dynamique partiel |
| 15.3 | **Optimisation des images** services (next/image ou placeholder) | 🟡 | ⚠️ next/image utilisé mais fallback non optimisé |
| 15.4 | **Bundle analysis** (vérifier la taille du bundle) | 🟠 | ❌ |
| 15.5 | **Prefetch des routes** | 🟡 | ⚠️ Next.js le fait pour les pages, mais app est SPA-like |
| 15.6 | **Web Vitals** mesurés et optimisés (LCP, FID, CLS) | 🟠 | ❌ |

---

## 16. Bugs & Edge Cases Connus

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 16.1 | `remindMe` dans `CancelRedirectModal` — state créé mais jamais utilisé par le parent | 🟠 | 🐛 |
| 16.2 | `localStorage` cache de `totalSaved` peut désynchroniser entre onglets | 🟡 | 🐛 |
| 16.3 | `eslint-disable react-hooks/exhaustive-deps` dans `useSubscriptions` — risque de closures périmées | 🟡 | 🐛 |
| 16.4 | Service worker Firebase utilise des clés en dur (`"NEXT_PUBLIC_..."`) au lieu de vraies valeurs | 🔴 | 🐛 |
| 16.5 | Wildcard `*.com` dans `next.config.ts` images — trop permissif | 🟠 | 🐛 |
| 16.6 | Pas de timeout sur `getServiceBySlug` — peut bloquer l'UI | 🟡 | 🐛 |
| 16.7 | « Clear all » notifications sans confirmation | 🟠 | 🐛 |
| 16.8 | Double-clic possible sur les boutons de formulaire (pas de loading state) | 🟠 | 🐛 |
| 16.9 | Normalisation prix hebdomadaire → mensuel utilise `* 4.33` (approximation) | 🟡 | 🐛 |

---

## 17. Internationalisation

| # | Item | Priorité | Statut |
|---|------|----------|--------|
| 17.1 | Bibliothèque i18n configurée (next-intl ou i18next) | 🟡 | ❌ |
| 17.2 | Tous les textes externalisés dans des fichiers de traduction | 🟡 | ❌ tout est hardcodé en anglais |
| 17.3 | Localisation des devises (€, £, $, etc.) | 🟠 | ⚠️ `$` hardcodé, `formatCurrency` existe |
| 17.4 | Formats de dates localisés | 🟡 | ⚠️ `date-fns` supporte mais pas configuré |
| 17.5 | Support RTL (arabe, hébreu) | 🟡 | ❌ |
| 17.6 | Sélecteur de langue dans les Settings | 🟡 | ❌ |

---

## Résumé par Priorité

### 🔴 Bloquants (à faire AVANT le lancement)

1. Pipeline CI/CD (1.1)
2. Configuration de déploiement (1.2)
3. Environnements staging/prod (1.3)
4. Nom de domaine + SSL (1.9)
5. CSP headers (2.1)
6. Rate limiting auth (2.3)
7. Validation inputs serveur (2.5)
8. Protection brute force (2.11)
9. Politique de confidentialité (3.1)
10. CGU (3.2)
11. Bannière cookies RGPD (3.3)
12. Suppression de compte RGPD (3.4)
13. Consentement CGU à l'inscription (3.7)
14. Intégration Stripe (4.1)
15. Webhook paiement (4.2)
16. Page checkout (4.3)
17. Limitations tier gratuit appliquées (4.9)
18. UpgradeModal non fonctionnel (4.11)
19. Framework de tests (5.1)
20. Tests unitaires utilitaires (5.2)
21. Error tracking Sentry (6.1)
22. Skeleton loaders (9.1)
23. Toast notifications (9.3)
24. Error boundaries React (9.4)
25. Focus trap modales (10.6)
26. Onboarding (12.1)
27. Suppression de compte (12.2)
28. Landing page marketing (12.15)
29. Focus trap a11y modales (14.1)
30. Bug : clés Firebase en dur dans le SW (16.4)

### 🟠 Importants (à faire pour la V1)

~40 items couvrant : sécurité renforcée, analytics, SEO, PWA offline, empty states, validation formulaires, tri/filtres, navigation depuis notifications, dark mode, export données, flow mot de passe oublié, support/contact, accessibilité, performance.

### 🟡 Souhaitables (V1.1+)

~30 items couvrant : Docker, MFA, logs d'audit, SMS, gamification, i18n, layout tablet/desktop, animations avancées, catégories d'abonnements, partage multi-utilisateur.

---

## Score Global Actuel

| Catégorie | Score |
|-----------|-------|
| Infrastructure & DevOps | 1/10 |
| Sécurité | 4/10 |
| Légal & Conformité | 0/10 |
| Paiement & Monétisation | 1/10 |
| Tests & Qualité | 1/10 |
| Monitoring & Analytics | 0/10 |
| SEO & ASO | 2/10 |
| PWA & Mobile | 5/10 |
| UI/UX États & Feedback | 2/10 |
| UI/UX Navigation | 3/10 |
| UI/UX Design Système | 4/10 |
| Fonctionnalités | 5/10 |
| UX TDAH | 4/10 |
| Accessibilité | 5/10 |
| Performance | 5/10 |
| **TOTAL** | **42/150 (28%)** |

> L'application a une base fonctionnelle solide (database, auth, realtime, notifications push) mais il manque toute la couche "production-ready" : légal, paiement, tests, monitoring, sécurité renforcée, et le polish UI/UX nécessaire pour un produit commercial.

---
---

# PARTIE 2 — Audit Détaillé par Composant & Validation des Interactions

> Analyse ligne par ligne de chaque page, écran, modale et du routage inter-pages.
> Basée sur la lecture complète du code source.

---

## 18. Carte de Navigation — Machine à États

L'application utilise une SPA interne dans `page.tsx` avec un état `screen` et un état `activeTab`.

```
                    ┌─────────────────────────────────────────────┐
                    │               /login                        │
                    │  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
                    │  │LoginForm │  │SignupForm │  │ForgotPwd  │ │
                    │  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
                    │       │             │              │        │
                    │       └──────┬──────┘              │        │
                    │              ▼                     │        │
                    │       check-email ◄────────────────┘        │
                    └──────────────┬──────────────────────────────┘
                                   │ Auth callback (/auth/callback)
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          / (page.tsx)                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ AppShell screens (avec TabBar)                                  │ │
│  │                                                                 │ │
│  │  ┌───────────┐    ┌──────────────┐    ┌──────────┐              │ │
│  │  │ Dashboard  │◄──►│AllSubscript.  │◄──►│ Settings │              │ │
│  │  │ (home tab) │    │ (subs tab)   │    │(set. tab)│              │ │
│  │  └─────┬──┬──┘    └──────┬───────┘    └────┬─────┘              │ │
│  │        │  │              │                  │                    │ │
│  └────────┼──┼──────────────┼──────────────────┼────────────────────┘ │
│           │  │              │                  │                      │
│  ┌────────┼──┼──────────────┼──────────────────┼────────────────────┐ │
│  │ DetailShell screens (sans TabBar)                               │ │
│  │        │  │              │                  │                    │ │
│  │        │  │     ┌────────┴────────┐         │                    │ │
│  │        │  │     │  Subscription   │◄────────┘                    │ │
│  │        │  │     │  Management     │  (onSubscriptionClick)       │ │
│  │        │  │     │  ┌────────────┐ │                              │ │
│  │        │  │     │  │Cancel flow │ │                              │ │
│  │        │  │     │  │3 modales   │ │                              │ │
│  │        │  │     │  └────────────┘ │                              │ │
│  │        │  │     └─────────────────┘                              │ │
│  │        │  │                                                      │ │
│  │        │  └──►┌───────────────┐    ┌───────────────┐             │ │
│  │        │      │AddSubscription│───►│AddSubscription│             │ │
│  │        │      │   Step 1      │    │   Step 2      │             │ │
│  │        │      └───────────────┘    └───────────────┘             │ │
│  │        │                                                         │ │
│  │        └────►┌───────────────┐                                   │ │
│  │              │ Notifications │                                   │ │
│  │              └───────────────┘                                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Modales flottantes (z-50)                                       │ │
│  │  ┌──────────────┐                                               │ │
│  │  │ UpgradeModal │  (depuis Settings)                            │ │
│  │  └──────────────┘                                               │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Transitions validées

| De → Vers | Déclencheur | Fonctionne | Problème |
|-----------|-------------|------------|----------|
| Dashboard → AllSubs | Tab "Subs" | ✅ | — |
| Dashboard → Settings | Tab "Settings" | ✅ | — |
| AllSubs → Dashboard | Tab "Home" | ✅ | — |
| Settings → Dashboard | Tab "Home" | ✅ | — |
| Dashboard → AddStep1 | Bouton "Add subscription" | ✅ | — |
| AddStep1 → AddStep2 | Sélection service | ✅ | — |
| AddStep2 → AddStep1 | Bouton back | ✅ | — |
| AddStep1 → Dashboard | Bouton back | ✅ | — |
| AddStep2 → Dashboard | Save (succès) | ✅ | Pas de toast confirmation |
| Dashboard → Manage | Click sur subscription | ✅ | — |
| AllSubs → Manage | Click sur subscription | ✅ | — |
| Manage → écran précédent | Bouton back | ✅ | `previousScreen` bien géré |
| Manage → Dashboard | Cancel complete | ✅ | Force retour Dashboard |
| Manage → écran précédent | Delete | ✅ | — |
| Manage → écran précédent | Restore | ✅ | — |
| Manage → écran précédent | Save | ✅ | — |
| Tout AppShell → Notifications | Cloche header | ✅ | — |
| Notifications → écran précédent | Back | ✅ | `previousScreen` bien géré |
| Settings → UpgradeModal | "Upgrade to Pro" | ✅ | — |
| UpgradeModal → Settings | Close / "No thanks" | ✅ | — |
| UpgradeModal → ??? | "Get Pro - $39" | ⚠️ | `onUpgrade` = `setModal(null)` = juste fermer ! |

### Problèmes de navigation identifiés

| # | Problème | Sévérité | Détail |
|---|----------|----------|--------|
| NAV-1 | **Pas de gestion du bouton Back du navigateur** | 🔴 | L'app est une SPA — presser Back du navigateur quitte l'app au lieu de revenir à l'écran précédent. Aucun `history.pushState` ou router. |
| NAV-2 | **URLs non reflétées** — tout est sur `/` | 🟠 | Impossible de bookmarker un écran, impossible de partager un lien direct vers Settings ou un abonnement. |
| NAV-3 | **Pas de transition animée** entre écrans | 🟠 | Changement instantané entre Dashboard / AllSubs / Settings / Manage — aucune animation, perte de contexte visuel. |
| NAV-4 | **UpgradeModal : onUpgrade ne fait rien** | 🔴 | `page.tsx:412` → `onUpgrade={() => setModal(null)}` — le bouton "Get Pro - $39" ferme juste la modale sans déclencher de paiement. |
| NAV-5 | **Perte du scroll position** | 🟠 | Quand on navigue Dashboard → Manage → back, le scroll est réinitialisé à 0. |
| NAV-6 | **selectedSub désynchronisé** | 🟡 | `selectedSub` est capturé au moment du clic. Si les données changent en temps réel pendant que l'utilisateur est sur Manage, l'UI affiche les anciennes valeurs. |
| NAV-7 | **ServiceStep2Wrapper défini dans le render** | 🟠 | `page.tsx:222-316` — un composant React est défini à l'intérieur du render de `Home`, ce qui cause un remount à chaque re-render du parent, perte d'état possible. |
| NAV-8 | **Notification click ne navigue pas** | 🟠 | `handleNotificationClick` (ligne 149) ne fait que `markAsRead(id)`. Aucune navigation vers l'abonnement concerné. Le `subscriptionId` est disponible mais ignoré. |

---

## 19. Audit Page : `/login` (LoginPage)

**Fichier** : `src/app/login/page.tsx`

### Contenu & Fonctionnalité

| Élément | Contenu | Statut |
|---------|---------|--------|
| Titre | "SubSnooze" (h1 font-serif) | ✅ |
| Sous-titre | Dynamique : "Welcome back" / "Create your account" / etc. | ✅ |
| Vue Login | `LoginForm` (email + password + Google OAuth) | ✅ |
| Vue Signup | `SignupForm` (nom + email + password + confirm + Google OAuth) | ✅ |
| Vue Forgot Password | Formulaire email + `resetPasswordForEmail` | ✅ |
| Vue Check Email | Message de confirmation avec icône CheckCircle | ✅ |
| Footer | "By continuing, you agree to our Terms of Service and Privacy Policy." | ⚠️ Pas de liens ! |
| Bouton Back | Visible sur signup et forgot-password, revient à login | ✅ |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| LOGIN-1 | **Footer mentionne « Terms of Service and Privacy Policy » mais aucun lien** — texte trompeur, non conforme légalement | 🔴 |
| LOGIN-2 | **Bouton Back invisible sur `check-email`** — l'utilisateur est bloqué sur la page check-email s'il a fait une erreur (le bouton « Back to sign in » existe mais le header back est caché) | 🟡 |
| LOGIN-3 | **Pas de gestion de l'erreur `auth_callback_error`** dans le query param `/login?error=auth_callback_error` — le paramètre est ignoré, l'utilisateur ne voit aucun message d'erreur | 🟠 |
| LOGIN-4 | **Password recovery redirect vers `/?update_password=true`** mais la page `/` n'a aucune logique pour gérer le query param `update_password` — le flow de changement de mot de passe est cassé | 🔴 |
| LOGIN-5 | **`createClient()` appelé à chaque render** de LoginPage — pas dans un `useMemo` ou `useRef`, nouveau client Supabase à chaque render | 🟡 |
| LOGIN-6 | **Pas de protection contre la soumission multiple** — le bouton « Send reset link » a un state `loading` mais le formulaire n'a pas de `disabled` sur les inputs | 🟡 |

---

## 20. Audit Page : `/` — Dashboard

**Fichier** : `src/components/screens/Dashboard.tsx`

### Contenu affiché

| Élément | Contenu | Props utilisées |
|---------|---------|-----------------|
| Greeting | "Hi, {userName}" (h1) | `userName` (firstName) |
| Card Saved | NumberFlow animé, format USD, label "Saved — nice work" ou "Saved this year" | `totalSaved` |
| Card Monthly | NumberFlow animé, format USD, count "{N} active subs/mo" | `totalMonthly`, subscriptions |
| Section "COMING UP" | SectionHeader variant warning + SubscriptionRow × N | subscriptions filtrées `renewing_soon` |
| Section "ALL GOOD" | SectionHeader variant success + SubscriptionRow × 3 + "Show all" | subscriptions filtrées `good` |
| Section "Cancelled" | XCircle icon + SubscriptionRow × N | subscriptions filtrées `cancelled` |
| Bouton fixe | "Add subscription" (full width, variant primary) | `onAddSubscription` |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| DASH-1 | **Aucun empty state** quand l'utilisateur n'a aucun abonnement — affiche juste le greeting et les cards à $0 | 🟠 |
| DASH-2 | **Currency USD hardcodée** — `format: { currency: "USD" }` dans NumberFlow (lignes 105, 124) | 🟠 |
| DASH-3 | **`totalSaved` calculé dans `page.tsx`** uniquement à partir des abonnements annulés, sans considérer la durée depuis l'annulation | 🟡 |
| DASH-4 | **Label conditionnel incohérent** — "Saved — nice work" si cancelled.length > 0, sinon "Saved this year". Mais `totalSaved` peut être 0 même avec des cancelled (si prix = 0) | 🟡 |
| DASH-5 | **Le bouton "Add" a un `bottom-[84px]` hardcodé** — couplé au hauteur de TabBar (84px). Si TabBar change, le layout casse | 🟡 |
| DASH-6 | **`pb-40` sur le contenu scrollable** — padding bottom de 160px pour éviter que le contenu soit sous le bouton fixe, mais c'est approximatif | 🟡 |
| DASH-7 | **Pas de lien entre le card "Monthly Spend" et AllSubscriptions** — on s'attendrait à ce qu'un tap dessus navigue vers AllSubs | 🟡 |

---

## 21. Audit Page : AllSubscriptions

**Fichier** : `src/components/screens/AllSubscriptions.tsx`

### Contenu affiché

| Élément | Contenu |
|---------|---------|
| Header | "Your Subscriptions" + total normalisé + toggle mo/yr |
| Recherche | Input text avec icône Search |
| Liste Active | Section "Active ({N})" avec SubscriptionItem × N |
| Liste Cancelled | Section "Cancelled ({N})" avec SubscriptionItem × N (opacity 60%) |
| Empty state | "No subscriptions yet" (si vide) |
| No results | "No subscriptions matching {query}" |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| ALLSUB-1 | **`onSearch` est un no-op** — `page.tsx:391` passe `onSearch={() => {}}`. Le prop existe mais n'est jamais utilisé côté parent. Le filtrage est entièrement local via `searchTerm` | 🟡 |
| ALLSUB-2 | **Pas de tri** — impossible de trier par prix, nom, ou date de renouvellement | 🟠 |
| ALLSUB-3 | **Normalisation hebdo → mensuel utilise `* 4.33`** — approximation, un mois fait 4.345 semaines en moyenne | 🟡 |
| ALLSUB-4 | **`priceView` persisté en localStorage** sans synchronisation entre onglets | 🟡 |
| ALLSUB-5 | **Pas de bottom padding suffisant** — la liste peut se retrouver partiellement cachée par la TabBar (pas de `pb-[84px]` dans le contenu, mais `AppShell` met `pb-[84px]` sur `main`) | ✅ vérifié ok |
| ALLSUB-6 | **Empty state sans CTA** — "No subscriptions yet" mais pas de bouton "Add your first subscription" | 🟠 |

---

## 22. Audit Page : Settings

**Fichier** : `src/components/screens/Settings.tsx`

### Contenu affiché

| Élément | Contenu |
|---------|---------|
| Titre | "Settings" (h1) |
| Reminder Schedule | 3 PresetOption (Aggressive/Relaxed/Minimal) avec ReminderDots |
| How to Notify You | ToggleRow email + push + SMS dans une Card |
| Account | Email (lecture seule) + Phone (lecture seule) |
| Upgrade | Bouton "Upgrade to Pro" avec icône Star |
| Dev only | "Send test notification" (visible en NODE_ENV=development seulement) |
| Sign Out | Bouton rouge avec icône LogOut |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| SET-1 | **SMS toggle activable mais non fonctionnel** — `handleSmsToggle` update la DB mais aucun backend n'envoie de SMS. L'utilisateur active une fonctionnalité qui ne marche pas | 🟠 |
| SET-2 | **Pas de moyen d'ajouter/modifier le numéro de téléphone** — le champ Phone est en lecture seule, dit "Not set" mais aucun moyen de le configurer | 🟠 |
| SET-3 | **Pas de moyen de modifier l'email** | 🟡 |
| SET-4 | **Pas de moyen de changer le mot de passe** (depuis les settings) | 🟠 |
| SET-5 | **Pas de bouton « Supprimer mon compte »** — RGPD obligatoire | 🔴 |
| SET-6 | **`createClient()` instancié dans le composant** (non mémorisé), chaque render recrée un client | 🟡 |
| SET-7 | **`testingSent` state reset après 2s** mais aucune protection contre les clics multiples pendant le délai | 🟡 |
| SET-8 | **Aucune section « À propos », version, lien support/contact** | 🟠 |
| SET-9 | **Pas de toggle dark mode** | 🟡 |

---

## 23. Audit Page : Notifications

**Fichier** : `src/components/screens/Notifications.tsx`

### Contenu affiché

| Élément | Contenu |
|---------|---------|
| Header | "Notifications" + icône Bell + "Clear all" (bouton destructif) |
| Section "New" | Notifications non lues avec dot rouge, swipe-to-delete |
| Section "Earlier" | Notifications lues (opacity 60%), swipe-to-delete + mark-as-unread |
| Swipe actions | Unread: Delete seul / Read: Mark-as-unread + Delete |
| Cancel followup | Boutons "Yes, I cancelled" + "Remind me again" inline (si unread) |
| Empty state | Icône Bell + "All caught up!" + texte explicatif |
| Infinite scroll | IntersectionObserver sentinel + spinner |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| NOTIF-1 | **"Clear all" sans confirmation** — un tap supprime toutes les notifications immédiatement, pas de modal de confirmation | 🟠 |
| NOTIF-2 | **onClick sur notification = markAsRead seulement** — ne navigue pas vers l'abonnement concerné alors que `subscriptionId` est disponible | 🟠 |
| NOTIF-3 | **Swipe-to-action non accessible au clavier** — seul touch fonctionne, pas de fallback clavier pour delete/mark-unread | 🟠 |
| NOTIF-4 | **Pas de bouton « Mark all as read »** — la fonction `markAllAsRead` existe dans `useNotifications` mais n'est pas exposée dans l'UI | 🟡 |
| NOTIF-5 | **`hasDoubleActions` ne check `onMarkAsUnread`/`onDelete` qu'avec `!!`** — si les props sont `undefined`, les swipe actions ne s'affichent pas. Fragile. | 🟡 |
| NOTIF-6 | **Pas de debounce sur loadMore** — si l'IntersectionObserver fire plusieurs fois rapidement, plusieurs fetches parallèles sont possibles (bien que `loadingMore` protège partiellement) | 🟡 |
| NOTIF-7 | **"Remind me again" appelle `resetCancelAttempt`** — le label laisse penser que ça planifie un nouveau rappel, mais ça reset juste l'attempt. La prochaine notification sera celle du cron `cancel-followup` (24h+). L'utilisateur peut ne pas comprendre quand arrivera le rappel | 🟡 |

---

## 24. Audit Page : SubscriptionManagement

**Fichier** : `src/components/screens/SubscriptionManagement.tsx`

### Contenu affiché

| Élément | Contenu |
|---------|---------|
| Header | Nom du service + ServiceIcon + bouton back |
| Status Badge | "Cancelled" (gris) ou "Renews in X days" (coral) |
| Formulaire | SubscriptionFormFields (prix, cycle, date) — readOnly si cancelled |
| Save Button | Apparaît seulement si `hasChanges && !isCancelled` |
| CTA fixe (bas) | "Cancel subscription" (danger) ou "Restore subscription" (primary) |
| Delete | "Remove from list" → "Tap again to confirm" (double-tap, auto-reset 3s) |

### Flow d'annulation (3 modales séquentielles)

```
Cancel subscription (bouton)
    │
    ├─ Si cancelUrl existe → CancelRedirectModal
    │   └─ "Go to {name}" → window.open(cancelUrl) → CancelRedirectModal se ferme
    │       └─ 500ms timeout → ConfirmCancellationModal
    │
    └─ Si pas de cancelUrl → ConfirmCancellationModal directement

ConfirmCancellationModal
    ├─ "Yes, I canceled it" → onCancelConfirm → CancellationSuccessModal
    └─ "No, I'll do it later" → onCancelNotYet → ferme la modale

CancellationSuccessModal
    └─ "Done" → onCancelComplete → retour Dashboard
```

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| MANAGE-1 | **CancelRedirectModal `remindMe` ignoré** — le state `remindMe` est créé (ligne 20), passé à `onProceed(remindMe)` (ligne 69), mais `SubscriptionManagement.tsx:193` définit `onProceed` sans paramètre : `() => { ... }`. Le boolean est perdu | 🟠 |
| MANAGE-2 | **`setTimeout(() => setShowConfirmCancel(true), 500)` après fermeture CancelRedirect** — timing arbitraire. Sur un téléphone lent, l'utilisateur peut voir un flash. Sur un réseau lent, la page externe peut ne pas avoir eu le temps de s'ouvrir | 🟡 |
| MANAGE-3 | **Pas de validation du prix** — `parseFloat(formData.price)` peut retourner `NaN` si l'utilisateur entre du texte. Pas de validation `> 0` | 🟠 |
| MANAGE-4 | **Save navigue immédiatement** — `onSave` dans `page.tsx:343-354` fait `await updateSubscription` puis `returnToPrevious()`. Si l'update échoue, l'utilisateur est quand même renvoyé à l'écran précédent (le `catch` fait juste `console.error`) | 🟠 |
| MANAGE-5 | **Pas de feedback de succès** après save/restore/cancel — l'utilisateur est renvoyé à l'écran précédent sans savoir si ça a marché | 🟠 |
| MANAGE-6 | **Delete double-tap sans feedback sonore/visuel clair** — "Tap again to confirm" avec changement de couleur (accent), mais peut être facile à rater sur mobile | 🟡 |
| MANAGE-7 | **CTA fixe `bottom-0` peut chevaucher le contenu** sur iPhone sans safe-area — bien que `pb-[max(2rem,env(safe-area-inset-bottom))]` est utilisé | ✅ Géré |
| MANAGE-8 | **Pas de bouton « Decide Later » pour le cancel flow** — le seul choix est "Yes" ou "No, I'll do it later" — mais ce dernier est en rouge (accent) avec icône X, ce qui paraît négatif. Inconsistant avec le principe TDAH | 🟡 |

---

## 25. Audit Page : AddSubscriptionStep1

**Fichier** : `src/components/screens/AddSubscriptionStep1.tsx`

### Contenu affiché

| Élément | Contenu |
|---------|---------|
| Header | "Add Subscription" + back |
| Progress | "Step 1 of 2" + dots (1 actif / 1 inactif) |
| Recherche | Input avec icône Search (debounce 300ms) |
| Grid services | Grille 3 colonnes avec ServiceIcon + nom |
| Custom option | Carte en pointillés "Add {query}" quand recherche active |
| Loading | Spinner Loader2 pendant le chargement initial |
| Empty search | Icône Search + "Start typing to search" |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| ADD1-1 | **`onSearch` est un no-op** — `page.tsx:204` passe `onSearch={() => {}}`. Le prop n'est jamais utilisé par le parent | 🟡 |
| ADD1-2 | **Pas de browse alphabétique** — l'utilisateur doit chercher ou choisir parmi les populaires. Pas de scroll de tous les services | 🟡 |
| ADD1-3 | **`searchServices` limité à 6 résultats** — `searchServices(query, 6)`. Si le service est en 7ème position, l'utilisateur ne le trouvera pas et devra taper un terme plus spécifique | 🟡 |
| ADD1-4 | **Pas de récents / favoris** — pas d'historique des services ajoutés précédemment | 🟡 |
| ADD1-5 | **Grid 3 colonnes fixe** — pas responsive. Sur un écran très petit, les icônes et noms seront compressés | 🟡 |

---

## 26. Audit Page : AddSubscriptionStep2

**Fichier** : `src/components/screens/AddSubscriptionStep2.tsx`

### Contenu affiché

| Élément | Contenu |
|---------|---------|
| Header | Nom du service + ServiceIcon + back |
| Progress | "Step 2 of 2" + dots (2 actifs) |
| Formulaire | SubscriptionFormFields (price, cycle, renewalDate) |
| Info | "Almost there… Add the details" |
| Save CTA fixe | "Save subscription" (full width, primary) |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| ADD2-1 | **Pas de validation avant save** — le prix peut être vide (""), ce qui sera parsé comme `NaN` par `parseFloat` dans `page.tsx:300` | 🟠 |
| ADD2-2 | **Pas de loading state sur le bouton Save** — double-clic possible, l'abonnement peut être ajouté 2 fois | 🟠 |
| ADD2-3 | **Pas de feedback de succès** — après save, navigation immédiate vers Dashboard sans toast | 🟠 |
| ADD2-4 | **`service.logo.startsWith("http")` peut crasher** si `service.logo` est `undefined` ou `null` — pas de null check (contrairement à SubscriptionManagement qui utilise `subscription.logo?.startsWith`) | 🟡 |
| ADD2-5 | **ServiceStep2Wrapper dans page.tsx est un composant défini dans le render** — cause des remount à chaque re-render du parent, perte d'état du formulaire possible | 🟠 |
| ADD2-6 | **Pas de bouton "Add another"** après save — l'utilisateur doit revenir au Dashboard puis re-cliquer "Add subscription" | 🟡 |

---

## 27. Audit Modale : UpgradeModal

**Fichier** : `src/components/screens/modals/UpgradeModal.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| Icône | Star dans cercle accent/10 |
| Titre | "Unlock SubSnooze Pro" |
| Features | "Unlimited subscriptions", "SMS + Push + Email reminders", "Money saved dashboard" |
| Prix | "$39 lifetime" + "(one-time, forever)" |
| CTA | "Get Pro - $39" (primary) |
| Dismiss | "No thanks, stay on free" |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| UPG-1 | **Le bouton "Get Pro - $39" ne fait rien** — `onUpgrade` dans `page.tsx` = `() => setModal(null)`. Ferme la modale sans aucun paiement | 🔴 |
| UPG-2 | **Pas de focus trap** — l'utilisateur peut Tab en dehors de la modale | 🟠 |
| UPG-3 | **Pas de gestion Escape** — appuyer Escape ne ferme pas la modale | 🟠 |
| UPG-4 | **Features trompeuses** — "Money saved dashboard" est listé comme feature Pro mais est déjà disponible en gratuit (le Dashboard affiche `totalSaved`) | 🟠 |
| UPG-5 | **Pas de bouton fermer (X)** — seul le backdrop click et "No thanks" ferment la modale | 🟡 |
| UPG-6 | **Padding incohérent** — `p-8` ici vs `p-6` dans les autres modales | 🟡 |

---

## 28. Audit Modale : CancelRedirectModal

**Fichier** : `src/components/screens/modals/CancelRedirectModal.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| ServiceIcon | Logo du service |
| Titre | "Cancel {name}" |
| Description | "To cancel your {name} subscription, you'll be taken to {name}'s website." |
| Info card | PiggyBank "You'll save {price}/month" + Calendar "Access until {date}" |
| CTA | "Go to {name}" (danger, avec ExternalLink icon) |
| Dismiss | "Not now" |
| Checkbox | "Remind me if I forget to cancel" |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| CANCEL-1 | **`remindMe` jamais transmis au parent** — voir MANAGE-1. Le checkbox est décoratif | 🟠 |
| CANCEL-2 | **Info card affiche le prix mensuel même pour un abonnement yearly** — `formatCurrency(subscription.price)/month` mais si cycle=yearly, le prix affiché est le prix annuel avec "/month" — incohérent | 🟠 |
| CANCEL-3 | **Pas de focus trap ni Escape handler** | 🟠 |
| CANCEL-4 | **Le checkbox est en dessous du bouton "Not now"** — hiérarchie visuelle contre-intuitive, l'utilisateur peut ne pas le voir | 🟡 |

---

## 29. Audit Modale : ConfirmCancellationModal

**Fichier** : `src/components/screens/modals/ConfirmCancellationModal.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| Icône | "?" (texte) dans cercle accent/10 |
| Titre | "Did you cancel {name}?" |
| Description | "Let us know so we can update your subscription status and track your savings." |
| CTA | "Yes, I canceled it" (primary, avec Check icon) |
| Dismiss | "No, I'll do it later" (accent, avec X icon) |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| CONF-1 | **"canceled" vs "cancelled"** — orthographe américaine dans le bouton mais britannique dans le reste de l'app (header "Cancelled", label "Cancelled"). Incohérent | 🟡 |
| CONF-2 | **Le bouton "No, I'll do it later" est en accent (rouge)** — couleur habituellement réservée aux actions dangereuses/négatives. « Décider plus tard » devrait être neutre/ghost | 🟡 |
| CONF-3 | **Pas de focus trap ni Escape handler** | 🟠 |
| CONF-4 | **Le bouton dismiss n'a pas de `focus-visible` ring** — contrairement à tous les autres boutons de l'app | 🟡 |

---

## 30. Audit Modale : CancellationSuccessModal

**Fichier** : `src/components/screens/modals/CancellationSuccessModal.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| Icône | PartyPopper dans cercle primary/10 |
| Titre | "You did it!" (primary) |
| Savings | "${monthlySavings}/month saved" |
| Description | "{name} has been marked as canceled. Your access continues until {date}." |
| Yearly savings | Card avec "You'll save this year" + gros montant vert |
| CTA | "Done" (primary) |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| SUCCESS-1 | **"You'll save this year" calcul naïf** — `monthlySavings * 12` toujours, même si l'annulation a lieu en novembre (ne devrait sauver que 1-2 mois cette année) | 🟡 |
| SUCCESS-2 | **Pas de confetti/animation** — le titre dit "You did it!" mais aucune animation festive. Opportunité TDAH manquée | 🟡 |
| SUCCESS-3 | **Pas de focus trap ni Escape handler** | 🟠 |
| SUCCESS-4 | **Hardcoded `$` dans le template** — `${monthlySavings.toFixed(2)}/month` et `${yearlySavings.toFixed(2)}` utilisent `$` directement au lieu de `formatCurrency` | 🟠 |

---

## 31. Audit Composant : AppShell

**Fichier** : `src/components/layout/AppShell.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| Header fixe | Logo "S" + "SubSnooze" + Notification bell avec badge count |
| Main | `{children}` avec `pb-[84px] pt-14` |
| TabBar fixe | 3 tabs (Home, Subs, Settings) |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| SHELL-1 | **Header `h-14` (56px) et TabBar `h-[84px]`** — hardcodés. Le contenu scrollable a exactement `pt-14 pb-[84px]` ce qui correspond, mais si on change l'un il faut changer les deux | 🟡 |
| SHELL-2 | **`bg-surface/80 backdrop-blur-sm`** — le header est semi-transparent, ce qui peut poser des problèmes de lisibilité quand du contenu scroll en dessous | 🟡 |
| SHELL-3 | **Pas de `role="tablist"`** sur le TabBar container ni `role="tabpanel"` sur le main | 🟡 |
| SHELL-4 | **Le logo "S" n'est pas un lien vers home** — pas de navigation au clic sur le logo | 🟡 |

---

## 32. Audit Composant : DetailShell

**Fichier** : `src/components/layout/DetailShell.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| Header fixe | Back button + `headerRight` + title + `headerActions` |
| Main | `{children}` avec `pt-14 pb-[env(safe-area-inset-bottom)]` |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| DETAIL-1 | **Pas de TabBar** — normal pour les écrans de détail, mais il n'y a pas de navigation alternative pour revenir aux tabs. Seul le bouton back fonctionne | ✅ Attendu |
| DETAIL-2 | **`headerRight` avant `title`** dans le flex — l'icône du service apparaît avant le titre, ce qui peut être visuellement confus | 🟡 |
| DETAIL-3 | **Header identique à AppShell** (`bg-surface/80 backdrop-blur-sm`) mais sans logo — OK, cohérent | ✅ |

---

## 33. Audit Composant : LoginForm

**Fichier** : `src/components/auth/LoginForm.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| Google OAuth | Bouton "Continue with Google" avec SVG icon |
| Séparateur | "or" |
| Email | Input avec icône Mail, label, autoComplete="email" |
| Password | Input avec icône Lock, toggle visibility Eye/EyeOff |
| Forgot | Lien "Forgot password?" |
| Submit | "Sign in" / "Signing in…" |
| Switch | "Don't have an account? Sign up" |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| AUTH-1 | **Erreur API affichée brute** — `error.message` de Supabase est affiché tel quel (ex: "Invalid login credentials"). Pas de message user-friendly | 🟡 |
| AUTH-2 | **Pas de rate limiting côté client** — l'utilisateur peut spammer le bouton sign in | 🟡 |
| AUTH-3 | **Google OAuth icon monochrome** — les guidelines Google demandent le logo couleur officiel | 🟡 |
| AUTH-4 | **`loading` ne désactive pas les inputs** — pendant le loading, les inputs restent éditables | 🟡 |

---

## 34. Audit Composant : SignupForm

**Fichier** : `src/components/auth/SignupForm.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| Google OAuth | Identique à LoginForm |
| Name | Input avec icône User |
| Email | Input avec icône Mail |
| Password | Input avec toggle, minLength=6 |
| Confirm Password | Input sans toggle |
| Submit | "Create account" / "Creating account…" |
| Switch | "Already have an account? Sign in" |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| SIGNUP-1 | **minLength=6 seulement** — pas de vérification de complexité (majuscules, chiffres, caractères spéciaux). Faible pour la sécurité | 🟠 |
| SIGNUP-2 | **Pas de checkbox CGU/Privacy Policy** — obligatoire légalement avant la soumission | 🔴 |
| SIGNUP-3 | **Le toggle password affecte les deux champs** — un seul state `showPassword` pour password ET confirmPassword. Si je toggle, les deux se révèlent, ce qui peut être désiré ou non | 🟡 |
| SIGNUP-4 | **Confirm Password n'a pas de toggle visibility** — icône œil manquante sur le champ confirmation (pas de bouton toggle) | 🟡 |
| SIGNUP-5 | **Validation mot de passe seulement au submit** — pas de feedback en temps réel pendant la saisie (force du mot de passe, match en direct) | 🟡 |

---

## 35. Audit Composant : SubscriptionFormFields

**Fichier** : `src/components/ui/SubscriptionFormFields.tsx`

### Contenu

| Élément | Contenu |
|---------|---------|
| Row Prix | Label dynamique + input text (inputMode="decimal") avec $ prefix |
| Row Cycle | Label + select (Monthly/Yearly/Weekly) avec icône chevron |
| Row Date | Label + input date avec icône Calendar |

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| FORM-1 | **Le champ prix est `type="text"` avec `inputMode="decimal"`** — permet de saisir des lettres et caractères spéciaux. Pas de validation pattern | 🟠 |
| FORM-2 | **Validation de date empêche les dates passées** (`min={today}`) — mais pour SubscriptionManagement, une date passée peut être légitime (dernier renouvellement d'un abo annulé) | 🟡 |
| FORM-3 | **`renewalDate` bloqué si vide** — `handleRenewalDateChange` vérifie `newDate && newDate >= today` — si l'utilisateur efface la date, il ne peut plus la remettre à une date passée | 🟡 |
| FORM-4 | **Le champ prix a un `style={{ width }}` dynamique** — calcul de largeur `(length / 1.66)em` est approximatif, peut tronquer ou déborder | 🟡 |
| FORM-5 | **Pas de symbole monétaire configurable** — `$` est hardcodé dans le composant (ligne 82) | 🟠 |

---

## 36. Audit : AuthContext & Middleware

**Fichiers** : `src/contexts/AuthContext.tsx`, `src/middleware.ts`, `src/lib/supabase/middleware.ts`

### Flow d'authentification

```
Utilisateur non connecté
    │
    ├─ middleware.ts intercepte toutes les requêtes
    │   └─ updateSession() dans lib/supabase/middleware.ts
    │       ├─ Refresh le token si expiré
    │       ├─ Si pas de session + path ≠ /login → redirect /login
    │       └─ Si session + path = /login → redirect /
    │
    ├─ /login → LoginForm ou SignupForm
    │   └─ supabase.auth.signInWithPassword() ou signInWithOAuth()
    │       └─ Succès → middleware redirige vers /
    │
    └─ /auth/callback → exchangeCodeForSession()
        ├─ Succès → redirect /
        └─ Erreur → redirect /login?error=auth_callback_error
```

### Problèmes identifiés

| # | Problème | Sévérité |
|---|----------|----------|
| AUTH-CTX-1 | **`getSession()` déprécié par Supabase** — la doc recommande `getUser()` pour valider le token côté serveur. `getSession()` lit le token local sans le valider | 🟠 |
| AUTH-CTX-2 | **Profile fetch asynchrone non bloquant** — `setLoading(false)` est appelé AVANT que le profil soit chargé (ligne 81). Les composants enfants voient `profile = null` momentanément | 🟡 |
| AUTH-CTX-3 | **`fetchProfile` appelé dans useEffect sans la variable dans les deps** — `eslint-disable` utilisé | 🟡 |
| AUTH-CTX-4 | **`signOut` utilise `window.location.href = "/login"`** — hard reload au lieu de navigation React. Perd tout le state client | 🟡 accepté (intentionnel pour clean state) |
| AUTH-CTX-5 | **Pas de gestion du token expiré côté client** — si le refresh token expire pendant que l'app est ouverte, les requêtes vont échouer silencieusement. Pas de redirect vers /login | 🟠 |

---

## 37. Audit : Hooks (useSubscriptions, useNotifications)

### useSubscriptions

| Fonctionnalité | Statut | Notes |
|---------------|--------|-------|
| Fetch initial | ✅ | Via `api.getSubscriptions(userId)` |
| Realtime sync | ✅ | Channel Supabase `postgres_changes` |
| Optimistic add | ✅ | Temp ID `temp-{Date.now()}`, rollback on error |
| Optimistic update | ✅ | Recalcule le status basé sur `daysUntilRenewal` |
| Optimistic cancel | ✅ | Status → "cancelled" |
| Optimistic delete | ✅ | Filter out, rollback on error |
| Record cancel attempt | ✅ | Set `cancelAttemptDate` + `cancelVerified: false` |
| Verify cancellation | ✅ | `cancelVerified: true`, status → "cancelled" |
| Reset cancel attempt | ✅ | Clear `cancelAttemptDate` + `cancelVerified` |
| Restore | ✅ | Recalcule status, clear cancel data |

**Problèmes :**
- `eslint-disable react-hooks/exhaustive-deps` sur le realtime effect — `supabase` n'est pas dans les deps
- `cancelSubscription` existe dans le hook mais n'est jamais utilisé (le flow passe par `verifyCancellation`)

### useNotifications

| Fonctionnalité | Statut | Notes |
|---------------|--------|-------|
| Fetch initial (page 0) | ✅ | Paginé |
| Load more (infinite scroll) | ✅ | Incrémente `page` |
| Realtime sync | ✅ | INSERT → prepend, UPDATE → replace, DELETE → filter |
| Mark as read | ✅ | Optimistic |
| Mark as unread | ✅ | Optimistic |
| Mark all as read | ✅ | Optimistic |
| Delete single | ✅ | Optimistic |
| Delete all | ✅ | Optimistic |

**Problèmes :**
- `eslint-disable react-hooks/exhaustive-deps` sur le realtime effect
- `markAllAsRead` existe mais n'est pas exposé dans l'UI Notifications
- La pagination peut se désynchroniser si des notifications arrivent en temps réel pendant le loadMore

---

## 38. Résumé des Bugs Inter-Composants

| # | Bug | Composants impliqués | Sévérité |
|---|-----|---------------------|----------|
| IC-1 | **`remindMe` checkbox perdu** | CancelRedirectModal → SubscriptionManagement → page.tsx | 🟠 |
| IC-2 | **UpgradeModal `onUpgrade` = no-op** | Settings → UpgradeModal → page.tsx | 🔴 |
| IC-3 | **Password recovery redirect cassé** | /auth/callback → /?update_password=true → page.tsx (non géré) | 🔴 |
| IC-4 | **Notification click ne navigue pas** | Notifications → page.tsx `handleNotificationClick` | 🟠 |
| IC-5 | **ServiceStep2Wrapper redéfini à chaque render** | page.tsx → AddSubscriptionStep2 | 🟠 |
| IC-6 | **`selectedSub` snapshot (stale data)** | page.tsx → SubscriptionManagement | 🟡 |
| IC-7 | **Save/Delete/Restore naviguent même en cas d'erreur** | page.tsx → SubscriptionManagement (catch just logs) | 🟠 |
| IC-8 | **Pas de history.pushState** | page.tsx — back button navigateur quitte l'app | 🔴 |
| IC-9 | **`auth_callback_error` param ignoré** | /login?error=... → LoginPage (non lu) | 🟠 |
| IC-10 | **CancelRedirectModal affiche prix mensuel pour un abo yearly** | CancelRedirectModal lit `subscription.price` brut | 🟠 |
| IC-11 | **CancellationSuccessModal utilise `$` hardcodé au lieu de `formatCurrency`** | CancellationSuccessModal | 🟠 |
| IC-12 | **Le bouton back du navigateur quitte l'app** | Toute l'app SPA sans gestion de l'History API | 🔴 |
