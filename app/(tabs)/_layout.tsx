import { Image, ImageBackground } from "expo-image";
import { Tabs } from 'expo-router';


const _layout = () => {
  return (
    <Tabs> 
        <Tabs.Screen
        name = "home"
        options = {{
            headerShown: false, 
            title: "Home",
            tabBarIcon: ({ color, size }) => ( 

                <Image
                    source={require('../../assets/icons/home.png')}
                    style={{ width: 20, height: 20}}
                    contentFit="contain"
                />

              ),
            }}
        />
        <Tabs.Screen 
            name = "search"
            options = {{
                headerShown: false,
                title: "Search",
                tabBarIcon: ({ color, size }) => (
                    <Image
                        source={require('../../assets/icons/search.png')}
                        style={{ width: 20, height: 20 }}
                        contentFit="contain"
                    />
                  ),
            }}
        />

        <Tabs.Screen
            name="directions"
            options={{
                headerShown: false,
                title: "Directions",
                tabBarIcon: ({ color, size }) => (
                    <Image
                        source={require('../../assets/icons/get-directions-button.png')}
                        style={{ width: 20 , height: 30 }}
                        contentFit="contain"
                    />
                ),
            }}
        />
        <Tabs.Screen
            name="alarms"
            options={{
                headerShown: false,
                title: "Alarms",
                tabBarIcon: ({ color, size }) => (
                    <Image
                        source={require('../../assets/icons/alarm-clock.png')}
                        style={{ width: 20 , height: 30 }}
                        contentFit="contain"
                    />
                ),
            }}
        />

        <Tabs.Screen
            name="busstops"
            options={{
                headerShown: false,
                title: "Bus Stop",
                tabBarIcon: ({ color, size }) => (
                    <Image
                        source={require('../../assets/icons/busStopIcon.png')}
                        style={{ width: 20 , height: 30 }}
                        contentFit="contain"
                    />
                ),
            }}
        />
        <Tabs.Screen
        name="profile"
        options={{
            headerShown: false,
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
                <Image
                    source={require('../../assets/icons/profile.png')}
                    style={{ width: 20 , height: 30 }}
                    contentFit="contain"
                />
            ),
        }}
    />
    </Tabs>
  )
}

export default _layout