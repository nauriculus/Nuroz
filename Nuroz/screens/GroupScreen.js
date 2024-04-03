import { View, ScrollView, Text, TouchableOpacity,Image,Clipboard, Dimensions, TextInput, Platform, Animated ,FlatList,StyleSheet, Linking  } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftCircleIcon, MinusIcon, XMarkIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { PlusSmallIcon } from 'react-native-heroicons/solid';
import { InformationCircleIcon, CheckCircleIcon } from 'react-native-heroicons/solid';
import { themeColors } from '../theme';
import Modal from 'react-native-modal';
import { useTranslation } from 'react-i18next';
import { Keypair} from "@solana/web3.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import nacl from 'tweet-nacl-react-native-expo';

import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
const {width, height} = Dimensions.get('window');
const ios = Platform.OS == 'ios';

export default function GroupScreen(props) {


  const [popupInfoVisible, setPopupInfoVisible] = useState(false);
  const [eulaVisible, setEulaVisible] = useState(false);

  const handlePopupOpen = () => {
    setPopupInfoVisible(true);
  };

  const handleEulaOpen = () => {
    setEulaVisible(true);
  };

  const styles = StyleSheet.create({
    iconContainer: {
    },
    icon: {
      shadowColor: themeColors.bgDark,
      shadowRadius: 30,
      marginBottom: 40,
      shadowOffset: { width: 0, height: 30 },
      shadowOpacity: 0.9,
    },
    popupContainer: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
    },
    popupTitle: {
      marginBottom: 10,
      color: themeColors.bgDark,
      fontWeight: 'bold',
      fontSize: 25,
    },
    popupEmail: {
      marginTop: -20,
      marginBottom: 10,
      color: themeColors.bgDark,
      fontWeight: 'bold',
      fontSize: 15,
      textDecorationLine: 'underline',
    },
    popupText: {
      marginBottom: 25,
    },
    closeButton: {
      color: themeColors.bgDark, 
      textAlign: 'left',
     
      marginTop: 10,
    },
  });

  const handlePopupInfoClose = () => {
    setPopupInfoVisible(false);
  };

  const handleEulaClose = () => {
    setEulaVisible(false);
  };

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
                getUserGroups();
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
            console.log(`HTTP error! Status: ${response.status}`);
            return null;
          }
        
          const data = await response.json();

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
                              console.log(`HTTP error! Status: ${response.status}`);
                              return null;
                          }
              
                          const groupInfoResponse = await response.json();
                          const groupInfo = groupInfoResponse.group[0];
      
                          localOptionSets.push({
                              id: groupInfo.groupId,
                              title: groupInfo.groupName,
                              icon: groupInfo.groupImage,
                              admins: groupInfo.GROUP_ADMIN,
                              groupSettings: groupInfo.groupSettings,
                          });
                      }


                    setOptionSets(localOptionSets);
                  } else {
                    console.log("User has no groups");
                    setOptionSets(null);
                  }
                } else {
                  console.log("User has no groups");
                  setOptionSets(null);
                }
              } else {
                console.log("Invalid response format");
                setOptionSets(null);
              }
              break;
          
            case 400:
              console.log("No profile found");
              break;
          
            default:
              console.log("Network error or unexpected response");
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

  const hidePopUp = () => {
    Animated.timing(slideUpAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setPopUpVisibility(false);
        setModalHeight(null);
      }
    });
  };

  const stylesEula = {
    scrollView: {
      maxHeight: 2500,
      padding: 10,
    },
    container: {
      padding: 25,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 5,
    },
    text: {
      fontSize: 14,
      marginBottom: 10,
    },
  };
  
  
  useEffect(() => {
    const fetchUserGroups = () => {
      getUserGroups();
    };

    fetchUserGroups();
    const intervalId = setInterval(fetchUserGroups, 10000);

    return () => clearInterval(intervalId);
  }, []); 

  const {t} = useTranslation(); 
  const navigation = useNavigation();
  const [selectedSet, setSelectedSet] = useState(null);
  const [isPopUpVisible, setPopUpVisibility] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [modalHeight, setModalHeight] = useState(null);

  const [optionSets, setOptionSets] = useState([]);

  const slideUpAnimation = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {

          await getUserGroups();
        } catch (error) {
          console.error('Error fetching data:', error);
    
        }
      };

      fetchData();

      return () => {
        
      };
    }, [navigation])
  );

  const showPopUp = () => {
    setModalHeight(height / 1.5);
    setPopUpVisibility(true);
    Animated.timing(slideUpAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleEulaSubmit = async () => {
    const success = await joinGroup(inviteCode);
    if(success !== null) {
    Toast.show({
      type: 'success',
      text1: t('homepage.success'),
      text2: t('homepage.groupjoined'),
  }); 
  
  };
  handleEulaClose();

  
  }

  const handlePopUpSubmit = async () => {
  hidePopUp();
    
  setTimeout(() => {
  handleEulaOpen();
  }, 1000);
  
  
  }

  const handleOptionSetSelect = (optionSet) => {
    setSelectedSet(optionSet.id);
    navigation.navigate('GroupTab', {...optionSet})
  };

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
    
     
     

      <Modal isVisible={popupInfoVisible}>
      <View style={styles.popupContainer}>
      <Text style={styles.popupTitle}>{t('groups.popupTitle')}</Text>
      <Text style={styles.popupText}>{t('groups.popupText1')}</Text>
      <Text style={styles.popupText}>{t('groups.popupText2')}</Text>
      <Text style={styles.popupText}>{t('groups.popupText3')}</Text>
      <Text style={styles.popupEmail} onPress={() => {
        Clipboard.setString('nuroz@binaramics.com');}}>
        {t('groups.popupEmail')}
        </Text>

<TouchableOpacity onPress={handlePopupInfoClose}>
<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
  <XMarkIcon style={styles.closeButton}></XMarkIcon>
  </View>
      </TouchableOpacity>
      </View>
      </Modal>
      <Modal
        isVisible={isPopUpVisible}
        onBackdropPress={hidePopUp}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <Animated.View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding:20,
            height: modalHeight || Dimensions.get('window').height,
            transform: [
              {
                translateY: slideUpAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [modalHeight || Dimensions.get('window').height, 0],
                }),
              },
            ],
          }}
        >
          
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

        <TouchableOpacity
    onPress={() => hidePopUp()}
    style={{
      
      padding: 10,
      marginTop: width >= 600 ? 0: -60,
      borderRadius: 50, 
    }}
  >
    <MinusIcon size={100} color={"rgba(0,0,0,0.25)"} />
  </TouchableOpacity>

        <Text style={{ color: themeColors.text, marginBottom:10 }} className="text-3xl font-semibold">{t('groups.invitecode')}</Text>
        <Text style={{ fontWeight: "bold", textAlign: "left", marginBottom: 20}} className="text-gray-500">
        {t('groups.invitecodesub')}
    </Text>
    <TextInput
      style={{
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
    
        paddingHorizontal: 10,
        borderRadius: 10,
        width: '100%',
      }}
      placeholderTextColor="black"
      placeholder=  {t('groups.invitecodetextfield')}
      value={inviteCode}
      onChangeText={(text) => setInviteCode(text)}
    />
  </View>
  <TouchableOpacity
    style={{
      backgroundColor: themeColors.bgDark,
      padding: 10,
      borderRadius: 10,
      marginTop: 0,
      marginBottom: height / 3,
      marginTop: 0,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    }}
    onPress={handlePopUpSubmit}
  >
    <Text style={{ color: 'white', marginRight: 5}}>  {t('groups.joinbutton')}</Text>
        </TouchableOpacity>
        </Animated.View>
      </Modal>

      <SafeAreaView className="space-y-1 flex-1">  
        <View className="mx-4 flex-row justify-between items-center">
          <TouchableOpacity className=" rounded-full " onPress={()=> navigation.goBack()}>
            <ArrowLeftCircleIcon  style={{
            shadowColor: themeColors.bgDark,
            shadowRadius: 30,
            marginBottom: 40,
            shadowOffset: {width: 0, height: 30},
            shadowOpacity: 0.9,
          }} size="40" strokeWidth={1.2} color={themeColors.bgDark}/>
          </TouchableOpacity>

          <TouchableOpacity className=" rounded-full " onPress={()=> handlePopupOpen()}>
            <QuestionMarkCircleIcon  style={{
            shadowColor: themeColors.bgDark,
            shadowRadius: 30,
            marginBottom: 40,
            shadowOffset: {width: 0, height: 30},
            shadowOpacity: 0.9,
          }} size="40" strokeWidth={1.2} color={themeColors.bgDark} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

        <View className="px-6 flex-row justify-between items-center">
    <Text style={{ color: themeColors.bgLight }} className="text-3xl font-semibold">
    {t('groups.title')}
    </Text>
         <View className="justify-between px-3">  
         <TouchableOpacity
          onPress={() => showPopUp()}
  style={{
    backgroundColor: "#FFF",
    width: 50, 
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  }}>

  <PlusSmallIcon style={{
    color: themeColors.bgLight,
  }} className="text-white text-lg font-semibold" />
