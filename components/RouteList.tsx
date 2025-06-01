import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const RouteList = ({ routes }) => {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleExpand = (index) => {
        setExpandedIndex(prev => (prev === index ? null : index));
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
