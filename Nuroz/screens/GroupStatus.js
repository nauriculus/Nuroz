
import 'react-native-get-random-values';
import { View, Text, TouchableOpacity, Image, Dimensions, Platform, FlatList } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftCircleIcon, MinusIcon, PlusIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { themeColors } from '../theme';
import { messagesToSend } from '../constants';
import nacl from 'tweet-nacl-react-native-expo';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { InformationCircleIcon } from 'react-native-heroicons/solid';
import { useTranslation } from 'react-i18next';

const ios = Platform.OS == 'ios';

export default function FavouriteScreen(props) {
  let groupId = props.route.params.groupId;
  const jsonCategories = (props.route.params.jsonCategories);
  const parsedCategories = JSON.parse(jsonCategories);

  const optionSets2 = Object.keys(parsedCategories).map((category, index) => {
    const options = Object.entries(parsedCategories[category]).map(([id, label]) => ({
      id,
      label,
    }));

    return {
      id: (index + 1).toString(),
      title: category,
      options,
    };
  });
  
  const {t} = useTranslation(); 

  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: 'green',
          backgroundColor: 'white',
          width: 340,
          height: 75,
          alignItems: 'center',  // Center horizontally
          justifyContent: 'center',  // Center vertically
        }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        text1Style={{
          fontSize: 25,
          fontWeight: '500',
          textAlign: 'center',  // Center text horizontally
        }}
        text2Style={{
          fontSize: 10,
          fontWeight: '500',
          textAlign: 'center',  // Center text horizontally
        }}
      />
    ),
  
    error: (props) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 17,
          textAlign: 'center',  // Center text horizontally
        }}
        text2Style={{
          fontSize: 15,
          textAlign: 'center',  // Center text horizontally
        }}
      />
    ),
  };

  const saveArrayToStorage = async (key, array) => {
    try {
      const arrayString = JSON.stringify(array);
      await AsyncStorage.setItem(key, arrayString);
    } catch (error) {
      console.error('Error saving array to AsyncStorage:', error);
    }
  };
  
  // Read an array from AsyncStorage
  const readArrayFromStorage = async (key) => {
    try {
      const arrayString = await AsyncStorage.getItem(key);
      if (arrayString) {
        return JSON.parse(arrayString);
      }
      return null;
    } catch (error) {
      console.error('Error reading array from AsyncStorage:', error);
      return null;
    }
  };
  

  const changeStatus = async (selectedOption, groupId) => {
    try {
      const secretKeyString = await AsyncStorage.getItem("walletSecretKey");
      if (secretKeyString) {
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));
  
        const wallet = Keypair.fromSecretKey(secretKey);
        const oldSavedTimestamps = await readArrayFromStorage(groupId);
        const currentDate = Date.now();
        
        if (oldSavedTimestamps === null) {
          await saveArrayToStorage(groupId, [currentDate]);
        } else {
          const lastDayTimestamp = new Date(oldSavedTimestamps[oldSavedTimestamps.length - 1]);
          lastDayTimestamp.setHours(0, 0, 0, 0); // Reset hours, minutes, seconds, and milliseconds
          const lastDayTimestampMillis = lastDayTimestamp.getTime();
        
          // Compare the timestamps
          if (currentDate - lastDayTimestampMillis < 24 * 60 * 60 * 1000) {
            // User has already voted today
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            await Toast.show({
              type: 'error',
              text1: t('homepage.error'),
              text2: t('groups.votedalready'),
            });
            return null;
          }
        }
        
        // Save the current timestamp to the storage (only if the user hasn't already voted today)
        await saveArrayToStorage(groupId, [...oldSavedTimestamps || [], currentDate]);
        console.log("User can vote today.");
        

        
       

        const optionIndex = parseInt(selectedOption);

        const option = (selectedSetbackend.options[optionIndex - 1].label);
  
        let sig = await fetchData(wallet);
        if(sig === null || sig === "") {
          sig = await fetchData(wallet);
        }
  
        try {
         
         
          console.log("groupId: " + groupId);
     
          console.log("title: " + selectedSetbackend.title);
          console.log("option: " + option);

        const response = await fetch('https://binaramics.com:5173/addStatsToGroup/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
              'Accept-Encoding': '*/*',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, groupId: groupId, category: selectedSetbackend.title, answerData: option}),
          });
        
          if (!response.ok) {
            console.log(`HTTP error! Status: ${response.status}`);
            return null;
          }
        
          const data = await response.json();
          console.log(data);

          if (data && data.success) {
            return data.success;
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      }
      
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  async function fetchData(wallet) {
    if (wallet) {
    try {
  
      try {
        fetch('https://binaramics.com:5173/health');
      }
      catch (error) {
      
      }
  
      const response = await fetch('https://binaramics.com:5173/authNuroz/', {
      method: 'POST',
      headers: {
        "Content-Type": `multipart/form-data`,
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'PostmanRuntime/7.34.0',
        Accept: 'application/json',
      },
      body: JSON.stringify({ wallet: wallet.publicKey }),
    })
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
  
      const data = await response.json();
  
      const message = `Sign this message for authenticating with your wallet. Nonce: ${data.nonce}`;
      const encodedMessage = new Uint8Array(message.length);
      for (let i = 0; i < message.length; i++) {
        encodedMessage[i] = message.charCodeAt(i);
      }
  
      const signature = nacl.sign.detached(encodedMessage, wallet.secretKey);
   
      const signatureBase64 = nacl.util.encodeBase64(signature);
      return signatureBase64;
      }catch(e) {
        console.log("Network error: "+ e);
      }
  
     
    }
  }

  const item = props.route.params;
  
  const navigation = useNavigation();
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedSetbackend, setSelectedSetbackend] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  async function changeStatusAction() {
    if (selectedSet !== null && selectedOption !== null) {
      if (item.id === 2) {


       const success = await changeStatus(selectedOption, groupId);
        if(success !== null) {
         await new Promise(resolve => setTimeout(resolve, 1000));

         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
         navigation.goBack();
  
         Toast.show({
            type: 'success',
            text1: t('homepage.success'),
            text2: t('homepage.statuschanged'),
          });
        }
      }
  
      if (item.id === 1) {
        const success = await changeStatus(selectedOption, groupId);
        if(success !== null) {
         await new Promise(resolve => setTimeout(resolve, 1000));

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  

        navigation.goBack();
  
        Toast.show({
            type: 'success',
            text1: t('homepage.success'),
            text2: t('homepage.statuschanged'),
          });
        }
      }
    } else {
      setTimeout(() => {
        Toast.show({
          type: 'error',
          text1: t('homepage.error'),
          text2: t('homepage.nooptionselected'),
        });
      }, 400); 
      return null;
    }
  }
  
  const handleOptionSetSelect = (optionSet) => {
    setSelectedSet(optionSet.id);
    setSelectedSetbackend(optionSet);
    console.log(optionSet);
    setSelectedOption(null); 
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option.id);
  };

  return (
    <View style={{
      backgroundColor: "#F9F9F9",
    }}
    className="flex-1" >
      <StatusBar style="light"/>
      
      
      <SafeAreaView className="space-y-2 flex-1">
        <View className="mx-4 flex-row justify-between items-center">
          <TouchableOpacity className=" rounded-full " onPress={()=> navigation.goBack()}>
            <ArrowLeftCircleIcon  style={{
            shadowColor: themeColors.bgDark,
            shadowRadius: 30,
            marginBottom: 40,
            shadowOffset: {width: 0, height: 30},
            shadowOpacity: 0.9,
          }} size="40" strokeWidth={1.2} color={themeColors.bgDark} />
          </TouchableOpacity>

        
        </View>

      
        

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

        <View className="px-5 flex-row justify-between items-center">
    <Text style={{ color: themeColors.text }} className="text-3xl font-semibold">
    {t('status.title')}
    </Text>
  </View>

  
</View>
        
<View className="px-5 space-y-2">
<Text style={{color:"rgba(0,0,0,0.5)"}} className="text-lg font-bold"> {t('status.subtitle')}</Text>
    <View className="flex-row justify-between">
         
    <FlatList
  horizontal
  showsHorizontalScrollIndicator={false}
  data={optionSets2}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={{ marginLeft: 0 }}
  renderItem={({ item }) => (
    <TouchableOpacity
      onPress={() => handleOptionSetSelect(item)}
      style={{
        backgroundColor: selectedSet === item.id ? themeColors.bgLight : 'rgba(0,0,0,0.07)',
      }}
      className="p-3 px-6 mr-2 rounded-full"
    >
      <Text style={{ fontSize: 20 }} className={selectedSet === item.id ? 'text-white' : 'text-gray-700'}>
        {item.title}
      </Text>
      </TouchableOpacity>
      )}
      />
      </View>
      </View>

      {selectedSet && (
  <View className="px-5 space-y-1">
    <View style={{ marginBottom: 10}} className="text-lg font-bold"></View>
    {optionSets2
      .find((optionSet) => optionSet.id === selectedSet)
      .options.map((option) => (
        <TouchableOpacity
          key={option.id} 
          onPress={() => handleOptionSelect(option)}
          style={{
            backgroundColor: selectedOption === option.id ? themeColors.bgLight : 'rgba(0,0,0,0.07)',
            margin: 5,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 16 }} className={selectedOption === option.id ? "text-white" : "text-gray-700"}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
  </View>
)}
    
        

        
      </SafeAreaView>

      
      <View className={`space-y-3 ${ios? 'mb-6': 'mb-3'}`}>
         
         
          <View className="flex-row justify-between px-4">
            
            <TouchableOpacity 
              style={{backgroundColor: themeColors.bgDark}} 
              onPress={() => changeStatusAction({item})}
              className="p-4 rounded-full flex-1">
                
              <Text className="text-center text-white text-base font-semibold">{t('status.buttonsubmit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Toast config={toastConfig} />
        
      
    </View>
  )
}