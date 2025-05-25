import { ImageBackground } from "expo-image";
import { Link } from "expo-router";
import React, { useEffect, useState } from 'react';
import MapView, {PROVIDER_GOOGLE} from "react-native-maps";
import { Alert, Pressable, StyleSheet , Text, TextInput, View} from "react-native";
import * as Location from 'expo-location';



export default function Home() {
    const [permissionGranted, setPermissionGranted] = useState(false);
    const INITIAL_REGION = {
        latitude: 1.3521,
        longitude: 103.8198,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };
    const [selectedOption, setSelectedOption] = useState("");

    const options = ["Option 1", "Option 2", "Option 3"];
    const handleOptionSelected = (option) => {
        setSelectedOption(option);
    };

    useEffect(() => { //Permissions for using location
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setPermissionGranted(true);
            }
        })();
    }, []);

  return (
    <View className="flex-1 bg-primary justify-center items-center">
        <MapView
              style = {StyleSheet.absoluteFill}
            provider = {PROVIDER_GOOGLE}
            initialRegion = {INITIAL_REGION}
            showsUserLocation = {true}
            showsMyLocationButton = {true}
          />
        <TextInput
            style={{
                borderRadius: 10,
                margin: 10,
                color: '#000',
                borderColor: '#666',
                backgroundColor: '#FFF',
                borderWidth: 1,
                height: 45,
                paddingHorizontal: 10,
                fontSize: 18,
                position: 'absolute',
                top: 10,
                left: 10,
                right: 10
            }}
            placeholder={'Search'}
            placeholderTextColor={'#666'}
        />


    </View>
  );
}