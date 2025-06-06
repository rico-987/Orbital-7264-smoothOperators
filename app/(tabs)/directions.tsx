import {Button, Image, Pressable, SafeAreaView, Text, TextInput, TouchableHighlight, View} from 'react-native'
import React, {useState} from 'react'
import {router, useLocalSearchParams} from 'expo-router'
import RouteList from "../../components/RouteList";
import useDirectionsStore from '../../store/directionsStore';
import getAuthToken from '../../store/authToken';
import axios from "axios";

const directions = () => {
    const {authToken} = getAuthToken();
    const [routes, setRoutes] = useState([]);
    const now = new Date();

// Format date: MM-DD-YYYY
    const date = String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + '-' +
        now.getFullYear();

// Format time: HH:MM:SS
    const time = String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

// Optional: URL encode the time if building the query manually
    const encodedTime = encodeURIComponent(time);
    const { start, end , startCoords, endCoords} = useDirectionsStore();
    const canFindRoute = start && end;
    // Use selected values or default placeholders
    const startPlaceHolder = start || 'Enter starting point';
    const destPlaceHolder = end || 'Enter destination point';
    const fetchPublicTransportRoute = async () => {
        try {
            const response = await axios.get('https://www.onemap.gov.sg/api/public/routingsvc/route', {
                headers: {
                    Authorization: authToken  // Replace with your actual JWT token
                },
                params: {
                    start: startCoords,
                    end: endCoords,
                    routeType: 'pt',
                    date: date,
                    time: time,
                    mode: 'TRANSIT',

                }
            });

            setRoutes(response.data.plan.itineraries);
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent:'justify-between',

            }}
        >
            <View style={{ width: '100%', backgroundColor: '#e16130', padding: 25}}>
                <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold', textAlign: 'center' }}>
                    Directions
                </Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderTopWidth: 2, borderColor: 'black' }}>
                <Image source={require('../../assets/icons/start-marker.png')} style={{ width: 30, height: 30, margin : 5}} />
                <Pressable
                    onPress={() => router.push('/search?type=start')}
                    style={{ flexDirection: 'row', padding: 10, width: '100%' }}
                >
                    <Text style={{ marginLeft: 10 }}>{startPlaceHolder}</Text>
                </Pressable>
            </View>
            <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderColor: 'black' }}>
                <Image source={require('../../assets/icons/end-marker.png')} style={{ width: 30, height: 30, margin : 5}} />
                <Pressable
                    onPress={() => router.push('/search?type=end')} //
                    style={{  flexDirection: 'row', padding: 10, width: '100%' }}
                >
                    <Text style={{ marginLeft: 10 }}>{destPlaceHolder}</Text>
                </Pressable>
            </View>
            <View style={{ backgroundColor: 'white', padding: 16 }}>
                <Text style={{ color: 'darkgrey', fontSize: 15, fontWeight: 'bold', textAlign: 'left' }}>
                    Recommended routes
                </Text>
            </View>
            {canFindRoute && (
                <View style={{ padding: 16, backgroundColor: 'white' }}>
                    <TouchableHighlight
                        onPress={() => {
                            // Add your navigation or route logic here
                            console.log('Calculating route from:', startCoords, 'to:', endCoords);
                            fetchPublicTransportRoute();
                            // Example: router.push(`/map?start=${start}&end=${end}`)
                        }}
                        style={{
                            backgroundColor: '#e16130',
                            padding: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Find Route</Text>
                    </TouchableHighlight>
                </View>


            )}
            <View style={{flex: 1, backgroundColor: 'white', padding: 16 }}>
                <RouteList routes={routes} />
            </View>
        </SafeAreaView>

    )
}
export default directions

