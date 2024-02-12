import { View, Text, TouchableOpacity,Image,Clipboard, Dimensions, TextInput, Platform, Animated ,FlatList,StyleSheet, Linking  } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftCircleIcon, MinusIcon, XMarkIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { PlusSmallIcon } from 'react-native-heroicons/solid';
import { InformationCircleIcon } from 'react-native-heroicons/solid';
import { themeColors } from '../theme';
import Modal from 'react-native-modal';
import { categories } from '../constants/index';
import { useTranslation } from 'react-i18next';
import { Keypair} from "@solana/web3.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import nacl from 'tweet-nacl-react-native-expo';

import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
const {width, height} = Dimensions.get('window');
const ios = Platform.OS == 'ios';

export default function Group(props) {

  const groupId = props.route.params.params.route.params.id;
  const jsonCategories = props.route.params.params.route.params.groupSettings;

  const [popupInfoVisible, setPopupInfoVisible] = useState(false);

  const handlePopupOpen = () => {
    setPopupInfoVisible(true);
  };

  const [activeCategory, setActiveCategory] = useState(1);


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

  const joinGroup = async (code) => {
    try {

      if(code === "" || code === null) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: 'error',
          text1: t('homepage.error'),
          text2: t('groups.invaildcode'),
        });
        return null;
      }
      const secretKeyString = await AsyncStorage.getItem("walletSecretKey");
      if (secretKeyString) {
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));
  
        const wallet = Keypair.fromSecretKey(secretKey);
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
          const response = await fetch('https://binaramics.com:5173/joinGroup/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
              'Accept-Encoding': '*/*',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, code: code.toString()}),
          });
        
          const data = await response.json();

          switch (response.status) {
            case 200:
              
              if (data && data.success) {
                console.log("Status was updated");
                return data.success;
              } else {
                console.log("Invalid response format");
              }
              break;
        
            case 400:
        
            console.log(data.error);
              if (data.error === 'User is already a member of the group') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Toast.show({
                  type: 'error',
                  text1: t('homepage.error'),
                  text2: t('groups.alreadyingroup'),
                });
                return null;
              } 
               if (data.error === 'User is already a member of the group') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Toast.show({
                  type: 'error',
                  text1: t('homepage.error'),
                  text2: t('groups.alreadyingroup'),
                });
                return null;
              } 
               if (data.error === 'No user found with the given wallet') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: t('homepage.error'),
                text2: t('groups.invaildcode'),
              });
              return null;
              } 
               if (data.error === 'No group found with the given groupId') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: t('homepage.error'),
                text2: t('groups.invaildcode'),
              });
              return null;
               
            } 
             if (data.error === 'Invalid or expired invite code') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: t('homepage.error'),
                text2: t('groups.invaildcode'),
              });
              return null;
            }
            break;

            default:
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: t('homepage.error'),
                text2: t('groups.invaildcode'),
              });
              console.log("Network error or unexpected response");
              return null;
              break;
          }
        
         
        } catch (error) {
          console.error("An error occurred:", error);
          return null;
        }
      }
      
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  const getUserGroups = async () => {
    try {
      const secretKeyString = await AsyncStorage.getItem("walletSecretKey");
      if (secretKeyString) {
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));
  
        const wallet = Keypair.fromSecretKey(secretKey);
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
          const response = await fetch('https://binaramics.com:5173/getUserGroups/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
              'Accept-Encoding': '*/*',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ wallet: wallet.publicKey, signature: sig}),
          });
        
          if (!response.ok) {
            return null;
          }
        
          const data = await response.json();
          console.log(wallet.publicKey);

          switch (response.status) {
            case 200:
              if (data && data.groups) {
                if (data.groups.length > 0 && data.groups[0] !== 'No groups') {
                  const validGroupNames = data.groups;
              
                  if (validGroupNames.length > 0) {
                      const allGroupNames = validGroupNames.join(', ');
                      console.log("User has group names:", allGroupNames);
              
                      const localOptionSets = [];
                      for (const groupName of validGroupNames) {
                          const response = await fetch('https://binaramics.com:5173/getGroupInfo/', {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json',
                                  'Connection': 'keep-alive',
                                  'Accept-Encoding': '*/*',
                                  'Accept': 'application/json',
                              },
                              body: JSON.stringify({ groupId: groupName }),
                          });
              
                          if (!response.ok) {
                              return null;
                          }
              
                          const groupInfoResponse = await response.json();
              
                        
                          const groupInfo = groupInfoResponse.group[0];
                          console.log(groupInfo.GROUP_ADMIN)
                         
              
                       
                          localOptionSets.push({
                              id: groupInfo.groupId,
                              admins: groupInfo.GROUP_ADMIN,
                              title: groupInfo.groupName,
                              icon: groupInfo.groupImage,
                          });
                      }

                  
                    
                 
                    setOptionSets(localOptionSets);
                  } else {
                    console.log("User has no groups");
                  }
                } else {
                  console.log("User has no groups");
                }
              } else {
                console.log("Invalid response format");
              }
              break;
          
            case 400:
              console.log("No profile found");
              break;
          
            default:
            break;
          }
         
        } catch (error) {
          console.error("An error occurred:", error);
         
          return null;
        }
      }
      
    } catch (error) {
      return null;
    }
  }
  

  const saveArrayToStorage = async (key, array) => {
    try {
      const arrayString = JSON.stringify(array);
      await AsyncStorage.setItem(key, arrayString);
    } catch (error) {
      console.error('Error saving array to AsyncStorage:', error);
    }
  };
  
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

        let sig = await fetchData(wallet);
        if(sig === null || sig === "") {
          sig = await fetchData(wallet);
        }
  
        try {
         

        const response = await fetch('https://binaramics.com:5173/addStatsToGroup/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
              'Accept-Encoding': '*/*',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, groupId: groupId, category: "Wohlbefinden", answerData: selectedOption}),
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
            return null;
          }
        } catch (error) {
          return null;
        }
      }
      
    } catch (error) {
      return null;
    }
  }

  async function emojiSwitch(item) {
  
    if(item.id != 3) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('GroupStatus', {...item, jsonCategories, groupId})
    }
    else {
      const success = await changeStatus("Zufrieden", groupId);
   
      if(success != null) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Toast.show({
          type: 'success',
          text1: t('homepage.success'),
          text2: t('homepage.statuschanged')
        });
      }
      else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            await Toast.show({
              type: 'error',
              text1: t('homepage.error'),
              text2: t('groups.votedalready'),
            });
      }
    }
  }

  useEffect(() => {
    getUserGroups();
  }, []);

  const {t} = useTranslation(); 
  const navigation = useNavigation();
  const [selectedSet, setSelectedSet] = useState(null);
  const [isPopUpVisible, setPopUpVisibility] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [modalHeight, setModalHeight] = useState(null);

  const [optionSets, setOptionSets] = useState([]);

  const slideUpAnimation = useRef(new Animated.Value(0)).current;

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

  return (
    <View className="flex-1" >
      <StatusBar style="light"/>
      <SafeAreaView className="space-y-1 flex-1">  
        <View className="mx-6 flex-row justify-between items-center">
          <TouchableOpacity className=" rounded-full " onPress={()=> navigation.goBack()}>
            <ArrowLeftCircleIcon  style={{
            shadowColor: themeColors.bgDark,
            shadowRadius: 30,
            marginBottom: 40,
            shadowOffset: {width: 0, height: 30},
            shadowOpacity: 0.9,
          }} size="40" strokeWidth={1.2} color={themeColors.bgDark}/>
          </TouchableOpacity>


        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>  
        <View className="px-6 flex-row justify-between items-center">
        

    <Text style={{ color: themeColors.bgLight }} className="text-3xl font-semibold">
    {props.route.params.params.route.params.title}
    </Text>

    <Image
          source={{ uri: "" + props.route.params.params.route.params.icon }}
          style={{
            width: 30,
            height: 30,
            marginLeft:10, 
          }}/>
</View> 

</View>

        
    <View className="px-1 6flex-row justify-between items-center">


    <Text style={{ marginLeft: 0, marginTop: 50,color: themeColors.bgLight}} className="text-2xl font-bold">{t('homepage.feeling2')}
       </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{
            alignItems: 'center',
          }}
          className="overflow-visible"
          renderItem={({ item }) => (
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => emojiSwitch(item)}
                style={{
                  marginTop: 30,
                  backgroundColor: activeCategory ? themeColors.bgDark : 'rgba(0,0,0,0.07)',
                }}
                className="p-3.5 px-4 mr-3 rounded-full shadow"
              >
                <Text style={{ fontSize: 40 }} className="font-semibold ">
                  {item.title}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 15, marginTop: 10, marginRight: 12}} className="text-gray-500" >
              
                {item.title === '😢'
                  ? t('homepage.statussad')
                  : item.title === '😐'
                  ? t('homepage.statusneutral')
                  : item.title === '🙂'
                  ? t('homepage.statusgood')
                  : ''}
              </Text>
            </View>
          )}
        />
          
      </View>
      <View style={{  marginRight: 80,paddingVertical: 70, flexDirection: 'row', alignItems: 'left' }}>
      <InformationCircleIcon size={35} style={{marginLeft: 30,color: themeColors.bgDark}} className="text-white" />
     <Text style={{ fontWeight: 'bold', marginLeft: 8, textAlign: 'left', color: 'gray', fontSize: 13 }}>
      {t('groups.groupInfo')}
      </Text>
      </View>

      <Toast config={toastConfig} /> 
      </SafeAreaView>
    </View>
  )
}