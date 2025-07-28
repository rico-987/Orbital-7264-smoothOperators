import {create} from 'zustand';

const useFavoriteStopsStore = create((set) => ({
    favorites: [],
    addFavorite: (stop) => set(state => ({
        favorites: [...state.favorites, stop]
    })),
    removeFavorite: (code) => set(state => ({
        favorites: state.favorites.filter(stop => stop.code !== code)
    })),
}));

export default useFavoriteStopsStore;
