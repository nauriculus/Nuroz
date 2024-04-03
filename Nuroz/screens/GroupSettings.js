
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

  const leaveGroup = async () => {
    try {
      const secretKeyString = await AsyncStorage.getItem("walletSecretKey");
      if (secretKeyString) {
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));
  
        const wallet = Keypair.fromSecretKey(secretKey);

      
      
        const groupId = props.route.params.params.route.params.id;

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
         
         
          navigation.navigate('Home')

        const response = await fetch('https://binaramics.com:5173/leaveGroup/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
              'Accept-Encoding': '*/*',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, groupId: groupId}),
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
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedSetbackend, setSelectedSetbackend] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  async function changeStatusAction() {
    if (selectedSet !== null && selectedOption !== null) {
      if (item.id === 2) {


         changeStatus("Neutral", selectedSet, selectedOption, groupId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
        navigation.goBack();
  
        Toast.show({
            type: 'success',
            text1: t('homepage.success'),
            text2: t('homepage.statuschanged'),
          });
        
      }
  
      if (item.id === 1) {
         changeStatus("Sad", selectedSet, selectedOption, groupId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
        navigation.goBack();
  
        
          Toast.show({
            type: 'success',
            text1: t('homepage.success'),
            text2: t('homepage.statuschanged'),
          });
       
       
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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="light" />
    
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon
              style={{
                shadowColor: themeColors.bgDark,
                shadowRadius: 30,
                shadowOffset: { width: 0, height: 30 },
                shadowOpacity: 0.9,
              }}
              size={40}
              strokeWidth={1.2}
              color={themeColors.bgDark}
            />
          </TouchableOpacity>
     
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 0, marginTop: 80 }}>
         
        </View>
        </View >
    
        <Text style={{ color: themeColors.text, marginBottom: -15 }} className="text-3xl font-semibold">
        {t('settings.title')}
        </Text>

        <Text style={{marginTop: 20,color: "rgba(0,0,0,0.5)"}} className="text-lg font-bold">{t('groups.leavegrouptitle')}</Text>
        <TouchableOpacity
        style={{
          backgroundColor: themeColors.bgDark,
          padding: 10,
          marginTop: 20,
          borderRadius: 10,
          alignItems: 'center',
         
        }}
        onPress={() => leaveGroup()}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}> {t('groups.leavegroup')}</Text>
      </TouchableOpacity>
     
      </SafeAreaView>
    </View>
      )
    }