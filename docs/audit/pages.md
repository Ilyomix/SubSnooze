# Audit des Pages & Ecrans

> Contenu, fonctionnalite et problemes pour chaque ecran.

---

## `/login` — LoginPage

**Fichier** : `src/app/login/page.tsx`

| Element | Contenu | OK |
|---|---|---|
| Titre | "SubSnooze" (h1 font-serif) | Y |
| Sous-titre | Dynamique selon la vue (Welcome back / Create your account / etc.) | Y |
| LoginForm | Email + password + Google OAuth | Y |
| SignupForm | Nom + email + password + confirm + Google OAuth | Y |
| Forgot Password | Formulaire email + `resetPasswordForEmail` | Y |
| Check Email | Message confirmation avec CheckCircle | Y |
| Footer | "By continuing, you agree to our Terms of Service and Privacy Policy." | **Pas de liens** |
| Back | Visible sur signup et forgot-password | Y |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| LOGIN-1 | Footer mentionne CGU/Privacy mais **aucun lien** — non conforme legalement | Bloquant |
| LOGIN-2 | Back invisible sur `check-email` — utilisateur bloque si erreur d'email | Souhaitable |
| LOGIN-3 | Query param `?error=auth_callback_error` **ignore** — aucun message d'erreur | Important |
| LOGIN-4 | Password recovery redirige vers `/?update_password=true` mais **page.tsx ne gere pas ce param** — flow casse | Bloquant |
| LOGIN-5 | `createClient()` appele a chaque render (pas memoize) | Souhaitable |
| LOGIN-6 | Pas de protection soumission multiple sur forgot-password | Souhaitable |

---

## `/` — Dashboard

**Fichier** : `src/components/screens/Dashboard.tsx`

| Element | Contenu |
|---|---|
| Greeting | "Hi, {userName}" |
| Card Saved | NumberFlow anime, USD, "Saved — nice work" / "Saved this year" |
| Card Monthly | NumberFlow anime, USD, "{N} active subs/mo" |
| Section "COMING UP" | SubscriptionRow x N (renewing_soon, trie par urgence) |
| Section "ALL GOOD" | SubscriptionRow x 3 + "Show all" (good) |
| Section "Cancelled" | SubscriptionRow x N |
| Bouton fixe | "Add subscription" (full width) |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| DASH-1 | **Aucun empty state** quand 0 abonnements — juste cards a $0 | Important |
| DASH-2 | Currency **USD hardcodee** dans NumberFlow | Important |
| DASH-3 | `totalSaved` ne considere pas la duree depuis l'annulation | Souhaitable |
| DASH-4 | Label "Saved — nice work" conditionnel incohérent | Souhaitable |
| DASH-5 | `bottom-[84px]` couple a la hauteur TabBar | Souhaitable |
| DASH-6 | `pb-40` approximatif pour eviter le chevauchement | Souhaitable |
| DASH-7 | Card "Monthly Spend" non cliquable (pas de lien vers AllSubs) | Souhaitable |

---

## AllSubscriptions

**Fichier** : `src/components/screens/AllSubscriptions.tsx`

| Element | Contenu |
|---|---|
| Header | "Your Subscriptions" + total + toggle mo/yr |
| Recherche | Input text local (pas de recherche serveur) |
| Liste Active | "Active ({N})" |
| Liste Cancelled | "Cancelled ({N})" (opacity 60%) |
| Empty state | "No subscriptions yet" |
| No results | "No subscriptions matching {query}" |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| ALLSUB-1 | `onSearch` est un **no-op** — filtrage entierement local | Souhaitable |
| ALLSUB-2 | **Pas de tri** (prix, nom, date) | Important |
| ALLSUB-3 | Normalisation hebdo `* 4.33` approximative | Souhaitable |
| ALLSUB-4 | `priceView` localStorage non synchronise entre onglets | Souhaitable |
| ALLSUB-6 | Empty state **sans CTA** "Add your first subscription" | Important |

---

## Settings

**Fichier** : `src/components/screens/Settings.tsx`

| Element | Contenu |
|---|---|
| Reminder Schedule | 3 presets (Aggressive/Relaxed/Minimal) |
| Notification Channels | Toggle email + push + SMS |
| Account | Email (ro) + Phone (ro) |
| Upgrade | "Upgrade to Pro" |
| Dev only | "Send test notification" (NODE_ENV=development) |
| Sign Out | Bouton rouge |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| SET-1 | **SMS toggle activable mais non fonctionnel** — backend inexistant | Important |
| SET-2 | **Pas de moyen d'ajouter un telephone** | Important |
| SET-3 | Pas de modification email | Souhaitable |
| SET-4 | **Pas de changement de mot de passe** | Important |
| SET-5 | **Pas de suppression de compte** — RGPD obligatoire | Bloquant |
| SET-6 | `createClient()` non memoize | Souhaitable |
| SET-7 | Test notif sans protection double-clic | Souhaitable |
| SET-8 | **Pas de section A propos / support / contact** | Important |
| SET-9 | Pas de toggle dark mode | Souhaitable |

