
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const ProxyAlarm = ({ target, active }) => {
    const [locationSub, setLocationSub] = useState(null);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (x) => (x * Math.PI) / 180;
        const R = 6371e3;
        const latRad1 = toRad(lat1), latRad2 = toRad(lat2);
        const distLat = toRad(lat2 - lat1), distLon = toRad(lon2 - lon1);
        const a =
            Math.sin(distLat / 2) ** 2 +
            Math.cos(latRad1) * Math.cos(latRad2) * Math.sin(distLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const triggerAlarm = async () => {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/alarms/mixkit-security-facility-breach-alarm-994.wav')
            );
            await sound.playAsync();
            Alert.alert("Alarm", "You're near your target!");
        } catch (e) {
            console.error("Alarm failed:", e);
        }
    };

    const checkProximity = (lat, lon) => {
        const radius = target?.radius || 100;
        const distance = getDistance(lat, lon, target.latitude, target.longitude);
        console.log(`Distance to target: ${distance}m`);
        if (distance < radius) {
            triggerAlarm();
        }
    };

    useEffect(() => {
        let sub;

        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location access required');
                return;
            }

            sub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 10,
                },
                (loc) => {
                    const { latitude, longitude } = loc.coords;
                    checkProximity(latitude, longitude);
                }
            );
            setLocationSub(sub);
        };

        if (active) {
            startTracking();
        }

        return () => {
            if (sub) sub.remove();
        };
    }, [active]);

    return null;
};

export default ProxyAlarm;
