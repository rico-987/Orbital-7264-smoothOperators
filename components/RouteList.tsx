import React, { useState } from 'react';
import {fetchAllBusArrivals, getBusArrival} from './busTimes';

import {View, Text, FlatList, TouchableOpacity, StyleSheet, Alert} from 'react-native';

const RouteList = ({ routes }) => {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleExpand = (index) => {
        if (expandedIndex === index){
            //pop-up to confirm route
            Alert.alert(
                "Confirm route",
                "Do you want to use this route?",
                [{
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => console.log("Cancel Pressed")
                },
                {
                    text: "OK",
                    //when user taps ok, we need to use information from Item to buses & bus stops in the trip
                    //will probably be useful for the bus timings using LTA api
                    onPress: async () => {
                        console.log("Route Selected", index + 1);
                        const selectedRoute = routes[index]
                        try{
                            const busLegs = selectedRoute.legs.filter(leg => leg.mode === 'BUS' || leg.mode === "RAIL")
                            const codesAndServices = busLegs.map(
                                leg => ({
                                    code: leg.from.stopCode, //bus stop code
                                    busNum: leg.route //bus service number
                                }))
                            console.log("stops n services:", codesAndServices)
                            //feed stop code and bus service to LTA data mall api from busTimes
                            const LiveBusTimes  = await fetchAllBusArrivals(codesAndServices);
                            console.log(JSON.stringify(LiveBusTimes, null, 2));

                            //idk how to go to the map display with the list of Live bus times
                            //how to represent the info also

                        }catch(error){
                            console.error("Failed to fetch live bus times:", error)
                            Alert.alert("Error: Could not fetch bus times")
                        }
                        setExpandedIndex(null);
                    }
                }]
            )
        }
            else {
            setExpandedIndex(index);
        }
    };

    const renderItem = ({ item, index }) => {
        const isExpanded = index === expandedIndex;
        const durationMin = Math.round(item.duration / 60);
        const walkTimeMin = Math.round(item.walkTime / 60);
        const transitTimeMin = Math.round(item.transitTime / 60);
        const fare = item.fare || "N/A";
        return (
            <TouchableOpacity
                onPress={() => toggleExpand(index)}
                style={styles.card}
            >

                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Route {index + 1}</Text>
                <Text>Total Duration: {durationMin} min</Text>
                <Text>Walk Time: {walkTimeMin} min</Text>
                <Text>Transit Time: {transitTimeMin} min</Text>
                <Text>Fare: ${fare}</Text>

                {isExpanded && (
                    <View style={styles.legsContainer}>
                        <Text style={styles.subHeader}>Legs:</Text>
                        {item.legs.map((leg, i) => (
                            <View key={i} style={styles.legItem}>
                                <Text>• {leg.mode}{leg.route ? ` - ${leg.route}` : ''}</Text>
                                <Text>  {leg.from.name} → {leg.to.name}</Text>
                                <Text>  {Math.round(leg.duration / 60)} min</Text>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={routes}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
        />
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#e0f7fa',
        marginHorizontal: 12,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
    },
    header: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    subHeader: {
        marginTop: 10,
        fontWeight: '600',
    },
    legsContainer: {
        marginTop: 6,
    },
    legItem: {
        marginTop: 6,
    },
});

export default RouteList;
