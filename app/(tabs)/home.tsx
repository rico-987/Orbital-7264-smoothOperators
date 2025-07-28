import React, { useEffect, useState, useRef } from 'react';
import MapView, {PROVIDER_GOOGLE} from "react-native-maps";
import { Alert, Pressable, StyleSheet , Text, TextInput, View, SafeAreaView} from "react-native";
import * as Location from 'expo-location';


export default function Home() {
    const [permissionGranted, setPermissionGranted] = useState(false);
    const INITIAL_REGION = {
        latitude: 1.3521,
        longitude: 103.8198,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };
    const mapRef = useRef(null);
    const [selectedOption, setSelectedOption] = useState("");

    const options = ["Option 1", "Option 2", "Option 3"];
    const handleOptionSelected = (option) => {
        setSelectedOption(option);
    };

    useEffect(() => {
        (async () => {
            // Request foreground permissions
            const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
            if (fgStatus !== 'granted') return;

            // Request background permissions
            const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
            if (bgStatus !== 'granted') return;

            // If both are granted
            setPermissionGranted(true);
        })();
    }, []);

  return (


    <SafeAreaView  style = {{flex: 1, backgroundColor: '#e16130', justifyContent: 'center', alignItems: 'center'}} >


        <Text style = {{color: 'white', fontSize: 23, fontWeight: 'bold', textAlign: 'center', position:'absolute',top:16}}>Home</Text>
        <MapView
            style={{ width: '100%', height: '93%', position: 'absolute', bottom:0 }}
            provider = {PROVIDER_GOOGLE}
            initialRegion = {INITIAL_REGION}
            showsUserLocation = {true}
            showsMyLocationButton = {true}
          />




    </SafeAreaView>
  );
}