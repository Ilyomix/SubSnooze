import { cn } from "@/lib/utils"
import { hapticLight } from "@/lib/haptics"
import { House, List, Settings } from "lucide-react"
import { type ReactNode } from "react"

type TabId = "home" | "subs" | "settings"

interface TabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

interface TabItemProps {
  icon: ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

function TabItem({ icon, label, isActive, onClick }: TabItemProps) {
  return (
    <button
      onClick={() => { hapticLight(); onClick() }}
      role="tab"
      aria-selected={isActive}
      aria-label={label}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg",
        isActive ? "text-primary" : "text-text-muted"
      )}
    >
      {icon}
      <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>
        {label}
      </span>
    </button>
  )
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-start justify-around bg-surface px-6 pt-3 pb-[max(34px,env(safe-area-inset-bottom))]" style={{ minHeight: "calc(50px + max(34px, env(safe-area-inset-bottom)))" }}>
      <TabItem
        icon={<House className="h-[22px] w-[22px]" />}
        label="Home"
        isActive={activeTab === "home"}
        onClick={() => onTabChange("home")}
      />
      <TabItem
        icon={<List className="h-[22px] w-[22px]" />}
        label="Subs"
        isActive={activeTab === "subs"}
        onClick={() => onTabChange("subs")}
      />
      <TabItem
        icon={<Settings className="h-[22px] w-[22px]" />}
        label="Settings"
        isActive={activeTab === "settings"}
        onClick={() => onTabChange("settings")}
      />
    </div>
  )
}
