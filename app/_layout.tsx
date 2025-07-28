import { Stack } from "expo-router";
import './globals.css';
import { AuthProvider } from '../authContext'; // adjust if your path is different

export default function RootLayout() {
  return (
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="locations/[id]" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
  );
}