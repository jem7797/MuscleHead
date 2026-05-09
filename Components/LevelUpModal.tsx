import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useUser } from "../Contexts/UserContext";
import {
  accent,
  borderSubtle,
  surfaceElevated,
  textPrimary,
  textSecondary,
} from "../theme/colors";

const CONTINUE_DELAY_MS = 1000;

/**
 * Full-screen celebration when XP pushes the user into a new rank.
 * Vibrates / haptics on open; "Continue" appears after {@link CONTINUE_DELAY_MS}.
 */
const LevelUpModal = () => {
  const { levelUpModal, dismissLevelUpModal } = useUser();
  const visible = levelUpModal != null;
  const rankName = levelUpModal?.rankName ?? "";

  const [showContinue, setShowContinue] = useState(false);

  const backdropOp = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const continueOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setShowContinue(false);
      backdropOp.setValue(0);
      cardScale.setValue(0.88);
      cardOpacity.setValue(0);
      continueOpacity.setValue(0);
      return;
    }

    setShowContinue(false);
    continueOpacity.setValue(0);

    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => {},
    );

    backdropOp.setValue(0);
    cardScale.setValue(0.88);
    cardOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 0.78,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => setShowContinue(true), CONTINUE_DELAY_MS);
    return () => clearTimeout(t);
  }, [visible, rankName, backdropOp, cardScale, cardOpacity, continueOpacity]);

  useEffect(() => {
    if (!showContinue) {
      continueOpacity.setValue(0);
      return;
    }
    Animated.timing(continueOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [showContinue, continueOpacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissLevelUpModal}
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents="none"
          style={[styles.backdrop, { opacity: backdropOp }]}
        />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <Image
            source={require("../assets/LevelUpIconNoBackground.png")}
            style={styles.logo}
            contentFit="contain"
          />

          <Text style={styles.title}>Level Up!</Text>
          <Text style={styles.body}>
            You have reached the rank of{" "}
            <Text style={styles.rankName}>{rankName}</Text>
          </Text>

          {showContinue ? (
            <Animated.View style={{ opacity: continueOpacity, alignSelf: "stretch" }}>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={dismissLevelUpModal}
                activeOpacity={0.85}
              >
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: surfaceElevated,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: borderSubtle,
    alignItems: "center",
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: accent,
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    color: textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  rankName: {
    fontWeight: "700",
    color: textPrimary,
  },
  continueBtn: {
    marginTop: 20,
    backgroundColor: accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
});

export default LevelUpModal;
