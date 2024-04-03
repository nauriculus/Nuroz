import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import { Dimensions, LogBox, Platform, Text, View } from 'react-native';
import StatusScreen from '../screens/StatusScreen';
import ChatScreen from '../screens/ChatScreen';
import GroupScreen from '../screens/GroupScreen';
import SettingScreen from '../screens/SettingScreen';
import GroupStatus from '../screens/GroupStatus';
import ProfileScreen from '../screens/ProfileScreen';
import GroupResults from '../screens/GroupResults';
import GroupSettings from '../screens/GroupSettings';
import Group from '../screens/Group';
import { themeColors } from '../theme';
const {width, height} = Dimensions.get('window');

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {HomeModernIcon as HomeOutline, ChatBubbleLeftEllipsisIcon as HeartOutline, UserGroupIcon as BagOutline } from 'react-native-heroicons/outline';
import {HomeModernIcon as HomeSolid, ChatBubbleLeftEllipsisIcon as HeartSolid, UserGroupIcon as BagSolid} from 'react-native-heroicons/solid';

import {Cog6ToothIcon as CogOutline  } from 'react-native-heroicons/outline';
import {Cog6ToothIcon as CogSolid} from 'react-native-heroicons/solid';

import {PresentationChartBarIcon as ChartOutline  } from 'react-native-heroicons/outline';
import {PresentationChartBarIcon as ChartSolid} from 'react-native-heroicons/solid';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ios = Platform.OS == 'ios';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function AppNavigation(props) {

 
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
         backgroundColor: "#F9F9F9",
      }}>
        
        <Stack.Screen name="Home" options={{headerShown: false}} component={HomeTabs} />
        <Stack.Screen name="Status" options={{headerShown: false}} component={StatusScreen} />
        <Stack.Screen name="Chat" options={{headerShown: false}} component={ChatScreen} />
        <Stack.Screen name="Settings" options={{headerShown: false}} component={SettingScreen} />
        <Stack.Screen name="Profile" options={{headerShown: false}} component={ProfileScreen} />
        <Stack.Screen name="GroupTab" options={{ headerShown: false }} component={GroupTabs} />
        <Stack.Screen name="GroupStatus" options={{ headerShown: false }} component={GroupStatus} />

        

      </Stack.Navigator>
    </NavigationContainer>
  )
}

function GroupTabs(props) {

  if (width <= 385) {
    // Smaller screens like iPhone SE
    iconPos = ios ? 0 : 0;
   
  } else {
    iconPos = ios ? 25: 0;
   
  }

  if (width == 430) {
    iconPos = ios ? 25 : 0;
   
    }


  if (width >= 700 && width <= 800) {
    iconPos = ios ? 10 : 0;
   
  }

  if (width > 800 && width <= 999) {
    iconPos = ios ? 10 : 40;
   
  }

    if (width >= 1000) {
      iconPos = ios ? 10 : 40;

    }

    if(width == 375) {
        //Iphone 13 Mini
      iconPos = ios ? 25 : 40;
    }
 
  return (
    <Tab.Navigator
      screenOptions={({ route, props }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => groupIcons(route, focused),
        tabBarStyle: {
          marginBottom: 20,
          height: 75,
          alignItems: 'center',
          borderRadius: 100,
          marginHorizontal: 20,
          backgroundColor: "#2B2E63",
        },
        tabBarItemStyle: {
          marginTop: iconPos,
        }
      })}
    >
     
     <Tab.Screen
      name="IndiGroup"
      component={Group}
      initialParams={{ params: props }}
    />

 

  <Tab.Screen name="IndiGroupStats" component={GroupResults} initialParams={{ params: props }}/>
  <Tab.Screen name="IndiGroupSettings" component={GroupSettings} initialParams={{ params: props }} />

    </Tab.Navigator>
  );
}

function HomeTabs(){

  let iconPos;
  
  if (width <= 385) {
    // Smaller screens like iPhone SE
    iconPos = ios ? 0 : 0;
   
  } else {
    iconPos = ios ? 25: 0;
   
  }

  if (width == 430) {
    iconPos = ios ? 25 : 0;
   
    }


  if (width >= 700 && width <= 800) {
    iconPos = ios ? 10 : 0;
   
  }

  if (width > 800 && width <= 999) {
    iconPos = ios ? 10 : 40;
   
  }

    if (width >= 1000) {
      iconPos = ios ? 10 : 40;

    }

    console.log(height);

    if(width == 375 && height == 667) {
        //Iphone SE
      iconPos = ios ? 0 : 40;
    }

    if(width == 375 && height !== 667) {
      //Iphone SE
    iconPos = ios ? 25 : 40;
  }

  return (
    <Tab.Navigator screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => menuIcons(route, focused),
        tabBarStyle: {
          marginBottom: 20,
          height: 75,
          alignItems: 'center',
          
          borderRadius: 100,
          marginHorizontal: 20,
          backgroundColor: "#2B2E63",

        },
        tabBarItemStyle: {
          marginTop: iconPos,
          
        }
      })}>
     
     
       <Tab.Screen name="home" component={HomeScreen} />
       <Tab.Screen name="chat" component={ChatScreen} />
       <Tab.Screen name="groups" component={GroupScreen} />
      
    </Tab.Navigator>
  )
}

const groupIcons = (route, focused)=> {
  let icon;

  if(route.name==='IndiGroupStats'){
    icon = focused? <ChartSolid size="30" color={themeColors.bgLight} /> : <ChartOutline size="30" strokeWidth={2} color="white" />
  }

  if (route.name === 'IndiGroup') {
    icon =  focused? <BagSolid size="30" color={themeColors.bgLight} /> : <BagOutline size="30" strokeWidth={2} color="white" />
  } 
  
  if (route.name === 'IndiGroupSettings') {
    icon =  focused? <CogSolid size="30" color={themeColors.bgLight} /> : <CogOutline size="30" strokeWidth={2} color="white" />
  } 

  
  let buttonClass = focused? "bg-white": "";
  return (
    <View className={"flex items-center rounded-full p-3 shadow " + buttonClass}>
      {icon}
    </View>
  )
}

const menuIcons = (route, focused)=> {
  let icon;
  
  console.log(route);
  if(route.name==='IndiGroupsBack'){
    icon = focused? <BagSolid size="30" color={themeColors.bgLight} /> : <BagOutline size="30" strokeWidth={2} color="white" />
  }

  if (route.name === 'IndiGroup') {
    icon =  focused? <ChartSolid size="30" color={themeColors.bgLight} /> : <ChartOutline size="30" strokeWidth={2} color="white" />
  } 
  
  if (route.name === 'IndiGroupSettings') {
    icon =  focused? <CogSolid size="30" color={themeColors.bgLight} /> : <CogOutline size="30" strokeWidth={2} color="white" />
  } 

  

  if (route.name === 'home') {
    icon =  focused? <HomeSolid size="30" color={themeColors.bgLight} /> : <HomeOutline size="30" strokeWidth={2} color="white" />
  } else if (route.name === 'chat') {
    icon =  focused? <HeartSolid size="30" color={themeColors.bgLight} /> : <HeartOutline size="30" strokeWidth={2} color="white" />
  }else if(route.name==='groups'){
    icon =  focused? <BagSolid size="30" color={themeColors.bgLight} /> : <BagOutline size="30" strokeWidth={2} color="white" />
  }

  
  let buttonClass = focused? "bg-white": "";
  return (
    <View className={"flex items-center rounded-full p-3 shadow " + buttonClass}>
      {icon}
    </View>
  )
}