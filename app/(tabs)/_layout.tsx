import { Image, ImageBackground } from "expo-image";
import { Tabs } from 'expo-router';


const _layout = () => {
  return (
    <Tabs> 
        <Tabs.Screen
        name = "index"
        options = {{
            headerShown: false, 
            title: "Home",
            tabBarIcon: ({ color, size }) => ( 
            <ImageBackground 
            source={require("../../assets/images/button.png")}
            style = {{
                justifyContent: 'center',
                alignItems: 'center',
            }} 
            
            >
                <Image
                    source={require('../../assets/icons/home.png')}
                    style={{ width: 20, height: 20}}
                    contentFit="contain"
                />
            </ImageBackground>
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