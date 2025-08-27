import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

export const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF4757',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#333',
        },
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="rules"
        options={{
          title: 'Rules',
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color, fontSize: 20 }}>📖</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color, fontSize: 20 }}>📊</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
