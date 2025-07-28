import axios from 'axios';

/**
 * Converts an ISO 8601 bus arrival time to minutes from now.
 * @param {string} timestamp - ISO time string from API.
 * @returns {string} - "Arriving", "X mins", or "No more buses"
 */
const formatArrivalTime = (timestamp) => {
    if (!timestamp) return 'No more buses';
    const arrival = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.round((arrival - now) / 60000);

    if (diffMins <= 0) return 'Arriving';
    if (diffMins === 1) return '1 min';
    return `${diffMins} mins`;
};

/**
 * Fetches bus arrival info for a single bus stop.
 * @param {string} busStopCode
 * @returns {Promise<object|null>}
 */
const getBusArrival = async (busStopCode) => {
    try {
        const response = await axios.get(`https://arrivelah2.busrouter.sg/?id=${busStopCode}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching bus arrival for ${busStopCode}:`, error.message);
        return null;
    }
};

/**
 * Fetches multiple bus arrivals for various bus stops and services.
 * @param {Array<{ code: string, busNum: string | number }>} codesAndServices
 * @returns {Promise<Array<object>>}
 */
const fetchAllBusArrivals = async (codesAndServices) => {
    const busInfoArray = [];

    for (const { code: stopCode, busNum: serviceNo } of codesAndServices) {
        try {
            const busStopData = await getBusArrival(stopCode);
            if (!busStopData || !busStopData.services) continue;

            const serviceInfo = busStopData.services.find(service => service.no === serviceNo.toString());
            if (!serviceInfo) {
                console.log(`Service ${serviceNo} not available at ${stopCode}`);
                continue;
            }

            busInfoArray.push({
                stopID: stopCode,
                busID: serviceNo,
                nextTiming: formatArrivalTime(serviceInfo.next?.time),
                next2Timing: formatArrivalTime(serviceInfo.next2?.time),
                next3Timing: formatArrivalTime(serviceInfo.next3?.time),
            });

        } catch (error) {
            console.error(`Error processing bus stop ${stopCode}:`, error.message);
        }
    }

    return busInfoArray;
};

export { getBusArrival, fetchAllBusArrivals };