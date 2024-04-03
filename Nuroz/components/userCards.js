import { View, Text, Image, TouchableOpacity, TextInput, Easing, Dimensions, Platform } from 'react-native'
import React, { useState, useEffect} from 'react'
import { themeColors } from '../theme'
import { useNavigation } from '@react-navigation/native'
import { PaperAirplaneIcon, ArrowPathIcon } from 'react-native-heroicons/solid';
import { XMarkIcon } from 'react-native-heroicons/outline';
import nacl from 'tweet-nacl-react-native-expo';
import { Keypair } from "@solana/web3.js";
const {width, height} = Dimensions.get('window');
import LoadingImage from '../assets/images/Loading.gif';
const ios = Platform.OS == 'ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const WALLET_STORAGE_KEY = 'walletSecretKey';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';

async function fetchData(wallet) {
  if (wallet) {
  try {
    fetch('https://binaramics.com:5173/health');

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

const handleRemove = async (item, removeFromUserItems) => {
  removeFromUserItems(item.id);
    Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success
    );
}



export default function UserCard({item, removeFromUserItems}) {
  
  const {t} = useTranslation(); 

  
  const [loading, setLoading] = useState(false);
  const [autoText, setAutoText] = useState(false);

  const [cardInput, setCardInput] = useState("");

  
  const handleCardInput = (text) => {
    setCardInput(text);
  };

  useEffect(() => {
  
    
    const fetchAutoText = async () => {
      const mode2 = await getAutoText();
      setAutoText(mode2);
    };
    fetchAutoText();
  }, []);

  const markMessageAsSent = async (recipientWallet) => {
    try {
      const today = new Date().toISOString().split('T')[0]; 
      let sentMessages = await AsyncStorage.getItem('sentMessages');
      sentMessages = sentMessages ? JSON.parse(sentMessages) : {};
  
      if (!sentMessages[today]) {
        sentMessages[today] = [];
      }
  
      sentMessages[today].push(recipientWallet);
  
      await AsyncStorage.setItem('sentMessages', JSON.stringify(sentMessages));
    } catch (error) {
      console.error('Error marking message as sent: ', error);
    }
  };

  const getAutoText = async () => {
    try {
      const modeString = await AsyncStorage.getItem("autoText");
      if (modeString !== null) {
       
        const mode = JSON.parse(modeString);
        return true;
      }
      return true; 
    } catch (error) {
      console.error("Error retrieving auto text mode from AsyncStorage:", error);
      return true; 
    }
  };


  const handleSend = async (item, message, removeFromUserItems) => {
    try {
      const secretKeyString = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      setLoading(true);
      if (secretKeyString) {
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));

        const wallet = Keypair.fromSecretKey(secretKey);

        fetch('https://binaramics.com:5173/health');

        let sig = await fetchData(wallet);
        if(sig === null || sig === "") {
          sig = await fetchData(wallet);
        }

        /*const url = 'https://community-purgomalum.p.rapidapi.com/json?text=';
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': 'dd85956bd8mshf589c6050696cfcp18acc0jsn653f330b336d',
            'X-RapidAPI-Host': 'community-purgomalum.p.rapidapi.com'
          }
        };
        
        try {
          const response = await fetch(url, options);
          const result = await response.text();
          console.log(result);
        } catch (error) {
          console.error(error);
        }*/

        if(cardInput === null) {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          setLoading(false);
          Toast.show({
            type: 'error',
            text1: t('homepage.error'),
            text2: t('homepage.writeamessage'),
        });
          return null;
        }

       let messageNew = "";
       if (!autoText) {
         messageNew = item.message;
       } else {
         messageNew = item.message;
       }

       if(messageNew === "" || messageNew === null) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: t('homepage.error'),
          text2: t('homepage.writeamessage'),
        });
        return null;
       }
       const response = await fetch('https://binaramics.com:5173/sendMessage/', {
         method: 'POST',
         headers: {
           "Content-Type": `application/json`,
           'Connection': 'keep-alive',
           'Accept-Encoding': '*/*',
           Accept: 'application/json',
         },
         body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, receiver: item.wallet, message: messageNew, mId: item.mId }),
        });
       

        if (!response.ok) {
          setLoading(false);
          console.log(`HTTP error! Status: ${response.json} `);
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

        const data = await response.json();
        if (data && data.message === "Success") {
          setTimeout(() => {
            removeFromUserItems(item.id);
            setLoading(false);
          }, 300);
          await markMessageAsSent(item.wallet);
         
        

          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          Toast.show({
            type: 'success',
            text1: t('homepage.success'),
            text2: t('homepage.messagesent')
          });
        
        
        } else {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          setLoading(false);
          Toast.show({
            type: 'error',
            text1: t('homepage.error'),
            text2: t('homepage.networkerror'),
        });
        }
      }
      
    } catch (error) {
      console.log(error);
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: t('homepage.error'),
        text2: t('homepage.networkerror'),
    });
      return null;
      }
  }

  if (!item) {
    return null; 
  }

  if (item == null) {
    return null; 
  }

  let cardHeightRatio, imageHeightRatio, cardWidthRatio, imageWidthRatio;
  
  if (width < 376 && !(height > 667)) {
    // Smaller screens like iPhone SE
    cardHeightRatio = ios ? 0.57 : 0.57;
    imageHeightRatio = ios ? 0.15 : 0.16;
    cardWidthRatio = 0.67;
    imageWidthRatio = ios ? 0.275 : 0.28;
  } else {
    // Larger screens
    cardHeightRatio = ios ? height * 0.00061 : 0.57; 
    imageHeightRatio = ios ? 0.155 : 0.16; 
    cardWidthRatio = 0.7; 
    imageWidthRatio = ios ? 0.34 : 0.28;
  }

  if (width >= 410 && width < 430) {
    cardHeightRatio = ios ? height * 0.000585 : 0.57;
      imageHeightRatio = ios ? 0.155 : 0.16;
      cardWidthRatio = 0.68;
      imageWidthRatio = ios ? 0.34 : 0.28;
    }

  if (width == 430) {
    cardHeightRatio = ios ? height * 0.00054 : 0.57;
      imageHeightRatio = ios ? 0.155 : 0.16;
      cardWidthRatio = 0.68;
      imageWidthRatio = ios ? 0.34 : 0.28;
    }

  if (width >= 700 && width <= 800) {
    cardHeightRatio = ios ? height * 0.00055 : 0.57;
    imageHeightRatio = ios ? 0.169 : 0.16;
    cardWidthRatio = 0.66;
    imageWidthRatio = ios ? 0.25 : 0.28;
  }


  if (width >= 820 && width <= 999) {
    
    cardHeightRatio = ios ? 0.6 : 0.57;
    imageHeightRatio = ios ? 0.2 : 0.16;
    cardWidthRatio = 0.5;
    imageWidthRatio = ios ? 0.3 : 0.28;
  }

  if (width >= 1000) {
    cardHeightRatio = ios ? 0.6 : 0.57;
    imageHeightRatio = ios ? 0.2 : 0.16;
    cardWidthRatio = 0.5;
    imageWidthRatio = ios ? 0.28 : 0.28;
  }

  if (width == 375 && height == 812) {
    cardHeightRatio = ios ? height * 0.00064 : 0.57; 
    imageHeightRatio = ios ? 0.16 : 0.16; 
    cardWidthRatio = 0.7; 
    imageWidthRatio = ios ? 0.32 : 0.28;
  }


  const shadowOffsetRatio = { width: 0, height: ios ? 0.03 * height : 40 };
  const cardHeight = ios ? height * cardHeightRatio: height * cardHeightRatio * 0.98;
  const cardWidth = width * cardWidthRatio;
  const imageHeight = ios ? height * imageHeightRatio: 130;
  const imageWidth =ios ? width * imageWidthRatio: 130;

  function getRandomSuccessMessage() {
    const rndInt = Math.floor(Math.random() * 3) + 1

    let image;

      if (rndInt == 1) {
        image = require('../assets/images/success1.gif');
        return image;
      }

      if (rndInt == 2) {
        image = require('../assets/images/success2.gif');
        return image;
      } 

      if (rndInt == 3) {
        image = require('../assets/images/success2.gif');
        return image;
      } 

      
  }

  return (

    <View
    style={{
      borderRadius: 40,
      backgroundColor: themeColors.card,
      height: cardHeight,
      width: cardWidth,
    }}
  >
    <View
      style={{
        shadowColor: 'black',
        shadowRadius: 30,
        shadowOffset: shadowOffsetRatio,
        shadowOpacity: 0.45,
        marginTop: ios ? -cardHeight * 0.22: 25,
      }}
      className="flex-row justify-center">
     
     {!loading ? (
            <View>
             <Image
        source={item.image}
        className="h-40 w-40"
        style={{
          height: imageHeight,
          marginTop: ios ? 0.15 * height : 0,
          width: imageWidth,
        }}
      />
    
            </View>
          ) : (
            <View style={{
              marginTop: 10,
           
            }}>
              <Image
               className="h-40 w-40"
                source={getRandomSuccessMessage()}
                style={{
                  height: imageHeight,
                  marginTop: ios ? 0.11 * height : 0,
                  width: imageWidth + 10
                }}
              />
            </View>
            
          )}  

        </View>
          <View className={`px-5 flex-1 justify-between ${ios? 'mt-5': ''}`}>
            <View className="space-y-3 mt-1">
              <Text style={{marginLeft: 15}} className="text-3xl text-white font-semibold z-10">
                {item.name}
              </Text>
              <View style={{backgroundColor: 'rgba(255,255,255,0.2)'}} className="flex-row items-center rounded-3xl p-3 px-3 space-x-1 w-30">
            {autoText ? (
            <View>
            <TextInput
              placeholder={item.message}
              placeholderTextColor='white'
              maxLength={50}
              multiline={true}
              numberOfLines={4}
              style={{
                borderColor: 'transparent',
                color: 'white',
                borderWidth: 1,
                padding: 10,
                fontSize: 16,
                width: 200,
                borderRadius: 10,
              }}
              value={cardInput ? cardInput.propertyToDisplay : ''}
            
            />
              </View>
            ) : (
              <View>
              <TextInput
              placeholder={t('homepage.cardInput')}
              placeholderTextColor='white'
              maxLength={50}
              multiline={true}
              numberOfLines={4}
              style={{
                borderColor: 'transparent',
                color: 'white',
                borderWidth: 1,
                padding: 10,
                fontSize: 16,
                width: 200,
                borderRadius: 10,
              }}
              value={cardInput ? cardInput.propertyToDisplay : ''}
             
            />
            </View>
            )}
              </View>
              <View className="flex-row space-x-1 z-10 mb-6">
                <Text className="text-base text-white font-semibold opacity-60">
                </Text>      
              </View>
            </View>
          
            <View style={{
              backgroundColor: ios? themeColors.bgDark: 'transparent',
              shadowColor: themeColors.bgDark,
              shadowRadius: 25,
              shadowOffset: {width: 0, height: 40},
              shadowOpacity: 0.8,
            }} className="flex-row justify-between items-center mb-5">
             
              <TouchableOpacity 
               onPress={()=> handleRemove(item, removeFromUserItems)}
              style={{
                shadowColor: 'black',
                shadowRadius: 40,
                shadowOffset: {width: -20, height: 0},
                marginTop: -30,
                shadowOpacity: 1,
              }} className="p-3 bg-white rounded-full">
                <XMarkIcon size="25" strokeWidth={2} color={themeColors.bgLight}/>
              </TouchableOpacity>

              {!loading ? (
            <View>
            <TouchableOpacity
              onPress={()=> handleSend(item, (item.messageId), removeFromUserItems)}
              style={{
                shadowColor: 'black',
                shadowRadius: 40,
                shadowOffset: {width: -20, height: 0},
                marginTop: -40,
                shadowOpacity: 1,
              }} className="p-3 bg-white rounded-full">
                <PaperAirplaneIcon size="25" strokeWidth={2} color={themeColors.bgLight} />
              </TouchableOpacity>
              
            </View>
          ) : (
            <View style={{
              width: 45, 
              height: 45,
              padding: 25, 
              borderRadius: 47.5,
              backgroundColor: 'white',
              shadowColor: 'black',
              shadowRadius: 40,
              shadowOpacity: 1,
              marginTop: -40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Image
                source={require("../assets/images/Loading.gif")}
                style={{
                  width: 30, 
                  height: 30,
                }}
              />
            </View>
            
          )}  
          </View>
        </View>
      </View>
  )
}