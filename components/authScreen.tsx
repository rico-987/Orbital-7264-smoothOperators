import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
    const { setUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async () => {
        try {
            const userCredential = isLogin
                ? await signInWithEmailAndPassword(auth, email, password)
                : await createUserWithEmailAndPassword(auth, email, password);

            setUser(userCredential.user);
        } catch (error) {
            Alert.alert('Auth Error', error.message);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title={isLogin ? 'Login' : 'Register'} onPress={handleAuth} />
            <Text onPress={() => setIsLogin(!isLogin)} style={{ color: 'blue', marginTop: 10 }}>
                {isLogin ? 'Don’t have an account? Register' : 'Already have an account? Login'}
            </Text>
        </View>
    );
}