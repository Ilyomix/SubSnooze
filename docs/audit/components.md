# Audit des Composants (Layout, Auth, UI, Hooks)

> Composants partages, auth, et hooks.

---

## AppShell

**Fichier** : `src/components/layout/AppShell.tsx`

Header fixe (logo + bell) + `{children}` + TabBar fixe (Home/Subs/Settings).

| # | Probleme | Severite |
|---|---|---|
| SHELL-1 | Header `h-14` / TabBar `h-[84px]` / padding `pt-14 pb-[84px]` — couples, fragile | Souhaitable |
| SHELL-2 | Header semi-transparent (`bg-surface/80`) — lisibilite si contenu scroll dessous | Souhaitable |
| SHELL-3 | Pas de `role="tablist"` / `role="tabpanel"` | Souhaitable |
| SHELL-4 | Logo non cliquable | Souhaitable |

## DetailShell

**Fichier** : `src/components/layout/DetailShell.tsx`

Header fixe (back + icon + title + actions) + `{children}`. Pas de TabBar (normal).

| # | Probleme | Severite |
|---|---|---|
| DETAIL-2 | `headerRight` avant `title` dans le flex — visuellement confus | Souhaitable |

## TabBar

**Fichier** : `src/components/layout/TabBar.tsx`

3 tabs avec `role="tab"` et `aria-selected`. Bottom fixe `h-[84px]` avec `pb-[34px]` (safe area iPhone).

Pas de probleme majeur.

---

## LoginForm

**Fichier** : `src/components/auth/LoginForm.tsx`

Google OAuth + email/password + forgot link + switch to signup.

| # | Probleme | Severite |
|---|---|---|
| AUTH-1 | Erreur API brute (`error.message` Supabase) | Souhaitable |
| AUTH-2 | Pas de rate limiting cote client | Souhaitable |
| AUTH-3 | Google icon monochrome (guidelines demandent couleur) | Souhaitable |
| AUTH-4 | `loading` ne desactive pas les inputs | Souhaitable |

## SignupForm

**Fichier** : `src/components/auth/SignupForm.tsx`

Google OAuth + nom + email + password + confirm + switch to login.

| # | Probleme | Severite |
|---|---|---|
| SIGNUP-1 | minLength=6 sans complexite | Important |
| SIGNUP-2 | **Pas de checkbox CGU** | Bloquant |
| SIGNUP-3 | Toggle password affecte les 2 champs | Souhaitable |
| SIGNUP-4 | Confirm sans toggle visibility | Souhaitable |
| SIGNUP-5 | Validation seulement au submit (pas de feedback temps reel) | Souhaitable |

---

## SubscriptionFormFields

**Fichier** : `src/components/ui/SubscriptionFormFields.tsx`

Champs prix (`type="text" inputMode="decimal"`), cycle (select), date (input date).

| # | Probleme | Severite |
|---|---|---|
| FORM-1 | **Prix = text** — lettres acceptees, pas de validation pattern | Important |
| FORM-2 | `min={today}` empeche dates passees (probleme pour abos annules) | Souhaitable |
| FORM-3 | Date bloquee si effacee | Souhaitable |
| FORM-4 | Largeur prix dynamique approximative | Souhaitable |
| FORM-5 | **`$` hardcode** | Important |

---

## AuthContext

**Fichier** : `src/contexts/AuthContext.tsx`

Flow : `getSession()` -> `fetchProfile()` -> `onAuthStateChange()`.

| # | Probleme | Severite |
|---|---|---|
| AUTH-CTX-1 | **`getSession()` deprecie** — Supabase recommande `getUser()` | Important |
| AUTH-CTX-2 | `setLoading(false)` AVANT profile charge — `profile=null` momentane | Souhaitable |
| AUTH-CTX-3 | `eslint-disable` sur deps du useEffect | Souhaitable |
| AUTH-CTX-5 | **Refresh token expire** — pas de redirect vers /login | Important |

## useSubscriptions

**Fichier** : `src/hooks/useSubscriptions.ts`

Fetch + realtime + optimistic updates pour : add, update, cancel, delete, recordCancelAttempt, verifyCancellation, resetCancelAttempt, restore.

Problemes : `eslint-disable` deps, `cancelSubscription` exporte mais jamais utilise.

## useNotifications

**Fichier** : `src/hooks/useNotifications.ts`

Fetch pagine + realtime + optimistic : markAsRead, markAsUnread, markAllAsRead, delete, deleteAll.

Problemes : `eslint-disable` deps, `markAllAsRead` pas expose dans l'UI, pagination peut se desynchroniser avec realtime.

---

## Bugs Inter-Composants

| # | Bug | Composants | Severite |
|---|---|---|---|
| IC-1 | `remindMe` checkbox perdu | CancelRedirectModal -> SubscriptionManagement -> page.tsx | Important |
| IC-2 | **UpgradeModal `onUpgrade` = no-op** | Settings -> UpgradeModal -> page.tsx | Bloquant |
| IC-3 | **Password recovery casse** | /auth/callback -> `/?update_password=true` -> page.tsx (non gere) | Bloquant |
| IC-4 | Notification click ne navigue pas | Notifications -> page.tsx | Important |
| IC-5 | ServiceStep2Wrapper dans le render | page.tsx -> AddStep2 | Important |
| IC-6 | `selectedSub` stale data | page.tsx -> SubscriptionManagement | Souhaitable |
| IC-7 | Save/Delete/Restore naviguent meme en erreur | page.tsx -> SubscriptionManagement | Important |
| IC-8 | **Back navigateur quitte l'app** | Toute l'app SPA | Bloquant |
| IC-9 | `auth_callback_error` param ignore | /login -> LoginPage | Important |
| IC-10 | Prix brut affiche dans CancelRedirectModal (yearly = mauvais) | CancelRedirectModal | Important |
| IC-11 | `$` hardcode dans CancellationSuccessModal | CancellationSuccessModal | Important |
| IC-12 | = IC-8 (doublon) | | |
