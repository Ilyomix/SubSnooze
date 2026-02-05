# Navigation & Routing

> Machine a etats, transitions validees et problemes identifies.

## Machine a etats

L'app est une SPA interne dans `page.tsx` avec un etat `screen` (7 valeurs) et `activeTab` (3 valeurs).

```
/login
  LoginForm / SignupForm / ForgotPwd / check-email
      |
      | Auth callback (/auth/callback)
      v
/ (page.tsx)
  |
  |-- AppShell (avec TabBar) --------+------------------+
  |   Dashboard  <-->  AllSubs  <-->  Settings          |
  |      |   |           |              |               |
  |------+---+-----------+--------------+---------------+
  |      |   |           |              |
  |-- DetailShell (sans TabBar) --------+
  |      |   |           |              |
  |      |   |    SubscriptionManagement (+ 3 modales cancel)
  |      |   |
  |      |   +-> AddStep1 --> AddStep2
  |      |
  |      +-----> Notifications
  |
  |-- Modales flottantes (z-50)
       UpgradeModal (depuis Settings)
```

## Transitions validees

| De -> Vers | Declencheur | OK | Probleme |
|---|---|---|---|
| Dashboard -> AllSubs | Tab "Subs" | Y | |
| Dashboard -> Settings | Tab "Settings" | Y | |
| AllSubs -> Dashboard | Tab "Home" | Y | |
| Settings -> Dashboard | Tab "Home" | Y | |
| Dashboard -> AddStep1 | "Add subscription" | Y | |
| AddStep1 -> AddStep2 | Selection service | Y | |
| AddStep2 -> AddStep1 | Back | Y | |
| AddStep1 -> Dashboard | Back | Y | |
| AddStep2 -> Dashboard | Save (succes) | Y | Pas de toast |
| Dashboard -> Manage | Click sub | Y | |
| AllSubs -> Manage | Click sub | Y | |
| Manage -> precedent | Back | Y | `previousScreen` ok |
| Manage -> Dashboard | Cancel complete | Y | Force Dashboard |
| Manage -> precedent | Delete/Restore/Save | Y | |
| AppShell -> Notifications | Cloche header | Y | |
| Notifications -> precedent | Back | Y | |
| Settings -> UpgradeModal | "Upgrade to Pro" | Y | |
| UpgradeModal -> Settings | Close | Y | |
| UpgradeModal -> ??? | "Get Pro - $39" | **NON** | `onUpgrade` = ferme juste la modale |

## Problemes

| # | Probleme | Severite |
|---|---|---|
| NAV-1 | **Back navigateur quitte l'app** — pas de `history.pushState`, aucune gestion History API | Bloquant |
| NAV-2 | **Tout sur `/`** — impossible de bookmarker, partager un lien direct | Important |
| NAV-3 | **Pas de transition animee** entre ecrans | Important |
| NAV-4 | **UpgradeModal `onUpgrade` = no-op** (`page.tsx:412`) | Bloquant |
| NAV-5 | **Scroll position perdu** au retour (Dashboard -> Manage -> back) | Important |
| NAV-6 | **`selectedSub` snapshot** — stale data si realtime update pendant la navigation | Souhaitable |
| NAV-7 | **`ServiceStep2Wrapper` defini dans le render** (`page.tsx:222-316`) — remount a chaque re-render | Important |
| NAV-8 | **Notification click = markAsRead seulement** — pas de navigation vers l'abo concerne | Important |
