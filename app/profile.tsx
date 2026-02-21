import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "./services/authService";
import { logger } from "../utils/logger";

const genderOptions: NonNullable<UserProfile["gender"]>[] = [
  "male",
  "female",
  "non_binary",
  "prefer_not_to_say",
];

export default function ProfileScreen() {
  const { user, profile, profileLoading, upsertProfile, signOutUser } =
    useAuth();
  const [formState, setFormState] = useState<UserProfile>({});
  const [saving, setSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormState(profile);
    }
  }, [profile]);

  const isEditable = Boolean(user);

  const handleChange = <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const payload: UserProfile = {
        display_name: formState.display_name?.trim() ?? null,
        age: formState.age ?? null,
        gender: formState.gender ?? null,
        bio: formState.bio?.trim() ?? null,
        note: formState.note?.trim() ? formState.note.trim() : null,
      };
      await upsertProfile(payload);
      Alert.alert("Profile updated");
      logger.info("Profile saved via UI", { userId: user.id });
      setIsEditOpen(false); // Close edit form on save
    } catch (error) {
      Alert.alert("Unable to save profile", "Please try again later.");
      logger.error("Profile save failed", { error, userId: user.id });
    } finally {
      setSaving(false);
    }
  };

  const infoItems = useMemo(
    () => [
      { label: "Email", value: user?.email ?? "-" },
      { label: "Name", value: profile?.display_name ?? "Not set" },
      {
        label: "Age",
        value: profile?.age ? `${profile.age} years` : "Not set",
      },
      {
        label: "Gender",
        value: profile?.gender?.replace(/_/g, " ") ?? "Not set",
      },
    ],
    [profile, user?.email],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen options={{ title: "Your Profile" }} />
        <View style={styles.headerRow}>
          <Text style={styles.heading}>About You</Text>
          <TouchableOpacity
            onPress={() => setIsEditOpen(!isEditOpen)}
            style={styles.pencilButton}
          >
            <Text style={styles.pencilIcon}>✎</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subheading}>
          Manage the info we use to personalize your experience.
        </Text>

        {!isEditOpen && (
          <View style={styles.card}>
            {infoItems.map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {isEditOpen ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formState.bio ?? ""}
              onChangeText={(text) => handleChange("bio", text)}
              placeholder="Tell us about your goals..."
              multiline
              numberOfLines={4}
              editable={isEditable}
            />
          ) : (
            <Text style={styles.noteText}>
              {profile?.bio || "No bio added."}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Note</Text>
          <TextInput
            style={[styles.input, styles.textArea, { height: 80 }]}
            value={formState.note ?? ""}
            onChangeText={(text) => handleChange("note", text)}
            placeholder="Add a personal note..."
            multiline
            numberOfLines={3}
            editable={isEditable}
          />
        </View>

        {isEditOpen && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Edit Details</Text>

            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={formState.display_name ?? ""}
              onChangeText={(text) => handleChange("display_name", text)}
              placeholder="e.g. Alex Strong"
              editable={isEditable}
            />

            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.input}
              value={formState.age ? String(formState.age) : ""}
              onChangeText={(text) =>
                handleChange(
                  "age",
                  text ? Number(text.replace(/[^0-9]/g, "")) : null,
                )
              }
              keyboardType="numeric"
              placeholder="25"
              editable={isEditable}
            />

            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {genderOptions.map((option) => {
                const isSelected = formState.gender === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderChip,
                      isSelected && styles.genderChipSelected,
                    ]}
                    onPress={() => handleChange("gender", option)}
                    disabled={!isEditable}
                  >
                    <Text
                      style={[
                        styles.genderChipText,
                        isSelected && styles.genderChipTextSelected,
                      ]}
                    >
                      {option.replace(/_/g, " ")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {isEditable && (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (saving || profileLoading) && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving || profileLoading}
          >
            {saving || profileLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={signOutUser}
        >
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pencilButton: {
    padding: 6,
  },
  pencilIcon: {
    fontSize: 22,
    color: "#f4511e",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  subheading: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    color: "#555",
    fontSize: 14,
  },
  infoValue: {
    color: "#1a1a2e",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1a1a2e",
  },
  noteText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    fontStyle: "italic",
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
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
    marginBottom: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  genderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  genderChip: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  genderChipSelected: {
    backgroundColor: "#f4511e",
    borderColor: "#f4511e",
  },
  genderChipText: {
    fontSize: 13,
    color: "#444",
    textTransform: "capitalize",
  },
  genderChipTextSelected: {
    color: "#fff",
    fontWeight: "700",
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
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d32f2f",
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "700",
  },
});
