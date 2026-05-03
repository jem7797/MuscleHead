import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { signUp, signOut, getCurrentUser } from "aws-amplify/auth";
import { reportMinorSignupAttempt } from "../Services/userApi";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../Contexts/UserContext";
import { useOnboarding } from "../Contexts/OnboardingContext";
import PrimaryButton from "../Components/PrimaryButton";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
// Note: createUser will be called after email confirmation and sign-in
// when we have an authenticated session

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CONSENT_STORAGE_KEY = "musclehead_signup_consent";

const SignUpScreen = () => {
  const navigation = useNavigation();
  //@ts-ignore
  const { given_name, setgiven_name, setTempPasswordForSignup } = useUser();
  const { setGender, setHeight, setWeight } = useOnboarding();
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGenderLocal] = useState<"Male" | "Female" | null>(null);
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeightLocal] = useState("");
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [legalDocOpen, setLegalDocOpen] = useState<"tos" | "privacy" | null>(null);
  const [tosPdfUri, setTosPdfUri] = useState<string | null>(null);
  const [privacyPdfUri, setPrivacyPdfUri] = useState<string | null>(null);
  const [loadingTosPdf, setLoadingTosPdf] = useState(false);
  const [loadingPrivacyPdf, setLoadingPrivacyPdf] = useState(false);

  // Automatically sign out any existing user when this screen loads
  // This allows testing signup multiple times without manual sign-out
  useEffect(() => {
    const clearExistingSession = async () => {
      try {
        // Check if a user is currently signed in
        const user = await getCurrentUser();
        if (user) {
          await signOut();
        }
      } catch (error: any) {
        // If getCurrentUser throws, no user is signed in - that's fine
        void error;
      }
    };

    clearExistingSession();
  }, []); // Run once when component mounts

  useEffect(() => {
    const loadConsent = async () => {
      try {
        const saved = await AsyncStorage.getItem(CONSENT_STORAGE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        setAcceptedTos(Boolean(parsed.acceptedTos));
        setAcceptedPrivacyPolicy(Boolean(parsed.acceptedPrivacyPolicy));
      } catch (error) {
        void error;
      }
    };

    loadConsent();
  }, []);

  const persistConsent = async (nextTos: boolean, nextPrivacyPolicy: boolean) => {
    setAcceptedTos(nextTos);
    setAcceptedPrivacyPolicy(nextPrivacyPolicy);
    try {
      await AsyncStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({
          acceptedTos: nextTos,
          acceptedPrivacyPolicy: nextPrivacyPolicy,
        }),
      );
    } catch (error) {
      void error;
    }
  };

  const openLegalDoc = async (doc: "tos" | "privacy") => {
    if (doc === "tos" && !acceptedTos) {
      await persistConsent(true, acceptedPrivacyPolicy);
    }
    if (doc === "privacy" && !acceptedPrivacyPolicy) {
      await persistConsent(acceptedTos, true);
    }
    if (doc === "tos" && !tosPdfUri) {
      setLoadingTosPdf(true);
      try {
        const tosAsset = Asset.fromModule(require("../assets/MeatHead_ToS (2).pdf"));
        await tosAsset.downloadAsync();
        setTosPdfUri(tosAsset.localUri ?? tosAsset.uri ?? null);
      } catch (error) {
        Alert.alert("Error", "Unable to load Terms of Service right now.");
      } finally {
        setLoadingTosPdf(false);
      }
    }
    if (doc === "privacy" && !privacyPdfUri) {
      setLoadingPrivacyPdf(true);
      try {
        const privacyAsset = Asset.fromModule(
          require("../assets/MeatHead_PrivacyPolicy (1).pdf"),
        );
        await privacyAsset.downloadAsync();
        setPrivacyPdfUri(privacyAsset.localUri ?? privacyAsset.uri ?? null);
      } catch (error) {
        Alert.alert("Error", "Unable to load privacy policy right now.");
      } finally {
        setLoadingPrivacyPdf(false);
      }
    }
    setLegalDocOpen(doc);
  };

  const openPdfFile = async (uri: string | null) => {
    if (!uri) return;
    try {
      await Linking.openURL(uri);
    } catch {
      Alert.alert("Couldn't open PDF", "Try again, or close this screen and reopen the link.");
    }
  };

  const formatDobInput = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const parseDobToYYYYMMDD = (formatted: string): string | null => {
    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) return null;
    const mm = digits.slice(0, 2);
    const dd = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    return `${yyyy}-${mm}-${dd}`;
  };

  /**
   * handleSignUp - Main sign up flow handler
   *
   * This function orchestrates the complete sign up process:
   *
   * STEP 1: Validate user input
   *   - Check that all required fields are filled
   *
   * STEP 2: Sign up with AWS Cognito
   *   - Create the user account in AWS Cognito (authentication service)
   *   - Cognito handles password security, email verification, etc.
   *   - Returns a userId which is the "sub" (subject identifier)
   *   - This sub becomes our primary key in the database
   *
   * STEP 3: Create user in our backend database
   *   - Send the username/alias to our backend API
   *   - Include the sub from Cognito as the primary key
   *   - Backend stores this in the database
   *
   * STEP 4: Navigate to next screen
   *   - Move to email confirmation screen
   */
  const handleSignUp = async () => {
    // STEP 1: Validate that all required fields are filled
    if (!given_name || !email || !birthDate || !alias || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    if (!gender) {
      Alert.alert("Error", "Please select your gender.");
      return;
    }
    const feet = parseInt(heightFeet, 10);
    const inches = parseInt(heightInches, 10);
    const weightLbs = parseFloat(weight);
    if (isNaN(feet) || feet < 1 || feet > 8) {
      Alert.alert("Error", "Please enter a valid height (feet: 1-8).");
      return;
    }
    if (isNaN(inches) || inches < 0 || inches > 11) {
      Alert.alert("Error", "Please enter a valid height (inches: 0-11).");
      return;
    }
    if (isNaN(weightLbs) || weightLbs < 50 || weightLbs > 600) {
      Alert.alert("Error", "Please enter a valid weight in lbs (50-600).");
      return;
    }
    if (!acceptedTos || !acceptedPrivacyPolicy) {
      Alert.alert(
        "Consent Required",
        "Please accept the Terms of Service and Privacy Policy to continue.",
      );
      return;
    }
    const birthDateYYYYMMDD = parseDobToYYYYMMDD(birthDate);
    if (!birthDateYYYYMMDD) {
      Alert.alert("Error", "Date of birth must be in MM/DD/YYYY format (e.g. 05/15/1990).");
      return;
    }
    const dobMatch = birthDateYYYYMMDD.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dobMatch) {
      Alert.alert("Error", "Please enter a valid date.");
      return;
    }
    const parsed = new Date(birthDateYYYYMMDD);
    if (isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== birthDateYYYYMMDD) {
      Alert.alert("Error", "Please enter a valid date.");
      return;
    }
    const today = new Date();
    const bdayThisYear = new Date(today.getFullYear(), parseInt(dobMatch[2], 10) - 1, parseInt(dobMatch[3], 10));
    const age = today.getFullYear() - parseInt(dobMatch[1], 10) - (today < bdayThisYear ? 1 : 0);

    if (age < 13) {
      try {
        await reportMinorSignupAttempt(email, given_name, birthDateYYYYMMDD, alias);
      } catch (e: any) {
        // Backend received the data (or failed) - either way we block
      }
      Alert.alert("Error", "You must be at least 13 years old to sign up.");
      return;
    }

    try {
      // STEP 1.5: Ensure no user is signed in before attempting signup
      // This prevents "already signed in user" errors during testing
      try {
        const existingUser = await getCurrentUser();
        if (existingUser) {
          await signOut();
          // Small delay to ensure sign-out completes
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (checkError: any) {
        // If getCurrentUser throws, no user is signed in - that's fine
        void checkError;
      }

      // STEP 2: Sign up with AWS Cognito
      // This creates the user account in AWS Cognito
      // IMPORTANT: When Cognito is configured with email alias (loginWith: { email: true }),
      // the username field CANNOT be an email format. We must use a unique username (alias)
      // and provide the email in userAttributes instead.
      // The response includes userId which is the "sub" (subject identifier from Cognito)
      const signUpResult = await signUp({
        username: alias, // Use alias as username (NOT email - email alias config prevents email in username field)
        password,
        options: {
          userAttributes: {
            email: email, // Email goes in userAttributes, not as username
            given_name: given_name,
            preferred_username: alias, // Also store alias as preferred_username attribute
          },
        },
      });

      // Extract userId and nextStep from the sign up result
      // userId from Cognito is the "sub" - this is our primary key
      // The sub is a unique identifier that AWS Cognito assigns to each user
      const sub = signUpResult.userId;
      const nextStep = signUpResult.nextStep;

      // Validate that we got a userId (sub) - this should always be present after sign up
      if (!sub) {
        throw new Error(
          "Failed to get user ID from Cognito. Please try again.",
        );
      }

      // STEP 3: Store password temporarily in context for auto-login after email confirmation
      setTempPasswordForSignup(password);

      // Store gender, height, weight in onboarding context for IdentityBasics/HeightWeight/ProfileSetUp
      const totalHeightInches = feet * 12 + inches;
      setGender(gender);
      setHeight(feet, inches);
      setWeight(weightLbs);

      // STEP 4: Navigate to email confirmation screen
      // @ts-ignore
      navigation.navigate("ConfirmSignUp", {
        username: alias,
        email,
        given_name,
        birthDate: birthDateYYYYMMDD,
        height: totalHeightInches,
        weight: weightLbs,
      });
    } catch (error: any) {
      // Handle any errors during the sign up process
      // Special handling for "already signed in" error
      // Check multiple possible error formats
      const errorMessage = (error?.message || "").toLowerCase();
      const errorName = error?.name || "";
      const isAlreadySignedIn =
        (errorMessage.includes("already") &&
          errorMessage.includes("signed in")) ||
        errorMessage.includes("already a signed in user") ||
        errorName === "UserAlreadyAuthenticatedException" ||
        errorName === "AlreadyAuthenticatedException";

      if (isAlreadySignedIn) {
        try {
          // Sign out the existing user
          await signOut();
          Alert.alert(
            "Already Signed In",
            "You were already signed in. We've signed you out. Please try signing up again.",
            [{ text: "OK" }],
          );
        } catch (signOutError: any) {
          void signOutError;
          Alert.alert(
            "Sign Up Failed",
            "You are already signed in. Please sign out first, then try again.",
          );
        }
        return; // Don't show the generic error message
      }

      // For all other errors, show the error message
      Alert.alert("Sign Up Failed", error.message || "An error has occurred");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#0c1525", "#182c54ff", "#020b1f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.mainContainer}
        >
          <Image
            source={require("../assets/AlternateMuscleHeadLogo.png")}
            style={styles.logo}
          />

          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>
              Let's start you with creating your account
            </Text>
          </View>

          <View style={styles.formBox}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John"
              placeholderTextColor="#aaaaaaac"
              value={given_name}
              onChangeText={setgiven_name}
              autoCapitalize="words"
              returnKeyType="done"
              blurOnSubmit
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="JohnDoe@email.com"
              placeholderTextColor="#aaaaaaac"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              blurOnSubmit
            />

            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY (e.g. 05/15/1990)"
              placeholderTextColor="#aaaaaaac"
              value={birthDate}
              onChangeText={(text) => setBirthDate(formatDobInput(text))}
              autoCapitalize="none"
              keyboardType="number-pad"
              maxLength={10}
              returnKeyType="done"
              blurOnSubmit
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Johnny7797"
              placeholderTextColor="#aaaaaaac"
              value={alias}
              onChangeText={setAlias}
              autoCapitalize="none"
              returnKeyType="done"
              blurOnSubmit
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaaaaaac"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              blurOnSubmit
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderButton, gender === "Male" && styles.genderButtonSelected]}
                onPress={() => setGenderLocal("Male")}
              >
                <Text style={[styles.genderButtonText, gender === "Male" && styles.genderButtonTextSelected]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "Female" && styles.genderButtonFemaleSelected,
                ]}
                onPress={() => setGenderLocal("Female")}
              >
                <Text style={[styles.genderButtonText, gender === "Female" && styles.genderButtonTextSelected]}>Female</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Height (ft / in)</Text>
            <View style={styles.heightRow}>
              <TextInput
                style={[styles.input, styles.heightInput]}
                placeholder="5"
                placeholderTextColor="#aaaaaaac"
                value={heightFeet}
                onChangeText={setHeightFeet}
                keyboardType="number-pad"
                maxLength={1}
                returnKeyType="done"
                blurOnSubmit
              />
              <Text style={styles.heightSeparator}>ft</Text>
              <TextInput
                style={[styles.input, styles.heightInput]}
                placeholder="10"
                placeholderTextColor="#aaaaaaac"
                value={heightInches}
                onChangeText={setHeightInches}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                blurOnSubmit
              />
              <Text style={styles.heightSeparator}>in</Text>
            </View>

            <Text style={styles.label}>Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              placeholder="150"
              placeholderTextColor="#aaaaaaac"
              value={weight}
              onChangeText={setWeightLocal}
              keyboardType="number-pad"
              returnKeyType="done"
              blurOnSubmit
            />

            <View style={styles.consentContainer}>
              <View style={styles.consentRow}>
                <TouchableOpacity
                  onPress={() => persistConsent(!acceptedTos, acceptedPrivacyPolicy)}
                  activeOpacity={0.8}
                >
                <View style={[styles.checkbox, acceptedTos && styles.checkboxChecked]}>
                  {acceptedTos ? <Text style={styles.checkboxCheckmark}>✓</Text> : null}
                </View>
                </TouchableOpacity>
                <Text style={styles.consentText}>
                  I agree to the{" "}
                  <Text
                    style={styles.consentLink}
                    onPress={() => {
                      openLegalDoc("tos");
                    }}
                  >
                    Terms of Service
                  </Text>
                </Text>
              </View>

              <View style={styles.consentRow}>
                <TouchableOpacity
                  onPress={() => persistConsent(acceptedTos, !acceptedPrivacyPolicy)}
                  activeOpacity={0.8}
                >
                <View
                  style={[
                    styles.checkbox,
                    acceptedPrivacyPolicy && styles.checkboxChecked,
                  ]}
                >
                  {acceptedPrivacyPolicy ? (
                    <Text style={styles.checkboxCheckmark}>✓</Text>
                  ) : null}
                </View>
                </TouchableOpacity>
                <Text style={styles.consentText}>
                  I agree to the{" "}
                  <Text
                    style={styles.consentLink}
                    onPress={() => {
                      openLegalDoc("privacy");
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>

            <PrimaryButton
              label="Sign Up"
              variant="continue"
              onPress={handleSignUp}
              containerStyle={styles.button}
            />

              <TouchableOpacity 
              onPress={() => navigation.navigate("LogIn" as never)}
              activeOpacity={0.8}
              >
            <Text style={styles.signInLinkText}>
              Already have an account?{" "}
              <Text style={styles.signUpLinkBold}>Log In here</Text>
            </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
      <Modal
        visible={legalDocOpen !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setLegalDocOpen(null)}
      >
        <View style={styles.legalModalRoot}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setLegalDocOpen(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          {legalDocOpen === "tos" ? (
            loadingTosPdf ? (
              <View style={styles.placeholderContainer}>
                <ActivityIndicator size="large" color="#3b6fb8" />
                <Text style={styles.placeholderText}>Loading Terms of Service...</Text>
              </View>
            ) : tosPdfUri ? (
              <View style={styles.legalDocPanel}>
                <Text style={styles.legalTitle}>Terms of Service</Text>
                <Text style={styles.legalDocBody}>
                  Opens in your device PDF viewer (Quick Look / Files). You can return here with the
                  close button.
                </Text>
                <TouchableOpacity
                  style={styles.openPdfButton}
                  onPress={() => openPdfFile(tosPdfUri)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.openPdfButtonText}>Open PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  Could not load the Terms of Service PDF.
                </Text>
              </View>
            )
          ) : null}

          {legalDocOpen === "privacy" ? (
            loadingPrivacyPdf ? (
              <View style={styles.placeholderContainer}>
                <ActivityIndicator size="large" color="#3b6fb8" />
                <Text style={styles.placeholderText}>Loading privacy policy...</Text>
              </View>
            ) : privacyPdfUri ? (
              <View style={styles.legalDocPanel}>
                <Text style={styles.legalTitle}>Privacy Policy</Text>
                <Text style={styles.legalDocBody}>
                  Opens in your device PDF viewer (Quick Look / Files). You can return here with the
                  close button.
                </Text>
                <TouchableOpacity
                  style={styles.openPdfButton}
                  onPress={() => openPdfFile(privacyPdfUri)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.openPdfButtonText}>Open PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  Could not load the privacy policy PDF.
                </Text>
              </View>
            )
          ) : null}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#141414e9",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 300,
    top: -20,
  },
  headerContainer: {
    marginBottom: 70,
    top: -50,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 28,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  formBox: {
    width: SCREEN_WIDTH * 0.85,
    padding: 20,
    borderRadius: 12,
    top: -120,
  },
  label: {
    color: "#fff",
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#44434373",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2255a7ff",
    marginTop: 24,
  },
  signInLinkText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    marginTop: 25,
  },
  signUpLinkBold: {
    color: "#5b9aff",
    fontWeight: "600",
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: "#44434373",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  genderButtonSelected: {
    backgroundColor: "#3b6fb8",
  },
  genderButtonFemaleSelected: {
    backgroundColor: "#ff2bd6",
  },
  genderButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  genderButtonTextSelected: {
    color: "#fff",
  },
  heightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  heightInput: {
    width: 60,
    marginBottom: 0,
  },
  heightSeparator: {
    color: "#fff",
    marginHorizontal: 8,
    fontSize: 14,
  },
  consentContainer: {
    marginBottom: 4,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#cfd8eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#3b6fb8",
    borderColor: "#3b6fb8",
  },
  checkboxCheckmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  consentText: {
    color: "rgba(255, 255, 255, 0.9)",
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  consentLink: {
    color: "#5b9aff",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  legalModalRoot: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "ios" ? 52 : 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: "#222",
    fontSize: 20,
    fontWeight: "700",
  },
  legalTitle: {
    color: "#0d1b33",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  legalDocPanel: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  legalDocBody: {
    color: "#2f3c54",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  openPdfButton: {
    backgroundColor: "#3b6fb8",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  openPdfButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  placeholderText: {
    marginTop: 10,
    color: "#2f3c54",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 16,
  },
});

export default SignUpScreen;