---

## Notifications

**Fichier** : `src/components/screens/Notifications.tsx`

| Element | Contenu |
|---|---|
| Header | "Notifications" + Bell + "Clear all" |
| Section "New" | Notifs non lues, dot rouge, swipe-to-delete |
| Section "Earlier" | Notifs lues (opacity 60%), swipe delete + mark-unread |
| Cancel followup | Boutons "Yes, I cancelled" + "Remind me again" inline |
| Empty state | Bell + "All caught up!" |
| Infinite scroll | IntersectionObserver + spinner |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| NOTIF-1 | **"Clear all" sans confirmation** | Important |
| NOTIF-2 | **Click = markAsRead seulement**, pas de navigation vers l'abo | Important |
| NOTIF-3 | **Swipe non accessible clavier** | Important |
| NOTIF-4 | `markAllAsRead` existe dans le hook mais pas dans l'UI | Souhaitable |
| NOTIF-5 | `hasDoubleActions` fragile si props undefined | Souhaitable |
| NOTIF-6 | Pas de debounce sur loadMore | Souhaitable |
| NOTIF-7 | "Remind me again" reset l'attempt — timing prochain rappel flou | Souhaitable |

---

## SubscriptionManagement

**Fichier** : `src/components/screens/SubscriptionManagement.tsx`

| Element | Contenu |
|---|---|
| Header | Nom service + ServiceIcon + back |
| Status Badge | "Cancelled" (gris) ou "Renews in X days" (coral) |
| Formulaire | Prix, cycle, date (readOnly si cancelled) |
| Save | Apparait si `hasChanges && !isCancelled` |
| CTA fixe | "Cancel subscription" (danger) ou "Restore" (primary) |
| Delete | "Remove from list" -> "Tap again to confirm" (3s auto-reset) |

**Flow annulation :**
```
Cancel -> [cancelUrl?] -> CancelRedirectModal -> window.open
                                              -> 500ms -> ConfirmCancellationModal
       -> [pas cancelUrl] -> ConfirmCancellationModal directement
ConfirmCancellation -> "Yes" -> CancellationSuccessModal -> "Done" -> Dashboard
                    -> "No, later" -> ferme
```

**Problemes :**

| # | Description | Severite |
|---|---|---|
| MANAGE-1 | **`remindMe` checkbox ignore** — state cree mais parent ne lit pas le param | Important |
| MANAGE-2 | `setTimeout(500)` arbitraire entre modales | Souhaitable |
| MANAGE-3 | **Pas de validation prix** — `parseFloat` peut retourner NaN | Important |
| MANAGE-4 | **Save navigue meme en cas d'erreur** — catch fait juste console.error | Important |
| MANAGE-5 | **Pas de feedback succes** apres save/restore/cancel | Important |
| MANAGE-6 | Delete double-tap feedback faible | Souhaitable |
| MANAGE-8 | "No, I'll do it later" en rouge — inconsistant avec principes TDAH | Souhaitable |

---

## AddSubscriptionStep1

**Fichier** : `src/components/screens/AddSubscriptionStep1.tsx`

| Element | Contenu |
|---|---|
| Progress | "Step 1 of 2" + dots |
| Recherche | Input debounce 300ms |
| Grid services | 3 colonnes, ServiceIcon + nom |
| Custom | Carte pointillee "Add {query}" |
| Loading | Spinner Loader2 |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| ADD1-1 | `onSearch` no-op | Souhaitable |
| ADD1-2 | Pas de browse alphabetique | Souhaitable |
| ADD1-3 | Recherche limitee a 6 resultats | Souhaitable |
| ADD1-4 | Pas de recents/favoris | Souhaitable |
| ADD1-5 | Grid 3 colonnes fixe, pas responsive | Souhaitable |

---

## AddSubscriptionStep2

**Fichier** : `src/components/screens/AddSubscriptionStep2.tsx`

| Element | Contenu |
|---|---|
| Progress | "Step 2 of 2" + dots |
| Formulaire | Prix, cycle, date (avec pricing hints) |
| Save CTA fixe | "Save subscription" |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| ADD2-1 | **Pas de validation prix** — peut etre vide/NaN | Important |
| ADD2-2 | **Pas de loading state** — double-clic possible | Important |
| ADD2-3 | **Pas de toast succes** | Important |
| ADD2-4 | `service.logo.startsWith("http")` sans null check | Souhaitable |
| ADD2-5 | **ServiceStep2Wrapper defini dans le render** de page.tsx — remount | Important |
| ADD2-6 | Pas de "Add another" | Souhaitable |
