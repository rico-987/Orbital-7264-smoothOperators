import { Image } from "expo-image";
import { StyleSheet, Text, View } from 'react-native';

const top10 = () => {
  return (
    <View> 
    <Image
    source ={require("../assets/images/drake.png")}
    style ={{width: 200, height:200}}
    contentFit="contain"/>
    <Text className="top-40 justify-center text-center">Key Events near your route!</Text>
    </View>
  )
}

export default top10

const styles = StyleSheet.create({})