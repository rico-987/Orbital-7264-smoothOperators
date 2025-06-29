// tabs/Alarms.js or Alarms.tsx
import React, { useState, useEffect } from 'react';
import { Alert, View, Text, FlatList, Switch, SafeAreaView, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Pressable } from 'react-native';
import ProxyAlarm from '../../components/ProxyAlarm';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import useAlarmCreationStore from '../../store/AlarmStore';
import { router } from 'expo-router';



export default function AlarmsTab() {
    // New states

    const [alarms, setAlarms] = useState([]);
    const [alarmOptionsVisible, setAlarmOptionsVisible] = useState(false);
    const [selectedAlarm, setSelectedAlarm] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editType, setEditType] = useState(null); // "rename" or "radius"
    const [selectedAlarmId, setSelectedAlarmId] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newCoords, setNewCoords] = useState({ latitude: null, longitude: null });
    const [newRadius, setNewRadius] = useState('100')
    const {
        tempAlarm,
        setLabel,
        setRadius,
        resetAlarm
    } = useAlarmCreationStore();
    const toggleAlarm = async (id) => {
        const updated = alarms.map(alarm =>
            alarm.id === id
                ? { ...alarm, active: !alarm.active }
                : { ...alarm, active: false }
        );

        setAlarms(updated);

        for (const alarm of updated) {
            await updateAlarm(alarm.id, { active: alarm.active });
        }
    };
    const saveAlarm = async (alarm) => {
        try {
            const docRef = await addDoc(collection(db, 'alarms'), alarm);
            console.log("Alarm saved with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding alarm: ", e);
        }
    };
    const loadAlarms = async () => {
        const snapshot = await getDocs(collection(db, 'alarms'));
        const alarmList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlarms(alarmList);
    };
    useFocusEffect(
        React.useCallback(() => {
            loadAlarms();
        }, [])
    );

    const deleteAlarm = async (id) => {
        await deleteDoc(doc(db, 'alarms', id));
    };
    const updateAlarm = async (id, data) => {
        const ref = doc(db, 'alarms', id);
        await updateDoc(ref, data);
    };

    const Delete = (id) => {
        Alert.alert(
            'Delete Alarm',
            'Are you sure you want to delete this alarm?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteAlarm(id);
                        loadAlarms();
                    },
                },
            ]
        );
    };
    const handleAddAlarm = async () => {
        const newAlarm = {
            label: tempAlarm.label,
            alarmAddress: tempAlarm.address,
            latitude: tempAlarm.coords.latitude,
            longitude: tempAlarm.coords.longitude,
            radius: tempAlarm.radius,
            active: false,
        };

        try {
            const docRef = await addDoc(collection(db, 'alarms'), newAlarm);
            console.log('Alarm added with ID:', docRef.id);

            await loadAlarms();       // Refresh the alarm list
            resetAlarm();             // Clear temp state
            setShowAddModal(false);   // Close modal
        } catch (error) {
            console.error('Failed to add alarm:', error);
            Alert.alert('Error', 'Failed to add alarm.');
        }
    };


    const renderAlarm = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onLongPress={() => {
                setSelectedAlarm(item);
                setAlarmOptionsVisible(true);
            }}
        >
            <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {item.label}
                </Text>
                {item.alarmAddress ? (
                    <Text numberOfLines={2} ellipsizeMode="tail" style={{ fontSize: 14, color: '#555' }}>
                        {item.alarmAddress}
                    </Text>
                ) : null}
                <Text style={{ fontSize: 14 }}>Trigger Radius: {item.radius}m</Text>
            </View>
            <Switch value={item.active} onValueChange={() => toggleAlarm(item.id)} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent:'justify-between',

            }}
        >
        <View style={{ width: '100%', backgroundColor: '#e16130', padding: 25}}>
            <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold', textAlign: 'center' }}>
                Alarms
            </Text>
        </View>
        <View style={styles.container}>

            {alarms.map(alarm => alarm.active && (
                <ProxyAlarm key={alarm.id} target={alarm} active={alarm.active} />
            ))}
            <TouchableOpacity style={Buttonstyles.addButton} onPress={() => setShowAddModal(true)}>
                <Text style={Buttonstyles.addButtonText}>Add Alarm</Text>
            </TouchableOpacity>
            <FlatList
                data={alarms}
                keyExtractor={(item) => item.id}
                renderItem={renderAlarm}
            />
            <Modal
                visible={alarmOptionsVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAlarmOptionsVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0,0,0,0.3)'
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        padding: 20,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        minHeight: '60%'


                    }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Modify "{selectedAlarm?.label}"
                        </Text>

                        <Pressable
                            style={{ paddingVertical: 10 }}
                            onPress={() => {
                                setEditType('rename');
                                setInputValue(selectedAlarm.label);
                                setSelectedAlarmId(selectedAlarm.id);
                                setAlarmOptionsVisible(false);
                                setEditModalVisible(true);
                            }}
                        >
                            <Text>Rename</Text>
                        </Pressable>

                        <Pressable
                            style={{ paddingVertical: 10 }}
                            onPress={() => {
                                setEditType('radius');
                                setInputValue(selectedAlarm.radius.toString());
                                setSelectedAlarmId(selectedAlarm.id);
                                setAlarmOptionsVisible(false);
                                setEditModalVisible(true);
                            }}
                        >
                            <Text>Change Radius</Text>
                        </Pressable>

                        <Pressable
                            style={{ paddingVertical: 10 }}
                            onPress={() => {
                                Delete(selectedAlarm.id);
                                setAlarmOptionsVisible(false);
                            }}
                        >
                            <Text style={{ color: 'red' }}>Delete</Text>
                        </Pressable>

                        <Pressable
                            style={{ paddingVertical: 10 }}
                            onPress={() => setAlarmOptionsVisible(false)}
                        >
                            <Text style={{ color: 'gray' }}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
                    <View style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        width:'100%',
                        backgroundColor: 'rgba(0,0,0,0.3)'
                    }}>
                        <View style={{

                            backgroundColor: 'white',
                            padding:20,
                            width:'100%',
                            minHeight: '60%',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20
                        }}>

                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Edit Alarm</Text>

                        <TextInput
                            value={inputValue}
                            onChangeText={setInputValue}
                            style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 20 }}
                            placeholder="Rename alarm"
                        />

                        <Pressable
                            style={{ paddingVertical: 10 }}
                            onPress={async () => {
                                try {
                                    if (editType === 'rename') {
                                        await updateAlarm(selectedAlarmId, { label: inputValue });
                                    } else if (editType === 'radius') {
                                        const radiusValue = parseInt(inputValue);
                                        if (!isNaN(radiusValue)) {
                                            await updateAlarm(selectedAlarmId, { radius: radiusValue });
                                        } else {
                                            Alert.alert("Invalid radius", "Please enter a number.");
                                            return;
                                        }
                                    }

                                    setEditModalVisible(false);
                                    await loadAlarms(); // Refresh the updated values
                                } catch (error) {
                                    console.error('Update failed:', error);
                                    Alert.alert('Error', 'Failed to update alarm.');
                                }
                            }}
                        >
                            <Text>Save</Text>
                        </Pressable>
                        <Pressable
                                style={{ paddingVertical: 10 }}
                                onPress={() => setEditModalVisible(false)}
                        >
                                <Text style={{ color: 'gray' }}>Cancel</Text>
                        </Pressable>

                        </View>
                    </View>
                </View>
            </Modal>
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Create New Alarm</Text>

                        <TextInput
                            placeholder="Label"
                            value={tempAlarm.label}
                            onChangeText={setLabel}
                            style={inputStyle}
                        />

                        <TextInput
                            placeholder="Radius (meters)"
                            value={tempAlarm.radius.toString()}
                            onChangeText={(val) => {
                                const num = parseInt(val);
                                if (!isNaN(num)) setRadius(num);
                            }}
                            style={inputStyle}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            onPress={() => router.push('/search?type=alarm')}
                            style={{ marginBottom: 10 }}
                        >
                            <Text style={{ color: 'blue' }}>
                                {tempAlarm.address ? tempAlarm.address : 'Set Alarm Address'}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    resetAlarm();
                                    setShowAddModal(false);
                                }}
                                style={{ ...buttonStyle, backgroundColor: 'grey' }}
                            >
                                <Text style={{ color: 'white' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleAddAlarm(tempAlarm)}
                                style={{ ...buttonStyle, backgroundColor: '#e16130' }}
                            >
                                <Text style={{ color: 'white' }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>




        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16},
    card: {
        backgroundColor: '#fff',
        padding: 14,
        marginBottom: 10,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        elevation: 2,
    },
    title: { fontSize: 16, fontWeight: 'bold' },
});
const inputStyle = {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
};

const buttonStyle = {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
};
const Buttonstyles = StyleSheet.create({
    addButton: {
        backgroundColor: '#e16130',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

