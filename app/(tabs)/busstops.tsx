import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView,
    StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import SearchFilter from '../../components/SearchFilter';
import { getBusArrival } from '../../components/busTimes';
import { collection, addDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../authContext';

const BusStops = () => {
    const { user } = useAuth();
    const inputRef = useRef(null);
    const [searchInput, setSearchInput] = useState('');
    const [busStopInfo, setBusStopInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [expandedStopCode, setExpandedStopCode] = useState(null);

    const minsTillNextBus = (timestamp) => {
        if (!timestamp) return 'No more buses';
        const arrival = new Date(timestamp);
        const now = new Date();
        const diff = Math.round((arrival - now) / 60000);
        if (diff <= 0) return 'Arriving';
        return `${diff} min${diff > 1 ? 's' : ''}`;
    };

    const fetchFavorites = async () => {
        if (!user) return;
        try {
            const snapshot = await getDocs(collection(db, 'users', user.uid, 'favorites'));
            const favs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFavorites(favs);
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setFavorites([]); // 🔥 clear favorites on logout
        }
    }, [user]);

    const handleSelectStop = async (stop) => {
        const stopCode = stop.ADDRESS.split(' ')[0];
        const stopDesc = stop.DESCRIPTION || stop.ADDRESS || '';
        setSearchInput(`${stopDesc} (${stopCode})`);
        setLoading(true);

        try {
            const data = await getBusArrival(stopCode);
            setBusStopInfo({
                code: stopCode,
                name: stopDesc,
                address: stop.ADDRESS || stopDesc,
                arrivalInfo: data,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch bus stop info');
            console.error(error);
            setBusStopInfo(null);
        }

        setLoading(false);
    };

    const handleAddFavorite = async () => {
        if (!user || !busStopInfo) return;
        const alreadyExists = favorites.some(fav => fav.code === busStopInfo.code);
        if (alreadyExists) {
            Alert.alert('Already Added', 'This bus stop is already in your favorites.');
            return;
        }

        try {
            await addDoc(collection(db, 'users', user.uid, 'favorites'), {
                code: busStopInfo.code,
                name: busStopInfo.name,
            });
            Alert.alert('Success', 'Added to favorites!');
            fetchFavorites();
        } catch (err) {
            Alert.alert('Error', 'Could not save favorite.');
            console.error(err);
        }
    };

    const handleRemoveFavorite = async (favId) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'favorites', favId));
            setFavorites(prev => prev.filter(f => f.id !== favId));
        } catch (err) {
            Alert.alert('Error', 'Failed to remove favorite.');
            console.error(err);
        }
    };

    const toggleExpand = async (code) => {
        if (expandedStopCode === code) {
            setExpandedStopCode(null);
            return;
        }

        setLoading(true);
        try {
            const data = await getBusArrival(code);
            setExpandedStopCode(code);
            setBusStopInfo(prev => ({
                ...prev,
                expandedArrivalInfo: {
                    ...(prev?.expandedArrivalInfo || {}),
                    [code]: data,
                },
            }));
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch bus arrival info');
            console.error(err);
        }

        setLoading(false);
    };

    const renderArrivalTimes = (arrivalData) => {
        if (!arrivalData?.services?.length) return <Text>No bus arrival data</Text>;

        return arrivalData.services.map(service => {
            return (
                <View key={service.no} style={styles.busCard}>
                    <Text style={styles.busService}>Bus {service.no}</Text>
                    <View style={styles.timingRow}><Text>Next:</Text><Text>{minsTillNextBus(service.next?.time)}</Text>


                    </View>
                    <View style={styles.timingRow}><Text>Next 2:</Text><Text>{minsTillNextBus(service.next2?.time)}</Text></View>
                    <View style={styles.timingRow}><Text>Next 3:</Text><Text>{minsTillNextBus(service.next3?.time)}</Text></View>
                </View>
            );
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isExpanded = expandedStopCode === item.code;
                    const expandedData = busStopInfo?.expandedArrivalInfo?.[item.code];
                    return (
                        <View style={styles.favItem}>
                            <TouchableOpacity onPress={() => toggleExpand(item.code)} style={styles.favItemHeader}>
                                <Text style={styles.favItemText}>
                                    {item.name} ({item.code})
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)}>
                                        <Feather name="trash-2" size={18} color="red" style={{ marginRight: 10 }} />
                                    </TouchableOpacity>
                                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} />
                                </View>
                            </TouchableOpacity>
                            {isExpanded && expandedData && renderArrivalTimes(expandedData)}
                        </View>
                    );
                }}
                ListHeaderComponent={
                    <>
                        <View style={{ backgroundColor: '#e16130', padding: 25 }}>
                            <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold', textAlign: 'center' }}>Bus Stops</Text>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchBar}>
                            <Feather name="search" size={20} color="black" />
                            <TextInput
                                ref={inputRef}
                                style={styles.searchInput}
                                placeholder="Enter Bus Stop ID"
                                multiline
                                value={searchInput}
                                onChangeText={setSearchInput}
                            />
                        </View>

                        {/* Search Results */}
                        <View style={{ backgroundColor: 'white', padding: 16 }}>
                            <SearchFilter input={searchInput} setInput={setSearchInput} onSelect={handleSelectStop} mode="busStop" />
                        </View>

                        {/* Selected Bus Stop Info */}
                        {busStopInfo && (
                            <View style={styles.busStopInfo}>
                                <Text style={styles.busStopName}>{busStopInfo.name} ({busStopInfo.code})</Text>
                                <Text style={{ fontStyle: 'italic', marginBottom: 8 }}>📍 {busStopInfo.address}</Text>
                                {renderArrivalTimes(busStopInfo.arrivalInfo)}
                                {user ? (
                                    <TouchableOpacity onPress={handleAddFavorite} style={styles.starButton}>
                                        <Feather name="star" size={24} color="gold" />
                                        <Text style={{ marginLeft: 6, fontWeight: 'bold' }}>Add to Favourites</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={{ color: 'red', marginTop: 8 }}>Login to save favorites</Text>
                                )}
                            </View>
                        )}

                        <Text style={styles.favHeader}>Favourite Bus Stops</Text>
                    </>
                }
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No favourite bus stops yet.</Text>}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
            {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    searchBar: {
        padding: 10,
        flexDirection: 'row',
        backgroundColor: '#d9dbda',
        alignItems: 'center',
        margin: 10,
        borderRadius: 10,
    },
    searchInput: {
        fontSize: 15,
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingTop: 8,
        marginLeft: 4,
    },
    busStopInfo: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
    },
    busStopName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    starButton: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    favHeader: { fontWeight: 'bold', fontSize: 20, marginTop: 20, marginBottom: 10 },
    favItem: { borderBottomColor: '#ccc', borderBottomWidth: 1, paddingVertical: 10 },
    favItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    favItemText: { fontWeight: 'bold', fontSize: 16 },
    busCard: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 10, marginBottom: 10 },
    busService: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#e16130' },
    timingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
});

export default BusStops;