</TouchableOpacity>
 </View>
</View> 
</View>
        
<View className="px-5 space-y-1">
    <Text style={{color: "rgba(0,0,0,0.5)"}} className="text-lg font-bold"> {t('groups.subtitle')}</Text>
    <View className="flex-row justify-between">
         
    {optionSets && optionSets.length > 0 ? (
    <FlatList
  showsHorizontalScrollIndicator={false}
  data={optionSets}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={{ marginLeft: 0 }}
  renderItem={({ item }) => (
    <View>
   
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
          source={{ uri: item.icon }}
          style={{
            width: 25,
            height: 25,
            marginRight: 10, 
          }}/>

      <Text
        style={{
          fontSize: 20,
          color: selectedSet === item.id ? 'white' : 'gray',
        }}
      >
        {item.title}
      </Text>
      </TouchableOpacity>


   </View>
      )}/>
      
      ) : (
        <View>
        <Image 
              source={require('../assets/images/Load.gif')} 
              style={{
              marginLeft: 8,
              height: 30,
               width: 30,
            }} 
            />
          </View>
          )
        }
      </View>
     </View>

     <Modal isVisible={eulaVisible}>
     <View style={{ flex: 1, marginTop: 40, marginBottom: 30 }}>
   
     <ScrollView contentContainerStyle={stylesEula.scrollView}>
     <View style={styles.popupContainer}>
      <Text style={stylesEula.title}>End-User License Agreement (EULA) for Nuroz Mental Health App - Group Function</Text>

      <Text style={stylesEula.text}>Effective Date: February 4, 2024</Text>

      <Text style={stylesEula.text}>This End-User License Agreement ("Agreement") is entered into by and between the user ("User" or "You") and Nuroz Health Solutions ("Nuroz" or "We"). This Agreement governs your use of the Nuroz mental health app's group function and its associated features (the "Group Function").</Text>

     
      <Text style={stylesEula.sectionTitle}>1. Acceptance of Terms</Text>
      <Text style={stylesEula.text}>By using the Group Function, you agree to be bound by the terms and conditions outlined in this Agreement. If you do not agree with these terms, you may not use the Group Function.</Text>

      <Text style={stylesEula.sectionTitle}>2. Voluntary Feedback Collection</Text>
      <Text style={stylesEula.text}>The Group Function may offer features allowing users to voluntarily provide feedback on mental health-related topics within the group setting. By choosing to submit feedback, you acknowledge that your feedback is voluntary, and you grant Nuroz the right to collect, store, and analyze the information provided within the context of the Group Function.</Text>
 
 
      <Text style={stylesEula.sectionTitle}>3. Privacy and Data Collection</Text>
      <Text style={stylesEula.text}>Nuroz may collect and analyze private information submitted through the voluntary feedback feature within the Group Function. This information is collected for the purpose of improving and analyzing mental health insights, user experience, and related aspects specific to the Group Function. Nuroz is committed to safeguarding your privacy, and the information collected will be handled in accordance with our Privacy Policy.</Text>

 
      <Text style={stylesEula.sectionTitle}>4. User Responsibilities</Text>
      <Text style={stylesEula.text}>a. You agree to provide accurate and truthful information when submitting voluntary feedback within the Group Function.</Text>
      <Text style={stylesEula.text}>b. You acknowledge that Nuroz may use aggregated and anonymized feedback from the Group Function for statistical and analytical purposes.</Text>
      <Text style={stylesEula.text}>c. You understand that participation in the voluntary feedback process within the Group Function is entirely optional.</Text>


      <Text style={stylesEula.sectionTitle}>5. Intellectual Property</Text>
      <Text style={stylesEula.text}>The Group Function and all related materials, including but not limited to software, graphics, and content, are the property of Nuroz and are protected by intellectual property laws. You may not reproduce, modify, distribute, or create derivative works based on the Group Function without explicit permission from Nuroz.</Text>

  
      <Text style={stylesEula.sectionTitle}>6. Disclaimers</Text>
      <Text style={stylesEula.text}>a. Nuroz does not guarantee the accuracy or completeness of any information obtained through the voluntary feedback feature within the Group Function.</Text>
      <Text style={stylesEula.text}>b. Nuroz is not responsible for any actions taken based on the information provided through the voluntary feedback feature within the Group Function.</Text>


      <Text style={stylesEula.sectionTitle}>7. Termination</Text>
      <Text style={stylesEula.text}>Nuroz reserves the right to terminate or suspend your access to the Group Function at any time for any reason, without prior notice.</Text>

      <Text style={stylesEula.sectionTitle}>8. Changes to the Agreement</Text>
      <Text style={stylesEula.text}>Nuroz reserves the right to modify or update this Agreement at any time, specifically regarding the Group Function. It is your responsibility to review this Agreement periodically for changes. Your continued use of the Group Function after the posting of any changes constitutes acceptance of those changes.</Text>


      <Text style={stylesEula.sectionTitle}>9. Governing Law</Text>
      <Text style={stylesEula.text}>This Agreement is governed by and construed in accordance with the laws of Germany.</Text>

      <Text style={stylesEula.sectionTitle}>10. Contact Information</Text>
      <Text style={stylesEula.text}>For questions or concerns regarding this Agreement, specifically related to the Group Function, please contact us at help@binaramics.com.</Text>

      <Text style={stylesEula.text}>By using the Group Function, you acknowledge that you have read, understood, and agreed to the terms and conditions outlined in this End-User License Agreement specific to the Group Function.</Text>
   

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
      
      <TouchableOpacity onPress={handleEulaClose}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      <XMarkIcon size={30} style={styles.closeButton}></XMarkIcon>
      </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleEulaSubmit}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
          <CheckCircleIcon size={30} style={styles.closeButton}></CheckCircleIcon>
        </View>
      </TouchableOpacity>

  
    </View>

      </View>

      
      </ScrollView>
      </View>

      </Modal>

    <View style={{ paddingHorizontal: 20, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}>
    <InformationCircleIcon style={{ color: themeColors.bgDark, fontSize: 10}} className="text-white font-semibold" />

      <Text style={{ fontWeight: 'bold', marginLeft: 3, textAlign: 'left', color: 'gray', fontSize: 12 }}>
      {t('groups.infotext')}
      </Text>
      </View>
      <Toast config={toastConfig} /> 
      </SafeAreaView>
    </View>
  )
}