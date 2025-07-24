import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import SearchFilter from '../../components/SearchFilter';
import { getBusArrival } from '../../components/busTimes';
import useFavoriteStopsStore from '../../store/favouriteStops';

const Profile = () => {
    const { favorites, addFavorite } = useFavoriteStopsStore();
    const [searchInput, setSearchInput] = useState('');
    const [busStopInfo, setBusStopInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedStopCode, setExpandedStopCode] = useState(null);

    const handleSelectStop = async (stop) => {
        // stop is full item from SearchFilter, must have code and name properties
        setSearchInput(stop.SEARCHVAL || stop.ADDRESS || '');
        setLoading(true);
        try {
            const data = await getBusArrival(stop.SEARCHVAL || stop.ADDRESS);
            if (!data || !data.services) {
                Alert.alert('Not Found', 'Bus stop not found or no data available');
                setBusStopInfo(null);
            } else {
                setBusStopInfo({
                    code: stop.SEARCHVAL || stop.ADDRESS,
                    name: stop.ADDRESS || '',
                    arrivalInfo: data,
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch bus stop info');
            setBusStopInfo(null);
            console.error(error);
        }
        setLoading(false);
    };

    const handleAddFavorite = () => {
        if (!busStopInfo) return;
        if (favorites.some((fav) => fav.code === busStopInfo.code)) {
            Alert.alert('Already Added', 'This bus stop is already in your favourites.');
            return;
        }
        addFavorite({ code: busStopInfo.code, name: busStopInfo.name });
        Alert.alert('Added', `${busStopInfo.name} added to favourites!`);
    };

    const toggleExpand = async (code) => {
        if (expandedStopCode === code) {
            setExpandedStopCode(null);
            return;
        }
        setLoading(true);
        try {
            const data = await getBusArrival(code);
            if (data) {
                setExpandedStopCode(code);
                setBusStopInfo((prev) => ({
                    ...prev,
                    expandedArrivalInfo: {
                        ...(prev?.expandedArrivalInfo || {}),
                        [code]: data,
                    },
                }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch bus arrival info');
            console.error(error);
        }
        setLoading(false);
    };

    const renderArrivalTimes = (arrivalData) => {
        if (!arrivalData?.services) return <Text>No bus arrival data</Text>;
        return arrivalData.services.map((service) => (
            <View key={service.no} style={styles.arrivalRow}>
                <Text style={styles.busNumber}>🚌 {service.no}</Text>
                <Text>Next: {minsTillNextBus(service.nextBus?.EstimatedArrival)}</Text>
                <Text>Next2: {minsTillNextBus(service.nextBus2?.EstimatedArrival)}</Text>
                <Text>Next3: {minsTillNextBus(service.nextBus3?.EstimatedArrival)}</Text>
            </View>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Profile</Text>

            {/* Search input */}
            <TextInput
                placeholder="Enter Bus Stop ID or Name"
                value={searchInput}
                onChangeText={setSearchInput}
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
            />

            {/* SearchFilter component (reuse as-is) */}
            <SearchFilter
                input={searchInput}
                setInput={setSearchInput}
                onSelect={handleSelectStop}
                mode="busStop" // optional to only show bus stops if you want
            />

            {/* Show bus stop info + Add favourite */}
            {busStopInfo && (
                <View style={styles.busStopInfo}>
                    <Text style={styles.busStopName}>
                        {busStopInfo.name} ({busStopInfo.code})
                    </Text>
                    {renderArrivalTimes(busStopInfo.arrivalInfo)}

                    <TouchableOpacity onPress={handleAddFavorite} style={styles.starButton}>
                        <Feather name="star" size={24} color="gold" />
                        <Text style={{ marginLeft: 6, fontWeight: 'bold' }}>Add to Favourites</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Favourite bus stops list */}
            <Text style={styles.favHeader}>Favourite Bus Stops</Text>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => {
                    const isExpanded = expandedStopCode === item.code;
                    return (
                        <View style={styles.favItem}>
                            <TouchableOpacity onPress={() => toggleExpand(item.code)} style={styles.favItemHeader}>
                                <Text style={styles.favItemText}>
                                    {item.name} ({item.code})
                                </Text>
                                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} />
                            </TouchableOpacity>
                            {isExpanded && busStopInfo?.expandedArrivalInfo?.[item.code] &&
                                renderArrivalTimes(busStopInfo.expandedArrivalInfo[item.code])}
                        </View>
                    );
                }}
                ListEmptyComponent={<Text style={{ marginTop: 20 }}>No favourite bus stops yet.</Text>}
                style={{ width: '100%' }}
            />
        </SafeAreaView>
    );
};

const minsTillNextBus = (timestamp) => {
    if (!timestamp) return 'No More Buses';
    const arrival = new Date(timestamp);
    const now = new Date();
    const diff = Math.max(Math.round((arrival - now) / 60000), 0);
    return `${diff} min`;
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 16 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    searchInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        width: '100%',
        marginBottom: 8,
        backgroundColor: 'white',
    },
    busStopInfo: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
    },
    busStopName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    starButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    favHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    favItem: {
        width: '100%',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    favItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    favItemText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    arrivalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    busNumber: {
        fontWeight: 'bold',
    },
});

export default Profile;
