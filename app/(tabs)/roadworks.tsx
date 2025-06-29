import React from 'react';
import { WebView } from 'react-native-webview';

const TrafficClosures = () => (
    <WebView source={{ uri: 'https://onemotoring.lta.gov.sg/content/onemotoring/home/driving/traffic_information/traffic_updates_and_road_closures.html' }} />
);

export default TrafficClosures;
