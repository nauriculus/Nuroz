import { View, Text, TouchableOpacity, Image, Dimensions, Platform, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftCircleIcon, MinusIcon, PlusIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { CalendarIcon } from 'react-native-heroicons/solid';
import { themeColors } from '../theme';
import { messagesToSend } from '../constants';
const {width, height} = Dimensions.get('window');
const ios = Platform.OS == 'ios';

export default function LoadingScreen() {

  
  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <SafeAreaView className="space-y-4 flex-1">
        <View className="mx-4 flex-row justify-between items-center">
          {isLoading ? (
            <Image
              source={require('../assets/images/Load.gif')}
              style={{ width: 100, height: 100 }}
            />
          ) : (
            <View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}