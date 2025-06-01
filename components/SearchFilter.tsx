import {FlatList, Image, SafeAreaView, Text, TouchableOpacity, TextInput, View} from 'react-native'
import axios from 'axios';
import React, {useState, useEffect} from 'react'
import {router, useLocalSearchParams} from "expo-router";
import getAuthToken from '../store/authToken';


const SearchFilter = ({input, setInput, onSelect, setCoords}) => {

    const {authToken} = getAuthToken();
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState('');
    const fetchSuggestions = async (input) => {
        try {
            const response = await axios.get(
                'https://www.onemap.gov.sg/api/common/elastic/search',
                {
                    headers: {
                        Authorization: authToken, // If OneMap requires a token
                    },
                    params: {
                        searchVal: input,
                        returnGeom: 'Y',
                        getAddrDetails: 'Y',
                    },
                }
            );
            setResults(response.data.results || []);


        } catch (error) {
            console.error('OneMap search error:', error);
        }
    };



    useEffect(() => {
        if (input.trim().length > 0) {
            fetchSuggestions(input);
        } else {
            setResults([]);
        }
    }, [input]);
    return (
        <View style={{ backgroundColor: 'white', padding: 5, flex : 1 }}>
            <FlatList
                data={results}
                scrollEnabled={true}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{
                            borderWidth: 3,
                            borderColor: 'black',
                            borderRadius: 10,
                            backgroundColor: '#eee',
                            marginBottom: 10,
                        }}
                        onPress={() => {
                            if (onSelect) {
                                setCoords(item.LATITUDE + ',' + item.LONGITUDE);
                                onSelect(item.ADDRESS); // Callback to set the value and return

                            }
                            setInput('');
                        }}
                    >
                        <Text
                            style={{
                                backgroundColor: '#eee',
                                margin: 8,
                                borderRadius: 10,
                                fontSize: 15,
                            }}
                        >
                            {item.ADDRESS}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    )

}

export default SearchFilter