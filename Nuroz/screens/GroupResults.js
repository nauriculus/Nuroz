
import 'react-native-get-random-values';
import { View, Text, TouchableOpacity, Image, Dimensions, Platform, FlatList } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'; // Import the necessary hook
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftCircleIcon, MinusIcon, PlusIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { themeColors } from '../theme';
import Chart from '../screens/Chart';
import { messagesToSend } from '../constants';
import nacl from 'tweet-nacl-react-native-expo';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { InformationCircleIcon } from 'react-native-heroicons/solid';
import { useTranslation } from 'react-i18next';
import { BarChart } from 'react-native-chart-kit'

const ios = Platform.OS == 'ios';

export default function FavouriteScreen(props) {

  const {t} = useTranslation(); 

  const groupAdmin =  props.route.params.params.route.params.admins;
  
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

  const getGroupData = async () => {
    try {
      const secretKeyString = await AsyncStorage.getItem("walletSecretKey");
      if (secretKeyString) {
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));
  
        const wallet = Keypair.fromSecretKey(secretKey);
        console.log(wallet.publicKey);
        setUserWallet(wallet.publicKey);
      
      
        const groupId = props.route.params.params.route.params.id;
        console.log(groupId);
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
         
        const response = await fetch('https://binaramics.com:5173/getResultsByGroupId/', {
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
         
          if(data.results) {
          console.log("found valid response");
          setResults(data);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getGroupData();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

  fetchData();
}, []);


  const navigation = useNavigation();
  const [results, setResults] = useState(null);
  const [selectedSetbackend, setSelectedSetbackend] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userWallet, setUserWallet] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await getGroupData();
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData(); 
      return () => {
      };
    }, [navigation])
  );
  
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
  
      {userWallet == groupAdmin ? (
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 0 }}>
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
  
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 100 }}>
              <Text
                style={{
                  color: themeColors.text,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginRight: 90,
                }}
              >
                {t('groups.groupResults')}
              </Text>
            </View>
          </View>
  
          <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 0, marginTop: 80 }}></View>
  
          <View>
            {results ? (
              <Chart results={results} />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 0, marginTop: 80 }}>
                <Image
                  source={require('../assets/images/Load.gif')}
                  style={{
                    height: 100,
                    width: 100,
                  }}
                />
                <Text style={{ fontSize: 15 }} className="text-center text-base font-semibold">
                  {t('homepage.loading')}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 0, marginTop: 200 }}>
                <Image
                  source={require('../assets/images/main.gif')}
                  style={{
                    height: 200,
                    width: 200,
                  }}
                />

                <Text style={{ fontSize: 15, flexDirection: 'row', padding: 20 }} className="text-center text-base font-semibold">
                  {t('groups.noaccess')}
                </Text>

        </View>
      )}
    </View>
  );
}