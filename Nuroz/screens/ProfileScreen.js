import { View, Text, TouchableOpacity, Dimensions, Platform, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftCircleIcon, StarIcon, PlusIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { themeColors } from '../theme';
import {Restart} from 'fiction-expo-restart';
import { Keypair} from "@solana/web3.js";
import * as Haptics from 'expo-haptics';
import nacl from 'tweet-nacl-react-native-expo';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const {width, height} = Dimensions.get('window');

const ios = Platform.OS == 'ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function FavouriteScreen(props) {
  const navigation = useNavigation();
  const [selectedSet, setSelectedSet] = useState(null);
  const [name, setName] = useState('');

  const [karmaPoints, setKarmaPoints] = useState(0);

  const {t, i18n} = useTranslation(); 

  const [anonymousMode, setAnonymousMode] = useState(false);
  const [autoText, setAutoText] = useState(false);

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

  const deleteUser = async () => {
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
          const response = await fetch('https://binaramics.com:5173/deleteUser/', {
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
            console.log(`HTTP error! Status: ${response.status}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
              type: 'error',
              text1: t('homepage.error'),
              text2: t('homepage.networkerror'),
            });

            await AsyncStorage.removeItem("walletSecretKey");
            await AsyncStorage.removeItem("sentMessages");
            await AsyncStorage.removeItem("Username");
            await AsyncStorage.removeItem("hasLaunched");
            Restart();
            return null;
          }
        
          const data = await response.json();
          if (data && data.success) {
            
            await AsyncStorage.removeItem("walletSecretKey");
            await AsyncStorage.removeItem("sentMessages");
            await AsyncStorage.removeItem("Username");
            await AsyncStorage.removeItem("hasLaunched");
            Restart();
            
          } else {
            await AsyncStorage.removeItem("walletSecretKey");
            await AsyncStorage.removeItem("sentMessages");
            await AsyncStorage.removeItem("Username");
            await AsyncStorage.removeItem("hasLaunched");
            Restart();
            return null;
          }
        } catch (error) {
          console.error("An error occurred:", error);
          await AsyncStorage.removeItem("walletSecretKey");
          await AsyncStorage.removeItem("sentMessages");
          await AsyncStorage.removeItem("Username");
          await AsyncStorage.removeItem("hasLaunched");
          Restart();
          return null;
        }
      }
      
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  const getKarmaPoints = async () => {
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
          const response = await fetch('https://binaramics.com:5173/getKarmaPoints/', {
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
          if (data && data.points) {
            
            setKarmaPoints(data.points);
          } else {
            
            return null;
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

  const getUserName = async () => {
    try {
      const username = await AsyncStorage.getItem('Username');
      if (username !== null) {
        return(username);
      }
      else {
        return("Anonymous");
      }
     
    } catch (error) {
      console.error('Error checking username: ', error);
    }
  };

  useEffect(() => {
    getKarmaPoints();

 

    const fetchAnonymousMode = async () => {

      const mode2 = await getAutoText();
      setAutoText(mode2);

      const mode = await getAnonymousMode();
      setAnonymousMode(mode);
    };
    fetchAnonymousMode();
  }, []);
  
  const handleToggleSwitch = () => {
    const newMode = !anonymousMode;
    setAnonymousMode(newMode);
    saveAnonymousMode(newMode); 
  };

  const handleAutoSwitch = () => {
    const newMode = !autoText;
    setAutoText(newMode);
    saveAutoText(newMode); 
  };

  const getAutoText = async () => {
    try {
      const modeString = await AsyncStorage.getItem("autoText");
      if (modeString !== null) {
       
        const mode = JSON.parse(modeString);
        return mode;
      }
      return false; 
    } catch (error) {
      console.error("Error retrieving auto text mode from AsyncStorage:", error);
      return false; 
    }
  };

  const getAnonymousMode = async () => {
    try {
      const modeString = await AsyncStorage.getItem("anonymousMode");
      if (modeString !== null) {
       
        const mode = JSON.parse(modeString);
        return mode;
      }
      return false; 
    } catch (error) {
      console.error("Error retrieving anonymous mode from AsyncStorage:", error);
      return false; 
    }
  };
  
  
  const changeUserName = async (username) => {
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
          const response = await fetch('https://binaramics.com:5173/updateUsername/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Connection': 'keep-alive',
              'Accept-Encoding': '*/*',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, username: username}),
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
          console.error("An error occurred:", error);
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
        text2: t('homepage.networkerror')
      });
      return null;
    }
  }

  const saveAutoText = async (mode) => {
    try {

      
      const modeString = JSON.stringify(mode);
      await AsyncStorage.setItem("autoText", modeString);
    } catch (error) {
      console.error("Error saving autotext mode to AsyncStorage:", error);
    }
  };

  const saveAnonymousMode = async (mode) => {
    try {

      if(mode === true) {
      changeUserName("Anonymous")
      }
      else {
        const username = await getUserName();
        changeUserName(username);
      }
      const modeString = JSON.stringify(mode);
      await AsyncStorage.setItem("anonymousMode", modeString);
    } catch (error) {
      console.error("Error saving anonymous mode to AsyncStorage:", error);
    }
  };
  
  const marginRightPercentage = 22; 

  const marginRightValue = (width * marginRightPercentage) / 100;


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

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text
        style={{
          color: themeColors.text,
          fontSize: 24,
          fontWeight: 'bold',
          marginRight: marginRightValue,
        }}
      >
        {t('profile.title')}
      </Text>
    </View>

 
    </View>

    <View style={{ marginTop: 30, marginBottom: 30 }}>
      <Text style={{ color: "rgba(0, 0, 0, 0.5)", fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{t('profile.karmapoints')}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.07)', borderRadius: 15, padding: 10, width: 80, marginBottom: 20 }}>
        <StarIcon style={{ color: themeColors.bgDark }}/>
        <Text style={{ color: themeColors.bgLight, fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>{karmaPoints}</Text>
        </View>
        <Text style={{ color: "rgba(0, 0, 0, 0.5)", fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{t('profile.modeswitch')}</Text>

        <Switch
          value={anonymousMode}
          onValueChange={handleToggleSwitch}
          style={{ flexDirection: 'row', marginRight: ios ? 0: 600}}
          trackColor={{ false: "rgba(0, 0, 0, 0.5)", true: themeColors.transparent }}
          thumbColor={anonymousMode ? themeColors.bgLight : themeColors.textwhite}
          ios_backgroundColor={themeColors.textwhite}
        />

        <View style={{marginBottom: 20 }}/>

        <Text style={{ color: "rgba(0, 0, 0, 0.5)", fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{t('settings.autotext')}</Text>
          

        <Switch
          value={autoText}
          onValueChange={handleAutoSwitch}
          style={{ flexDirection: 'row', marginRight: ios ? 0: 600}}
          trackColor={{ false: "rgba(0, 0, 0, 0.5)", true: themeColors.transparent }}
          thumbColor={autoText ? themeColors.bgLight : themeColors.textwhite}
          ios_backgroundColor={themeColors.textwhite}
        />
     
    </View>

    <TouchableOpacity
    style={{
      backgroundColor: themeColors.bgDark,
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
     
    }}
    onPress={() => deleteUser()}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}> {t('settings.deleteaccount')}</Text>
  </TouchableOpacity>

  </SafeAreaView>
</View>
  )
}