import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const GEOFENCING_TASK = 'geofencing-task';

TaskManager.defineTask(GEOFENCING_TASK, async ({ data: { eventType, region }, error }) => {
    if (error) {
        console.error('Geofencing task error:', error);
        return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
        console.log('Entered region:', region.identifier);

        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/alarms/mixkit-security-facility-breach-alarm-994.wav')
            );
            await sound.playAsync();
        } catch (err) {
            console.error('Failed to trigger alarm sound:', err);
        }
    }
});