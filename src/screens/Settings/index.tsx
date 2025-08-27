import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings } from './resources/useSettings';

export const SettingsScreen = () => {
  const {
    soundEnabled,
    hapticsEnabled,
    darkMode,
    toggleSound,
    toggleHaptics,
    toggleDarkMode,
    resetStatistics,
  } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Play sounds for die rolls and captures
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#767577', true: '#FF4757' }}
              thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Vibrate on interactions
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={toggleHaptics}
              trackColor={{ false: '#767577', true: '#FF4757' }}
              thumbColor={hapticsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark theme (always on for now)
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#767577', true: '#FF4757' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              disabled
            />
          </View>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>Trouble Game v1.0.0</Text>
          <Text style={styles.aboutText}>Created by Daniel Martorell</Text>
          <Text style={styles.aboutText}>© 2024 All Rights Reserved</Text>
        </View>

        <Pressable style={styles.resetButton} onPress={resetStatistics}>
          <Text style={styles.resetButtonText}>Reset Statistics</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF4757',
    marginBottom: 24,
    textAlign: 'center',
  },
  settingsList: {
    gap: 16,
    marginBottom: 40,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
    maxWidth: 200,
  },
  aboutSection: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFA502',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  resetButton: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  resetButtonText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: '600',
  },
});
