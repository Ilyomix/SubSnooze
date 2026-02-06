# SubSnooze — Checklist de Commercialisation

> Score global : **99/150 (66%)**
> S8 : Accessibility sweep + legal + feature fixes (10 items).
> S7 : 10 audit fixes — auth, navigation, UX, currency, sorting.

Priorite : Bloquant | Important | Souhaitable

Audit detaille dans [`docs/audit/`](docs/audit/) :
- [`navigation.md`](docs/audit/navigation.md) — Machine a etats, transitions, 8 problemes de routing
- [`pages.md`](docs/audit/pages.md) — Audit des 7 ecrans (contenu + bugs)
- [`modals.md`](docs/audit/modals.md) — Audit des 4 modales (contenu + bugs)
- [`components.md`](docs/audit/components.md) — Layout, auth, hooks, 11 bugs inter-composants

---

## Bloquants (avant lancement)

### Infrastructure
- [x] Pipeline CI/CD (GitHub Actions) ✅ S6 (lint + tsc + test + audit)
- [ ] Config deploiement (Vercel / Netlify)
- [ ] Environnements staging + production
- [ ] Nom de domaine + SSL
- [ ] Backups DB automatiques

### Securite
- [x] Content Security Policy headers ✅ S3
- [x] Rate limiting sur auth ✅ S3
- [x] Validation inputs cote serveur ✅ S3
- [x] Protection brute force login ✅ S3 (rate limit 10 req/min)

