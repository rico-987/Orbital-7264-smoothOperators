import { ImageBackground } from "expo-image";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-primary justify-center items-center">
      <Link href="/top10">
        <ImageBackground
          source={require("../../assets/images/button.png")}
          style={{
            width: 200,
            height: 90,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text className="text-4xl text-black">BIG MAP</Text>
        </ImageBackground>
      </Link>
    </View>
  );
}