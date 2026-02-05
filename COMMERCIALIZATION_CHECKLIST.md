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
