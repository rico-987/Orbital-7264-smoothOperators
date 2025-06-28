// tabs/Alarms.js or Alarms.tsx
import React, { useState, useEffect } from 'react';
import { Alert, View, Text, FlatList, Switch, SafeAreaView, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Pressable } from 'react-native';
import ProxyAlarm from '../../components/ProxyAlarm';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const initialAlarms = [
    { id: '1', label: 'Work', alarmAddress:'Rude', latitude: 1.3521, longitude: 103.8198, radius: 100, active: false },

    { id: '2', label: 'Home', alarmAddress:'Reservoir', latitude: 1.3001, longitude: 103.844, radius: 150, active: false },
];

export default function AlarmsTab() {
    const [alarms, setAlarms] = useState(initialAlarms);
    const [alarmOptionsVisible, setAlarmOptionsVisible] = useState(false);
    const [selectedAlarm, setSelectedAlarm] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editType, setEditType] = useState(null); // "rename" or "radius"
    const [selectedAlarmId, setSelectedAlarmId] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const toggleAlarm = (id) => {
        setAlarms(alarms.map(a => a.id === id ? { ...a, active: !a.active } : { ...a, active: false }));
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

    useEffect(() => {
        loadAlarms();
    }, []);
    const updateAlarm = async (id, newData) => {
        const alarmRef = doc(db, 'alarms', id);
        await updateDoc(alarmRef, newData);
    };
    const deleteAlarm = async (id) => {
        await deleteDoc(doc(db, 'alarms', id));
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
                    onPress: () => {
                        setAlarms(prev => prev.filter(alarm => alarm.id !== id));
                    },
                },
            ]
        );
    };
    const renderAlarm = ({ item }) => (
        <TouchableOpacity style={styles.card}
                          onLongPress={() => {
                              setSelectedAlarm(item);
                              setAlarmOptionsVisible(true);
                          }}>
            <View>
                <Text style={styles.title}>{item.label}</Text>
                <Text>{item.alarmAddress}</Text>
                <Text>Trigger Radius: {item.radius}m</Text>
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
        <View style={{ width: '100%', backgroundColor: '#e16130', padding: 25 }}>
            <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold', textAlign: 'center' }}>
                Alarms
            </Text>
        </View>
        <View style={styles.container}>

            {alarms.map(alarm => alarm.active && (
                <ProxyAlarm key={alarm.id} target={alarm} active={alarm.active} />
            ))}
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
                                setAlarms(prev => prev.filter(a => a.id !== selectedAlarm.id));
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
                            onPress={() => null}
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
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
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

