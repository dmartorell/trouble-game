import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#16213e',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Trouble Game',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="game/setup"
          options={{
            title: 'Game Setup',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="game/play"
          options={{
            title: 'Game',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: 'Settings',
            presentation: 'modal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
};

export default RootLayout;
