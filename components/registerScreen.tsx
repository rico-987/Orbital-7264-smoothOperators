
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { registerUser } from './authService'; // adjust path if needed
import { router } from 'expo-router';

const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            await registerUser(email, password);
            Alert.alert('Success', 'Account created!');
            router.replace('/profile'); // Go to profile screen after registration
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>

            <TextInput
                placeholder="Email"
                style={styles.input}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Register" onPress={handleRegister} />

            <View style={{ marginTop: 16 }}>
                <Button
                    title="Already have an account? Login"
                    onPress={() => router.replace('/profile')}
                />
            </View>
        </View>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 12,
        marginBottom: 16,
    },
});
