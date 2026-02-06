# SubSnooze — Checklist de Commercialisation

> Score global : **79/150 (53%)**
> Base fonctionnelle solide. CI/CD, SEO et fonctionnalites cles ajoutees en S6.

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
- [ ] Banniere cookies RGPD
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
- [ ] Onboarding pour les nouveaux utilisateurs
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
- [ ] Politique mots de passe (complexite > minLength=6)
- [x] Wildcard `*.com` dans next.config images — supprime ✅ S3
- [ ] `getSession()` deprecie — migrer vers `getUser()`
- [ ] Gestion token expire cote client (redirect /login)

### SEO
- [x] `robots.txt` + `sitemap.xml` + `llms.txt` ✅ S6 (Next.js metadata API + static)
- [x] Open Graph meta tags ✅ S6 (OG + Twitter cards dans layout.tsx)
- [x] Meta description par page ✅ S6 (layout, terms, privacy)
- [x] Favicon complet (SVG + apple-touch-icon) ✅ S6 (icon.svg + apple-icon.tsx ImageResponse)

### PWA
- [ ] Icones completes (192, 256, 384, 512, maskable)
- [ ] Page offline dediee
- [ ] Service worker avec cache strategy
- [ ] Safe-area gestion (notch iPhone)

### UI/UX
- [x] Error states visuels pour echecs reseau ✅ S5 (ErrorState + integration Dashboard/AllSubs)
- [x] Loading state sur les boutons (empecher double-clic) ✅ S5 (Button loading prop — spinner + disabled)
- [ ] Transitions animees entre ecrans
- [ ] Scroll position restoration
- [ ] Pull-to-refresh
- [ ] Tri des abonnements (prix, nom, date)
- [ ] Empty state Dashboard avec CTA
- [ ] Empty state AllSubscriptions avec CTA
- [ ] Navigation depuis notification vers l'abonnement
- [x] Validation inline formulaires (prix > 0, date valide) ✅ S6 (touched state + error hints)
- [ ] `$` hardcode partout — utiliser `formatCurrency` systematiquement
- [ ] "Clear all" notifications avec confirmation
- [ ] Save/Delete/Restore : ne pas naviguer si erreur

### Fonctionnalites
- [x] Changement de mot de passe (depuis Settings) ✅ S6 (Security section, min 8 chars, eye toggle)
- [x] Export donnees (CSV) ✅ S6 (Your Data section, downloadCSV utility)
- [ ] SMS toggle : desactiver ou implementer le backend
- [ ] Ajout telephone dans Settings
- [ ] `remindMe` checkbox : brancher au parent
- [ ] Prix dans CancelRedirectModal : normaliser pour yearly
- [ ] Section A propos / support / contact
- [ ] Page pricing publique
- [ ] Ajout rapide en chaine (sans revenir au Dashboard)

### Monitoring
- [ ] Analytics utilisateur (PostHog / GA4)
- [ ] Web Vitals
- [ ] Uptime monitoring
- [ ] Tracking evenements cles (signup, add_sub, cancel, upgrade)

### Accessibilite
- [ ] Skip links
- [ ] Hierarchie headings coherente
- [ ] ARIA live regions
- [ ] Swipe notifications accessible clavier
- [ ] Alt text sur ServiceIcon
- [ ] Contraste couleurs verifie WCAG AA

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
- [ ] Bouton "Decide Later" (principe TDAH)
- [ ] `ServiceStep2Wrapper` : extraire hors du render

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
| Securite | 9/10 |
| Legal & Conformite | 7/10 |
| Paiement & Monetisation | 1/10 |
| Tests & Qualite | 5/10 |
| Monitoring & Analytics | 0/10 |
| SEO & ASO | 7/10 |
| PWA & Mobile | 5/10 |
| UI/UX Etats & Feedback | 9/10 |
| UI/UX Navigation | 5/10 |
| UI/UX Design Systeme | 4/10 |
| Fonctionnalites | 7/10 |
| UX TDAH | 5/10 |
| Accessibilite | 6/10 |
| Performance | 5/10 |
| **TOTAL** | **79/150 (53%)** |
