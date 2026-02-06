# Audit des Modales

> Contenu, interactions et problemes pour chaque modale.

---

## UpgradeModal

**Fichier** : `src/components/screens/modals/UpgradeModal.tsx`

| Element | Contenu |
|---|---|
| Icone | Star (accent) |
| Titre | "Unlock SubSnooze Pro" |
| Features | Unlimited subs, SMS+Push+Email, Money saved dashboard |
| Prix | "$39 lifetime (one-time, forever)" |
| CTA | "Get Pro - $39" |
| Dismiss | "No thanks, stay on free" |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| UPG-1 | **"Get Pro" ne fait rien** — `onUpgrade = setModal(null)` | Bloquant |
| UPG-2 | Pas de focus trap | Important |
| UPG-3 | Pas de gestion Escape | Important |
| UPG-4 | **"Money saved dashboard" liste comme Pro** mais deja dispo en gratuit | Important |
| UPG-5 | Pas de bouton X | Souhaitable |
| UPG-6 | Padding `p-8` vs `p-6` dans les autres modales | Souhaitable |

---

## CancelRedirectModal

**Fichier** : `src/components/screens/modals/CancelRedirectModal.tsx`

| Element | Contenu |
|---|---|
| ServiceIcon | Logo du service |
| Titre | "Cancel {name}" |
| Description | "You'll be taken to {name}'s website" |
| Info card | Savings/month + access until date |
| CTA | "Go to {name}" (danger + ExternalLink) |
| Dismiss | "Not now" |
| Checkbox | "Remind me if I forget to cancel" |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| CANCEL-1 | **`remindMe` jamais transmis** — le parent ignore le param | Important |
| CANCEL-2 | **Prix affiche brut** — `subscription.price/month` meme si cycle=yearly | Important |
| CANCEL-3 | Pas de focus trap / Escape | Important |
| CANCEL-4 | Checkbox sous le dismiss — hierarchie visuelle confuse | Souhaitable |

---

## ConfirmCancellationModal

**Fichier** : `src/components/screens/modals/ConfirmCancellationModal.tsx`

| Element | Contenu |
|---|---|
| Icone | "?" texte dans cercle |
| Titre | "Did you cancel {name}?" |
| CTA | "Yes, I canceled it" (primary + Check) |
| Dismiss | "No, I'll do it later" (accent + X) |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| CONF-1 | "cancel**ed**" vs "cancel**led**" — orthographe incohérente | Souhaitable |
| CONF-2 | **Dismiss en rouge** — couleur danger pour "decider plus tard" | Souhaitable |
| CONF-3 | Pas de focus trap / Escape | Important |
| CONF-4 | Dismiss sans `focus-visible` ring | Souhaitable |

---

## CancellationSuccessModal

**Fichier** : `src/components/screens/modals/CancellationSuccessModal.tsx`

| Element | Contenu |
|---|---|
| Icone | PartyPopper (primary) |
| Titre | "You did it!" |
| Savings | "${monthlySavings}/month saved" |
| Description | "Marked as canceled. Access until {date}." |
| Yearly card | "You'll save this year" + montant |
| CTA | "Done" |

**Problemes :**

| # | Description | Severite |
|---|---|---|
| SUCCESS-1 | Yearly savings = `monthly * 12` toujours, meme en novembre | Souhaitable |
| SUCCESS-2 | Pas de confetti/animation — opportunite TDAH manquee | Souhaitable |
| SUCCESS-3 | Pas de focus trap / Escape | Important |
| SUCCESS-4 | **`$` hardcode** au lieu de `formatCurrency` | Important |
