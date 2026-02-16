import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { logger } from "../utils/logger";
import { signIn, signUp } from "./services/authService";

type AuthAction = "signIn" | "signUp" | "guest" | null;

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const { refreshSession } = useAuth();
  const [actionLoading, setActionLoading] = useState<AuthAction>(null);

  const isLoading = actionLoading !== null;
  const isFormValid = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  const navigateHome = () => {
    router.replace("/");
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setActionLoading(mode);

    const action = mode === "signIn" ? signIn : signUp;
    const { data, error } = await action(email.trim(), password);

    if (error) {
      setActionLoading(null);
      setErrorMessage(
        error.message ||
          `Could not ${mode === "signIn" ? "sign in" : "sign up"} right now.`,
      );
      logger.error("Auth action failed", { mode, error: error.message });
      return;
    }

    await refreshSession();
    setActionLoading(null);
    logger.info("Auth action successful", { mode, userId: data.user?.id });

    if (mode === "signUp" && !data.session) {
      setStatusMessage(
        "Sign-up successful. Check your email to confirm your account.",
      );
      logger.info("Sign-up confirmation required", { email });
      return;
    }

    navigateHome();
  };
  const primaryLabel = mode === "signIn" ? "Sign In" : "Create Account";
  const secondaryLabel =
    mode === "signIn"
      ? "Don't have an account? Sign Up"
      : "Have an account? Sign In";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Sign In" }} />

      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to sync your workouts and progress.
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (isLoading || !isFormValid) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        >
          <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  errorText: {
    color: "#c62828",
    fontSize: 13,
    marginBottom: 10,
  },
  statusText: {
    color: "#2e7d32",
    fontSize: 13,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: "#f4511e",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f4511e",
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fff",
  },
  secondaryButtonText: {
    color: "#f4511e",
    fontSize: 16,
    fontWeight: "700",
  },
  guestButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#f9f9fb",
  },
  guestButtonText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
