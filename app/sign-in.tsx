import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { ensureAuthenticated } from './services/authService';

type AuthAction = 'signIn' | 'signUp' | 'guest' | null;

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<AuthAction>(null);

  const isLoading = actionLoading !== null;
  const isFormValid = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password]
  );

  const navigateHome = () => {
    router.replace('/');
  };

  const handleSignIn = async () => {
    if (!isFormValid) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setActionLoading('signIn');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setActionLoading(null);
      setErrorMessage(error.message || 'Could not sign in. Please try again.');
      return;
    }

    setActionLoading(null);
    navigateHome();
  };

  const handleSignUp = async () => {
    if (!isFormValid) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setActionLoading('signUp');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setActionLoading(null);
      setErrorMessage(error.message || 'Could not sign up right now. Please try again.');
      return;
    }

    setActionLoading(null);
    if (data.session) {
      navigateHome();
      return;
    }

    setStatusMessage('Sign-up successful. Check your email to confirm your account.');
  };

  const handleContinueAsGuest = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setActionLoading('guest');

    const user = await ensureAuthenticated();
    setActionLoading(null);

    if (!user) {
      setErrorMessage('Unable to continue as guest right now. Please try again.');
      return;
    }

    navigateHome();
  };

  const signInButtonLabel = actionLoading === 'signIn' ? 'Signing In...' : 'Sign In';
  const signUpButtonLabel = actionLoading === 'signUp' ? 'Creating Account...' : 'Sign Up';
  const guestButtonLabel = actionLoading === 'guest' ? 'Continuing...' : 'Continue as Guest';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sign In' }} />

      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to sync your workouts and progress.</Text>

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

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, (isLoading || !isFormValid) && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading || !isFormValid}
        >
          {actionLoading === 'signIn' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{signInButtonLabel}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, (isLoading || !isFormValid) && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading || !isFormValid}
        >
          <Text style={styles.secondaryButtonText}>{signUpButtonLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.guestButton, isLoading && styles.buttonDisabled]}
          onPress={handleContinueAsGuest}
          disabled={isLoading}
        >
          {actionLoading === 'guest' ? (
            <ActivityIndicator color="#f4511e" />
          ) : (
            <Text style={styles.guestButtonText}>{guestButtonLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    marginBottom: 10,
  },
  statusText: {
    color: '#2e7d32',
    fontSize: 13,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#f4511e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f4511e',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#f4511e',
    fontSize: 16,
    fontWeight: '700',
  },
  guestButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f9f9fb',
  },
  guestButtonText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
