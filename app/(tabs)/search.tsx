import React, { useState, useRef, useCallback } from 'react';
import { SafeAreaView, Text, TextInput, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // ← important
import SearchFilter from '../../components/SearchFilter';
import useDirectionsStore from '../../store/directionsStore';
import useAlarmCreationStore from '../../store/AlarmStore';

const Search = () => {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    const { type } = useLocalSearchParams(); // 'start' | 'end' | 'alarm'
    const { setStart, setEnd, setStartCoords, setEndCoords } = useDirectionsStore();
    const { setAddress, setCoordinates } = useAlarmCreationStore();

    // Focus input every time screen comes into view
    useFocusEffect(
        useCallback(() => {
            const timeout = setTimeout(() => {
                inputRef.current?.focus();
            }, 200); // Delay slightly for animation/nav transitions
            return () => clearTimeout(timeout);
        }, [])
    );

    const handleAddressSelect = (address) => {
        if (type === 'start') {
            setStart(address);
            router.replace('/directions');
        } else if (type === 'end') {
            setEnd(address);
            router.replace('/directions');
        } else if (type === 'alarm') {
            setAddress(address);
            router.replace('/alarms');
        }
    };

    const setCoords = (lat, long) => {
        if (type === 'start') setStartCoords(`${lat},${long}`);
        else if (type === 'end') setEndCoords(`${lat},${long}`);
        else if (type === 'alarm') {
            setCoordinates({ latitude: lat, longitude: long });
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ width: '100%', backgroundColor: '#e16130', padding: 25 }}>
                <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold', textAlign: 'center' }}>
                    Search
                </Text>
            </View>

            <View
                style={{
                    padding: 10,
                    flexDirection: 'row',
                    width: '95%',
                    backgroundColor: '#d9dbda',
                    alignItems: 'center',
                    margin: 10,
                    borderRadius: 10,
                }}
            >
                <Feather name="search" size={20} color="black" style={{ marginLeft: 1, marginRight: 4 }} />
                <TextInput
                    ref={inputRef}
                    style={{
                        fontSize: 15,
                        flex: 1,
                        minHeight: 40,
                        maxHeight: 120,
                        paddingTop: 8,
                    }}
                    placeholder="Search"
                    multiline={true}
                    onChangeText={text => setInput(text)}
                    value={input}
                />
            </View>

            <View style={{ backgroundColor: 'white', padding: 16, flex: 1 }}>
                <SearchFilter
                    input={input}
                    setInput={setInput}
                    onSelect={handleAddressSelect}
                    setCoords={setCoords}
                />
            </View>
        </SafeAreaView>
    );
};

export default Search;
