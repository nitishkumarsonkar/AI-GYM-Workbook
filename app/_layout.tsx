import React from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { WorkoutProvider } from "../context/WorkoutContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

const RootNavigator = () => {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    const inAuthFlow = segments[0] === "sign-in";

    if (!user && !inAuthFlow) {
      router.replace("/sign-in");
    } else if (user && inAuthFlow) {
      router.replace("/");
    }
  }, [isLoading, user, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f4511e" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "Account" }} />
      </Stack>
      {user ? (
        <View style={styles.bottomNavWrapper} pointerEvents="box-none">
          <BottomNav />
        </View>
      ) : null}
    </View>
  );
};

export default function Layout() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <RootNavigator />
      </WorkoutProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
