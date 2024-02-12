
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
          alignItems: 'center',  
          justifyContent: 'center',  
        }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        text1Style={{
          fontSize: 25,
          fontWeight: '500',
          textAlign: 'center',  
        }}
        text2Style={{
          fontSize: 10,
          fontWeight: '500',
          textAlign: 'center', 
        }}
      />
    ),
  
    error: (props) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 17,
          textAlign: 'center', 
        }}
        text2Style={{
          fontSize: 15,
          textAlign: 'center', 
        }}
      />
    ),
  };

  const changeStatus = async (status) => {
    try {
      const secretKeyString = await AsyncStorage.getItem("walletSecretKey");
      if (secretKeyString) {
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));
  
        const wallet = Keypair.fromSecretKey(secretKey);
  
        console.log("wallet loaded: " + wallet);
        
        try {
          fetch('https://binaramics.com:5173/health');
        }
        catch (error) {
        
        }
  
        let sig = await fetchData(wallet);
        if(sig === null || sig === "") {
          sig = await fetchData(wallet);
        }
  
        try {
          const response = await fetch('https://binaramics.com:5173/changeStatus/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
              'Accept-Encoding': '*/*',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, status: status, id: selectedOption}),
          });
        
          if (!response.ok) {
            console.log(`HTTP error! Status: ${response.status}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
              type: 'error',
              text1: t('homepage.error'),
              text2: t('homepage.networkerror'),
          });
            return null;
          }
        
          const data = await response.json();
        
          if (data && data.success) {
            return data.success;
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
              type: 'error',
              text1: t('homepage.error'),
              text2: t('homepage.networkerror'),
          });
            return null;
          }
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: t('homepage.error'),
            text2: t('homepage.networkerror'),
        });
          return null;
        }
      }
      
    } catch (error) {
      console.log(error);
       Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      Toast.show({
        type: 'error',
        text1: t('homepage.error'),
        text2: t('homepage.networkerror'),
    });
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
  const [selectedSet, setSelectedSet] = useState("2");
  const [selectedOption, setSelectedOption] = useState(null);

  const optionSets = [
      {
        id: '1',
        title: t('status.category1'),
        options: [
          { id: '1', label: t('status.option1') },
          { id: '2', label: t('status.option2') },
        ],
      },
      {
        id: '2',
        title: t('status.category2'),
        options: [
          { id: '3', label: t('status.option3') },
          { id: '4', label: t('status.option4') },
          { id: '5', label: t('status.option5') },
          { id: '6', label: t('status.option6') },
        ],
      },
      {
        id: '3',
        title: t('status.category3'),
        options: [
          { id: '7', label: t('status.option7') },
          { id: '8', label: t('status.option8') },
          { id: '9', label: t('status.option9') },
        ],
      },
      {
        id: '4',
        title: t('status.category4'),
        options: [
          { id: '10', label: t('status.option10') },
          { id: '11', label: t('status.option11') },
          { id: '12', label: t('status.option12') },
        ],
      },
      {
        id: '5',
        title: t('status.category5'),
        options: [
          { id: '13', label: t('status.option13') },
          { id: '14', label: t('status.option14') },
          { id: '15', label: t('status.option15') },
        ],
      },
      {
        id: '6',
        title: t('status.category6'),
        options: [
          { id: '16', label: t('status.option16') },
          { id: '17', label: t('status.option17') },
          { id: '18', label: t('status.option18') },
        ],
      },
    ];

  function changeStatusAction() {
    if (selectedSet !== null && selectedOption !== null) {
      if (item.id === 2) {
        changeStatus("Neutral");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
        navigation.goBack();
  
        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: t('homepage.success'),
            text2: t('homepage.statuschanged'),
          });
        }, 1000); 
      }
  
      if (item.id === 1) {
        changeStatus("Sad");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
        navigation.goBack();
  
        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: t('homepage.success'),
            text2: t('homepage.statuschanged'),
          });
        }, 1000); 
       
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
  data={optionSets}
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
    {optionSets
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