import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.error(error);
        return;
    }

    const { locations } = data;
    if (locations.length > 0) {
        const { latitude, longitude } = locations[0].coords;
        console.log("Background Location:", latitude, longitude);

    }
});