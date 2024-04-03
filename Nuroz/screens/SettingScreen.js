import { View, Text, TouchableOpacity, Image, Platform, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftCircleIcon, MinusIcon, PlusIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { themeColors } from '../theme';
import {Restart} from 'fiction-expo-restart';

const ios = Platform.OS == 'ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {

  const navigation = useNavigation();
  const [selectedSet, setSelectedSet] = useState(null);
  const {t, i18n} = useTranslation(); 

  const checkLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('selectedLanguage')
      if (storedLanguage) {
        setSelectedSet(storedLanguage);

        if(storedLanguage == 2) {
        i18n.changeLanguage("en");
        }
        if(storedLanguage == 1) {
          i18n.changeLanguage("ger");
          }
        if(storedLanguage == 3) {
          i18n.changeLanguage("es");
        }
        if(storedLanguage == 4) {
          i18n.changeLanguage("fr");
        }
      } else {
        const defaultLanguage = 'en';
        setSelectedSet(defaultLanguage);
        i18n.changeLanguage("en");
        await AsyncStorage.setItem('selectedLanguage', defaultLanguage);
      }
    } catch (error) {
      i18n.changeLanguage("en");
      console.error('Error checking language: ', error);
    }
  };

  const optionSets = [
    {
      id: '1',
      title: t('settings.german'),
      icon: require('../assets/icons/ger.png'),
      language: 'ger',
    },
    {
      id: '2',
      title:  t('settings.english'),
      icon: require('../assets/icons/usa.png'),
      language: 'en',
    },
    {
      id: '3',
      title: t('settings.spanish'),
      icon: require('../assets/icons/spa.png'),
      language: 'es',
    },
  ];
  
  const handleOptionSetSelect = async (optionSet) => {
    setSelectedSet(optionSet.id);
    await AsyncStorage.setItem('selectedLanguage', optionSet.id);
    await i18n.changeLanguage(optionSet.language);
    Restart();
  };
  
  useEffect(() => {
    checkLanguage();
  }, []);


  return (
    <View className="flex-1" style={{
      backgroundColor: "#F9F9F9",
     }} >
      <StatusBar style="light"/>
      <SafeAreaView className="space-y-3 flex-1">
        <View className="mx-4 flex-row justify-between items-center">
          <TouchableOpacity className=" rounded-full " onPress={()=> navigation.goBack()}>
            <ArrowLeftCircleIcon  style={{
            shadowColor: themeColors.bgDark,
            shadowRadius: 30,
            marginBottom: 20,
            shadowOffset: {width: 0, height: 30},
            shadowOpacity: 0.9,
          }} size="40" strokeWidth={1.2} color={themeColors.bgDark} />
          </TouchableOpacity>

        
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

        <View className="px-5 flex-row justify-between items-center">
        <Text style={{ color: themeColors.text, marginBottom: -15 }} className="text-3xl font-semibold">
        {t('settings.title')}
        </Text>
  </View>
</View>
        
<View className="px-5 space-y-2">
    <Text style={{color: "rgba(0,0,0,0.5)"}} className="text-lg font-bold">{t('settings.lang')}</Text>
    <View className="flex-row justify-between">
         
  <FlatList
  showsHorizontalScrollIndicator={false}
  data={optionSets}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={{ marginLeft: 0 }}
  renderItem={({ item }) => (
    <TouchableOpacity
      onPress={() => handleOptionSetSelect(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: selectedSet === item.id ? themeColors.bgLight : 'rgba(0,0,0,0.07)',
        padding: 10,
        margin: 2,
        borderRadius: 10,
      }}>

      <Image
        source={item.icon} 
        style={{
          width: 20,
          height: 20,
          marginRight: 10, 
         
        }}/>

<View style={{ flex: 1 }}>
  <Text
    style={{
      fontSize: 20,
      color: selectedSet === item.id ? 'white' : 'gray',
    }}
  >
    {item.title}
  </Text>
</View>
    </TouchableOpacity>
    )}/>

      </View>
      </View>
      </SafeAreaView>

    </View>
  )
}