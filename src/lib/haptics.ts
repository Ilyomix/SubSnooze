/**
 * Trigger haptic feedback on supported devices.
 * Uses the Vibration API — no-ops silently on unsupported browsers.
 */
export function hapticLight() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

export function hapticMedium() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(25)
  }
}

export function hapticSuccess() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([30, 20, 30])
  }
}

export function hapticError() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([50, 30, 50, 30, 50])
  }
}
