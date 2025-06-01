import { create } from 'zustand';

const useDirectionsStore = create(set => ({
    start: '',
    startCoords: '',
    end: '',
    endCoords: '',
    setStart: (start) => set({ start }),
    setEnd: (end) => set({ end }),
    setStartCoords: (startCoords) => set({ startCoords }),
    setEndCoords: (endCoords) => set({ endCoords }),
}));

export default useDirectionsStore;