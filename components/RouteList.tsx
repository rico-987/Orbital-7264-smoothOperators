import React, { useState } from 'react';
import { fetchAllBusArrivals } from './busTimes';
import { router } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const getIcon = (mode) => {
    switch (mode) {
        case 'WALK': return '🚶';
        case 'BUS': return '🚌';
        default: return '❓';
    }
};

const RouteList = ({ routes }) => {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [liveBusInfo, setLiveBusInfo] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);

    const toggleExpand = (index) => {
        if (expandedIndex === index) {
            Alert.alert(
                "Confirm route",
                "Do you want to use this route?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => console.log("Cancel Pressed"),
                    },
                    {
                        text: "OK",
                        onPress: async () => {
                            console.log("Route Selected", index + 1);
                            const route = routes[index];
                            setSelectedRoute(route);

                            try {
                                // Filter only bus legs
                                const busLegs = route.legs.filter(leg => leg.mode === 'BUS');
                                // Extract bus stop codes and bus numbers
                                const codesAndServices = busLegs.map(leg => ({
                                    code: leg.from.stopCode,
                                    busNum: leg.route,
                                }));
                                console.log("stops n services:", codesAndServices);

                                // Fetch live bus times
                                const liveBusTimes = await fetchAllBusArrivals(codesAndServices);
                                console.log("LiveBusTimes array length:", liveBusTimes.length);

                                // Get stop names for each leg
                                const stopNames = busLegs.map(leg => leg.from.name);
                                console.log("stopNames:", stopNames);

                                // Combine stop names with live bus times (defensive mapping)
                                const displayInfo = liveBusTimes.map(item => {
                                    const matchIndex = busLegs.findIndex(leg => leg.from.stopCode === item.stopID);
                                    const stopName = matchIndex !== -1 ? stopNames[matchIndex] : 'Unknown Stop';
                                    return {
                                        stopName,
                                        ...item,
                                    };
                                });

                                console.log("DisplayInfo combined:", JSON.stringify(displayInfo, null, 2));

                                setLiveBusInfo(displayInfo);
                            } catch (error) {
                                console.error("Failed to fetch live bus times:", error);
                                Alert.alert("Error: Could not fetch bus times");
                            }

                            setExpandedIndex(null);
                        },
                    },
                ]
            );
        } else {
            setExpandedIndex(index);
        }
    };

    const minsTillNextBus = (timestamp) => {
        console.log("minsTillNextBus called with:", timestamp);
        if (!timestamp || timestamp === "No Available Bus") return 'No More Buses';

        const arrivalTime = new Date(timestamp);
        const now = new Date();
        const diffMs = arrivalTime.getTime() - now.getTime();
        const diffMin = Math.max(Math.round(diffMs / 60000), 0);
        console.log("Calculated mins till next bus:", diffMin);
        return `${diffMin} min`;
    };

    const renderRouteItem = ({ item, index }) => {
        const isExpanded = index === expandedIndex;
        const durationMin = Math.round(item.duration / 60);
        const walkTimeMin = Math.round(item.walkTime / 60);
        const transitTimeMin = Math.round(item.transitTime / 60);
        const fare = item.fare ?? "N/A";

        return (
            <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.card}>
                <Text style={styles.routeTitle}>Route {index + 1}</Text>
                {!isExpanded && (
                    <Text>
                        ⏱ {durationMin} min | 🚶 {walkTimeMin} min | 🚌 {transitTimeMin} min | 💵 ${fare}
                    </Text>
                )}
                {isExpanded && (
                    <View style={styles.legsContainer}>
                        <Text>⏱ Total Duration: {durationMin} min</Text>
                        <Text>🚶 Walk Time: {walkTimeMin} min</Text>
                        <Text>🚌 Transit Time: {transitTimeMin} min</Text>
                        <Text>💵 Fare: ${fare}</Text>
                        <Text style={styles.subHeader}>Legs:</Text>
                        {item.legs.map((leg, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.legItem,
                                    { backgroundColor: leg.mode === 'WALK' ? '#fff3e0' : '#C3B1E1', padding: 8, borderRadius: 6 },
                                ]}
                            >
                                <Text style={styles.legText}>
                                    {getIcon(leg.mode)} {leg.mode === 'BUS' ? `Take Bus ${leg.route}` : 'Walk'}
                                </Text>
                                <Text style={styles.legSubText}>
                                    from "{leg.from.name}" → "{leg.to.name}" ({Math.round(leg.duration / 60)} min)
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderLiveBusItem = ({ item }) => {
        console.log("Rendering live bus item:", item);
        return (
            <View style={styles.card}>
                <Text style={styles.header}>Bus Stop: {item.stopID} ({item.stopName || 'No Name'})</Text>
                <Text>Service No: {item.busID}</Text>
                <Text>Next Bus: {minsTillNextBus(item.nextTiming)}</Text>
                <Text>Next 2nd Bus: {minsTillNextBus(item.next2Timing)}</Text>
                <Text>Next 3rd Bus: {minsTillNextBus(item.next3Timing)}</Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
            {/* Back button to go back to route selection */}
            {liveBusInfo && (
                <TouchableOpacity
                    onPress={() => {
                        setLiveBusInfo(null);
                        setSelectedRoute(null);
                    }}
                    style={[styles.card, { backgroundColor: '#fff3e0', marginBottom: 10 }]}
                >
                    <Text style={{ color: 'blue' }}>← Back to Route Selection</Text>
                </TouchableOpacity>
            )}

            {/* Show route list if liveBusInfo is null */}
            {!liveBusInfo && (
                <FlatList
                    data={routes}
                    keyExtractor={(_, index) => `route-${index}`}
                    renderItem={renderRouteItem}
                    extraData={expandedIndex}
                />
            )}

            {/* Show live bus info if available */}
            {liveBusInfo && (
                <>
                    <View style={[styles.card, { backgroundColor: '#fffde7' }]}>
                        <Text style={styles.header}>Selected Route Summary</Text>
                        {selectedRoute?.legs.map((leg, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.legTouchable}
                                onPress={() => {
                                    // This is the fixed navigation from your old code:
                                    router.push({
                                        pathname: '/alarms',
                                        params: {
                                            openAddModal: true,
                                            legData: JSON.stringify(leg),
                                        },
                                    });
                                }}
                            >
                                <Text style={{ fontSize: 14 }}>
                                    {getIcon(leg.mode)} {leg.mode === 'BUS' ? `Take Bus ${leg.route}` : 'Walk'} from {leg.from.name} to {leg.to.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <FlatList
                        data={liveBusInfo}
                        keyExtractor={(item, i) => `${item.stopID}-${item.busID}-${i}`}
                        renderItem={renderLiveBusItem}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#e6e6fa',
        padding: 12,
        marginVertical: 6,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    routeTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    legsContainer: {
        marginTop: 10,
    },
    subHeader: {
        marginTop: 10,
        fontWeight: 'bold',
        fontSize: 15,
    },
    legItem: {
        marginTop: 6,
    },
    legText: {
        fontSize: 15,
    },
    legSubText: {
        fontSize: 14,
        color: '#555',
    },
    header: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 6,
    },
    legTouchable: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});

export default RouteList;
