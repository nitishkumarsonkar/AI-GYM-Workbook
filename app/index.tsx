import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Link, Stack } from 'expo-router';

// Dashboard Card Component
type DashboardCardProps = {
  title: string;
  emoji: string;
  href: '/todays-workout' | '/exercise-library' | '/weekly-planner' | '/sign-in';
  description: string;
};

function DashboardCard({ title, emoji, href, description }: DashboardCardProps) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </Link>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: '💪 GYM Workbook' }} />

      <Text style={styles.headerSubtitle}>Select a section to get started</Text>

      <DashboardCard
        title="Today's Workout"
        emoji="🏋️"
        href="/todays-workout"
        description="View your daily exercise plan"
      />

      <DashboardCard
        title="Exercise Library"
        emoji="📚"
        href="/exercise-library"
        description="Browse all gym & cardio exercises"
      />

      <DashboardCard
        title="Weekly Planner"
        emoji="📅"
        href="/weekly-planner"
        description="Manage your 7-day workout schedule"
      />

      <DashboardCard
        title="Sign In"
        emoji="🔐"
        href="/sign-in"
        description="Sign in or continue as guest"
      />

      <View style={styles.footer}>
         <Text style={styles.footerText}>Stay consistent!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    // Removed shadows for web compatibility as per previous fix
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#888',
  },
  arrow: {
    fontSize: 28,
    color: '#ccc',
    marginLeft: 12,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
});
