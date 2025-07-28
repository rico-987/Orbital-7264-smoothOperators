import { create } from 'zustand';

const useAlarmCreationStore = create((set) => ({
    tempAlarm: {
        label: '',
        radius: 100,
        address: '',
        coords: { latitude: null, longitude: null },
    },
    setLabel: (label) =>
        set((state) => ({
            tempAlarm: { ...state.tempAlarm, label },
        })),
    setRadius: (radius) =>
        set((state) => ({
            tempAlarm: { ...state.tempAlarm, radius },
        })),
    setAddress: (address) =>
        set((state) => ({
            tempAlarm: { ...state.tempAlarm, address },
        })),
    setCoordinates: (coords) =>
        set((state) => ({
            tempAlarm: { ...state.tempAlarm, coords },
        })),
    resetAlarm: () =>
        set(() => ({
            tempAlarm: {
                label: '',
                radius: 100,
                address: '',
                coords: { latitude: null, longitude: null },
            },
        })),
}));

export default useAlarmCreationStore;
useAlarmCreationStore;