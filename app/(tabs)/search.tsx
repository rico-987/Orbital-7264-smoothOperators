import React ,{useState} from 'react'
import {Image, Pressable, SafeAreaView, Text, TextInput, View} from 'react-native'
import Feather from 'react-native-vector-icons/Feather';
import {router, useLocalSearchParams} from "expo-router";
import SearchFilter from "../../components/SearchFilter";
import useDirectionsStore from '../../store/directionsStore';



const search = () => {
    const [input, setInput] = useState('');
    const { type } = useLocalSearchParams(); // value is 'start' or 'end'
    const { setStart, setEnd ,setStartCoords, setEndCoords} = useDirectionsStore();
    const handleAddressSelect = (address) => {
        if (type === 'start') setStart(address);
        else setEnd(address);

        router.replace('/directions'); // or router.push('/directions') if needed
    };
    const setCoords = (coords) => {
        if (type === 'start') setStartCoords(coords);
        else setEndCoords(coords);
    }
    return (
      <SafeAreaView
          style={{
              flex: 1,
              justifyContent:'justify-between',

          }}
      >
          <View style={{ width: '100%', backgroundColor: '#e16130', padding: 25 }}>
              <Text style={{ color: 'white', fontSize: 23, fontWeight: 'bold', textAlign: 'center' }}>
                  Search
              </Text>
          </View>
          <View
              style={{
                  padding:10,
                  flexDirection: 'row',
                  width:'95%',
                  backgroundColor: '#d9dbda',
                  alignItems: 'center',
                  margin: 10,
                  borderRadius: 10
            }}
          >
              <Feather
                  name="search"
                  size={20}
                  color="black"
                  style ={{marginLeft:1, marginRight:4}}
              />
              <TextInput
                  style={{
                      fontSize: 15,
                      flex: 1,
                      minHeight: 40,
                      maxHeight: 120, // prevent too tall
                      paddingTop: 8,
                  }}
                  placeholder="Search"
                  multiline={true}
                  onChangeText={text => setInput(text)}
                  value={input}
              />
          </View>
          <View style={{ backgroundColor: 'white', padding: 16, flex: 1 }}>
              <SearchFilter input={input} setInput={setInput} onSelect={handleAddressSelect} setCoords={setCoords} />
          </View>
      </SafeAreaView>
  )
}

export default search