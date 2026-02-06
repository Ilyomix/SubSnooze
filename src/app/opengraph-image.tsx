import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "SubSnooze - ADHD-Friendly Subscription Tracker"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #F8F7F4 0%, #EBE9E4 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo/icon circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            backgroundColor: "#237A5A",
            marginBottom: "24px",
          }}
        >
          <span style={{ fontSize: "40px", color: "white" }}>S</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#1A1918",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          SubSnooze
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: "28px",
            color: "#5C5956",
            margin: "16px 0 0 0",
            textAlign: "center",
          }}
        >
          Stop paying the ADHD tax on subscriptions.
        </p>

        {/* Features pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
          }}
        >
          {["Track Renewals", "Smart Reminders", "Cancel On Time"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  backgroundColor: "#237A5A20",
                  color: "#237A5A",
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