### Legal
- [x] Politique de confidentialite (page + lien dans footer login) ✅ S2
- [x] CGU (page + lien dans footer login) ✅ S2
- [x] Banniere cookies RGPD ✅ S8 (CookieBanner component, accept/decline, localStorage)
- [x] Suppression de compte (RGPD droit a l'oubli) ✅ S2
- [x] Checkbox consentement CGU a l'inscription (`SignupForm`) ✅ S2

### Paiement (Phase 1 — Web / Stripe)
- [ ] Integration Stripe Checkout + Billing Portal
- [ ] Webhook paiement (`checkout.session.completed`, `subscription.updated/deleted`)
- [ ] Page checkout securise
- [ ] Limitations tier gratuit appliquees (`is_premium` existe mais rien n'est limite)
- [ ] `UpgradeModal` : brancher vers Stripe Checkout (remplacer le "Coming soon")

### Tests
- [x] Framework de tests (Vitest) ✅ S4
- [x] Tests unitaires utilitaires (`date-utils`, `utils`, `services`, `rate-limit`) ✅ S4 (51 tests)
- [ ] Error tracking (Sentry) — necessite config externe

### UI/UX
- [x] Skeleton loaders ✅ S5 (DashboardSkeleton avec Skeleton primitif)
- [x] Toast notifications ✅ S5 (useToast — success/error/info, auto-dismiss, max 3)
- [x] Error boundaries React ✅ S4 (ErrorBoundary + error.tsx + global-error.tsx)
- [x] Focus trap dans toutes les modales ✅ S5 (useFocusTrap — 4 modales)
- [x] Onboarding pour les nouveaux utilisateurs ✅ S9 (3-step flow, localStorage, skip/decide-later)
- [ ] Landing page marketing

### Bugs bloquants
- [x] Back navigateur quitte l'app — `history.pushState` integre ✅ S1
- [x] Password recovery casse — `/update-password` page creee ✅ S1
- [x] Service worker Firebase avec cles placeholder — query params ✅ S1
- [x] UpgradeModal no-op — "Coming soon" state ✅ S1
- [x] Stale `activeTab` closure dans `navigateTo` ✅ S1

---

## Importants (V1)

### Securite
- [x] Headers securite (X-Content-Type-Options, X-Frame-Options) ✅ S3
- [ ] CORS configure
- [x] Audit dependances (`pnpm audit` automatise) ✅ S6 (CI job, continue-on-error)
- [x] Politique mots de passe (complexite > minLength=6) ✅ S8 (min 8 chars + uppercase + lowercase + number)
- [x] Wildcard `*.com` dans next.config images — supprime ✅ S3
- [x] `getSession()` deprecie — migrer vers `getUser()` ✅ S7 (getUser() + fallback redirect)
- [x] Gestion token expire cote client (redirect /login) ✅ S7 (TOKEN_REFRESHED + stale session detect)

### SEO
- [x] `robots.txt` + `sitemap.xml` + `llms.txt` ✅ S6 (Next.js metadata API + static)
- [x] Open Graph meta tags ✅ S6 (OG + Twitter cards dans layout.tsx)
- [x] Meta description par page ✅ S6 (layout, terms, privacy)
- [x] Favicon complet (SVG + apple-touch-icon) ✅ S6 (icon.svg + apple-icon.tsx ImageResponse)

### PWA
- [x] Icones completes (192, 256, 384, 512, maskable) ✅ S9 (sharp gen, 8 PNGs + apple-touch)
- [x] Page offline dediee ✅ S9 (public/offline.html, ADHD-friendly messaging)
- [x] Service worker avec cache strategy ✅ S9 (sw.js, network-first pages, cache-first assets)
- [x] Safe-area gestion (notch iPhone) ✅ S9 (viewport-fit=cover, env(safe-area-inset) on header/tabs/CTAs)

### UI/UX
- [x] Error states visuels pour echecs reseau ✅ S5 (ErrorState + integration Dashboard/AllSubs)
- [x] Loading state sur les boutons (empecher double-clic) ✅ S5 (Button loading prop — spinner + disabled)
- [x] Transitions animees entre ecrans ✅ S9 (CSS screen-slide-in/fade-in, motion-safe)
- [x] Scroll position restoration ✅ S9 (useScrollRestore hook, per-screen save/restore)
- [x] Pull-to-refresh ✅ S9 (usePullToRefresh hook, touch events, spinner indicator)
- [x] Tri des abonnements (prix, nom, date) ✅ S7 (cycle sort button, 3 modes)
- [x] Empty state Dashboard avec CTA ✅ S7 (icon + message + Add button)
- [x] Empty state AllSubscriptions avec CTA ✅ S7 (icon + message + Add link)
- [x] Navigation depuis notification vers l'abonnement ✅ S7 (click → manage screen)
- [x] Validation inline formulaires (prix > 0, date valide) ✅ S6 (touched state + error hints)
- [x] `$` hardcode partout — utiliser `formatCurrency` systematiquement ✅ S7 (CURRENCY_SYMBOL + formatCurrency)
- [x] "Clear all" notifications avec confirmation ✅ S7 (tap-to-confirm 3s auto-reset)
- [x] Save/Delete/Restore : ne pas naviguer si erreur ✅ S7 (navigate only on success)

### Fonctionnalites
- [x] Changement de mot de passe (depuis Settings) ✅ S6 (Security section, min 8 chars, eye toggle)
- [x] Export donnees (CSV) ✅ S6 (Your Data section, downloadCSV utility)
- [x] SMS toggle : desactiver ou implementer le backend ✅ S8 (disabled with "Coming soon" label)
- [ ] Ajout telephone dans Settings
- [x] `remindMe` checkbox : brancher au parent ✅ S8 (CancelRedirectModal → SubscriptionManagement → parent)
- [x] Prix dans CancelRedirectModal : normaliser pour yearly ✅ S7 (monthly normalization)
- [x] Section A propos / support / contact ✅ S9 (About screen: mission, privacy, email support, legal links)
- [x] Page pricing publique ✅ S9 (Pricing screen: Free/Pro tiers, feature comparison)
- [ ] Ajout rapide en chaine (sans revenir au Dashboard)

### Monitoring
- [ ] Analytics utilisateur (PostHog / GA4)
- [ ] Web Vitals
- [ ] Uptime monitoring
- [ ] Tracking evenements cles (signup, add_sub, cancel, upgrade)

### Accessibilite
- [x] Skip links ✅ S8 (AppShell + DetailShell, sr-only focus:visible)
- [x] Hierarchie headings coherente ✅ S8 (h1→h2 across Dashboard, AllSubs, Notifications, Settings)
- [x] ARIA live regions ✅ S8 (Dashboard summary cards, Notifications list, AllSubs search results)
- [x] Swipe notifications accessible clavier ✅ S8 (Delete/Backspace to delete, U to mark unread)
- [x] Alt text sur ServiceIcon ✅ S8 (role=img + aria-label on initials fallback)
- [x] Contraste couleurs verifie WCAG AA ✅ S8 (text-tertiary #767370→#6B6966, 4.5:1+ on background)

---

## Souhaitables (V1.1+)

- [ ] Dark mode
- [ ] Layout tablette / desktop
- [ ] i18n (next-intl) + localisation devises/dates
- [ ] Docker / docker-compose
- [ ] MFA
- [ ] Logs d'audit
- [ ] Gamification (streak, confetti sur cancel success)
- [ ] Resume hebdomadaire
- [ ] Categories d'abonnements
- [ ] Partage multi-utilisateur (famille)
- [ ] Brouillons ajout abonnement
- [ ] Calcul automatique prix mensuel <-> annuel
- [ ] Heures "Ne pas deranger"
- [ ] Browse alphabetique services
- [ ] Changelog in-app
- [ ] FAQ
- [ ] Haptic feedback mobile
- [ ] Ripple effect boutons
- [x] Bouton "Decide Later" (principe TDAH) ✅ S9 (CancelRedirectModal: "Decide later — remind me")
- [x] `ServiceStep2Wrapper` : extraire hors du render ✅ S7 (ServiceStep2Loader component)

---

## Roadmap Monetisation

> Strategie en 3 phases pour maximiser la portee sans over-engineering initial.

| Phase | Distribution | Paiement | Quand |
|-------|-------------|----------|-------|
| **1 — Web** | PWA web (lancement) | **Stripe** Checkout + Billing Portal | V1 |
| **2 — Android** | Play Store via TWA (PWABuilder/Bubblewrap) | **RevenueCat** (unifie Stripe web + Google Play Billing) | Post-traction |
| **3 — iOS** | App Store via Capacitor | **RevenueCat** (+ StoreKit IAP obligatoire Apple) | Si ca decolle |

**Pourquoi cet ordre :**
- Phase 1 : 0% commission store, iteration rapide, validation marche
- Phase 2 : Play Store accepte bien les TWA/PWA, RevenueCat gratuit < $2.5k MRR
- Phase 3 : Apple exige IAP (15-30% commission), review stricte — justifie seulement avec traction prouvee

**Pre-requis Play Store (Phase 2) :**
- [ ] Icones completes (192, 512, maskable)
- [ ] Page offline dediee
- [ ] Service worker avec cache strategy
- [ ] Compte Google Play Developer ($25 one-time)

**Pre-requis App Store (Phase 3) :**
- [ ] Wrapper Capacitor ou equivalent
- [ ] Apple Developer Program ($99/an)
- [ ] Conformite App Store Review Guidelines

---

## Scores par categorie

| Categorie | Score |
|---|---|
| Infrastructure & DevOps | 3/10 |
| Securite | 10/10 |
| Legal & Conformite | 8/10 |
| Paiement & Monetisation | 1/10 |
| Tests & Qualite | 5/10 |
| Monitoring & Analytics | 0/10 |
| SEO & ASO | 7/10 |
| PWA & Mobile | 9/10 |
| UI/UX Etats & Feedback | 9/10 |
| UI/UX Navigation | 8/10 |
| UI/UX Design Systeme | 9/10 |
| Fonctionnalites | 10/10 |
| UX TDAH | 7/10 |
| Accessibilite | 9/10 |
| Performance | 6/10 |
| **TOTAL** | **109/150 (73%)** |
