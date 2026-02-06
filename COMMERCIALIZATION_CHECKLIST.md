# SubSnooze — Checklist de Commercialisation

> Score global : **42/150 (28%)**
> Base fonctionnelle solide, mais il manque la couche production-ready.

Priorite : Bloquant | Important | Souhaitable

Audit detaille dans [`docs/audit/`](docs/audit/) :
- [`navigation.md`](docs/audit/navigation.md) — Machine a etats, transitions, 8 problemes de routing
- [`pages.md`](docs/audit/pages.md) — Audit des 7 ecrans (contenu + bugs)
- [`modals.md`](docs/audit/modals.md) — Audit des 4 modales (contenu + bugs)
- [`components.md`](docs/audit/components.md) — Layout, auth, hooks, 11 bugs inter-composants

---

## Bloquants (avant lancement)

### Infrastructure
- [ ] Pipeline CI/CD (GitHub Actions)
- [ ] Config deploiement (Vercel / Netlify)
- [ ] Environnements staging + production
- [ ] Nom de domaine + SSL
- [ ] Backups DB automatiques

### Securite
- [ ] Content Security Policy headers
- [ ] Rate limiting sur auth
- [ ] Validation inputs cote serveur
- [ ] Protection brute force login

### Legal
- [ ] Politique de confidentialite (page + lien dans footer login)
- [ ] CGU (page + lien dans footer login)
- [ ] Banniere cookies RGPD
- [ ] Suppression de compte (RGPD droit a l'oubli)
- [ ] Checkbox consentement CGU a l'inscription (`SignupForm`)

### Paiement
- [ ] Integration Stripe
- [ ] Webhook paiement
- [ ] Page checkout securise
- [ ] Limitations tier gratuit appliquees (`is_premium` existe mais rien n'est limite)
- [ ] `UpgradeModal` : le bouton "Get Pro - $39" ferme juste la modale — brancher le paiement

### Tests
- [ ] Framework de tests (Vitest)
- [ ] Tests unitaires utilitaires (`date-utils`, `utils`, `services`)
- [ ] Error tracking (Sentry)

### UI/UX
- [ ] Skeleton loaders (spinner generique actuellement)
- [ ] Toast notifications (aucun feedback de succes)
- [ ] Error boundaries React
- [ ] Focus trap dans toutes les modales
- [ ] Onboarding pour les nouveaux utilisateurs
- [ ] Landing page marketing

### Bugs bloquants
- [ ] Back navigateur quitte l'app — pas de `history.pushState` → [`navigation.md#NAV-1`](docs/audit/navigation.md)
- [ ] Password recovery casse — `/?update_password=true` non gere → [`components.md#IC-3`](docs/audit/components.md)
- [ ] Service worker Firebase avec cles placeholder → verifier `firebase-messaging-sw.js`

---

## Importants (V1)

### Securite
- [ ] Headers securite (X-Content-Type-Options, X-Frame-Options)
- [ ] CORS configure
- [ ] Audit dependances (`pnpm audit` automatise)
- [ ] Politique mots de passe (complexite > minLength=6)
- [ ] Wildcard `*.com` dans next.config images — trop permissif
- [ ] `getSession()` deprecie — migrer vers `getUser()`
- [ ] Gestion token expire cote client (redirect /login)

### SEO
- [ ] `robots.txt` + `sitemap.xml`
- [ ] Open Graph meta tags
- [ ] Meta description par page
- [ ] Favicon complet (16, 32, apple-touch-icon)

### PWA
- [ ] Icones completes (192, 256, 384, 512, maskable)
- [ ] Page offline dediee
- [ ] Service worker avec cache strategy
- [ ] Safe-area gestion (notch iPhone)

### UI/UX
- [ ] Error states visuels pour echecs reseau
- [ ] Loading state sur les boutons (empecher double-clic)
- [ ] Transitions animees entre ecrans
- [ ] Scroll position restoration
- [ ] Pull-to-refresh
- [ ] Tri des abonnements (prix, nom, date)
- [ ] Empty state Dashboard avec CTA
- [ ] Empty state AllSubscriptions avec CTA
- [ ] Navigation depuis notification vers l'abonnement
- [ ] Validation inline formulaires (prix > 0, date valide)
- [ ] `$` hardcode partout — utiliser `formatCurrency` systematiquement
- [ ] "Clear all" notifications avec confirmation
- [ ] Save/Delete/Restore : ne pas naviguer si erreur

### Fonctionnalites
- [ ] Changement de mot de passe (depuis Settings)
- [ ] Export donnees (CSV)
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

## Scores par categorie

| Categorie | Score |
|---|---|
| Infrastructure & DevOps | 1/10 |
| Securite | 4/10 |
| Legal & Conformite | 0/10 |
| Paiement & Monetisation | 1/10 |
| Tests & Qualite | 1/10 |
| Monitoring & Analytics | 0/10 |
| SEO & ASO | 2/10 |
| PWA & Mobile | 5/10 |
| UI/UX Etats & Feedback | 2/10 |
| UI/UX Navigation | 3/10 |
| UI/UX Design Systeme | 4/10 |
| Fonctionnalites | 5/10 |
| UX TDAH | 4/10 |
| Accessibilite | 5/10 |
| Performance | 5/10 |
| **TOTAL** | **42/150 (28%)** |
