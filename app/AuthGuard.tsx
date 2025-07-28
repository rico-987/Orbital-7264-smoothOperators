// components/AuthGuard.js
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../authContext'; // adjust path as needed
import { View, ActivityIndicator } from 'react-native';

const AuthGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('../(tabs)/profile'); // only redirect when auth is loaded
        }
    }, [loading, user]);

    if (loading || (!user && !loading)) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#e16130" />
            </View>
        );
    }

    return children;
};

export default AuthGuard;
