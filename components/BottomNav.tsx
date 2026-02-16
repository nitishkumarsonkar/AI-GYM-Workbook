import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Link, usePathname } from "expo-router";

type TabConfig = {
  label: string;
  href: string;
  icon: string;
  isActive: (pathname: string) => boolean;
};

const tabs: TabConfig[] = [
  {
    label: "Home",
    href: "/",
    icon: "🏠",
    isActive: (pathname) => pathname === "/" || pathname === "/index",
  },
  {
    label: "Planner",
    href: "/weekly-planner",
    icon: "📅",
    isActive: (pathname) => pathname.startsWith("/weekly-planner"),
  },
  {
    label: "Account",
    href: "/profile",
    icon: "👤",
    isActive: (pathname) => pathname.startsWith("/profile"),
  },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = tab.isActive(pathname ?? "/");
        return (
          <Link key={tab.href} href={tab.href} asChild>
            <TouchableOpacity
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.icon, active && styles.textActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.label, active && styles.textActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e2e2",
    paddingBottom: Platform.select({ ios: 20, default: 10 }),
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  tabActive: {
    borderRadius: 12,
    backgroundColor: "rgba(244, 81, 30, 0.08)",
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
    color: "#999",
  },
  label: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  textActive: {
    color: "#f4511e",
  },
});

export default BottomNav;
