import React, { useState } from 'react';
import { fetchAllBusArrivals, getBusArrival } from './busTimes';
import { router } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const RouteList = ({ routes }) => {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [liveBusInfo, setLiveBusInfo] = useState(null); // To store fetched bus info
    const [selectedRoute, setSelectedRoute] = useState(null);
    const toggleExpand = (index) => {
        if (expandedIndex === index) {
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
                            setSelectedRoute(selectedRoute);
                            try {
                                const busLegs = selectedRoute.legs.filter(leg => leg.mode === 'BUS')
                                //this filters out the legs that use buses using OneMap api
                                const codesAndServices = busLegs.map(leg => ({
                                    code: leg.from.stopCode, //bus stop code
                                    busNum: leg.route //bus service number
                                }))
                                console.log("stops n services:", codesAndServices)
                                //feed stop code and bus service to LTA data mall api from busTimes
                                const LiveBusTimes = await fetchAllBusArrivals(codesAndServices);
                                //contains bus time info from arrivelah
                                const stopNames = busLegs.map(leg => leg.from.name)
                                //contains bus stop names
                                console.log(JSON.stringify(LiveBusTimes, null, 2));
                                console.log(JSON.stringify(stopNames, null, 2));
                                const displayInfo = LiveBusTimes.map((item, index) => ({
                                    stopName: stopNames[index],
                                    ...item,
                                }));
                                console.log(JSON.stringify(displayInfo, null, 2));
                                setLiveBusInfo(displayInfo); // switch UI to display live bus info
                            } catch (error) {
                                console.error("Failed to fetch live bus times:", error)
                                Alert.alert("Error: Could not fetch bus times")
                            }
                            setExpandedIndex(null);
                        }
                    }]
            )
        } else {
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
                {!isExpanded && (<Text>
                    ⏱ {durationMin} min | 🚶 {walkTimeMin} min | 🚌 {transitTimeMin} min | 💵 ${fare}
                </Text>)}

                {isExpanded && (
                    <View style={styles.legsContainer}>
                        <Text>⏱Total Duration: {durationMin} min</Text>
                        <Text>🚶Walk Time: {walkTimeMin} min</Text>
                        <Text>🚌Transit Time: {transitTimeMin} min</Text>
                        <Text>💵Fare: ${fare}</Text>

                        <Text style={styles.subHeader}>Legs:</Text>
                        {item.legs.map((leg, i) => (
                            <View key={i} style={[
                                styles.legItem,
                                { backgroundColor: leg.mode === 'WALK' ? '#fff3e0' : '#C3B1E1', padding: 8, borderRadius: 6 }
                            ]}>
                                <Text style={{ fontSize: 15 }}>
                                    {getIcon(leg.mode)} {leg.mode === 'BUS' ? `Take Bus ${leg.route}` : 'Walk'}
                                </Text>
                                <Text style={{ fontSize: 14, color: '#555' }}>
                                    from "{leg.from.name}" → "{leg.to.name}" ({Math.round(leg.duration / 60)} min)
                                </Text>
                            </View>
                        ))}

                    </View>
                )}
            </TouchableOpacity>
        );
    };
    const minsTillNextBus = (timestamp) =>{
        if (!timestamp) return 'No More Buses';
        const arrivalTime = new Date(timestamp);
        const timeNow = new Date();
        const diff = arrivalTime.getTime() - timeNow.getTime();
        const diffMin = Math.max(Math.round(diff / 60000), 0);
        return `${diffMin} min`;

    }

    const renderLiveBusItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.header}>
                Bus Stop: {item.stopID} ({item.stopName})
            </Text>
            <Text>Service No: {item.busID}</Text>
            <Text>Next Bus: {minsTillNextBus(item.nextTiming) || 'N/A'}</Text>
            <Text>Next 2nd Bus: {minsTillNextBus(item.next2Timing) || 'N/A'}</Text>
            <Text>Next 3rd Bus: {minsTillNextBus(item.next3Timing) || 'N/A'}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            {/* Show back button when viewing live timings */}
            {liveBusInfo && (
                <TouchableOpacity
                    onPress={() => {
                        setLiveBusInfo(null);
                    }}
                    style={[styles.card, { backgroundColor: '#fff3e0' }]}
                >
                    <Text style={{ color: 'blue' }}>← Back to Route Selection</Text>
                </TouchableOpacity>
            )}
            {selectedRoute && liveBusInfo && (
            <View style={[styles.card, { backgroundColor: '#fffde7' }]}>
                <Text style={styles.header}>Selected Route Summary</Text>
                {selectedRoute.legs.map((leg, i) => (
                    <TouchableOpacity
                        key={i}
                        style={styles.legTouchable}
                        onPress={() => {
                            router.push({
                                pathname: '/alarms',
                                params: {
                                    openAddModal: true,
                                    legData: JSON.stringify(leg),
                                }
                            });
                        }}
                    >
                        <Text style={styles.legTitle}>
                            {getIcon(leg.mode)} {leg.mode === 'BUS' ? `Take Bus ${leg.route}` : 'Walk'}
                        </Text>
                        <Text style={styles.legSubtext}>
                            {leg.from.name} → {leg.to.name} ({Math.round(leg.duration / 60)} min)
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        )}

            <FlatList
                data={liveBusInfo || routes}
                keyExtractor={(_, index) => index.toString()}
                renderItem={liveBusInfo ? renderLiveBusItem : renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
};
const getIcon = (mode) => {
    switch (mode) {
        case 'BUS': return '🚌';
        case 'WALK': return '🚶';
        case 'MRT': return '🚇';
        default: return '❓';
    }
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
    legTouchable: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
        backgroundColor: '#f0f0f0',
    },

    legTitle: {
        fontWeight: '600',
        fontSize: 15,
    },

    legSubtext: {
        color: '#555',
        fontSize: 13,
    },
});


export default RouteList;
