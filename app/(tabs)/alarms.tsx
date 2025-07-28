import React, { useState, useEffect } from 'react';
import {
    Alert, View, Text, FlatList, Switch, SafeAreaView, TouchableOpacity,
    StyleSheet, Modal, TextInput, Pressable
} from 'react-native';
import ProxyAlarm from '../../components/ProxyAlarm';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import useAlarmCreationStore from '../../store/AlarmStore';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import '../backgroundLocation';
import { useAuth } from '../../authContext';

export default function AlarmsTab() {
    const { user } = useAuth();
    const [alarms, setAlarms] = useState([]);
    const [alarmOptionsVisible, setAlarmOptionsVisible] = useState(false);
    const [selectedAlarm, setSelectedAlarm] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editType, setEditType] = useState(null);
    const [selectedAlarmId, setSelectedAlarmId] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const {
        tempAlarm,
        setLabel,
        setRadius,
        resetAlarm,
        setAddress,
        setCoordinates
    } = useAlarmCreationStore();

    const { openAddModal, legData } = useLocalSearchParams();
    const userAlarmsCollection = user ? collection(db, 'users', user.uid, 'alarms') : null;

    const startGeofencing = async (alarmList) => {
        const regions = alarmList.filter(alarm => alarm.active).map(alarm => ({
            identifier: alarm.id,
            latitude: alarm.latitude,
            longitude: alarm.longitude,
            radius: alarm.radius || 100,
            notifyOnEnter: true,
            notifyOnExit: false,
        }));

        try { await Location.stopGeofencingAsync('geofencing-task'); } catch (e) {}

        if (regions.length > 0) {
            await Location.startGeofencingAsync('geofencing-task', regions);
        }
    };

    useEffect(() => {
        if (openAddModal === 'true' && legData) {
            try {
                const leg = JSON.parse(legData);
                setAddress(leg.to.name || '');
                const lat = parseFloat(leg.from.lat);
                const lon = parseFloat(leg.from.lon);
                setCoordinates({ latitude: isNaN(lat) ? null : lat, longitude: isNaN(lon) ? null : lon });
                setRadius(100);
            } catch (e) {
                console.warn('Failed to parse legData', e);
            }
            setShowAddModal(true);
        }
    }, [openAddModal, legData]);

    const toggleAlarm = async (id) => {
        const updated = alarms.map(alarm =>
            alarm.id === id ? { ...alarm, active: !alarm.active } : { ...alarm, active: false }
        );
        setAlarms(updated);
        for (const alarm of updated) {
            await updateAlarm(alarm.id, { active: alarm.active });
        }
    };

    const loadAlarms = async () => {
        if (!user) return;
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'alarms'));
        const alarmList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlarms(alarmList);
    };

    const updateAlarm = async (id, data) => {
        if (!user) return;
        const ref = doc(db, 'users', user.uid, 'alarms', id);
        await updateDoc(ref, data);
    };

    const deleteAlarm = async (id) => {
        if (!user) return;
        const ref = doc(db, 'users', user.uid, 'alarms', id);
        await deleteDoc(ref);
    };

    const Delete = (id) => {
        Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteAlarm(id);
                    await loadAlarms();
                },
            },
        ]);
    };

    const handleAddAlarm = async () => {
        if (!userAlarmsCollection) return;
        const newAlarm = {
            label: tempAlarm.label,
            alarmAddress: tempAlarm.address,
            latitude: tempAlarm.coords.latitude,
            longitude: tempAlarm.coords.longitude,
            radius: tempAlarm.radius,
            active: false,
        };
        await addDoc(userAlarmsCollection, newAlarm);
        await loadAlarms();
        resetAlarm();
        setShowAddModal(false);
    };

    useEffect(() => {
        if (alarms.length > 0) {
            startGeofencing(alarms);
        }
    }, [alarms]);

    useFocusEffect(
        React.useCallback(() => {
            if (user) loadAlarms();
        }, [user])
    );

    const renderAlarm = ({ item }) => (
        <View>
        <TouchableOpacity
            style={styles.card}
            onLongPress={() => {
                setSelectedAlarm(item);
                setAlarmOptionsVisible(true);
            }}
        >
            <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.title} numberOfLines={1}>{item.label}</Text>
                {item.alarmAddress && <Text style={{ fontSize: 14, color: '#555' }}>{item.alarmAddress}</Text>}
                <Text style={{ fontSize: 14 }}>Trigger Radius: {item.radius}m</Text>
            </View>
            <Switch value={item.active} onValueChange={() => toggleAlarm(item.id)} />
        </TouchableOpacity>
        {item.active && (
            <ProxyAlarm key={item.id} target={item} active={item.active} />
        )}
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ width: '100%', backgroundColor: '#e16130', padding: 25 }}>
                <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold', textAlign: 'center' }}>
                    Alarms
                </Text>
            </View>

            <View style={styles.container}>
                {!user ? (
                    <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 50 }}>
                        Please log in to access alarms.
                    </Text>
                ) : (
                    <>
                        <TouchableOpacity style={Buttonstyles.addButton} onPress={() => setShowAddModal(true)}>
                            <Text style={Buttonstyles.addButtonText}>Add Alarm</Text>
                        </TouchableOpacity>
                        <FlatList data={alarms} keyExtractor={(item) => item.id} renderItem={renderAlarm} />
                        {renderModals()}
                    </>
                )}
            </View>
        </SafeAreaView>
    );

    function renderModals() {
        return (
            <>
                {/* Alarm Options Modal */}
                <Modal visible={alarmOptionsVisible} transparent animationType="slide" onRequestClose={() => setAlarmOptionsVisible(false)}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: '60%' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                                Modify "{selectedAlarm?.label}"
                            </Text>
                            <Pressable onPress={() => {
                                setEditType('rename');
                                setInputValue(selectedAlarm.label);
                                setSelectedAlarmId(selectedAlarm.id);
                                setAlarmOptionsVisible(false);
                                setEditModalVisible(true);
                            }}>
                                <Text style={{ paddingVertical: 10 }}>Rename</Text>
                            </Pressable>
                            <Pressable onPress={() => {
                                setEditType('radius');
                                setInputValue(selectedAlarm.radius.toString());
                                setSelectedAlarmId(selectedAlarm.id);
                                setAlarmOptionsVisible(false);
                                setEditModalVisible(true);
                            }}>
                                <Text style={{ paddingVertical: 10 }}>Change Radius</Text>
                            </Pressable>
                            <Pressable onPress={() => { Delete(selectedAlarm.id); setAlarmOptionsVisible(false); }}>
                                <Text style={{ paddingVertical: 10, color: 'red' }}>Delete</Text>
                            </Pressable>
                            <Pressable onPress={() => setAlarmOptionsVisible(false)}>
                                <Text style={{ paddingVertical: 10, color: 'gray' }}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                {/* Edit Modal */}
                <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
                        <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                            <View style={{ backgroundColor: 'white', padding: 20, width: '100%', minHeight: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Edit Alarm</Text>
                                <TextInput value={inputValue} onChangeText={setInputValue} style={inputStyle} placeholder="Edit value" />
                                <Pressable onPress={async () => {
                                    try {
                                        if (editType === 'rename') {
                                            await updateAlarm(selectedAlarmId, { label: inputValue });
                                        } else if (editType === 'radius') {
                                            const radius = parseInt(inputValue);
                                            if (!isNaN(radius)) {
                                                await updateAlarm(selectedAlarmId, { radius });
                                            } else {
                                                Alert.alert('Invalid radius');
                                                return;
                                            }
                                        }
                                        setEditModalVisible(false);
                                        await loadAlarms();
                                    } catch (e) {
                                        Alert.alert('Update error', e.message);
                                    }
                                }}>
                                    <Text>Save</Text>
                                </Pressable>
                                <Pressable onPress={() => setEditModalVisible(false)}>
                                    <Text style={{ color: 'gray', paddingVertical: 10 }}>Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Add Alarm Modal */}
                <Modal visible={showAddModal} transparent animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Create New Alarm</Text>
                            <TextInput placeholder="Label" value={tempAlarm.label} onChangeText={setLabel} style={inputStyle} />
                            <TextInput placeholder="Radius (meters)" value={tempAlarm.radius.toString()} onChangeText={(val) => {
                                const num = parseInt(val);
                                if (!isNaN(num)) setRadius(num);
                            }} keyboardType="numeric" style={inputStyle} />
                            <TouchableOpacity onPress={() => router.push('/search?type=alarm')}>
                                <Text style={{ color: 'blue' }}>
                                    {tempAlarm.address ? tempAlarm.address : 'Set Alarm Address'}
                                </Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <TouchableOpacity onPress={() => { resetAlarm(); setShowAddModal(false); }} style={{ ...buttonStyle, backgroundColor: 'grey' }}>
                                    <Text style={{ color: 'white' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAddAlarm} style={{ ...buttonStyle, backgroundColor: '#e16130' }}>
                                    <Text style={{ color: 'white' }}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </>
        );
    }
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
