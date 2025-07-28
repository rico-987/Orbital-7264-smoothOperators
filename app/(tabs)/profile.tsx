// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../authContext';
import LoginScreen from '../loginScreen'; // Reuse the login screen
import { logoutUser } from '../../components/authService';
export default function ProfileScreen() {
    const { user, logout } = useAuth();

    if (!user) {
        return <LoginScreen />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome, {user.email}</Text>
            <Button title="Log Out" onPress={logoutUser} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
});