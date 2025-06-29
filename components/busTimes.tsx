import React, {useState} from 'react'
import axios from 'axios';

const getBusArrival = async (busStopCode) => {
    try {
        const response = await axios.get(
            `https://arrivelah2.busrouter.sg/?id=${busStopCode}`,
        );
        console.log(response.data);
        return response.data;
        } catch(error){
            console.error(`Error fetching bus arrival:`, error);
            return null;
        }
    }
const fetchAllBusArrivals = async (codesAndServices) => {
    const busInfoArray = [];

    for (const { code: stopCode, busNum: serviceNo } of codesAndServices) {
        try {
            const busStopData = await getBusArrival(stopCode)
            if (!busStopData) continue;
            const serviceInfo = busStopData.services.find(services => services.no === serviceNo.toString());

        if (!serviceInfo) console.log(`service ${serviceNo} not available at ${stopCode}`);

        busInfoArray.push({
            stopID: stopCode,
            busID: serviceNo,
            nextTiming: serviceInfo.next?.time || "No Available Bus",
            next2Timing: serviceInfo.next2?.time || "No Available Bus",
            next3Timing: serviceInfo.next3?.time || "No Available Bus",

        });
    } catch (error){
        console.error(`Cant Find bus stop ${stopCode}`)}
    }
    return busInfoArray;
}



export {getBusArrival};
export { fetchAllBusArrivals};
