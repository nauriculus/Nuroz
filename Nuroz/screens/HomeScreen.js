import 'react-native-get-random-values';
import { View, Text, Image, TouchableOpacity, TextInput,PanResponder, FlatList, Dimensions, Animated, Platform } from 'react-native'
import React, { useState, useEffect, useReducer, useRef  } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {themeColors} from '../theme';
import { useNavigation } from '@react-navigation/native'
import { categories } from '../constants/index';
import Carousel, { Pagination } from 'react-native-snap-carousel';

import { translate } from '@vitalets/google-translate-api';
import {Restart} from 'fiction-expo-restart';

import UserCard from '../components/userCards';
import { Cog6ToothIcon, MinusIcon, ChevronDownIcon, ChevronUpIcon, UserCircleIcon } from 'react-native-heroicons/outline'
import * as Haptics from 'expo-haptics';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import nacl from 'tweet-nacl-react-native-expo';
import { Keypair} from "@solana/web3.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import {HeartIcon as HeartOutline, FaceSmileIcon as FaceSmileOutline, ArrowPathIcon} from 'react-native-heroicons/outline';
import { initReactI18next } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';

import ger from '../assets/language/de.json';
import en from '../assets/language/en.json';
import es from '../assets/language/es.json';
import fr from '../assets/language/fr.json';
import { EyeIcon, FaceSmileIcon, HeartIcon, StarIcon } from 'react-native-heroicons/solid';
import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';

const resources = {
  ger: {
    translation: ger,
  },
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  fr: {
    translation: fr,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: {
    escapeValue: false
  }
});

const {width, height} = Dimensions.get('window');
const ios = Platform.OS == 'ios';

const initialState = [];

const userItemsReducer = (state, action) => {
  switch (action.type) {

    case 'SET_LIST':
      return action.payload;

    case 'REMOVE_ITEM':
      const newState = state.filter(item => item.id !== action.itemId);
      return newState;

    case 'ADD_ITEM':
      const newItem = action.item;
      const updatedState = [...state, newItem];
      return updatedState;

    default:
      return state;
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

const changeStatus = async (status) => {
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
        const response = await fetch('https://binaramics.com:5173/changeStatus/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Accept-Encoding': '*/*',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, status: status, id: "Happy" }),
        });
      
        if (!response.ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Toast.show({
            type: 'error',
            text1: t('homepage.error'),
            text2: t('homepage.statusnotchanged'),
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
            text2: t('homepage.statusnotchanged'),
          });
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

const motivationalDE = [
  {"id": 51, "text": "Glaube an dich, PLACEHOLDER! Du hast mehr Kraft, als du denkst."},
  {"id": 52, "text": "Mach weiter, PLACEHOLDER! Deine Ausdauer führt zum Erfolg."},
  {"id": 53, "text": "Setze kleine Ziele, PLACEHOLDER. Sie führen zu großen Erfolgen."},
  {"id": 54, "text": "Bleib positiv, PLACEHOLDER! Gute Dinge kommen auf dich zu."},
  {"id": 55, "text": "Du überwindest Hürden, PLACEHOLDER! Das zeigt deine Stärke."},
  {"id": 56, "text": "Sei geduldig, PLACEHOLDER. Fortschritt braucht Zeit."},
  {"id": 57, "text": "Gib nicht auf, PLACEHOLDER! Du verdienst Gesundheit und Glück."},
  {"id": 58, "text": "Dein Durchhaltevermögen ist beeindruckend, PLACEHOLDER. Mach weiter."},
  {"id": 59, "text": "Vertrau auf deinen Weg, PLACEHOLDER! Du bist auf dem richtigen Pfad."},
  {"id": 60, "text": "Bleib stark, PLACEHOLDER! Deine Stärke ist bewundernswert."},
  {"id": 61, "text": "Du machst das großartig, PLACEHOLDER! Jeder Tag ist ein neuer Schritt nach vorn."},
];

const motivationalEN = [
  {"id": 51, "text": "Believe in yourself, PLACEHOLDER! You have more strength than you think."},
  {"id": 52, "text": "Keep going, PLACEHOLDER! Your perseverance leads to success."},
  {"id": 53, "text": "Set small goals, PLACEHOLDER. They lead to big achievements."},
  {"id": 54, "text": "Stay positive, PLACEHOLDER! Good things are coming your way."},
  {"id": 55, "text": "You overcome obstacles, PLACEHOLDER! That shows your strength."},
  {"id": 56, "text": "Be patient, PLACEHOLDER. Progress takes time."},
  {"id": 57, "text": "Don't give up, PLACEHOLDER! You deserve health and happiness."},
  {"id": 58, "text": "Your perseverance is admirable, PLACEHOLDER. Keep going."},
  {"id": 59, "text": "Trust your path, PLACEHOLDER! You are on the right track."},
  {"id": 60, "text": "Stay strong, PLACEHOLDER! Your strength is admirable."},
  {"id": 61, "text": "You're doing great, PLACEHOLDER! Each day is a step forward."},
];

const motivationalES = [
  {"id": 51, "text": "Cree en ti mismo/a, PLACEHOLDER. Tienes más fuerza de la que piensas."},
  {"id": 52, "text": "Sigue adelante, PLACEHOLDER. Tu perseverancia conduce al éxito."},
  {"id": 53, "text": "Establece metas pequeñas, PLACEHOLDER. Conducen a grandes logros."},
  {"id": 54, "text": "Mantén la positividad, PLACEHOLDER. Lo bueno vendrá."},
  {"id": 55, "text": "Superas obstáculos, PLACEHOLDER. Eso demuestra tu fuerza."},
  {"id": 56, "text": "Ten paciencia, PLACEHOLDER. El progreso lleva tiempo."},
  {"id": 57, "text": "No te rindas, PLACEHOLDER. Te mereces salud y felicidad."},
  {"id": 58, "text": "Tu perseverancia es admirable, PLACEHOLDER. Sigue adelante."},
  {"id": 59, "text": "Confía en tu camino, PLACEHOLDER. Estás en la dirección correcta."},
  {"id": 60, "text": "Mantente fuerte, PLACEHOLDER. Tu fuerza es admirable."},
  {"id": 61, "text": "Lo estás haciendo genial, PLACEHOLDER. Cada día es un paso adelante."},

];



const gesundheitDE = [
  {"id": 26, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 27, "text": "Bleib stark, PLACEHOLDER! Dein Durchhaltevermögen wird belohnt."},
  {"id": 28, "text": "Gib nicht auf, PLACEHOLDER! Deine Stärke ist bewundernswert."},
  {"id": 29, "text": "Halte durch, PLACEHOLDER! Dein Mut inspiriert."},
  {"id": 30, "text": "Sei stolz auf dich, PLACEHOLDER! Jeder Schritt zählt."},
  {"id": 31, "text": "Denk daran, PLACEHOLDER: Kleinere Fortschritte sind auch Erfolge."},
  {"id": 32, "text": "Vertrau auf deine Kraft, PLACEHOLDER! Du bist widerstandsfähig."},
  {"id": 33, "text": "Bleib optimistisch, PLACEHOLDER! Positives Denken bringt positive Ergebnisse."},
  {"id": 34, "text": "Du bist nicht allein, PLACEHOLDER! Gemeinsam sind wir stark."},
  {"id": 35, "text": "Nimm dir Zeit für dich, PLACEHOLDER. Selbstfürsorge ist wichtig."},
  {"id": 36, "text": "Du machst das großartig, PLACEHOLDER! Jeder Tag ist ein neuer Schritt nach vorn."},
  {"id": 37, "text": "Lass dich nicht entmutigen, PLACEHOLDER! Du wächst daran."},
  {"id": 38, "text": "Steh zu dir, PLACEHOLDER! Du bist wertvoll."},
  {"id": 39, "text": "Du hast eine innere Stärke, PLACEHOLDER. Nutze sie."},
  {"id": 40, "text": "Denk daran, PLACEHOLDER: Jeder Tag ist eine neue Chance."},
  {"id": 41, "text": "Vertrau auf deinen Weg, PLACEHOLDER! Du bist auf dem richtigen Pfad."},
  {"id": 42, "text": "Glaub an dich, PLACEHOLDER! Du bist stärker als du denkst."},
  {"id": 43, "text": "Deine Beständigkeit beeindruckt, PLACEHOLDER. Mach weiter so."},
  {"id": 44, "text": "Bleib positiv, PLACEHOLDER! Das Gute wird kommen."},
  {"id": 45, "text": "Du überwindest Hürden, PLACEHOLDER! Das zeigt deine Kraft."},
  {"id": 46, "text": "Sei geduldig, PLACEHOLDER. Fortschritt braucht Zeit."},
  {"id": 47, "text": "Denk daran, PLACEHOLDER: Du bist auf dem Weg der Besserung."},
  {"id": 48, "text": "Dein Durchhaltevermögen ist bewundernswert, PLACEHOLDER. Mach weiter."},
  {"id": 49, "text": "Gib nicht auf, PLACEHOLDER! Du verdienst Gesundheit und Glück."},
  {"id": 50, "text": "Deine Widerstandsfähigkeit ist beeindruckend, PLACEHOLDER. Weiter so!"}
];

const gesundheitEN =[
  {"id": 26, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 27, "text": "Stay strong, PLACEHOLDER! Your perseverance will be rewarded."},
  {"id": 28, "text": "Don't give up, PLACEHOLDER! Your strength is admirable."},
  {"id": 29, "text": "Hang in there, PLACEHOLDER! Your courage inspires."},
  {"id": 30, "text": "Be proud of yourself, PLACEHOLDER! Every step counts."},
  {"id": 31, "text": "Remember, PLACEHOLDER: Small progress is still progress."},
  {"id": 32, "text": "Trust your strength, PLACEHOLDER! You are resilient."},
  {"id": 33, "text": "Stay optimistic, PLACEHOLDER! Positive thinking brings positive results."},
  {"id": 34, "text": "You're not alone, PLACEHOLDER! Together we are strong."},
  {"id": 35, "text": "Take time for yourself, PLACEHOLDER. Self-care is important."},
  {"id": 36, "text": "You're doing great, PLACEHOLDER! Each day is a step forward."},
  {"id": 37, "text": "Don't be discouraged, PLACEHOLDER! You grow from it."},
  {"id": 38, "text": "Stand by yourself, PLACEHOLDER! You are valuable."},
  {"id": 39, "text": "You have inner strength, PLACEHOLDER. Use it."},
  {"id": 40, "text": "Remember, PLACEHOLDER: Every day is a new chance."},
  {"id": 41, "text": "Trust your path, PLACEHOLDER! You are on the right track."},
  {"id": 42, "text": "Believe in yourself, PLACEHOLDER! You are stronger than you think."},
  {"id": 43, "text": "Your consistency is impressive, PLACEHOLDER. Keep it up."},
  {"id": 44, "text": "Stay positive, PLACEHOLDER! The good will come."},
  {"id": 45, "text": "You overcome obstacles, PLACEHOLDER! That shows your strength."},
  {"id": 46, "text": "Be patient, PLACEHOLDER. Progress takes time."},
  {"id": 47, "text": "Remember, PLACEHOLDER: You are on the path to recovery."},
  {"id": 48, "text": "Your perseverance is admirable, PLACEHOLDER. Keep going."},
  {"id": 49, "text": "Don't give up, PLACEHOLDER! You deserve health and happiness."},
  {"id": 50, "text": "Your resilience is impressive, PLACEHOLDER. Keep it up!"}
];

const gesundheitES =[
  {"id": 26, "text": "¡Tú puedes, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 27, "text": "Mantente fuerte, PLACEHOLDER. Tu perseverancia será recompensada."},
  {"id": 28, "text": "No te rindas, PLACEHOLDER. Tu fuerza es admirable."},
  {"id": 29, "text": "Sigue adelante, PLACEHOLDER. Tu valentía inspira."},
  {"id": 30, "text": "Siéntete orgulloso/a de ti mismo/a, PLACEHOLDER. Cada paso cuenta."},
  {"id": 31, "text": "Recuerda, PLACEHOLDER: Pequeños avances son también logros."},
  {"id": 32, "text": "Confía en tu fuerza, PLACEHOLDER. Eres resiliente."},
  {"id": 33, "text": "Mantén el optimismo, PLACEHOLDER. El pensamiento positivo trae resultados positivos."},
  {"id": 34, "text": "No estás solo/a, PLACEHOLDER. Juntos/as somos fuertes."},
  {"id": 35, "text": "Tómate tiempo para ti, PLACEHOLDER. El autocuidado es importante."},
  {"id": 36, "text": "Lo estás haciendo genial, PLACEHOLDER. Cada día es un paso adelante."},
  {"id": 37, "text": "No te desanimes, PLACEHOLDER. Crecerás a través de ello."},
  {"id": 38, "text": "Mantente firme, PLACEHOLDER. Eres valioso/a."},
  {"id": 39, "text": "Tienes fuerza interior, PLACEHOLDER. Úsala."},
  {"id": 40, "text": "Recuerda, PLACEHOLDER: Cada día es una nueva oportunidad."},
  {"id": 41, "text": "Confía en tu camino, PLACEHOLDER. Estás en la dirección correcta."},
  {"id": 42, "text": "Cree en ti mismo/a, PLACEHOLDER. Eres más fuerte de lo que piensas."},
  {"id": 43, "text": "Tu consistencia es impresionante, PLACEHOLDER. Sigue así."},
  {"id": 44, "text": "Mantén la positividad, PLACEHOLDER. Lo bueno vendrá."},
  {"id": 45, "text": "Superas obstáculos, PLACEHOLDER. Eso demuestra tu fuerza."},
  {"id": 46, "text": "Ten paciencia, PLACEHOLDER. El progreso lleva tiempo."},
  {"id": 47, "text": "Recuerda, PLACEHOLDER: Estás en el camino hacia la recuperación."},
  {"id": 48, "text": "Tu perseverancia es admirable, PLACEHOLDER. Sigue adelante."},
  {"id": 49, "text": "No te rindas, PLACEHOLDER. Te mereces salud y felicidad."},
  {"id": 50, "text": "Tu resistencia es impresionante, PLACEHOLDER. ¡Sigue así!"}
];

const mentalDE = [
  {"id": 51, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 52, "text": "Bleib stark, PLACEHOLDER! Deine Stärke wird dich tragen."},
  {"id": 53, "text": "Halte durch, PLACEHOLDER! Du bist stärker, als du denkst."},
  {"id": 54, "text": "Vertrau dir selbst, PLACEHOLDER! Du kannst jede Hürde überwinden."},
  {"id": 55, "text": "Lass nicht nach, PLACEHOLDER! Jeder Tag ist ein neuer Schritt."},
  {"id": 56, "text": "Glaub an dich, PLACEHOLDER! Deine innere Kraft ist unerschöpflich."},
  {"id": 57, "text": "Sei geduldig, PLACEHOLDER! Veränderung braucht Zeit."},
  {"id": 58, "text": "Denk positiv, PLACEHOLDER! Positives Denken bringt positive Ergebnisse."},
  {"id": 59, "text": "Erinnere dich an deine Stärke, PLACEHOLDER! Du bist nicht allein."},
  {"id": 60, "text": "Kopf hoch, PLACEHOLDER! Es wird besser werden."},
  {"id": 61, "text": "Gib nicht auf, PLACEHOLDER! Jeder Tag ist ein neuer Anfang."},
  {"id": 62, "text": "Du bist nicht allein, PLACEHOLDER! Gemeinsam sind wir stark."},
  {"id": 63, "text": "Konzentriere dich auf das Positive, PLACEHOLDER! Das Negative wird verblassen."},
  {"id": 64, "text": "Bleib optimistisch, PLACEHOLDER! Gute Dinge werden kommen."},
  {"id": 65, "text": "Vertrau auf deine Fähigkeiten, PLACEHOLDER! Du bist talentiert."},
  {"id": 66, "text": "Du machst Fortschritte, PLACEHOLDER! Jeder Schritt zählt."},
  {"id": 67, "text": "Atme tief durch, PLACEHOLDER! Du hast die Kontrolle."},
  {"id": 68, "text": "Lass dich nicht entmutigen, PLACEHOLDER! Du bist auf dem richtigen Weg."},
  {"id": 69, "text": "Denk an deine Erfolge, PLACEHOLDER! Du hast schon viel erreicht."},
  {"id": 70, "text": "Sei stolz auf dich, PLACEHOLDER! Du verdienst Anerkennung."},
  {"id": 71, "text": "Glaube an deine Fähigkeiten, PLACEHOLDER! Du kannst alles erreichen."},
  {"id": 72, "text": "Umarme die Herausforderungen, PLACEHOLDER! Sie machen dich stärker."},
  {"id": 73, "text": "Du bist nicht allein auf diesem Weg, PLACEHOLDER! Gemeinsam sind wir stark."},
  {"id": 74, "text": "Freu dich auf morgen, PLACEHOLDER! Neue Chancen warten auf dich."},
  {"id": 75, "text": "Hab Vertrauen in dich, PLACEHOLDER! Du bist auf dem richtigen Weg."}
];
const mentalEN =
[
  {"id": 51, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 52, "text": "Stay strong, PLACEHOLDER! Your strength will carry you."},
  {"id": 53, "text": "Hang in there, PLACEHOLDER! You're stronger than you think."},
  {"id": 54, "text": "Trust yourself, PLACEHOLDER! You can overcome any hurdle."},
  {"id": 55, "text": "Don't give up, PLACEHOLDER! Every day is a new step."},
  {"id": 56, "text": "Believe in yourself, PLACEHOLDER! Your inner strength is limitless."},
  {"id": 57, "text": "Be patient, PLACEHOLDER! Change takes time."},
  {"id": 58, "text": "Think positive, PLACEHOLDER! Positive thinking brings positive results."},
  {"id": 59, "text": "Remember your strength, PLACEHOLDER! You're not alone."},
  {"id": 60, "text": "Chin up, PLACEHOLDER! It will get better."},
  {"id": 61, "text": "Don't give up, PLACEHOLDER! Every day is a new beginning."},
  {"id": 62, "text": "You are not alone, PLACEHOLDER! Together we are strong."},
  {"id": 63, "text": "Focus on the positive, PLACEHOLDER! The negative will fade away."},
  {"id": 64, "text": "Stay optimistic, PLACEHOLDER! Good things will come."},
  {"id": 65, "text": "Trust in your abilities, PLACEHOLDER! You are talented."},
  {"id": 66, "text": "You're making progress, PLACEHOLDER! Every step counts."},
  {"id": 67, "text": "Take deep breaths, PLACEHOLDER! You are in control."},
  {"id": 68, "text": "Don't be discouraged, PLACEHOLDER! You are on the right path."},
  {"id": 69, "text": "Think of your achievements, PLACEHOLDER! You have already accomplished a lot."},
  {"id": 70, "text": "Be proud of yourself, PLACEHOLDER! You deserve recognition."},
  {"id": 71, "text": "Believe in your abilities, PLACEHOLDER! You can achieve anything."},
  {"id": 72, "text": "Embrace the challenges, PLACEHOLDER! They make you stronger."},
  {"id": 73, "text": "You are not alone on this journey, PLACEHOLDER! Together we are strong."},
  {"id": 74, "text": "Look forward to tomorrow, PLACEHOLDER! New opportunities await you."},
  {"id": 75, "text": "Have confidence in yourself, PLACEHOLDER! You are on the right path."}
];

const mentalES = [
  {"id": 51, "text": "¡Tú puedes, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 52, "text": "Mantente fuerte, PLACEHOLDER! Tu fuerza te llevará lejos."},
  {"id": 53, "text": "Resiste, PLACEHOLDER! Eres más fuerte de lo que piensas."},
  {"id": 54, "text": "Confía en ti mismo, PLACEHOLDER! Puedes superar cualquier obstáculo."},
  {"id": 55, "text": "No te rindas, PLACEHOLDER! Cada día es un nuevo paso."},
  {"id": 56, "text": "Cree en ti mismo, PLACEHOLDER! Tu fuerza interior es ilimitada."},
  {"id": 57, "text": "Ten paciencia, PLACEHOLDER! El cambio lleva tiempo."},
  {"id": 58, "text": "Piensa positivo, PLACEHOLDER! Pensar positivo trae resultados positivos."},
  {"id": 59, "text": "Recuerda tu fuerza, PLACEHOLDER! No estás solo/a."},
  {"id": 60, "text": "Mantén la cabeza en alto, PLACEHOLDER! Mejorará."},
  {"id": 61, "text": "No te rindas, PLACEHOLDER! Cada día es un nuevo comienzo."},
  {"id": 62, "text": "No estás solo/a, PLACEHOLDER! Juntos/as somos fuertes."},
  {"id": 63, "text": "Concéntrate en lo positivo, PLACEHOLDER! Lo negativo se desvanecerá."},
  {"id": 64, "text": "Mantén el optimismo, PLACEHOLDER! Cosas buenas vendrán."},
  {"id": 65, "text": "Confía en tus habilidades, PLACEHOLDER! Eres talentoso/a."},
  {"id": 66, "text": "Estás progresando, PLACEHOLDER! Cada paso cuenta."},
  {"id": 67, "text": "Respira profundamente, PLACEHOLDER! Tienes el control."},
  {"id": 68, "text": "No te desanimes, PLACEHOLDER! Estás en el camino correcto."},
  {"id": 69, "text": "Piensa en tus logros, PLACEHOLDER! Ya has logrado mucho."},
  {"id": 70, "text": "Siéntete orgulloso/a de ti mismo/a, PLACEHOLDER! Te mereces reconocimiento."},
  {"id": 71, "text": "Cree en tus habilidades, PLACEHOLDER! Puedes lograr cualquier cosa."},
  {"id": 72, "text": "Acepta los desafíos, PLACEHOLDER! Te hacen más fuerte."},
  {"id": 73, "text": "No estás solo/a en este viaje, PLACEHOLDER! Juntos/as somos fuertes."},
  {"id": 74, "text": "Espera con ansias el mañana, PLACEHOLDER! Nuevas oportunidades te esperan."},
  {"id": 75, "text": "Ten confianza en ti mismo/a, PLACEHOLDER! Estás en el camino correcto."}
];

const familieDE = [
  {"id": 76, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 77, "text": "Halte durch, PLACEHOLDER! Stärke kommt oft aus Herausforderungen."},
  {"id": 78, "text": "Bleib stark, PLACEHOLDER! Deine Resilienz wird dich führen."},
  {"id": 79, "text": "Vertrau dir selbst, PLACEHOLDER! Selbst kleine Fortschritte sind Erfolge."},
  {"id": 80, "text": "Es wird besser, PLACEHOLDER! Veränderung ist unausweichlich."},
  {"id": 81, "text": "Glaub an dich, PLACEHOLDER! Deine Stärke ist bemerkenswert."},
  {"id": 82, "text": "Lass nicht nach, PLACEHOLDER! Jeder Tag ist eine neue Möglichkeit."},
  {"id": 83, "text": "Kopf hoch, PLACEHOLDER! Dunkle Zeiten gehen vorüber."},
  {"id": 84, "text": "Sei geduldig, PLACEHOLDER! Gute Dinge brauchen Zeit."},
  {"id": 85, "text": "Denk positiv, PLACEHOLDER! Dein Geist formt deine Realität."},
  {"id": 86, "text": "Du bist nicht allein, PLACEHOLDER! Hilfe ist immer da."},
  {"id": 87, "text": "Schau nach vorn, PLACEHOLDER! Die Zukunft birgt Hoffnung."},
  {"id": 88, "text": "Steh auf, PLACEHOLDER! Du bist stärker als du denkst."},
  {"id": 89, "text": "Erkenne deine Kraft, PLACEHOLDER! In dir ruht viel Potential."},
  {"id": 90, "text": "Gib nicht auf, PLACEHOLDER! Der Weg zur Lösung beginnt bei dir."},
  {"id": 91, "text": "Bleib authentisch, PLACEHOLDER! Dein Wesen ist einzigartig."},
  {"id": 92, "text": "Es wird leichter, PLACEHOLDER! Schritt für Schritt."},
  {"id": 93, "text": "Sei mutig, PLACEHOLDER! Veränderung erfordert Mut."},
  {"id": 94, "text": "Hab Vertrauen, PLACEHOLDER! Du bist auf dem richtigen Weg."},
  {"id": 95, "text": "Denk an die Möglichkeiten, PLACEHOLDER! Sie sind endlos."},
  {"id": 96, "text": "Lass los, PLACEHOLDER! Frieden kommt von innen."},
  {"id": 97, "text": "Entwickle Widerstandskraft, PLACEHOLDER! Du wächst daran."},
  {"id": 98, "text": "Öffne dein Herz, PLACEHOLDER! Liebe heilt."},
  {"id": 99, "text": "Finde Ruhe, PLACEHOLDER! In der Stille liegt Stärke."},
  {"id": 100, "text": "Sei du selbst, PLACEHOLDER! Authentizität ist Kraft."}
];
const familieEN =
[
  {"id": 76, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 77, "text": "Hang in there, PLACEHOLDER! Strength often comes from challenges."},
  {"id": 78, "text": "Stay strong, PLACEHOLDER! Your resilience will guide you."},
  {"id": 79, "text": "Trust yourself, PLACEHOLDER! Even small progress is success."},
  {"id": 80, "text": "It will get better, PLACEHOLDER! Change is inevitable."},
  {"id": 81, "text": "Believe in yourself, PLACEHOLDER! Your strength is remarkable."},
  {"id": 82, "text": "Don't give up, PLACEHOLDER! Every day is a new opportunity."},
  {"id": 83, "text": "Keep your head up, PLACEHOLDER! Dark times will pass."},
  {"id": 84, "text": "Be patient, PLACEHOLDER! Good things take time."},
  {"id": 85, "text": "Think positive, PLACEHOLDER! Your mind shapes your reality."},
  {"id": 86, "text": "You're not alone, PLACEHOLDER! Help is always there."},
  {"id": 87, "text": "Look ahead, PLACEHOLDER! The future holds hope."},
  {"id": 88, "text": "Rise up, PLACEHOLDER! You're stronger than you think."},
  {"id": 89, "text": "Recognize your strength, PLACEHOLDER! There's a lot of potential in you."},
  {"id": 90, "text": "Don't give up, PLACEHOLDER! The path to a solution starts with you."},
  {"id": 91, "text": "Stay true to yourself, PLACEHOLDER! Your essence is unique."},
  {"id": 92, "text": "It will get easier, PLACEHOLDER! Step by step."},
  {"id": 93, "text": "Be brave, PLACEHOLDER! Change requires courage."},
  {"id": 94, "text": "Have faith, PLACEHOLDER! You're on the right path."},
  {"id": 95, "text": "Think about the possibilities, PLACEHOLDER! They are endless."},
  {"id": 96, "text": "Let go, PLACEHOLDER! Peace comes from within."},
  {"id": 97, "text": "Build resilience, PLACEHOLDER! You grow through it."},
  {"id": 98, "text": "Open your heart, PLACEHOLDER! Love heals."},
  {"id": 99, "text": "Find peace, PLACEHOLDER! Strength lies in silence."},
  {"id": 100, "text": "Be yourself, PLACEHOLDER! Authenticity is power."}
];
const familieES =[
  {"id": 76, "text": "¡Tú puedes, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 77, "text": "Mantén la fortaleza, PLACEHOLDER! Frecuentemente viene de los desafíos."},
  {"id": 78, "text": "Mantente fuerte, PLACEHOLDER! Tu resiliencia te guiará."},
  {"id": 79, "text": "Confía en ti mismo, PLACEHOLDER! Incluso el progreso pequeño es éxito."},
  {"id": 80, "text": "Mejorará, PLACEHOLDER! El cambio es inevitable."},
  {"id": 81, "text": "Cree en ti mismo, PLACEHOLDER! Tu fuerza es notable."},
  {"id": 82, "text": "No te rindas, PLACEHOLDER! Cada día es una nueva oportunidad."},
  {"id": 83, "text": "Mira hacia arriba, PLACEHOLDER! Los tiempos oscuros pasarán."},
  {"id": 84, "text": "Ten paciencia, PLACEHOLDER! Las cosas buenas llevan tiempo."},
  {"id": 85, "text": "Piensa positivo, PLACEHOLDER! Tu mente forma tu realidad."},
  {"id": 86, "text": "No estás solo, PLACEHOLDER! La ayuda siempre está disponible."},
  {"id": 87, "text": "Mira hacia adelante, PLACEHOLDER! El futuro guarda esperanza."},
  {"id": 88, "text": "Levántate, PLACEHOLDER! Eres más fuerte de lo que piensas."},
  {"id": 89, "text": "Reconoce tu fuerza, PLACEHOLDER! Hay mucho potencial en ti."},
  {"id": 90, "text": "No te rindas, PLACEHOLDER! El camino hacia la solución comienza contigo."},
  {"id": 91, "text": "Sé fiel a ti mismo, PLACEHOLDER! Tu esencia es única."},
  {"id": 92, "text": "Mejorará, PLACEHOLDER! Paso a paso."},
  {"id": 93, "text": "Sé valiente, PLACEHOLDER! El cambio requiere valentía."},
  {"id": 94, "text": "Ten fe, PLACEHOLDER! Estás en el camino correcto."},
  {"id": 95, "text": "Piensa en las posibilidades, PLACEHOLDER! Son infinitas."},
  {"id": 96, "text": "Deja ir, PLACEHOLDER! La paz viene desde dentro."},
  {"id": 97, "text": "Desarrolla resistencia, PLACEHOLDER! Creces a través de ello."},
  {"id": 98, "text": "Abre tu corazón, PLACEHOLDER! El amor sana."},
  {"id": 99, "text": "Encuentra paz, PLACEHOLDER! La fuerza yace en el silencio."},
  {"id": 100, "text": "Sé tú mismo, PLACEHOLDER! La autenticidad es poder."}
];

const partnerschaftenDE = [
  {"id": 101, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 102, "text": "Bleib stark, PLACEHOLDER! Die Wolken werden sich lichten."},
  {"id": 103, "text": "Vertrau auf dich, PLACEHOLDER! Du bist stärker als du denkst."},
  {"id": 104, "text": "Es wird besser, PLACEHOLDER! Halte durch und lass nicht los."},
  {"id": 105, "text": "Glaub an deine Kraft, PLACEHOLDER! Du wächst durch Herausforderungen."},
  {"id": 106, "text": "Mach weiter, PLACEHOLDER! Jeder Schritt bringt dich näher."},
  {"id": 107, "text": "Lass nicht nach, PLACEHOLDER! Du bist auf dem richtigen Weg."},
  {"id": 108, "text": "Mutig vorwärts, PLACEHOLDER! Du bist nicht allein."},
  {"id": 109, "text": "In der Ruhe liegt die Kraft, PLACEHOLDER! Alles wird gut."},
  {"id": 110, "text": "Halt durch, PLACEHOLDER! Gute Dinge brauchen Zeit."},
  {"id": 111, "text": "Denk positiv, PLACEHOLDER! Du verdienst Glück."},
  {"id": 112, "text": "Gib nicht auf, PLACEHOLDER! Jeder Tag ist ein neuer Anfang."},
  {"id": 113, "text": "Sei geduldig, PLACEHOLDER! Veränderungen brauchen Zeit."},
  {"id": 114, "text": "Du bist stark, PLACEHOLDER! Gemeinsam schaffen wir das."},
  {"id": 115, "text": "Kopf hoch, PLACEHOLDER! Das Schlimmste geht vorbei."},
  {"id": 116, "text": "Hoffnung bewahren, PLACEHOLDER! Das Leben überrascht oft."},
  {"id": 117, "text": "Glaube an dich, PLACEHOLDER! Du bist wertvoll."},
  {"id": 118, "text": "Lächle weiter, PLACEHOLDER! Dein Lächeln ist stark."},
  {"id": 119, "text": "Bleib optimistisch, PLACEHOLDER! Gute Dinge kommen."},
  {"id": 120, "text": "Steh auf, PLACEHOLDER! Du bist nicht allein im Sturm."},
  {"id": 121, "text": "Alles wird gut, PLACEHOLDER! Glaube an die Liebe."},
  {"id": 122, "text": "Behalte Hoffnung, PLACEHOLDER! Die Sonne wird wieder scheinen."},
  {"id": 123, "text": "Vertrau auf den Prozess, PLACEHOLDER! Du wirst wachsen."},
  {"id": 124, "text": "Lass das Licht herein, PLACEHOLDER! Dunkelheit vergeht."},
  {"id": 125, "text": "Erinnere dich, PLACEHOLDER! Du bist unbezwingbar."}
];

const partnerschaftenEN = [
  {"id": 101, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 102, "text": "Stay strong, PLACEHOLDER! The clouds will clear."},
  {"id": 103, "text": "Believe in yourself, PLACEHOLDER! You're stronger than you think."},
  {"id": 104, "text": "It will get better, PLACEHOLDER! Hold on and don't let go."},
  {"id": 105, "text": "Have faith in your strength, PLACEHOLDER! You grow through challenges."},
  {"id": 106, "text": "Keep going, PLACEHOLDER! Every step brings you closer."},
  {"id": 107, "text": "Don't give up, PLACEHOLDER! You're on the right path."},
  {"id": 108, "text": "Courageously forward, PLACEHOLDER! You are not alone."},
  {"id": 109, "text": "In calmness lies strength, PLACEHOLDER! Everything will be okay."},
  {"id": 110, "text": "Hang in there, PLACEHOLDER! Good things take time."},
  {"id": 111, "text": "Think positive, PLACEHOLDER! You deserve happiness."},
  {"id": 112, "text": "Don't give up, PLACEHOLDER! Every day is a new beginning."},
  {"id": 113, "text": "Be patient, PLACEHOLDER! Changes take time."},
  {"id": 114, "text": "You are strong, PLACEHOLDER! Together we can do this."},
  {"id": 115, "text": "Chin up, PLACEHOLDER! The worst will pass."},
  {"id": 116, "text": "Maintain hope, PLACEHOLDER! Life often surprises."},
  {"id": 117, "text": "Believe in yourself, PLACEHOLDER! You are valuable."},
  {"id": 118, "text": "Keep smiling, PLACEHOLDER! Your smile is powerful."},
  {"id": 119, "text": "Stay optimistic, PLACEHOLDER! Good things are coming."},
  {"id": 120, "text": "Rise up, PLACEHOLDER! You are not alone in the storm."},
  {"id": 121, "text": "Everything will be okay, PLACEHOLDER! Believe in love."},
  {"id": 122, "text": "Hold onto hope, PLACEHOLDER! The sun will shine again."},
  {"id": 123, "text": "Trust the process, PLACEHOLDER! You will grow."},
  {"id": 124, "text": "Let the light in, PLACEHOLDER! Darkness fades."},
  {"id": 125, "text": "Remember, PLACEHOLDER! You are unstoppable."}
];

const partnerschaftenES = [
  {"id": 101, "text": "¡Tú puedes, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 102, "text": "Mantente fuerte, PLACEHOLDER! Las nubes se dispersarán."},
  {"id": 103, "text": "Confía en ti, PLACEHOLDER! Eres más fuerte de lo que piensas."},
  {"id": 104, "text": "Mejorará, PLACEHOLDER! Aguanta y no te rindas."},
  {"id": 105, "text": "Ten fe en tu fuerza, PLACEHOLDER! Crecerás a través de los desafíos."},
  {"id": 106, "text": "Continúa, PLACEHOLDER! Cada paso te acerca."},
  {"id": 107, "text": "No te rindas, PLACEHOLDER! Estás en el camino correcto."},
  {"id": 108, "text": "Avanza con valentía, PLACEHOLDER! No estás solo."},
  {"id": 109, "text": "En la calma está la fuerza, PLACEHOLDER! Todo estará bien."},
  {"id": 110, "text": "Mantente firme, PLACEHOLDER! Las cosas buenas llevan tiempo."},
  {"id": 111, "text": "Piensa positivo, PLACEHOLDER! Te mereces la felicidad."},
  {"id": 112, "text": "No te rindas, PLACEHOLDER! Cada día es un nuevo comienzo."},
  {"id": 113, "text": "Ten paciencia, PLACEHOLDER! Los cambios llevan tiempo."},
  {"id": 114, "text": "Eres fuerte, PLACEHOLDER! Juntos podemos hacer esto."},
  {"id": 115, "text": "Mira hacia arriba, PLACEHOLDER! Lo peor pasará."},
  {"id": 116, "text": "Mantén la esperanza, PLACEHOLDER! La vida sorprende a menudo."},
  {"id": 117, "text": "Cree en ti, PLACEHOLDER! Eres valioso."},
  {"id": 118, "text": "Sigue sonriendo, PLACEHOLDER! Tu sonrisa es poderosa."},
  {"id": 119, "text": "Mantén el optimismo, PLACEHOLDER! Cosas buenas vienen."},
  {"id": 120, "text": "Levántate, PLACEHOLDER! No estás solo en la tormenta."},
  {"id": 121, "text": "Todo estará bien, PLACEHOLDER! Cree en el amor."},
  {"id": 122, "text": "Mantén la esperanza, PLACEHOLDER! El sol brillará de nuevo."},
  {"id": 123, "text": "Confía en el proceso, PLACEHOLDER! Crecerás."},
  {"id": 124, "text": "Deja entrar la luz, PLACEHOLDER! La oscuridad desaparece."},
  {"id": 125, "text": "Recuerda, PLACEHOLDER! Eres imparable."}
];

const einsamkeitDE = [
  {"id": 126, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 127, "text": "Halte durch, PLACEHOLDER! Das Licht am Ende des Tunnels wird immer heller."},
  {"id": 128, "text": "Vergiss nicht, PLACEHOLDER, du bist stärker als du denkst."},
  {"id": 129, "text": "Die Sonne wird auch für dich wieder scheinen, PLACEHOLDER."},
  {"id": 130, "text": "Egal, wie schwer es gerade ist, PLACEHOLDER, du bist nicht allein."},
  {"id": 131, "text": "Es wird besser, PLACEHOLDER. Glaub an dich selbst."},
  {"id": 132, "text": "Du bist nicht nur gut genug, PLACEHOLDER, du bist großartig."},
  {"id": 133, "text": "Jeder Tag ist eine neue Möglichkeit, PLACEHOLDER. Nutze sie."},
  {"id": 134, "text": "Die Welt braucht jemanden wie dich, PLACEHOLDER. Sei stolz auf dich."},
  {"id": 135, "text": "Lass dich nicht entmutigen, PLACEHOLDER. Du machst Fortschritte."},
  {"id": 136, "text": "Deine Stärke ist bewundernswert, PLACEHOLDER. Weiter so!"},
  {"id": 137, "text": "Es ist okay, sich Hilfe zu holen, PLACEHOLDER. Du bist nicht allein."},
  {"id": 138, "text": "Denk daran, PLACEHOLDER, jeder Tag ist ein neues Kapitel."},
  {"id": 139, "text": "In der Ruhe liegt die Kraft, PLACEHOLDER. Nimm dir Zeit für dich."},
  {"id": 140, "text": "Du bist einzigartig, PLACEHOLDER. Zeig der Welt dein Strahlen."},
  {"id": 141, "text": "Vertrau auf den Prozess, PLACEHOLDER. Gute Dinge kommen."},
  {"id": 142, "text": "Bleib positiv, PLACEHOLDER. Du bist auf dem richtigen Weg."},
  {"id": 143, "text": "Lass die Vergangenheit los, PLACEHOLDER. Die Zukunft hält Gutes bereit."},
  {"id": 144, "text": "Akzeptiere deine Gefühle, PLACEHOLDER. Sie machen dich stark."},
  {"id": 145, "text": "Glaube an die Magie des Anfangs, PLACEHOLDER. Alles ist möglich."},
  {"id": 146, "text": "Sei geduldig mit dir selbst, PLACEHOLDER. Du machst Fortschritte."},
  {"id": 147, "text": "Versuch es mit einem Lächeln, PLACEHOLDER. Es kann Wunder wirken."},
  {"id": 148, "text": "Erinnere dich daran, PLACEHOLDER, dass du geliebt wirst."},
  {"id": 149, "text": "Deine Reise ist einzigartig, PLACEHOLDER. Genieße sie."},
  {"id": 150, "text": "Jede Wolke hat einen silbernen Rand, PLACEHOLDER. Halte durch."}
];


const einsamtkeitEN =[
  {"id": 126, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 127, "text": "Hang in there, PLACEHOLDER! The light at the end of the tunnel is getting brighter."},
  {"id": 128, "text": "Don't forget, PLACEHOLDER, you are stronger than you think."},
  {"id": 129, "text": "The sun will shine for you too, PLACEHOLDER."},
  {"id": 130, "text": "No matter how tough it is right now, PLACEHOLDER, you are not alone."},
  {"id": 131, "text": "It will get better, PLACEHOLDER. Believe in yourself."},
  {"id": 132, "text": "You are not just good enough, PLACEHOLDER, you are amazing."},
  {"id": 133, "text": "Every day is a new opportunity, PLACEHOLDER. Seize it."},
  {"id": 134, "text": "The world needs someone like you, PLACEHOLDER. Be proud of yourself."},
  {"id": 135, "text": "Don't be discouraged, PLACEHOLDER. You are making progress."},
  {"id": 136, "text": "Your strength is admirable, PLACEHOLDER. Keep it up!"},
  {"id": 137, "text": "It's okay to seek help, PLACEHOLDER. You are not alone."},
  {"id": 138, "text": "Remember, PLACEHOLDER, every day is a new chapter."},
  {"id": 139, "text": "In stillness lies strength, PLACEHOLDER. Take time for yourself."},
  {"id": 140, "text": "You are unique, PLACEHOLDER. Show the world your radiance."},
  {"id": 141, "text": "Trust the process, PLACEHOLDER. Good things are coming."},
  {"id": 142, "text": "Stay positive, PLACEHOLDER. You are on the right path."},
  {"id": 143, "text": "Let go of the past, PLACEHOLDER. The future holds good things."},
  {"id": 144, "text": "Accept your feelings, PLACEHOLDER. They make you strong."},
  {"id": 145, "text": "Believe in the magic of beginnings, PLACEHOLDER. Anything is possible."},
  {"id": 146, "text": "Be patient with yourself, PLACEHOLDER. You are making progress."},
  {"id": 147, "text": "Try with a smile, PLACEHOLDER. It can work wonders."},
  {"id": 148, "text": "Remember, PLACEHOLDER, that you are loved."},
  {"id": 149, "text": "Your journey is unique, PLACEHOLDER. Enjoy it."},
  {"id": 150, "text": "Every cloud has a silver lining, PLACEHOLDER. Hang in there."}
];

const einsamtkeitES = [
  {"id": 126, "text": "¡Tú puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 127, "text": "Resiste, PLACEHOLDER. La luz al final del túnel se hace más brillante."},
  {"id": 128, "text": "No olvides, PLACEHOLDER, eres más fuerte de lo que piensas."},
  {"id": 129, "text": "El sol también brillará para ti, PLACEHOLDER."},
  {"id": 130, "text": "No importa lo difícil que sea en este momento, PLACEHOLDER, no estás solo/a."},
  {"id": 131, "text": "Mejorará, PLACEHOLDER. Cree en ti mismo/a."},
  {"id": 132, "text": "No solo eres suficiente, PLACEHOLDER, eres increíble."},
  {"id": 133, "text": "Cada día es una nueva oportunidad, PLACEHOLDER. Aprovéchala."},
  {"id": 134, "text": "El mundo necesita a alguien como tú, PLACEHOLDER. Siéntete orgulloso/a de ti mismo/a."},
  {"id": 135, "text": "No te desanimes, PLACEHOLDER. Estás progresando."},
  {"id": 136, "text": "Tu fuerza es admirable, PLACEHOLDER. ¡Sigue así!"},
  {"id": 137, "text": "Está bien buscar ayuda, PLACEHOLDER. No estás solo/a."},
  {"id": 138, "text": "Recuerda, PLACEHOLDER, cada día es un nuevo capítulo."},
  {"id": 139, "text": "En la calma reside la fuerza, PLACEHOLDER. Tómate tiempo para ti mismo/a."},
  {"id": 140, "text": "Eres único/a, PLACEHOLDER. Muestra al mundo tu resplandor."},
  {"id": 141, "text": "Confía en el proceso, PLACEHOLDER. Cosas buenas están por venir."},
  {"id": 142, "text": "Mantén una actitud positiva, PLACEHOLDER. Estás en el camino correcto."},
  {"id": 143, "text": "Deja ir el pasado, PLACEHOLDER. El futuro trae cosas buenas."},
  {"id": 144, "text": "Acepta tus sentimientos, PLACEHOLDER. Te hacen fuerte."},
  {"id": 145, "text": "Cree en la magia de los comienzos, PLACEHOLDER. Todo es posible."},
  {"id": 146, "text": "Ten paciencia contigo mismo/a, PLACEHOLDER. Estás progresando."},
  {"id": 147, "text": "Intenta con una sonrisa, PLACEHOLDER. Puede hacer maravillas."},
  {"id": 148, "text": "Recuerda, PLACEHOLDER, que eres amado/a."},
  {"id": 149, "text": "Tu viaje es único, PLACEHOLDER. Disfrútalo."},
  {"id": 150, "text": "Cada nube tiene un lado positivo, PLACEHOLDER. Aguanta."},
  {"id": 151, "text": "El mundo es mejor contigo, PLACEHOLDER. No lo olvides."}
];

const freundschaftenDE = [
  {"id": 151, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 152, "text": "Halte durch, PLACEHOLDER! Freundschaften entwickeln sich mit der Zeit."},
  {"id": 153, "text": "Kopf hoch, PLACEHOLDER! Du bist nicht allein in diesem Prozess."},
  {"id": 154, "text": "Glaube an dich, PLACEHOLDER! Gute Freundschaften brauchen Geduld."},
  {"id": 155, "text": "Sei geduldig, PLACEHOLDER! Wahre Freunde kommen, wenn du es am wenigsten erwartest."},
  {"id": 156, "text": "Vertraue dem Prozess, PLACEHOLDER! Du wirst Menschen finden, die zu dir passen."},
  {"id": 157, "text": "Denk daran, PLACEHOLDER! Selbstbewusstsein zieht positive Beziehungen an."},
  {"id": 158, "text": "Sei du selbst, PLACEHOLDER! Echte Freunde mögen dich so, wie du bist."},
  {"id": 159, "text": "Nimm dir Zeit, PLACEHOLDER! Qualität geht vor Quantität in Freundschaften."},
  {"id": 160, "text": "Bleib offen, PLACEHOLDER! Neue Freundschaften können wunderbare Erfahrungen bringen."},
  {"id": 161, "text": "Lass dich nicht entmutigen, PLACEHOLDER! Gute Freunde sind das Warten wert."},
  {"id": 162, "text": "Erinnere dich, PLACEHOLDER! Jeder hat Höhen und Tiefen in Beziehungen."},
  {"id": 163, "text": "Entwickle Selbstliebe, PLACEHOLDER! Wahre Freundschaft beginnt mit dir selbst."},
  {"id": 164, "text": "Bleib authentisch, PLACEHOLDER! Wahre Freunde mögen dich für deine Echtheit."},
  {"id": 165, "text": "Du bist einzigartig, PLACEHOLDER! Finde Menschen, die das schätzen."},
  {"id": 166, "text": "Gib nicht auf, PLACEHOLDER! Gute Freundschaften erfordern Ausdauer."},
  {"id": 167, "text": "Sei mutig, PLACEHOLDER! Freundschaften entstehen oft durch Initiative."},
  {"id": 168, "text": "Denk positiv, PLACEHOLDER! Die richtigen Freunde kommen zur richtigen Zeit."},
  {"id": 169, "text": "Akzeptiere Veränderungen, PLACEHOLDER! Freundschaften können wachsen und sich entwickeln."},
  {"id": 170, "text": "Halte an deinen Werten fest, PLACEHOLDER! Wahre Freunde teilen deine Überzeugungen."},
  {"id": 171, "text": "Glaube an die Zukunft, PLACEHOLDER! Tolle Freundschaften liegen noch vor dir."},
  {"id": 172, "text": "Sei großzügig mit Vergebung, PLACEHOLDER! Fehler gehören zu jeder Freundschaft."},
  {"id": 173, "text": "Bleib optimistisch, PLACEHOLDER! Die richtigen Menschen werden dein Leben bereichern."},
  {"id": 174, "text": "Feiere kleine Fortschritte, PLACEHOLDER! Freundschaften entwickeln sich schrittweise."},
  {"id": 175, "text": "Erwarte nicht zu viel, PLACEHOLDER! Freundschaften sind ein stetiger Prozess."},
];

const freundschaftenEN =  [
  {"id": 151, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 152, "text": "Hang in there, PLACEHOLDER! Friendships evolve over time."},
  {"id": 153, "text": "Chin up, PLACEHOLDER! You're not alone in this process."},
  {"id": 154, "text": "Believe in yourself, PLACEHOLDER! Good friendships require patience."},
  {"id": 155, "text": "Be patient, PLACEHOLDER! True friends come when you least expect it."},
  {"id": 156, "text": "Trust the process, PLACEHOLDER! You will find people who resonate with you."},
  {"id": 157, "text": "Remember, PLACEHOLDER! Confidence attracts positive relationships."},
  {"id": 158, "text": "Be yourself, PLACEHOLDER! Real friends like you for who you are."},
  {"id": 159, "text": "Take your time, PLACEHOLDER! Quality matters more than quantity in friendships."},
  {"id": 160, "text": "Stay open, PLACEHOLDER! New friendships can bring wonderful experiences."},
  {"id": 161, "text": "Don't get discouraged, PLACEHOLDER! Good friends are worth the wait."},
  {"id": 162, "text": "Recall, PLACEHOLDER! Everyone experiences highs and lows in relationships."},
  {"id": 163, "text": "Cultivate self-love, PLACEHOLDER! True friendship begins with yourself."},
  {"id": 164, "text": "Stay authentic, PLACEHOLDER! True friends appreciate your authenticity."},
  {"id": 165, "text": "You're unique, PLACEHOLDER! Find people who value that."},
  {"id": 166, "text": "Don't give up, PLACEHOLDER! Good friendships require persistence."},
  {"id": 167, "text": "Be brave, PLACEHOLDER! Friendships often begin with initiative."},
  {"id": 168, "text": "Think positive, PLACEHOLDER! The right friends come at the right time."},
  {"id": 169, "text": "Accept changes, PLACEHOLDER! Friendships can grow and evolve."},
  {"id": 170, "text": "Hold onto your values, PLACEHOLDER! True friends share your beliefs."},
  {"id": 171, "text": "Believe in the future, PLACEHOLDER! Great friendships are ahead of you."},
  {"id": 172, "text": "Be generous with forgiveness, PLACEHOLDER! Mistakes are part of every friendship."},
  {"id": 173, "text": "Stay optimistic, PLACEHOLDER! The right people will enrich your life."},
  {"id": 174, "text": "Celebrate small progress, PLACEHOLDER! Friendships develop gradually."},
  {"id": 175, "text": "Don't expect too much, PLACEHOLDER! Friendships are a continuous process."},
];

const freundschaftenES = [
  {"id": 151, "text": "¡Tú puedes con esto, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 152, "text": "Mantente firme, PLACEHOLDER! Las amistades evolucionan con el tiempo."},
  {"id": 153, "text": "Ánimo, PLACEHOLDER! No estás solo/a en este proceso."},
  {"id": 154, "text": "Cree en ti mismo/a, PLACEHOLDER! Las buenas amistades requieren paciencia."},
  {"id": 155, "text": "Ten paciencia, PLACEHOLDER! Los verdaderos amigos llegan cuando menos lo esperas."},
  {"id": 156, "text": "Confía en el proceso, PLACEHOLDER! Encontrarás personas que conecten contigo."},
  {"id": 157, "text": "Recuerda, PLACEHOLDER! La confianza atrae relaciones positivas."},
  {"id": 158, "text": "Sé tú mismo/a, PLACEHOLDER! Los verdaderos amigos te aprecian tal como eres."},
  {"id": 159, "text": "Tómate tu tiempo, PLACEHOLDER! La calidad es más importante que la cantidad en las amistades."},
  {"id": 160, "text": "Mantente abierto/a, PLACEHOLDER! Nuevas amistades pueden traer experiencias maravillosas."},
  {"id": 161, "text": "No te desanimes, PLACEHOLDER! Los buenos amigos valen la espera."},
  {"id": 162, "text": "Recuerda, PLACEHOLDER! Todos experimentan altibajos en las relaciones."},
  {"id": 163, "text": "Cultiva el amor propio, PLACEHOLDER! La verdadera amistad comienza contigo mismo/a."},
  {"id": 164, "text": "Sé auténtico/a, PLACEHOLDER! Los verdaderos amigos aprecian tu autenticidad."},
  {"id": 165, "text": "Eres único/a, PLACEHOLDER! Encuentra personas que valoren eso."},
  {"id": 166, "text": "No te rindas, PLACEHOLDER! Las buenas amistades requieren persistencia."},
  {"id": 167, "text": "Sé valiente, PLACEHOLDER! Las amistades a menudo comienzan con iniciativa."},
  {"id": 168, "text": "Piensa positivo, PLACEHOLDER! Los amigos adecuados llegan en el momento adecuado."},
  {"id": 169, "text": "Acepta los cambios, PLACEHOLDER! Las amistades pueden crecer y evolucionar."},
  {"id": 170, "text": "Mantén tus valores, PLACEHOLDER! Los verdaderos amigos comparten tus creencias."},
  {"id": 171, "text": "Cree en el futuro, PLACEHOLDER! Grandes amistades están por venir."},
  {"id": 172, "text": "Sé generoso/a con el perdón, PLACEHOLDER! Los errores son parte de toda amistad."},
  {"id": 173, "text": "Mantén el optimismo, PLACEHOLDER! Las personas adecuadas enriquecerán tu vida."},
  {"id": 174, "text": "Celebra pequeños avances, PLACEHOLDER! Las amistades se desarrollan gradualmente."},
  {"id": 175, "text": "No esperes demasiado, PLACEHOLDER! Las amistades son un proceso continuo."},
];

const TrauerBewaeltigungDE = [
  {"id": 176, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 177, "text": "Gib nicht auf, PLACEHOLDER! Die Sonne wird wieder für dich scheinen."},
  {"id": 178, "text": "Erinnere dich an die schönen Zeiten, PLACEHOLDER. Sie werden immer in deinem Herzen sein."},
  {"id": 179, "text": "Jeder Tag ist ein Schritt nach vorne, PLACEHOLDER. Du bist nicht allein."},
  {"id": 180, "text": "Die Trauer wird leichter mit der Zeit, PLACEHOLDER. Sei geduldig mit dir selbst."},
  {"id": 181, "text": "Halte die Erinnerungen fest, PLACEHOLDER. Sie sind ein Schatz, der bleibt."},
  {"id": 182, "text": "Es ist okay zu trauern, PLACEHOLDER. Lass deine Gefühle zu."},
  {"id": 183, "text": "Die Liebe bleibt, auch wenn die Person geht, PLACEHOLDER. Du bist geliebt."},
  {"id": 184, "text": "Dein Schmerz ist gültig, PLACEHOLDER. Nimm dir die Zeit, die du brauchst."},
  {"id": 185, "text": "Denke daran, dass du stark bist, PLACEHOLDER. Du kannst das überwinden."},
  {"id": 186, "text": "In der Dunkelheit findest du auch Kraft, PLACEHOLDER. Du bist nicht allein."},
  {"id": 187, "text": "Trauer hat keine Zeitbegrenzung, PLACEHOLDER. Gehe deinen eigenen Weg."},
  {"id": 188, "text": "Umarme die Trauer, aber lass sie nicht dein Licht nehmen, PLACEHOLDER."},
  {"id": 189, "text": "Die Vergangenheit bleibt in Erinnerungen, PLACEHOLDER. Die Zukunft liegt noch vor dir."},
  {"id": 190, "text": "Es ist okay, nach Unterstützung zu suchen, PLACEHOLDER. Du musst nicht alleine durch diesen Schmerz gehen."},
  {"id": 191, "text": "Denke daran, dass du nicht stark sein musst, PLACEHOLDER. Es ist in Ordnung, verletzlich zu sein."},
  {"id": 192, "text": "Halte an Hoffnung fest, PLACEHOLDER. Sie wird dich durch trübe Tage führen."},
  {"id": 193, "text": "Deine Gefühle sind wichtig, PLACEHOLDER. Lass sie zu und lass sie gehen."},
  {"id": 194, "text": "Du bist nicht allein auf diesem Weg, PLACEHOLDER. Gemeinsam sind wir stark."},
  {"id": 195, "text": "Die Trauer verbindet uns alle, PLACEHOLDER. Du bist Teil einer unterstützenden Gemeinschaft."},
  {"id": 196, "text": "Jeder Tag ist ein neuer Schritt in Richtung Heilung, PLACEHOLDER. Nimm dir die Zeit, die du brauchst."},
  {"id": 197, "text": "Es ist in Ordnung, sich an glückliche Momente zu erinnern, PLACEHOLDER. Sie werden dich tragen."},
  {"id": 198, "text": "Du bist stärker, als du denkst, PLACEHOLDER. Glaube an dich selbst."},
  {"id": 199, "text": "Die Liebe, die du fühlst, bleibt bestehen, PLACEHOLDER. Sie wird immer da sein."},
  {"id": 200, "text": "Gib nicht auf, PLACEHOLDER. Das Leben hält noch viele schöne Momente für dich bereit."}
];

const TrauerBewaeltigungEN = [ 
  {"id": 176, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 177, "text": "Don't give up, PLACEHOLDER! The sun will shine for you again."},
  {"id": 178, "text": "Remember the beautiful times, PLACEHOLDER. They will always be in your heart."},
  {"id": 179, "text": "Every day is a step forward, PLACEHOLDER. You are not alone."},
  {"id": 180, "text": "Grief gets lighter with time, PLACEHOLDER. Be patient with yourself."},
  {"id": 181, "text": "Hold on to the memories, PLACEHOLDER. They are a treasure that remains."},
  {"id": 182, "text": "It's okay to grieve, PLACEHOLDER. Allow yourself to feel."},
  {"id": 183, "text": "Love remains even when the person is gone, PLACEHOLDER. You are loved."},
  {"id": 184, "text": "Your pain is valid, PLACEHOLDER. Take the time you need."},
  {"id": 185, "text": "Remember, you are strong, PLACEHOLDER. You can overcome this."},
  {"id": 186, "text": "In darkness, you will find strength too, PLACEHOLDER. You are not alone."},
  {"id": 187, "text": "Grief has no time limit, PLACEHOLDER. Forge your own path."},
  {"id": 188, "text": "Embrace the grief but don't let it take your light, PLACEHOLDER."},
  {"id": 189, "text": "The past remains in memories, PLACEHOLDER. The future is still ahead of you."},
  {"id": 190, "text": "It's okay to seek support, PLACEHOLDER. You don't have to go through this pain alone."},
  {"id": 191, "text": "Remember, you don't have to be strong, PLACEHOLDER. It's okay to be vulnerable."},
  {"id": 192, "text": "Hold on to hope, PLACEHOLDER. It will guide you through cloudy days."},
  {"id": 193, "text": "Your feelings matter, PLACEHOLDER. Allow them and let them go."},
  {"id": 194, "text": "You are not alone on this journey, PLACEHOLDER. Together, we are strong."},
  {"id": 195, "text": "Grief connects us all, PLACEHOLDER. You are part of a supportive community."},
  {"id": 196, "text": "Every day is a new step towards healing, PLACEHOLDER. Take the time you need."},
  {"id": 197, "text": "It's okay to remember happy moments, PLACEHOLDER. They will carry you."},
  {"id": 198, "text": "You are stronger than you think, PLACEHOLDER. Believe in yourself."},
  {"id": 199, "text": "The love you feel remains, PLACEHOLDER. It will always be there."},
  {"id": 200, "text": "Don't give up, PLACEHOLDER. Life still holds many beautiful moments for you."}
];

const TrauerBewaeltigungES = [
  {"id": 176, "text": "Puedes hacerlo, PLACEHOLDER. Cada comienzo es una oportunidad."},
  {"id": 177, "text": "No te rindas, PLACEHOLDER. El sol volverá a brillar para ti."},
  {"id": 178, "text": "Recuerda los momentos hermosos, PLACEHOLDER. Siempre estarán en tu corazón."},
  {"id": 179, "text": "Cada día es un paso hacia adelante, PLACEHOLDER. No estás solo/a."},
  {"id": 180, "text": "El dolor disminuirá con el tiempo, PLACEHOLDER. Ten paciencia contigo mismo/a."},
  {"id": 181, "text": "Guarda los recuerdos, PLACEHOLDER. Son un tesoro que perdura."},
  {"id": 182, "text": "Está bien sentir dolor, PLACEHOLDER. Permítete experimentarlo."},
  {"id": 183, "text": "El amor perdura incluso cuando la persona se va, PLACEHOLDER. Eres amado/a."},
  {"id": 184, "text": "Tu dolor es válido, PLACEHOLDER. Tómate el tiempo que necesites."},
  {"id": 185, "text": "Recuerda que eres fuerte, PLACEHOLDER. Puedes superar esto."},
  {"id": 186, "text": "En la oscuridad encontrarás fuerza, PLACEHOLDER. No estás solo/a."},
  {"id": 187, "text": "El duelo no tiene límite de tiempo, PLACEHOLDER. Forja tu propio camino."},
  {"id": 188, "text": "Abraza el duelo, pero no dejes que apague tu luz, PLACEHOLDER."},
  {"id": 189, "text": "El pasado permanece en los recuerdos, PLACEHOLDER. El futuro aún está por delante."},
  {"id": 190, "text": "Está bien buscar apoyo, PLACEHOLDER. No tienes que pasar por este dolor solo/a."},
  {"id": 191, "text": "Recuerda, no tienes que ser fuerte, PLACEHOLDER. Está bien ser vulnerable."},
  {"id": 192, "text": "Aférrate a la esperanza, PLACEHOLDER. Te guiará en días nublados."},
  {"id": 193, "text": "Tus sentimientos importan, PLACEHOLDER. Permíteles fluir y dejarlos ir."},
  {"id": 194, "text": "No estás solo/a en este camino, PLACEHOLDER. Juntos, somos fuertes."},
  {"id": 195, "text": "El duelo nos conecta a todos, PLACEHOLDER. Eres parte de una comunidad solidaria."},
  {"id": 196, "text": "Cada día es un nuevo paso hacia la curación, PLACEHOLDER. Tómate el tiempo que necesites."},
  {"id": 197, "text": "Está bien recordar momentos felices, PLACEHOLDER. Te llevarán adelante."},
  {"id": 198, "text": "Eres más fuerte de lo que piensas, PLACEHOLDER. Cree en ti mismo/a."},
  {"id": 199, "text": "El amor que sientes perdura, PLACEHOLDER. Siempre estará ahí."},
  {"id": 200, "text": "No te rindas, PLACEHOLDER. La vida aún guarda muchos momentos hermosos para ti."}
];

const TrennungDE = [
  {"id": 201, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 202, "text": "Glaub an dich, PLACEHOLDER! Du bist stärker, als du denkst."},
  {"id": 203, "text": "Die Zeit heilt, PLACEHOLDER. Halte durch, es wird besser."},
  {"id": 204, "text": "Sei stolz auf deine Stärke, PLACEHOLDER. Du wirst wachsen."},
  {"id": 205, "text": "Der Weg mag schwer sein, PLACEHOLDER, aber du bist nicht allein."},
  {"id": 206, "text": "Jeder Tag ist ein neuer Schritt, PLACEHOLDER. Schau nach vorne."},
  {"id": 207, "text": "Lass los, PLACEHOLDER. Neue Chancen warten auf dich."},
  {"id": 208, "text": "Bleib positiv, PLACEHOLDER! Gutes kommt auf dich zu."},
  {"id": 209, "text": "Deine Stärke beeindruckt, PLACEHOLDER. Weiter so!"},
  {"id": 210, "text": "Die Sonne wird wieder scheinen, PLACEHOLDER. Glaub daran."},
  {"id": 211, "text": "Veränderung ist schwer, PLACEHOLDER, aber auch notwendig."},
  {"id": 212, "text": "Deine Zukunft ist offen, PLACEHOLDER. Gestalte sie nach deinen Wünschen."},
  {"id": 213, "text": "Jeder Tag bringt Heilung, PLACEHOLDER. Sei geduldig mit dir selbst."},
  {"id": 214, "text": "Du bist nicht allein, PLACEHOLDER. Freunde stehen an deiner Seite."},
  {"id": 215, "text": "Halte an deinen Träumen fest, PLACEHOLDER. Sie geben dir Kraft."},
  {"id": 216, "text": "Die Vergangenheit definiert nicht deine Zukunft, PLACEHOLDER."},
  {"id": 217, "text": "Blicke nach vorne, PLACEHOLDER. Dort liegt deine Stärke."},
  {"id": 218, "text": "Selbst in der Dunkelheit, PLACEHOLDER, findest du Licht."},
  {"id": 219, "text": "Lerne aus der Vergangenheit, PLACEHOLDER. Wachse daran."},
  {"id": 220, "text": "Du verdienst Glück, PLACEHOLDER. Suche danach."},
  {"id": 221, "text": "Das Leben hält Überraschungen bereit, PLACEHOLDER. Sei offen dafür."},
  {"id": 222, "text": "Bleib authentisch, PLACEHOLDER. Deine Echtheit ist deine Stärke."},
  {"id": 223, "text": "Dein Herz heilt mit der Zeit, PLACEHOLDER. Schenke ihm Zeit."},
  {"id": 224, "text": "Du bist auf dem Weg zu einer besseren Version von dir, PLACEHOLDER."},
  {"id": 225, "text": "Jede Träne trägt zur Heilung bei, PLACEHOLDER. Weine, wenn du musst."}
];

const TrennungEN = [
  {"id": 201, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 202, "text": "Believe in yourself, PLACEHOLDER! You are stronger than you think."},
  {"id": 203, "text": "Time heals, PLACEHOLDER. Hang in there, it will get better."},
  {"id": 204, "text": "Be proud of your strength, PLACEHOLDER. You will grow."},
  {"id": 205, "text": "The path may be difficult, PLACEHOLDER, but you are not alone."},
  {"id": 206, "text": "Every day is a new step, PLACEHOLDER. Look forward."},
  {"id": 207, "text": "Let go, PLACEHOLDER. New opportunities await you."},
  {"id": 208, "text": "Stay positive, PLACEHOLDER! Good things are coming your way."},
  {"id": 209, "text": "Your strength is impressive, PLACEHOLDER. Keep going!"},
  {"id": 210, "text": "The sun will shine again, PLACEHOLDER. Believe in it."},
  {"id": 211, "text": "Change is hard, PLACEHOLDER, but also necessary."},
  {"id": 212, "text": "Your future is open, PLACEHOLDER. Shape it according to your desires."},
  {"id": 213, "text": "Every day brings healing, PLACEHOLDER. Be patient with yourself."},
  {"id": 214, "text": "You are not alone, PLACEHOLDER. Friends stand by your side."},
  {"id": 215, "text": "Hold on to your dreams, PLACEHOLDER. They give you strength."},
  {"id": 216, "text": "The past does not define your future, PLACEHOLDER."},
  {"id": 217, "text": "Look forward, PLACEHOLDER. There lies your strength."},
  {"id": 218, "text": "Even in darkness, PLACEHOLDER, you will find light."},
  {"id": 219, "text": "Learn from the past, PLACEHOLDER. Grow from it."},
  {"id": 220, "text": "You deserve happiness, PLACEHOLDER. Seek it."},
  {"id": 221, "text": "Life holds surprises, PLACEHOLDER. Be open to them."},
  {"id": 222, "text": "Stay authentic, PLACEHOLDER. Your authenticity is your strength."},
  {"id": 223, "text": "Your heart heals with time, PLACEHOLDER. Give it time."},
  {"id": 224, "text": "You are on the way to a better version of yourself, PLACEHOLDER."},
  {"id": 225, "text": "Every tear contributes to healing, PLACEHOLDER. Cry if you must."}
];

const TrennungES = [
  {"id": 201, "text": "¡Puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 202, "text": "Cree en ti mismo, PLACEHOLDER. Eres más fuerte de lo que piensas."},
  {"id": 203, "text": "El tiempo cura, PLACEHOLDER. Aguanta, mejorará."},
  {"id": 204, "text": "Siéntete orgulloso de tu fuerza, PLACEHOLDER. Crecerás."},
  {"id": 205, "text": "El camino puede ser difícil, PLACEHOLDER, pero no estás solo."},
  {"id": 206, "text": "Cada día es un nuevo paso, PLACEHOLDER. Mira hacia adelante."},
  {"id": 207, "text": "Deja ir, PLACEHOLDER. Nuevas oportunidades te esperan."},
  {"id": 208, "text": "Mantén una actitud positiva, PLACEHOLDER. Cosas buenas vienen hacia ti."},
  {"id": 209, "text": "Tu fuerza es impresionante, PLACEHOLDER. ¡Sigue adelante!"},
  {"id": 210, "text": "El sol volverá a brillar, PLACEHOLDER. Créelo."},
  {"id": 211, "text": "El cambio es difícil, PLACEHOLDER, pero necesario."},
  {"id": 212, "text": "Tu futuro está abierto, PLACEHOLDER. Dále forma según tus deseos."},
  {"id": 213, "text": "Cada día trae curación, PLACEHOLDER. Ten paciencia contigo mismo."},
  {"id": 214, "text": "No estás solo, PLACEHOLDER. Los amigos están a tu lado."},
  {"id": 215, "text": "Aférrate a tus sueños, PLACEHOLDER. Te dan fuerza."},
  {"id": 216, "text": "El pasado no define tu futuro, PLACEHOLDER."},
  {"id": 217, "text": "Mira hacia adelante, PLACEHOLDER. Allí está tu fuerza."},
  {"id": 218, "text": "Incluso en la oscuridad, PLACEHOLDER, encontrarás luz."},
  {"id": 219, "text": "Aprende del pasado, PLACEHOLDER. Crece a partir de él."},
  {"id": 220, "text": "Mereces la felicidad, PLACEHOLDER. Búscala."},
  {"id": 221, "text": "La vida tiene sorpresas, PLACEHOLDER. Abre tu mente a ellas."},
  {"id": 222, "text": "Mantente auténtico, PLACEHOLDER. Tu autenticidad es tu fuerza."},
  {"id": 223, "text": "Tu corazón se cura con el tiempo, PLACEHOLDER. Dale tiempo."},
  {"id": 224, "text": "Estás en camino a una mejor versión de ti mismo, PLACEHOLDER."},
  {"id": 225, "text": "Cada lágrima contribuye a la curación, PLACEHOLDER. Llora si es necesario."}
];

const SinnfindungDE = [
  {"id": 251, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 252, "text": "Glaube an dich, PLACEHOLDER! Selbst kleine Fortschritte sind Erfolge."},
  {"id": 253, "text": "Halte durch, PLACEHOLDER! Deine Stärke wird belohnt."},
  {"id": 254, "text": "Bleib dran, PLACEHOLDER! Die Reise ist genauso wichtig wie das Ziel."},
  {"id": 255, "text": "Vertrau dir, PLACEHOLDER! Du bist stärker, als du denkst."},
  {"id": 256, "text": "Lass dich nicht entmutigen, PLACEHOLDER! Jeder Tag ist eine neue Chance."},
  {"id": 257, "text": "Sei geduldig, PLACEHOLDER! Gute Dinge brauchen Zeit."},
  {"id": 258, "text": "Bleib positiv, PLACEHOLDER! Positives Denken öffnet Türen."},
  {"id": 259, "text": "Erinnere dich an deine Stärken, PLACEHOLDER! Du bist einzigartig."},
  {"id": 260, "text": "Akzeptiere Veränderungen, PLACEHOLDER! Sie führen zu Wachstum."},
  {"id": 261, "text": "Du bist nicht allein, PLACEHOLDER! Gemeinsam sind wir stark."},
  {"id": 262, "text": "Schau nach vorn, PLACEHOLDER! Die Zukunft hält Gutes für dich bereit."},
  {"id": 263, "text": "Setze kleine Ziele, PLACEHOLDER! Sie führen zu großen Erfolgen."},
  {"id": 264, "text": "Bleib authentisch, PLACEHOLDER! Du bist großartig, so wie du bist."},
  {"id": 265, "text": "Gib nicht auf, PLACEHOLDER! Dein Durchhaltevermögen wird belohnt."},
  {"id": 266, "text": "Sei mutig, PLACEHOLDER! Große Träume beginnen mit kleinen Schritten."},
  {"id": 267, "text": "Du hast die Kraft, PLACEHOLDER! Glaube an deine Fähigkeiten."},
  {"id": 268, "text": "Vertraue dem Prozess, PLACEHOLDER! Alles kommt zur richtigen Zeit."},
  {"id": 269, "text": "Entwickle deine Stärken, PLACEHOLDER! Sie werden dich voranbringen."},
  {"id": 270, "text": "Schätze die kleinen Freuden, PLACEHOLDER! Sie machen das Leben reich."},
  {"id": 271, "text": "Bleib optimistisch, PLACEHOLDER! Positives Denken schafft positive Realität."},
  {"id": 272, "text": "Hab Vertrauen in dich, PLACEHOLDER! Du bist auf dem richtigen Weg."},
  {"id": 273, "text": "Feiere deine Erfolge, PLACEHOLDER! Du hast sie verdient."},
  {"id": 274, "text": "Sei dankbar, PLACEHOLDER! Dankbarkeit öffnet Herzen."},
  {"id": 275, "text": "Denk daran, PLACEHOLDER! Du bist wertvoll und wichtig."}
];


const SinnfindungEN = [
  {"id": 251, "text": "You can do it, PLACEHOLDER! Every beginning is a chance."},
  {"id": 252, "text": "Believe in yourself, PLACEHOLDER! Even small progress is an achievement."},
  {"id": 253, "text": "Hang in there, PLACEHOLDER! Your strength will be rewarded."},
  {"id": 254, "text": "Stay persistent, PLACEHOLDER! The journey is as important as the destination."},
  {"id": 255, "text": "Trust yourself, PLACEHOLDER! You are stronger than you think."},
  {"id": 256, "text": "Don't be discouraged, PLACEHOLDER! Every day is a new opportunity."},
  {"id": 257, "text": "Be patient, PLACEHOLDER! Good things take time."},
  {"id": 258, "text": "Stay positive, PLACEHOLDER! Positive thinking opens doors."},
  {"id": 259, "text": "Remember your strengths, PLACEHOLDER! You are unique."},
  {"id": 260, "text": "Embrace change, PLACEHOLDER! It leads to growth."},
  {"id": 261, "text": "You're not alone, PLACEHOLDER! Together we are strong."},
  {"id": 262, "text": "Look forward, PLACEHOLDER! The future holds good things for you."},
  {"id": 263, "text": "Set small goals, PLACEHOLDER! They lead to big successes."},
  {"id": 264, "text": "Stay authentic, PLACEHOLDER! You are amazing just the way you are."},
  {"id": 265, "text": "Don't give up, PLACEHOLDER! Your perseverance will be rewarded."},
  {"id": 266, "text": "Be courageous, PLACEHOLDER! Big dreams start with small steps."},
  {"id": 267, "text": "You have the power, PLACEHOLDER! Believe in your abilities."},
  {"id": 268, "text": "Trust the process, PLACEHOLDER! Everything comes at the right time."},
  {"id": 269, "text": "Develop your strengths, PLACEHOLDER! They will propel you forward."},
  {"id": 270, "text": "Appreciate small joys, PLACEHOLDER! They enrich life."},
  {"id": 271, "text": "Stay optimistic, PLACEHOLDER! Positive thinking creates positive reality."},
  {"id": 272, "text": "Have confidence in yourself, PLACEHOLDER! You are on the right path."},
  {"id": 273, "text": "Celebrate your successes, PLACEHOLDER! You deserve them."},
  {"id": 274, "text": "Be grateful, PLACEHOLDER! Gratitude opens hearts."},
  {"id": 275, "text": "Remember, PLACEHOLDER! You are valuable and important."}
];

const SinnfindungES = [
  {"id": 251, "text": "¡Puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 252, "text": "Cree en ti mismo, PLACEHOLDER! Incluso el progreso pequeño es un logro."},
  {"id": 253, "text": "Mantén la esperanza, PLACEHOLDER! Tu fuerza será recompensada."},
  {"id": 254, "text": "Persevera, PLACEHOLDER! El viaje es tan importante como el destino."},
  {"id": 255, "text": "Confía en ti mismo, PLACEHOLDER! Eres más fuerte de lo que piensas."},
  {"id": 256, "text": "No te desanimes, PLACEHOLDER! Cada día es una nueva oportunidad."},
  {"id": 257, "text": "Ten paciencia, PLACEHOLDER! Las cosas buenas llevan tiempo."},
  {"id": 258, "text": "Mantén una actitud positiva, PLACEHOLDER! Pensar positivo abre puertas."},
  {"id": 259, "text": "Recuerda tus fortalezas, PLACEHOLDER! Eres único."},
  {"id": 260, "text": "Acepta el cambio, PLACEHOLDER! Conduce al crecimiento."},
  {"id": 261, "text": "No estás solo, PLACEHOLDER! Juntos somos fuertes."},
  {"id": 262, "text": "Mira hacia adelante, PLACEHOLDER! El futuro tiene cosas buenas para ti."},
  {"id": 263, "text": "Establece metas pequeñas, PLACEHOLDER! Llevan a grandes éxitos."},
  {"id": 264, "text": "Sé auténtico, PLACEHOLDER! Eres increíble tal como eres."},
  {"id": 265, "text": "No te rindas, PLACEHOLDER! Tu perseverancia será recompensada."},
  {"id": 266, "text": "Sé valiente, PLACEHOLDER! Los grandes sueños comienzan con pequeños pasos."},
  {"id": 267, "text": "Tienes el poder, PLACEHOLDER! Cree en tus habilidades."},
  {"id": 268, "text": "Confía en el proceso, PLACEHOLDER! Todo llega en el momento adecuado."},
  {"id": 269, "text": "Desarrolla tus fortalezas, PLACEHOLDER! Te impulsarán hacia adelante."},
  {"id": 270, "text": "Aprecia las pequeñas alegrías, PLACEHOLDER! Enriquecen la vida."},
  {"id": 271, "text": "Mantén el optimismo, PLACEHOLDER! Pensar positivo crea una realidad positiva."},
  {"id": 272, "text": "Ten confianza en ti mismo, PLACEHOLDER! Estás en el camino correcto."},
  {"id": 273, "text": "Celebra tus éxitos, PLACEHOLDER! Te los mereces."},
  {"id": 274, "text": "Sé agradecido, PLACEHOLDER! La gratitud abre corazones."},
  {"id": 275, "text": "Recuerda, PLACEHOLDER! Eres valioso e importante."}
]

const spirituellDE = [
  {"id": 276, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 277, "text": "Lass dich nicht entmutigen, PLACEHOLDER. Deine spirituelle Reise ist einzigartig."},
  {"id": 278, "text": "Bleib standhaft, PLACEHOLDER. In der Suche nach Antworten findest du inneren Frieden."},
  {"id": 279, "text": "Vertraue dem Prozess, PLACEHOLDER. Die Wahrheit wird sich offenbaren."},
  {"id": 280, "text": "Du bist nicht allein, PLACEHOLDER. Viele teilen ähnliche Gedanken."},
  {"id": 281, "text": "Sei geduldig, PLACEHOLDER. Spirituelles Wachstum braucht Zeit."},
  {"id": 282, "text": "Bleib offen für neue Erkenntnisse, PLACEHOLDER. Das Universum hat viel zu bieten."},
  {"id": 283, "text": "Erforsche deine Fragen, PLACEHOLDER. Die Antworten liegen in dir."},
  {"id": 284, "text": "Zweifle nicht an dir selbst, PLACEHOLDER. Du bist auf dem richtigen Weg."},
  {"id": 285, "text": "Glaube an deine Stärke, PLACEHOLDER. Spirituelle Herausforderungen formen deinen Charakter."},
  {"id": 286, "text": "Akzeptiere deine Zweifel, PLACEHOLDER. Sie sind Teil des Weges zur Erkenntnis."},
  {"id": 287, "text": "Jeder Schritt zählt, PLACEHOLDER. Du bewegst dich vorwärts."},
  {"id": 288, "text": "Finde Trost in der Suche, PLACEHOLDER. Du wirst Antworten finden."},
  {"id": 289, "text": "Vertraue deiner Intuition, PLACEHOLDER. Sie wird dich leiten."},
  {"id": 290, "text": "Du bist auf einer erstaunlichen Reise, PLACEHOLDER. Genieße den Weg."},
  {"id": 291, "text": "Lass die Zweifel los, PLACEHOLDER. Du bist auf dem Weg zur Klarheit."},
  {"id": 292, "text": "Bleib authentisch, PLACEHOLDER. Deine Wahrheit ist einzigartig."},
  {"id": 293, "text": "Öffne dein Herz, PLACEHOLDER. Liebe und Verständnis werden kommen."},
  {"id": 294, "text": "Hab Vertrauen in dich selbst, PLACEHOLDER. Du bist stärker als du denkst."},
  {"id": 295, "text": "Du bist ein Suchender, PLACEHOLDER. Deine Neugier führt dich zu Weisheit."},
  {"id": 296, "text": "Lass die Angst los, PLACEHOLDER. Die Wahrheit wird dich befreien."},
  {"id": 297, "text": "In der Dunkelheit wächst das Licht, PLACEHOLDER. Halte durch."},
  {"id": 298, "text": "Sei mutig, PLACEHOLDER. Das Universum unterstützt deine Reise."},
  {"id": 299, "text": "Deine Fragen sind gültig, PLACEHOLDER. Finde die Antworten, die du suchst."},
  {"id": 300, "text": "Vertraue dem Unbekannten, PLACEHOLDER. Dort liegt oft die größte Weisheit."}
];

const spirituellEN = [
  {"id": 276, "text": "You've got this, PLACEHOLDER! Every beginning is an opportunity."},
  {"id": 277, "text": "Don't be discouraged, PLACEHOLDER. Your spiritual journey is unique."},
  {"id": 278, "text": "Stay steadfast, PLACEHOLDER. In seeking answers, you'll find inner peace."},
  {"id": 279, "text": "Trust the process, PLACEHOLDER. The truth will reveal itself."},
  {"id": 280, "text": "You're not alone, PLACEHOLDER. Many share similar thoughts."},
  {"id": 281, "text": "Be patient, PLACEHOLDER. Spiritual growth takes time."},
  {"id": 282, "text": "Stay open to new insights, PLACEHOLDER. The universe has much to offer."},
  {"id": 283, "text": "Explore your questions, PLACEHOLDER. The answers lie within you."},
  {"id": 284, "text": "Don't doubt yourself, PLACEHOLDER. You're on the right path."},
  {"id": 285, "text": "Believe in your strength, PLACEHOLDER. Spiritual challenges shape your character."},
  {"id": 286, "text": "Accept your doubts, PLACEHOLDER. They're part of the path to understanding."},
  {"id": 287, "text": "Every step matters, PLACEHOLDER. You're moving forward."},
  {"id": 288, "text": "Find solace in the search, PLACEHOLDER. You will discover answers."},
  {"id": 289, "text": "Trust your intuition, PLACEHOLDER. It will guide you."},
  {"id": 290, "text": "You're on an amazing journey, PLACEHOLDER. Enjoy the path."},
  {"id": 291, "text": "Let go of doubts, PLACEHOLDER. You're on the way to clarity."},
  {"id": 292, "text": "Stay authentic, PLACEHOLDER. Your truth is unique."},
  {"id": 293, "text": "Open your heart, PLACEHOLDER. Love and understanding will come."},
  {"id": 294, "text": "Have confidence in yourself, PLACEHOLDER. You're stronger than you think."},
  {"id": 295, "text": "You're a seeker, PLACEHOLDER. Your curiosity leads to wisdom."},
  {"id": 296, "text": "Release the fear, PLACEHOLDER. The truth will set you free."},
  {"id": 297, "text": "In darkness, light grows, PLACEHOLDER. Hold on."},
  {"id": 298, "text": "Be courageous, PLACEHOLDER. The universe supports your journey."},
  {"id": 299, "text": "Your questions are valid, PLACEHOLDER. Find the answers you seek."},
  {"id": 300, "text": "Trust the unknown, PLACEHOLDER. Often, the greatest wisdom lies there."}
];

const spirituellES = [
  {"id": 276, "text": "¡Tú puedes, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 277, "text": "No te desanimes, PLACEHOLDER. Tu viaje espiritual es único."},
  {"id": 278, "text": "Mantente firme, PLACEHOLDER. En la búsqueda de respuestas, encontrarás paz interior."},
  {"id": 279, "text": "Confía en el proceso, PLACEHOLDER. La verdad se revelará."},
  {"id": 280, "text": "No estás solo/a, PLACEHOLDER. Muchos comparten pensamientos similares."},
  {"id": 281, "text": "Ten paciencia, PLACEHOLDER. El crecimiento espiritual lleva tiempo."},
  {"id": 282, "text": "Permanece abierto/a a nuevas perspectivas, PLACEHOLDER. El universo tiene mucho que ofrecer."},
  {"id": 283, "text": "Explora tus preguntas, PLACEHOLDER. Las respuestas están dentro de ti."},
  {"id": 284, "text": "No dudes de ti mismo/a, PLACEHOLDER. Estás en el camino correcto."},
  {"id": 285, "text": "Cree en tu fuerza, PLACEHOLDER. Los desafíos espirituales moldean tu carácter."},
  {"id": 286, "text": "Acepta tus dudas, PLACEHOLDER. Son parte del camino hacia la comprensión."},
  {"id": 287, "text": "Cada paso cuenta, PLACEHOLDER. Estás avanzando."},
  {"id": 288, "text": "Encuentra consuelo en la búsqueda, PLACEHOLDER. Descubrirás respuestas."},
  {"id": 289, "text": "Confía en tu intuición, PLACEHOLDER. Te guiará."},
  {"id": 290, "text": "Estás en un viaje increíble, PLACEHOLDER. Disfruta el camino."},
  {"id": 291, "text": "Deja ir las dudas, PLACEHOLDER. Estás en el camino hacia la claridad."},
  {"id": 292, "text": "Sé auténtico/a, PLACEHOLDER. Tu verdad es única."},
  {"id": 293, "text": "Abre tu corazón, PLACEHOLDER. El amor y la comprensión llegarán."},
  {"id": 294, "text": "Ten confianza en ti mismo/a, PLACEHOLDER. Eres más fuerte de lo que piensas."},
  {"id": 295, "text": "Eres un buscador/a, PLACEHOLDER. Tu curiosidad lleva a la sabiduría."},
  {"id": 296, "text": "Libera el miedo, PLACEHOLDER. La verdad te hará libre."},
  {"id": 297, "text": "En la oscuridad, la luz crece, PLACEHOLDER. Aguanta."},
  {"id": 298, "text": "Sé valiente, PLACEHOLDER. El universo apoya tu viaje."},
  {"id": 299, "text": "Tus preguntas son válidas, PLACEHOLDER. Encuentra las respuestas que buscas."},
  {"id": 300, "text": "Confía en lo desconocido, PLACEHOLDER. A menudo, la mayor sabiduría yace allí."}
];


const stressDE = [
  {"id": 301, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 302, "text": "Bleib stark, PLACEHOLDER! In der Ruhe liegt die Kraft."},
  {"id": 303, "text": "Glaub an dich, PLACEHOLDER! Die Lösung liegt oft im Loslassen."},
  {"id": 304, "text": "Lass dich nicht unterkriegen, PLACEHOLDER! Jeder Tag ist eine neue Gelegenheit."},
  {"id": 305, "text": "Halte durch, PLACEHOLDER! Vertraue auf deine Stärke."},
  {"id": 306, "text": "Es wird besser, PLACEHOLDER! Kleine Fortschritte sind auch Erfolge."},
  {"id": 307, "text": "Du bist nicht allein, PLACEHOLDER! Teile deine Lasten."},
  {"id": 308, "text": "Kopf hoch, PLACEHOLDER! Der Weg ist genauso wichtig wie das Ziel."},
  {"id": 309, "text": "Denk positiv, PLACEHOLDER! Jede Herausforderung macht dich stärker."},
  {"id": 310, "text": "Atme tief durch, PLACEHOLDER! In der Ruhe liegt die Kraft."},
  {"id": 311, "text": "Gib nicht auf, PLACEHOLDER! Du bist widerstandsfähiger als du denkst."},
  {"id": 312, "text": "Sei geduldig, PLACEHOLDER! Gute Dinge brauchen Zeit."},
  {"id": 313, "text": "Halt durch, PLACEHOLDER! Morgen wird ein neuer Tag."},
  {"id": 314, "text": "Denk an die kleinen Erfolge, PLACEHOLDER! Sie zählen."},
  {"id": 315, "text": "Du machst das großartig, PLACEHOLDER! Schritt für Schritt."},
  {"id": 316, "text": "Bleib fokussiert, PLACEHOLDER! Du schaffst das."},
  {"id": 317, "text": "Es kommt gut, PLACEHOLDER! Vertraue auf den Prozess."},
  {"id": 318, "text": "Bleib ruhig, PLACEHOLDER! Die Kontrolle liegt bei dir."},
  {"id": 319, "text": "Hab Vertrauen, PLACEHOLDER! Du bist auf dem richtigen Weg."},
  {"id": 320, "text": "Glaube an deine Stärke, PLACEHOLDER! Du bist resilient."},
  {"id": 321, "text": "Lass nicht nach, PLACEHOLDER! Du bist auf dem Weg zum Erfolg."},
  {"id": 322, "text": "Bewältige Stress, PLACEHOLDER! Deine Gesundheit ist wichtig."},
  {"id": 323, "text": "Es wird leichter, PLACEHOLDER! Halte durch."},
  {"id": 324, "text": "Du bist nicht allein, PLACEHOLDER! Gemeinsam sind wir stark."},
  {"id": 325, "text": "Gib nicht auf, PLACEHOLDER! Du wächst daran."}
];

const stressEN = [
  {"id": 301, "text": "You can do it, PLACEHOLDER! Every beginning is an opportunity."},
  {"id": 302, "text": "Stay strong, PLACEHOLDER! Strength lies in calmness."},
  {"id": 303, "text": "Believe in yourself, PLACEHOLDER! The solution often lies in letting go."},
  {"id": 304, "text": "Don't be discouraged, PLACEHOLDER! Every day is a new opportunity."},
  {"id": 305, "text": "Hang in there, PLACEHOLDER! Trust in your strength."},
  {"id": 306, "text": "It will get better, PLACEHOLDER! Small progress is still success."},
  {"id": 307, "text": "You are not alone, PLACEHOLDER! Share your burdens."},
  {"id": 308, "text": "Chin up, PLACEHOLDER! The journey is as important as the destination."},
  {"id": 309, "text": "Think positive, PLACEHOLDER! Every challenge makes you stronger."},
  {"id": 310, "text": "Take a deep breath, PLACEHOLDER! Strength lies in calmness."},
  {"id": 311, "text": "Don't give up, PLACEHOLDER! You are more resilient than you think."},
  {"id": 312, "text": "Be patient, PLACEHOLDER! Good things take time."},
  {"id": 313, "text": "Hold on, PLACEHOLDER! Tomorrow is a new day."},
  {"id": 314, "text": "Think of the small victories, PLACEHOLDER! They count."},
  {"id": 315, "text": "You're doing great, PLACEHOLDER! Step by step."},
  {"id": 316, "text": "Stay focused, PLACEHOLDER! You can do it."},
  {"id": 317, "text": "It will be okay, PLACEHOLDER! Trust the process."},
  {"id": 318, "text": "Stay calm, PLACEHOLDER! Control is in your hands."},
  {"id": 319, "text": "Have faith, PLACEHOLDER! You're on the right path."},
  {"id": 320, "text": "Believe in your strength, PLACEHOLDER! You are resilient."},
  {"id": 321, "text": "Don't give up, PLACEHOLDER! You're on the path to success."},
  {"id": 322, "text": "Manage stress, PLACEHOLDER! Your health is important."},
  {"id": 323, "text": "It will get easier, PLACEHOLDER! Hang in there."},
  {"id": 324, "text": "You are not alone, PLACEHOLDER! Together we are strong."},
  {"id": 325, "text": "Don't give up, PLACEHOLDER! You grow through it."}
];

const stressES = [
  {"id": 301, "text": "¡Puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 302, "text": "Mantente fuerte, PLACEHOLDER. La fuerza está en la calma."},
  {"id": 303, "text": "Cree en ti, PLACEHOLDER. La solución a menudo está en soltar."},
  {"id": 304, "text": "No te desanimes, PLACEHOLDER. Cada día es una nueva oportunidad."},
  {"id": 305, "text": "Sigue adelante, PLACEHOLDER. Confía en tu fuerza."},
  {"id": 306, "text": "Mejorará, PLACEHOLDER. Pequeños avances son también éxitos."},
  {"id": 307, "text": "No estás solo/a, PLACEHOLDER. Comparte tus cargas."},
  {"id": 308, "text": "Ánimo, PLACEHOLDER. El camino es tan importante como el destino."},
  {"id": 309, "text": "Piensa positivo, PLACEHOLDER. Cada desafío te hace más fuerte."},
  {"id": 310, "text": "Respira profundamente, PLACEHOLDER. La fuerza está en la calma."},
  {"id": 311, "text": "No te rindas, PLACEHOLDER. Eres más resistente de lo que piensas."},
  {"id": 312, "text": "Ten paciencia, PLACEHOLDER. Las cosas buenas llevan tiempo."},
  {"id": 313, "text": "Resiste, PLACEHOLDER. Mañana es un nuevo día."},
  {"id": 314, "text": "Piensa en las pequeñas victorias, PLACEHOLDER. Cuentan."},
  {"id": 315, "text": "Lo estás haciendo genial, PLACEHOLDER. Paso a paso."},
  {"id": 316, "text": "Mantente enfocado/a, PLACEHOLDER. Puedes lograrlo."},
  {"id": 317, "text": "Todo estará bien, PLACEHOLDER. Confía en el proceso."},
  {"id": 318, "text": "Mantén la calma, PLACEHOLDER. El control está en tus manos."},
  {"id": 319, "text": "Ten fe, PLACEHOLDER. Estás en el camino correcto."},
  {"id": 320, "text": "Cree en tu fuerza, PLACEHOLDER. Eres resiliente."},
  {"id": 321, "text": "No te rindas, PLACEHOLDER. Estás en el camino hacia el éxito."},
  {"id": 322, "text": "Maneja el estrés, PLACEHOLDER. Tu salud es importante."},
  {"id": 323, "text": "Mejorará, PLACEHOLDER. Aguanta."},
  {"id": 324, "text": "No estás solo/a, PLACEHOLDER. Juntos/as somos fuertes."},
  {"id": 325, "text": "No te rindas, PLACEHOLDER. Crecerás a través de esto."}
];

const AngstStDE = [
  {"id": 326, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 327, "text": "Gib nicht auf, PLACEHOLDER! Du bist stärker als deine Ängste."},
  {"id": 328, "text": "Halte durch, PLACEHOLDER! Jeder Schritt zählt auf dem Weg zur Besserung."},
  {"id": 329, "text": "Es ist okay zu kämpfen, PLACEHOLDER. Du bist nicht allein."},
  {"id": 330, "text": "Die Sonne wird wieder für dich scheinen, PLACEHOLDER. Glaube an morgen."},
  {"id": 331, "text": "Du bist mutiger, als du denkst, PLACEHOLDER. Vertraue auf deine Stärke."},
  {"id": 332, "text": "Lass nicht zu, dass Ängste deine Träume bremsen, PLACEHOLDER. Du bist kraftvoll."},
  {"id": 333, "text": "In jedem Tief steckt auch ein Hoch, PLACEHOLDER. Bald wirst du wieder oben sein."},
  {"id": 334, "text": "Nicht die Angst kontrolliert dich, PLACEHOLDER, sondern du kontrollierst die Angst."},
  {"id": 335, "text": "Jeder Tag ist eine neue Gelegenheit, stark zu sein, PLACEHOLDER."},
  {"id": 336, "text": "Auch kleine Fortschritte sind Erfolge, PLACEHOLDER. Feiere sie."},
  {"id": 337, "text": "Bleib standhaft, PLACEHOLDER. Du wächst durch jede Herausforderung."},
  {"id": 338, "text": "Die Dunkelheit weicht dem Licht, PLACEHOLDER. Glaube an deine Helligkeit."},
  {"id": 339, "text": "Deine Gedanken formen deine Realität, PLACEHOLDER. Denke positiv."},
  {"id": 340, "text": "Mit jedem Atemzug sammelst du Kraft, PLACEHOLDER. Atme tief ein."},
  {"id": 341, "text": "Lass die Angst nicht dein Herz regieren, PLACEHOLDER. Liebe überwindet alles."},
  {"id": 342, "text": "Deine Reise ist einzigartig, PLACEHOLDER. Vergleiche dich nicht."},
  {"id": 343, "text": "Kämpfe für deine Freiheit von Ängsten, PLACEHOLDER. Du bist es wert."},
  {"id": 344, "text": "Die Wolken werden sich lichten, PLACEHOLDER. Der Himmel wird klarer."},
  {"id": 345, "text": "Auch wenn du strauchelst, steh wieder auf, PLACEHOLDER. Du bist stärker."},
  {"id": 346, "text": "Du bist der Architekt deiner Zukunft, PLACEHOLDER. Baue etwas Großartiges."},
  {"id": 347, "text": "In der Ruhe findest du die Kraft, PLACEHOLDER. Atme aus."},
  {"id": 348, "text": "Glaube an deine Fähigkeiten, PLACEHOLDER. Du bist bemerkenswert."},
  {"id": 349, "text": "Der Weg mag schwer sein, PLACEHOLDER, aber du bist stärker."},
  {"id": 350, "text": "Vertraue dem Prozess, PLACEHOLDER. Gute Dinge kommen auf dich zu."}
];

const AngstStEN = [
  {"id": 326, "text": "You can do it, PLACEHOLDER! Every beginning is an opportunity."},
  {"id": 327, "text": "Don't give up, PLACEHOLDER! You are stronger than your fears."},
  {"id": 328, "text": "Hang in there, PLACEHOLDER! Every step counts on the path to improvement."},
  {"id": 329, "text": "It's okay to struggle, PLACEHOLDER. You are not alone."},
  {"id": 330, "text": "The sun will shine for you again, PLACEHOLDER. Believe in tomorrow."},
  {"id": 331, "text": "You are braver than you think, PLACEHOLDER. Trust in your strength."},
  {"id": 332, "text": "Don't let fears hinder your dreams, PLACEHOLDER. You are powerful."},
  {"id": 333, "text": "In every low, there's also a high, PLACEHOLDER. Soon, you'll be on top again."},
  {"id": 334, "text": "Fear doesn't control you, PLACEHOLDER; you control fear."},
  {"id": 335, "text": "Every day is a new opportunity to be strong, PLACEHOLDER."},
  {"id": 336, "text": "Even small progress is success, PLACEHOLDER. Celebrate it."},
  {"id": 337, "text": "Stay resilient, PLACEHOLDER. You grow through every challenge."},
  {"id": 338, "text": "Darkness gives way to light, PLACEHOLDER. Believe in your brightness."},
  {"id": 339, "text": "Your thoughts shape your reality, PLACEHOLDER. Think positively."},
  {"id": 340, "text": "With every breath, you gather strength, PLACEHOLDER. Breathe deeply."},
  {"id": 341, "text": "Don't let fear rule your heart, PLACEHOLDER. Love conquers all."},
  {"id": 342, "text": "Your journey is unique, PLACEHOLDER. Don't compare yourself."},
  {"id": 343, "text": "Fight for freedom from fears, PLACEHOLDER. You are worth it."},
  {"id": 344, "text": "The clouds will clear, PLACEHOLDER. The sky will become clearer."},
  {"id": 345, "text": "Even if you stumble, stand up again, PLACEHOLDER. You are stronger."},
  {"id": 346, "text": "You are the architect of your future, PLACEHOLDER. Build something great."},
  {"id": 347, "text": "In stillness, you find strength, PLACEHOLDER. Breathe out."},
  {"id": 348, "text": "Believe in your abilities, PLACEHOLDER. You are remarkable."},
  {"id": 349, "text": "The road may be tough, PLACEHOLDER, but you are stronger."},
  {"id": 350, "text": "Trust the process, PLACEHOLDER. Good things are coming your way."}
];

const AngstStES = [
  {"id": 326, "text": "¡Puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 327, "text": "No te rindas, PLACEHOLDER. Eres más fuerte que tus miedos."},
  {"id": 328, "text": "Sigue adelante, PLACEHOLDER. Cada paso cuenta en el camino hacia la mejora."},
  {"id": 329, "text": "Está bien luchar, PLACEHOLDER. No estás solo."},
  {"id": 330, "text": "El sol volverá a brillar para ti, PLACEHOLDER. Cree en el mañana."},
  {"id": 331, "text": "Eres más valiente de lo que piensas, PLACEHOLDER. Confía en tu fuerza."},
  {"id": 332, "text": "No permitas que los miedos obstaculicen tus sueños, PLACEHOLDER. Eres poderoso."},
  {"id": 333, "text": "En cada bajón, también hay un alto, PLACEHOLDER. Pronto estarás en la cima de nuevo."},
  {"id": 334, "text": "El miedo no te controla, PLACEHOLDER; tú controlas el miedo."},
  {"id": 335, "text": "Cada día es una nueva oportunidad para ser fuerte, PLACEHOLDER."},
  {"id": 336, "text": "Incluso pequeños avances son éxito, PLACEHOLDER. Celébralo."},
  {"id": 337, "text": "Mantente firme, PLACEHOLDER. Crecerás a través de cada desafío."},
  {"id": 338, "text": "La oscuridad da paso a la luz, PLACEHOLDER. Cree en tu brillo."},
  {"id": 339, "text": "Tus pensamientos dan forma a tu realidad, PLACEHOLDER. Piensa positivamente."},
  {"id": 340, "text": "Con cada respiración, acumulas fuerza, PLACEHOLDER. Respira profundamente."},
  {"id": 341, "text": "No dejes que el miedo gobierne tu corazón, PLACEHOLDER. El amor todo lo conquista."},
  {"id": 342, "text": "Tu viaje es único, PLACEHOLDER. No te compares."},
  {"id": 343, "text": "Lucha por la libertad de los miedos, PLACEHOLDER. Tú lo vales."},
  {"id": 344, "text": "Las nubes se dispersarán, PLACEHOLDER. El cielo se despejará."},
  {"id": 345, "text": "Incluso si tropiezas, levántate de nuevo, PLACEHOLDER. Eres más fuerte."},
  {"id": 346, "text": "Eres el arquitecto de tu futuro, PLACEHOLDER. Construye algo grandioso."},
  {"id": 347, "text": "En la quietud, encuentras fuerza, PLACEHOLDER. Exhala."},
  {"id": 348, "text": "Confía en tus habilidades, PLACEHOLDER. Eres extraordinario."},
  {"id": 349, "text": "El camino puede ser difícil, PLACEHOLDER, pero eres más fuerte."},
  {"id": 350, "text": "Confía en el proceso, PLACEHOLDER. Cosas buenas vienen en tu camino."}
];

const BurnOutDE = [
  {"id": 351, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 352, "text": "Gib nicht auf, PLACEHOLDER! Du bist stärker, als du denkst."},
  {"id": 353, "text": "Es ist okay, PACEHOLDER. Du machst Fortschritte, auch wenn es langsam geht."},
  {"id": 354, "text": "Lass dich nicht entmutigen, PLACEHOLDER! Du bist auf dem richtigen Weg."},
  {"id": 355, "text": "Denk daran, PLACEHOLDER, Pausen sind genauso wichtig wie Fortschritte."},
  {"id": 356, "text": "Sei stolz auf dich, PLACEHOLDER! Selbst kleine Schritte zählen."},
  {"id": 357, "text": "Nimm dir Zeit für dich selbst, PLACEHOLDER. Du verdienst es."},
  {"id": 358, "text": "Es wird besser, PLACEHOLDER. Halte durch und bleib positiv."},
  {"id": 359, "text": "Du bist nicht allein, PLACEHOLDER. Unterstützung ist da."},
  {"id": 360, "text": "Glaube an deine Stärke, PLACEHOLDER. Du überwindest das."},
  {"id": 361, "text": "Es ist okay, um Hilfe zu bitten, PLACEHOLDER. Stark zu sein bedeutet nicht, alles alleine zu schaffen."},
  {"id": 362, "text": "Erfolge kommen in kleinen Schritten, PLACEHOLDER. Jeder zählt."},
  {"id": 363, "text": "Deine Gesundheit steht an erster Stelle, PLACEHOLDER. Kümmere dich um dich selbst."},
  {"id": 364, "text": "Mach Pausen, PLACEHOLDER. Du verdienst Erholung."},
  {"id": 365, "text": "Innehalten ist keine Schwäche, PLACEHOLDER. Es zeigt, dass du auf dich achtest."},
  {"id": 366, "text": "Bleib positiv, PLACEHOLDER. Du hast die Kraft, dies zu überwinden."},
  {"id": 367, "text": "Deine Mühe wird belohnt werden, PLACEHOLDER. Halte durch."},
  {"id": 368, "text": "Jeder Tag ist eine neue Chance, PLACEHOLDER. Nutze sie."},
  {"id": 369, "text": "Es ist okay, sich auszuruhen, PLACEHOLDER. Du musst nicht alles auf einmal schaffen."},
  {"id": 370, "text": "Vertraue auf deine Fähigkeiten, PLACEHOLDER. Du kannst das meistern."},
  {"id": 371, "text": "Denk daran, PLACEHOLDER, dass du wertvoll und wichtig bist."},
  {"id": 372, "text": "Die Sonne wird wieder scheinen, PLACEHOLDER. Halte durch."},
  {"id": 373, "text": "Deine Gesundheit ist wichtiger als Perfektion, PLACEHOLDER. Kümmere dich um dich selbst."},
  {"id": 374, "text": "Sei geduldig mit dir selbst, PLACEHOLDER. Du machst Fortschritte."},
  {"id": 375, "text": "Du bist stark, PLACEHOLDER. Glaube an deine Kraft."},
];

const BurnOutEN = [
  {"id": 351, "text": "You can do it, PLACEHOLDER! Every beginning is an opportunity."},
  {"id": 352, "text": "Don't give up, PLACEHOLDER! You are stronger than you think."},
  {"id": 353, "text": "It's okay, PLACEHOLDER. You're making progress, even if it's slow."},
  {"id": 354, "text": "Don't be discouraged, PLACEHOLDER! You're on the right track."},
  {"id": 355, "text": "Remember, PLACEHOLDER, breaks are just as important as progress."},
  {"id": 356, "text": "Be proud of yourself, PLACEHOLDER! Even small steps count."},
  {"id": 357, "text": "Take time for yourself, PLACEHOLDER. You deserve it."},
  {"id": 358, "text": "It will get better, PLACEHOLDER. Hang in there and stay positive."},
  {"id": 359, "text": "You're not alone, PLACEHOLDER. Support is available."},
  {"id": 360, "text": "Believe in your strength, PLACEHOLDER. You will overcome this."},
  {"id": 361, "text": "It's okay to ask for help, PLACEHOLDER. Being strong doesn't mean doing everything alone."},
  {"id": 362, "text": "Success comes in small steps, PLACEHOLDER. Every one counts."},
  {"id": 363, "text": "Your health comes first, PLACEHOLDER. Take care of yourself."},
  {"id": 364, "text": "Take breaks, PLACEHOLDER. You deserve rest."},
  {"id": 365, "text": "Pausing is not a weakness, PLACEHOLDER. It shows you're taking care of yourself."},
  {"id": 366, "text": "Stay positive, PLACEHOLDER. You have the strength to overcome this."},
  {"id": 367, "text": "Your effort will be rewarded, PLACEHOLDER. Hang in there."},
  {"id": 368, "text": "Every day is a new chance, PLACEHOLDER. Seize it."},
  {"id": 369, "text": "It's okay to rest, PLACEHOLDER. You don't have to do everything all at once."},
  {"id": 370, "text": "Trust in your abilities, PLACEHOLDER. You can overcome this."},
  {"id": 371, "text": "Remember, PLACEHOLDER, you are valuable and important."},
  {"id": 372, "text": "The sun will shine again, PLACEHOLDER. Keep going."},
  {"id": 373, "text": "Your health is more important than perfection, PLACEHOLDER. Take care of yourself."},
  {"id": 374, "text": "Be patient with yourself, PLACEHOLDER. You are making progress."},
  {"id": 375, "text": "You are strong, PLACEHOLDER. Believe in your strength."},
];

const BurnOutES = [
  {"id": 351, "text": "¡Puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 352, "text": "No te rindas, PLACEHOLDER. Eres más fuerte de lo que piensas."},
  {"id": 353, "text": "Está bien, PLACEHOLDER. Estás progresando, aunque sea lentamente."},
  {"id": 354, "text": "No te desanimes, PLACEHOLDER. Estás en el camino correcto."},
  {"id": 355, "text": "Recuerda, PLACEHOLDER, las pausas son tan importantes como el progreso."},
  {"id": 356, "text": "Siéntete orgulloso/a de ti mismo/a, PLACEHOLDER. Incluso los pequeños pasos cuentan."},
  {"id": 357, "text": "Tómate tiempo para ti mismo/a, PLACEHOLDER. Te lo mereces."},
  {"id": 358, "text": "Mejorará, PLACEHOLDER. Aguanta y mantén una actitud positiva."},
  {"id": 359, "text": "No estás solo/a, PLACEHOLDER. Hay apoyo disponible."},
  {"id": 360, "text": "Cree en tu fuerza, PLACEHOLDER. Superarás esto."},
  {"id": 361, "text": "Está bien pedir ayuda, PLACEHOLDER. Ser fuerte no significa hacer todo solo/a."},
  {"id": 362, "text": "El éxito viene en pequeños pasos, PLACEHOLDER. Cada uno cuenta."},
  {"id": 363, "text": "Tu salud es lo primero, PLACEHOLDER. Cuídate."},
  {"id": 364, "text": "Tómate descansos, PLACEHOLDER. Te lo mereces."},
  {"id": 365, "text": "Hacer una pausa no es una debilidad, PLACEHOLDER. Muestra que te estás cuidando."},
  {"id": 366, "text": "Mantén una actitud positiva, PLACEHOLDER. Tienes la fuerza para superar esto."},
  {"id": 367, "text": "Tu esfuerzo será recompensado, PLACEHOLDER. Aguanta."},
  {"id": 368, "text": "Cada día es una nueva oportunidad, PLACEHOLDER. Aprovéchala."},
  {"id": 369, "text": "Está bien descansar, PLACEHOLDER. No tienes que hacerlo todo de una vez."},
  {"id": 370, "text": "Confía en tus habilidades, PLACEHOLDER. Puedes superar esto."},
  {"id": 371, "text": "Recuerda, PLACEHOLDER, eres valioso/a e importante."},
  {"id": 372, "text": "El sol volverá a brillar, PLACEHOLDER. Sigue adelante."},
  {"id": 373, "text": "Tu salud es más importante que la perfección, PLACEHOLDER. Cuídate."},
  {"id": 374, "text": "Ten paciencia contigo mismo/a, PLACEHOLDER. Estás progresando."},
  {"id": 375, "text": "Eres fuerte, PLACEHOLDER. Cree en tu fuerza."},
];

const SelbstzweifelDE = [
  {"id": 376, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 377, "text": "Sei stolz auf dich, PLACEHOLDER! Du bist stärker, als du denkst."},
  {"id": 378, "text": "Glaube an deine Fähigkeiten, PLACEHOLDER! Du hast viele Talente."},
  {"id": 379, "text": "Mach dir keine Sorgen, PLACEHOLDER. Du bist auf dem richtigen Weg."},
  {"id": 380, "text": "Jeder Tag ist eine Gelegenheit zu wachsen, PLACEHOLDER. Du wirst besser."},
  {"id": 381, "text": "Hab Vertrauen in dich, PLACEHOLDER! Du bist einzigartig und wertvoll."},
  {"id": 382, "text": "Lass dich nicht entmutigen, PLACEHOLDER. Du bist auf dem richtigen Weg."},
  {"id": 383, "text": "Denk daran, PLACEHOLDER, du bist mehr als genug."},
  {"id": 384, "text": "Sei geduldig mit dir selbst, PLACEHOLDER. Veränderung braucht Zeit."},
  {"id": 385, "text": "Du bist nicht allein, PLACEHOLDER. Viele Menschen unterstützen dich."},
  {"id": 386, "text": "Gib nicht auf, PLACEHOLDER. Die Sonne wird wieder für dich scheinen."},
  {"id": 387, "text": "Erinnere dich daran, PLACEHOLDER, du verdienst Liebe und Respekt."},
  {"id": 388, "text": "Du bist mutig, PLACEHOLDER! Die Herausforderungen machen dich stärker."},
  {"id": 389, "text": "Feiere kleine Erfolge, PLACEHOLDER. Jeder Schritt zählt."},
  {"id": 390, "text": "Höre auf deine innere Stimme, PLACEHOLDER. Du kennst dich am besten."},
  {"id": 391, "text": "Lass dich nicht von Zweifeln bremsen, PLACEHOLDER. Du bist kraftvoll."},
  {"id": 392, "text": "Freu dich über Fortschritte, PLACEHOLDER. Du machst großartige Dinge."},
  {"id": 393, "text": "Umgebe dich mit Positivität, PLACEHOLDER. Du verdienst Glück."},
  {"id": 394, "text": "Konzentriere dich auf das Positive, PLACEHOLDER. Gute Dinge kommen."},
  {"id": 395, "text": "Du bist einzigartig, PLACEHOLDER. Das macht dich besonders."},
  {"id": 396, "text": "Glaube an deine Stärke, PLACEHOLDER. Du bist unverwüstlich."},
  {"id": 397, "text": "Sei stolz auf deine Reise, PLACEHOLDER. Jeder Schritt zählt."},
  {"id": 398, "text": "Du hast die Kraft, PLACEHOLDER. Vertraue in deine Fähigkeiten."},
  {"id": 399, "text": "Bleib fokussiert, PLACEHOLDER. Du wirst überwinden."},
  {"id": 400, "text": "Du verdienst Liebe und Glück, PLACEHOLDER. Erlaube es dir."},
];

const exAngstDE = [
  {"id": 226, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 227, "text": "Bleib stark, PLACEHOLDER! Die Sonne wird wieder für dich scheinen."},
  {"id": 228, "text": "Vertrau dir selbst, PLACEHOLDER! Du bist stärker als du denkst."},
  {"id": 229, "text": "Es ist okay zu kämpfen, PLACEHOLDER! Jeder Fortschritt zählt."},
  {"id": 230, "text": "Halte durch, PLACEHOLDER! Du wächst durch Herausforderungen."},
  {"id": 231, "text": "Glaube an deine Kraft, PLACEHOLDER! Du bist nicht allein."},
  {"id": 232, "text": "Schritt für Schritt, PLACEHOLDER! Du bewegst dich vorwärts."},
  {"id": 233, "text": "Lass nicht nach, PLACEHOLDER! Die Zukunft hält Gutes für dich bereit."},
  {"id": 234, "text": "Erfolge kommen, PLACEHOLDER! Bleib dran und sei geduldig."},
  {"id": 235, "text": "Stolpern ist erlaubt, PLACEHOLDER! Steh wieder auf und geh weiter."},
  {"id": 236, "text": "Sei stolz auf dich, PLACEHOLDER! Du machst Fortschritte."},
  {"id": 237, "text": "Die Dunkelheit vergeht, PLACEHOLDER! Das Licht kommt näher."},
  {"id": 238, "text": "Du bist widerstandsfähig, PLACEHOLDER! Jeder Tag ist eine neue Chance."},
  {"id": 239, "text": "In deiner Einzigartigkeit liegt Stärke, PLACEHOLDER!"},
  {"id": 240, "text": "Umarme Veränderungen, PLACEHOLDER! Sie führen zu Wachstum."},
  {"id": 241, "text": "Deine Geschichte ist noch nicht zu Ende, PLACEHOLDER!"},
  {"id": 242, "text": "Du bist auf dem richtigen Weg, PLACEHOLDER! Vertraue dem Prozess."},
  {"id": 243, "text": "Ängste verblassen, PLACEHOLDER! Glaube an deine inneren Kräfte."},
  {"id": 244, "text": "Selbst in der Dunkelheit gibt es Hoffnung, PLACEHOLDER!"},
  {"id": 245, "text": "Jeder Tag ist ein neuer Anfang, PLACEHOLDER!"},
  {"id": 246, "text": "Bleib beharrlich, PLACEHOLDER! Du formst deine Zukunft."},
  {"id": 247, "text": "Die Sterne leuchten für dich, PLACEHOLDER!"},
  {"id": 248, "text": "Gib nicht auf, PLACEHOLDER! Das Beste kommt noch."},
  {"id": 249, "text": "Du bist nicht allein, PLACEHOLDER! Gemeinsam sind wir stark."},
  {"id": 250, "text": "Deine Stärke beeindruckt, PLACEHOLDER! Weiter so."},
];

const exAngstEN = [
  {"id": 226, "text": "You can do it, PLACEHOLDER! Every beginning is an opportunity."},
  {"id": 227, "text": "Stay strong, PLACEHOLDER! The sun will shine for you again."},
  {"id": 228, "text": "Trust yourself, PLACEHOLDER! You are stronger than you think."},
  {"id": 229, "text": "It's okay to struggle, PLACEHOLDER! Every step forward counts."},
  {"id": 230, "text": "Hang in there, PLACEHOLDER! You grow through challenges."},
  {"id": 231, "text": "Believe in your strength, PLACEHOLDER! You are not alone."},
  {"id": 232, "text": "Step by step, PLACEHOLDER! You are moving forward."},
  {"id": 233, "text": "Don't give up, PLACEHOLDER! The future holds good things for you."},
  {"id": 234, "text": "Success is coming, PLACEHOLDER! Stay committed and be patient."},
  {"id": 235, "text": "Stumbling is allowed, PLACEHOLDER! Get up and keep going."},
  {"id": 236, "text": "Be proud of yourself, PLACEHOLDER! You are making progress."},
  {"id": 237, "text": "The darkness will fade, PLACEHOLDER! The light is getting closer."},
  {"id": 238, "text": "You are resilient, PLACEHOLDER! Every day is a new chance."},
  {"id": 239, "text": "Strength lies in your uniqueness, PLACEHOLDER!"},
  {"id": 240, "text": "Embrace changes, PLACEHOLDER! They lead to growth."},
  {"id": 241, "text": "Your story is not over yet, PLACEHOLDER!"},
  {"id": 242, "text": "You are on the right path, PLACEHOLDER! Trust the process."},
  {"id": 243, "text": "Fears fade away, PLACEHOLDER! Believe in your inner strength."},
  {"id": 244, "text": "Even in darkness, there is hope, PLACEHOLDER!"},
  {"id": 245, "text": "Every day is a new beginning, PLACEHOLDER!"},
  {"id": 246, "text": "Stay persistent, PLACEHOLDER! You are shaping your future."},
  {"id": 247, "text": "The stars shine for you, PLACEHOLDER!"},
  {"id": 248, "text": "Don't give up, PLACEHOLDER! The best is yet to come."},
  {"id": 249, "text": "You are not alone, PLACEHOLDER! Together we are strong."},
  {"id": 250, "text": "Your strength is impressive, PLACEHOLDER! Keep it up."},
];

const umzugDE = [
  {"id": 250, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 251, "text": "Veränderungen sind herausfordernd, PLACEHOLDER, aber bringen Wachstum."},
  {"id": 252, "text": "Es ist normal, sich unsicher zu fühlen, PLACEHOLDER. Gib dir Zeit, es wird besser."},
  {"id": 253, "text": "Hallo PLACEHOLDER! Nimm dir Zeit zum Ankommen."},
  {"id": 254, "text": "Unsicherheiten beim Umzug gehen vorbei, PLACEHOLDER. Du wirst es lieben!"},
  {"id": 255, "text": "Hey PLACEHOLDER, du bist nicht allein. Freunde warten auf dich."},
  {"id": 256, "text": "Es braucht Zeit, sich einzuleben, PLACEHOLDER. Hab Geduld, es wird besser."},
  {"id": 257, "text": "Glaub an dich, PLACEHOLDER! Du machst das großartig."},
  {"id": 258, "text": "Es ist okay, unsicher zu sein, PLACEHOLDER. Du machst das großartig!"},
  {"id": 259, "text": "Hey PLACEHOLDER, Veränderungen sind Chancen für Wachstum."},
  {"id": 260, "text": "Der Umzug ist schwer, PLACEHOLDER, aber du findest ein neues Zuhause."},
  {"id": 261, "text": "Hey PLACEHOLDER! Lass die Unsicherheit nicht die Freude überdecken."},
  {"id": 262, "text": "Die Anfangsphase ist herausfordernd, PLACEHOLDER, aber es wird besser. Bleib positiv!"},
  {"id": 263, "text": "Egal wie schwierig, PLACEHOLDER, du wirst gestärkt hervorgehen."},
  {"id": 264, "text": "Veränderungen lohnen sich, PLACEHOLDER. Halte durch, es wird vertraut."},
  {"id": 265, "text": "Hey PLACEHOLDER, jeder Tag bringt neue Möglichkeiten. Genieße die Reise!"},
  {"id": 266, "text": "Unsicherheiten sind vorübergehend, PLACEHOLDER. Bald wird es vertraut."},
  {"id": 267, "text": "Hey PLACEHOLDER, du bist mutig! Vertrau darauf, dass alles gut wird."},
  {"id": 268, "text": "Es ist normal, sich am Anfang unwohl zu fühlen, PLACEHOLDER. Es wird leichter."},
  {"id": 269, "text": "Du bist stärker, als du denkst, PLACEHOLDER! Vertrau auf deinen Weg."},
  {"id": 270, "text": "Hey PLACEHOLDER, jede Herausforderung ist eine Gelegenheit zum Wachsen."},
  {"id": 271, "text": "Veränderungen bringen Neues, PLACEHOLDER. Freu dich auf die Entdeckungen!"},
  {"id": 272, "text": "Hey PLACEHOLDER, du machst das großartig! Bald wird alles vertrauter sein."},
  {"id": 273, "text": "Unsicherheiten verblassen, PLACEHOLDER. Halte durch, es wird besser."},
  {"id": 274, "text": "Hey PLACEHOLDER, du bist nicht allein. Du hast Unterstützung auf deinem Weg!"}
];

const umzugEN = [
  {"id": 250, "text": "You've got this, PLACEHOLDER! Every beginning is a chance."},
  {"id": 251, "text": "Changes can be challenging, PLACEHOLDER, but they bring growth."},
  {"id": 252, "text": "It's normal to feel uncertain, PLACEHOLDER. Give it time, it'll get better."},
  {"id": 253, "text": "Hello PLACEHOLDER! Take time to settle in."},
  {"id": 254, "text": "Uncertainties with moving will pass, PLACEHOLDER. You'll love it!"},
  {"id": 255, "text": "Hey PLACEHOLDER, you're not alone. Friends await you."},
  {"id": 256, "text": "It takes time to adjust, PLACEHOLDER. Be patient, it'll improve."},
  {"id": 257, "text": "Believe in yourself, PLACEHOLDER! You're doing great."},
  {"id": 258, "text": "It's okay to be unsure, PLACEHOLDER. You're doing great!"},
  {"id": 259, "text": "Hey PLACEHOLDER, changes are opportunities for growth."},
  {"id": 260, "text": "Moving is tough, PLACEHOLDER, but you'll find a new home."},
  {"id": 261, "text": "Hey PLACEHOLDER! Don't let uncertainty overshadow the joy."},
  {"id": 262, "text": "The initial phase is challenging, PLACEHOLDER, but it gets better. Stay positive!"},
  {"id": 263, "text": "No matter how difficult, PLACEHOLDER, you'll emerge stronger."},
  {"id": 264, "text": "Changes are worth it, PLACEHOLDER. Hang in there, it'll become familiar."},
  {"id": 265, "text": "Hey PLACEHOLDER, each day brings new possibilities. Enjoy the journey!"},
  {"id": 266, "text": "Uncertainties are temporary, PLACEHOLDER. Soon, it'll be familiar."},
  {"id": 267, "text": "Hey PLACEHOLDER, you're brave! Trust that everything will be okay."},
  {"id": 268, "text": "It's normal to feel uncomfortable at first, PLACEHOLDER. It gets easier."},
  {"id": 269, "text": "You're stronger than you think, PLACEHOLDER! Trust your path."},
  {"id": 270, "text": "Hey PLACEHOLDER, every challenge is an opportunity to grow."},
  {"id": 271, "text": "Changes bring something new, PLACEHOLDER. Look forward to discoveries!"},
  {"id": 272, "text": "Hey PLACEHOLDER, you're doing great! Soon, everything will be more familiar."},
  {"id": 273, "text": "Uncertainties fade, PLACEHOLDER. Hang in there, it gets better."},
  {"id": 274, "text": "Hey PLACEHOLDER, you're not alone. You have support on your journey!"}
];

const umzugES = [
  {"id": 250, "text": "¡Tú puedes, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 251, "text": "Los cambios pueden ser desafiantes, PLACEHOLDER, pero traen crecimiento."},
  {"id": 252, "text": "Es normal sentirse inseguro, PLACEHOLDER. Dale tiempo, mejorará."},
  {"id": 253, "text": "¡Hola PLACEHOLDER! Tómate tiempo para instalarte."},
  {"id": 254, "text": "Las incertidumbres con la mudanza pasarán, PLACEHOLDER. ¡Te encantará!"},
  {"id": 255, "text": "Hola PLACEHOLDER, no estás solo. Los amigos te esperan."},
  {"id": 256, "text": "Lleva tiempo adaptarse, PLACEHOLDER. Ten paciencia, mejorará."},
  {"id": 257, "text": "Cree en ti mismo, PLACEHOLDER. ¡Lo estás haciendo genial!"},
  {"id": 258, "text": "Está bien sentirse inseguro, PLACEHOLDER. ¡Lo estás haciendo genial!"},
  {"id": 259, "text": "Hola PLACEHOLDER, los cambios son oportunidades para crecer."},
  {"id": 260, "text": "Mudarse es difícil, PLACEHOLDER, pero encontrarás un nuevo hogar."},
  {"id": 261, "text": "¡Hola PLACEHOLDER! No dejes que la incertidumbre oscurezca la alegría."},
  {"id": 262, "text": "La fase inicial es desafiante, PLACEHOLDER, pero mejora. ¡Mantente positivo!"},
  {"id": 263, "text": "No importa cuán difícil sea, PLACEHOLDER, saldrás más fuerte."},
  {"id": 264, "text": "Los cambios valen la pena, PLACEHOLDER. Aguanta, se volverá familiar."},
  {"id": 265, "text": "Hola PLACEHOLDER, cada día trae nuevas posibilidades. ¡Disfruta el viaje!"},
  {"id": 266, "text": "Las incertidumbres son temporales, PLACEHOLDER. Pronto será familiar."},
  {"id": 267, "text": "Hola PLACEHOLDER, ¡eres valiente! Confía en que todo estará bien."},
  {"id": 268, "text": "Es normal sentirse incómodo al principio, PLACEHOLDER. Se vuelve más fácil."},
  {"id": 269, "text": "Eres más fuerte de lo que piensas, PLACEHOLDER. ¡Confía en tu camino!"},
  {"id": 270, "text": "Hola PLACEHOLDER, cada desafío es una oportunidad para crecer."},
  {"id": 271, "text": "Los cambios traen algo nuevo, PLACEHOLDER. ¡Espera con anticipación descubrimientos!"},
  {"id": 272, "text": "Hola PLACEHOLDER, ¡lo estás haciendo genial! Pronto, todo será más familiar."},
  {"id": 273, "text": "Las incertidumbres se desvanecen, PLACEHOLDER. ¡Aguanta, mejora!"},
  {"id": 274, "text": "Hola PLACEHOLDER, no estás solo. ¡Tienes apoyo en tu camino!"}
];

const exAngstES = [
  {"id": 226, "text": "¡Tú puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 227, "text": "Mantente fuerte, PLACEHOLDER! El sol volverá a brillar para ti."},
  {"id": 228, "text": "Confía en ti mismo, PLACEHOLDER! Eres más fuerte de lo que piensas."},
  {"id": 229, "text": "Está bien luchar, PLACEHOLDER! Cada avance cuenta."},
  {"id": 230, "text": "Aguanta, PLACEHOLDER! Crecerás a través de los desafíos."},
  {"id": 231, "text": "Cree en tu fuerza, PLACEHOLDER! No estás solo."},
  {"id": 232, "text": "Paso a paso, PLACEHOLDER! Te estás moviendo hacia adelante."},
  {"id": 233, "text": "No te rindas, PLACEHOLDER! El futuro tiene cosas buenas para ti."},
  {"id": 234, "text": "El éxito está llegando, PLACEHOLDER! Permanece comprometido y ten paciencia."},
  {"id": 235, "text": "Tropezar está permitido, PLACEHOLDER! Levántate y sigue adelante."},
  {"id": 236, "text": "Siéntete orgulloso de ti mismo, PLACEHOLDER! Estás progresando."},
  {"id": 237, "text": "La oscuridad se disipará, PLACEHOLDER! La luz está cada vez más cerca."},
  {"id": 238, "text": "Eres resistente, PLACEHOLDER! Cada día es una nueva oportunidad."},
  {"id": 239, "text": "La fuerza radica en tu singularidad, PLACEHOLDER!"},
  {"id": 240, "text": "Acepta los cambios, PLACEHOLDER! Conducen al crecimiento."},
  {"id": 241, "text": "Tu historia aún no ha terminado, PLACEHOLDER!"},
  {"id": 242, "text": "Estás en el camino correcto, PLACEHOLDER! Confía en el proceso."},
  {"id": 243, "text": "Los miedos se desvanecen, PLACEHOLDER! Cree en tu fuerza interior."},
  {"id": 244, "text": "Incluso en la oscuridad, hay esperanza, PLACEHOLDER!"},
  {"id": 245, "text": "Cada día es un nuevo comienzo, PLACEHOLDER!"},
  {"id": 246, "text": "Permanece persistente, PLACEHOLDER! Estás dando forma a tu futuro."},
  {"id": 247, "text": "Las estrellas brillan para ti, PLACEHOLDER!"},
  {"id": 248, "text": "No te rindas, PLACEHOLDER! Lo mejor está por venir."},
  {"id": 249, "text": "No estás solo, PLACEHOLDER! Juntos somos fuertes."},
  {"id": 250, "text": "Tu fuerza es impresionante, PLACEHOLDER! Continúa así."},
];

const SelbstzweifelEN = [
  {"id": 376, "text": "You can do it, PLACEHOLDER! Every beginning is an opportunity."},
  {"id": 377, "text": "Be proud of yourself, PLACEHOLDER! You are stronger than you think."},
  {"id": 378, "text": "Believe in your abilities, PLACEHOLDER! You have many talents."},
  {"id": 379, "text": "Don't worry, PLACEHOLDER. You are on the right path."},
  {"id": 380, "text": "Every day is a chance to grow, PLACEHOLDER. You are getting better."},
  {"id": 381, "text": "Have confidence in yourself, PLACEHOLDER! You are unique and valuable."},
  {"id": 382, "text": "Don't be discouraged, PLACEHOLDER. You are on the right track."},
  {"id": 383, "text": "Remember, PLACEHOLDER, you are more than enough."},
  {"id": 384, "text": "Be patient with yourself, PLACEHOLDER. Change takes time."},
  {"id": 385, "text": "You are not alone, PLACEHOLDER. Many people support you."},
  {"id": 386, "text": "Don't give up, PLACEHOLDER. The sun will shine for you again."},
  {"id": 387, "text": "Remember, PLACEHOLDER, you deserve love and respect."},
  {"id": 388, "text": "You are brave, PLACEHOLDER! Challenges make you stronger."},
  {"id": 389, "text": "Celebrate small victories, PLACEHOLDER. Every step counts."},
  {"id": 390, "text": "Listen to your inner voice, PLACEHOLDER. You know yourself best."},
  {"id": 391, "text": "Don't let doubts hold you back, PLACEHOLDER. You are powerful."},
  {"id": 392, "text": "Enjoy your progress, PLACEHOLDER. You are doing great things."},
  {"id": 393, "text": "Surround yourself with positivity, PLACEHOLDER. You deserve happiness."},
  {"id": 394, "text": "Focus on the positive, PLACEHOLDER. Good things are coming."},
  {"id": 395, "text": "You are unique, PLACEHOLDER. That makes you special."},
  {"id": 396, "text": "Believe in your strength, PLACEHOLDER. You are indestructible."},
  {"id": 397, "text": "Be proud of your journey, PLACEHOLDER. Every step counts."},
  {"id": 398, "text": "You have the power, PLACEHOLDER. Trust in your abilities."},
  {"id": 399, "text": "Stay focused, PLACEHOLDER. You will overcome."},
  {"id": 400, "text": "You deserve love and happiness, PLACEHOLDER. Allow yourself."},
];


const SelbstzweifelES = [
  {"id": 376, "text": "¡Puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 377, "text": "Siéntete orgulloso/a de ti mismo/a, PLACEHOLDER. Eres más fuerte de lo que piensas."},
  {"id": 378, "text": "Cree en tus habilidades, PLACEHOLDER. Tienes muchos talentos."},
  {"id": 379, "text": "No te preocupes, PLACEHOLDER. Estás en el camino correcto."},
  {"id": 380, "text": "Cada día es una oportunidad para crecer, PLACEHOLDER. Estás mejorando."},
  {"id": 381, "text": "Ten confianza en ti mismo/a, PLACEHOLDER. Eres único/a y valioso/a."},
  {"id": 382, "text": "No te desanimes, PLACEHOLDER. Estás en la dirección correcta."},
  {"id": 383, "text": "Recuerda, PLACEHOLDER, eres más que suficiente."},
  {"id": 384, "text": "Ten paciencia contigo mismo/a, PLACEHOLDER. El cambio lleva tiempo."},
  {"id": 385, "text": "No estás solo/a, PLACEHOLDER. Mucha gente te apoya."},
  {"id": 386, "text": "No te rindas, PLACEHOLDER. El sol volverá a brillar para ti."},
  {"id": 387, "text": "Recuerda, PLACEHOLDER, mereces amor y respeto."},
  {"id": 388, "text": "Eres valiente, PLACEHOLDER. Los desafíos te hacen más fuerte."},
  {"id": 389, "text": "Celebra pequeñas victorias, PLACEHOLDER. Cada paso cuenta."},
  {"id": 390, "text": "Escucha tu voz interior, PLACEHOLDER. Te conoces mejor."},
  {"id": 391, "text": "No dejes que las dudas te frenen, PLACEHOLDER. Eres poderoso/a."},
  {"id": 392, "text": "Disfruta de tus progresos, PLACEHOLDER. Estás haciendo cosas grandiosas."},
  {"id": 393, "text": "Rodeate de positividad, PLACEHOLDER. Te mereces la felicidad."},
  {"id": 394, "text": "Enfócate en lo positivo, PLACEHOLDER. Cosas buenas están por venir."},
  {"id": 395, "text": "Eres único/a, PLACEHOLDER. Eso te hace especial."},
  {"id": 396, "text": "Cree en tu fuerza, PLACEHOLDER. Eres indestructible."},
  {"id": 397, "text": "Siéntete orgulloso/a de tu viaje, PLACEHOLDER. Cada paso cuenta."},
  {"id": 398, "text": "Tienes el poder, PLACEHOLDER. Confía en tus habilidades."},
  {"id": 399, "text": "Mantente enfocado/a, PLACEHOLDER. Superarás cualquier obstáculo."},
  {"id": 400, "text": "Mereces amor y felicidad, PLACEHOLDER. Permítetelo."},
];

const SelbstFindungDE = [
  {"id": 401, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 402, "text": "Bleib stark, PLACEHOLDER! Deine Reise ist einzigartig und wertvoll."},
  {"id": 403, "text": "Egal wer du bist, PLACEHOLDER, du bist wichtig und wertvoll."},
  {"id": 404, "text": "Vertrau dir selbst, PLACEHOLDER! Du hast die Stärke, Herausforderungen zu überwinden."},
  {"id": 405, "text": "Sei stolz auf dich, PLACEHOLDER! Jeder Schritt zählt."},
  {"id": 406, "text": "Halte durch, PLACEHOLDER! Die Antwort liegt in dir."},
  {"id": 407, "text": "Es ist okay, unsicher zu sein, PLACEHOLDER. Du wirst deinen Weg finden."},
  {"id": 408, "text": "Verändere dich, PLACEHOLDER! Das ist der Weg zur Selbstentdeckung."},
  {"id": 409, "text": "Glaub an deine Stärke, PLACEHOLDER! Du bist mutiger als du denkst."},
  {"id": 410, "text": "Die Reise zu sich selbst ist lohnenswert, PLACEHOLDER. Nimm dir die Zeit."},
  {"id": 411, "text": "Erforsche deine Identität, PLACEHOLDER. Du bist ein einzigartiges Puzzle."},
  {"id": 412, "text": "Jeder Zweifel ist eine Gelegenheit zu wachsen, PLACEHOLDER. Vertrau darauf."},
  {"id": 413, "text": "Deine Geschichte ist noch nicht zu Ende, PLACEHOLDER. Gestalte sie."},
  {"id": 414, "text": "Lass dich nicht entmutigen, PLACEHOLDER. Deine Reise hat erst begonnen."},
  {"id": 415, "text": "Akzeptiere dich selbst, PLACEHOLDER. Du bist wertvoll."},
  {"id": 416, "text": "In der Vielfalt deiner Gedanken findest du Klarheit, PLACEHOLDER."},
  {"id": 417, "text": "Es ist nie zu spät, sich selbst zu entdecken, PLACEHOLDER. Beginne jetzt."},
  {"id": 418, "text": "Deine Einzigartigkeit bereichert die Welt, PLACEHOLDER. Sei stolz darauf."},
  {"id": 419, "text": "Entfalte dich, PLACEHOLDER! Die Welt braucht deine Authentizität."},
  {"id": 420, "text": "Gib nicht auf, PLACEHOLDER! Das Beste kommt noch."},
  {"id": 421, "text": "Du bist auf dem richtigen Weg, PLACEHOLDER. Vertraue dem Prozess."},
  {"id": 422, "text": "Selbstzweifel sind nur vorübergehend, PLACEHOLDER. Deine Stärke bleibt."},
  {"id": 423, "text": "Sei geduldig mit dir selbst, PLACEHOLDER. Gute Dinge brauchen Zeit."},
  {"id": 424, "text": "Entdecke die Schönheit in deiner Einzigartigkeit, PLACEHOLDER."},
  {"id": 425, "text": "Du bist mehr als genug, PLACEHOLDER. Glaube an dich."},
];

const SelbstFindungEN = [
  {"id": 401, "text": "You've got this, PLACEHOLDER! Every beginning is an opportunity."},
  {"id": 402, "text": "Stay strong, PLACEHOLDER! Your journey is unique and valuable."},
  {"id": 403, "text": "No matter who you are, PLACEHOLDER, you are important and valuable."},
  {"id": 404, "text": "Trust yourself, PLACEHOLDER! You have the strength to overcome challenges."},
  {"id": 405, "text": "Be proud of yourself, PLACEHOLDER! Every step counts."},
  {"id": 406, "text": "Hang in there, PLACEHOLDER! The answer lies within you."},
  {"id": 407, "text": "It's okay to be unsure, PLACEHOLDER. You will find your way."},
  {"id": 408, "text": "Embrace change, PLACEHOLDER! That's the path to self-discovery."},
  {"id": 409, "text": "Believe in your strength, PLACEHOLDER! You are braver than you think."},
  {"id": 410, "text": "The journey to oneself is worthwhile, PLACEHOLDER. Take the time."},
  {"id": 411, "text": "Explore your identity, PLACEHOLDER. You are a unique puzzle."},
  {"id": 412, "text": "Every doubt is an opportunity to grow, PLACEHOLDER. Trust it."},
  {"id": 413, "text": "Your story is not over yet, PLACEHOLDER. Shape it."},
  {"id": 414, "text": "Don't be discouraged, PLACEHOLDER. Your journey has just begun."},
  {"id": 415, "text": "Accept yourself, PLACEHOLDER. You are valuable."},
  {"id": 416, "text": "In the diversity of your thoughts, you find clarity, PLACEHOLDER."},
  {"id": 417, "text": "It's never too late to discover yourself, PLACEHOLDER. Start now."},
  {"id": 418, "text": "Your uniqueness enriches the world, PLACEHOLDER. Be proud of it."},
  {"id": 419, "text": "Unfold yourself, PLACEHOLDER! The world needs your authenticity."},
  {"id": 420, "text": "Don't give up, PLACEHOLDER! The best is yet to come."},
  {"id": 421, "text": "You are on the right path, PLACEHOLDER. Trust the process."},
  {"id": 422, "text": "Self-doubt is only temporary, PLACEHOLDER. Your strength remains."},
  {"id": 423, "text": "Be patient with yourself, PLACEHOLDER. Good things take time."},
  {"id": 424, "text": "Discover the beauty in your uniqueness, PLACEHOLDER."},
  {"id": 425, "text": "You are more than enough, PLACEHOLDER. Believe in yourself."},
];

const SelbstFindungES = [
  {"id": 401, "text": "¡Tú puedes, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 402, "text": "Mantente fuerte, PLACEHOLDER. Tu viaje es único y valioso."},
  {"id": 403, "text": "No importa quién seas, PLACEHOLDER, eres importante y valioso."},
  {"id": 404, "text": "Confía en ti mismo, PLACEHOLDER. Tienes la fuerza para superar desafíos."},
  {"id": 405, "text": "Siéntete orgulloso/a de ti mismo/a, PLACEHOLDER. Cada paso cuenta."},
  {"id": 406, "text": "No te rindas, PLACEHOLDER. La respuesta está en ti."},
  {"id": 407, "text": "Está bien sentirse inseguro/a, PLACEHOLDER. Encontrarás tu camino."},
  {"id": 408, "text": "Acepta el cambio, PLACEHOLDER. Ese es el camino hacia el autodescubrimiento."},
  {"id": 409, "text": "Cree en tu fuerza, PLACEHOLDER. Eres más valiente de lo que piensas."},
  {"id": 410, "text": "El viaje hacia uno mismo vale la pena, PLACEHOLDER. Tómate el tiempo."},
  {"id": 411, "text": "Explora tu identidad, PLACEHOLDER. Eres un rompecabezas único."},
  {"id": 412, "text": "Cada duda es una oportunidad para crecer, PLACEHOLDER. Confía en ello."},
  {"id": 413, "text": "Tu historia aún no ha terminado, PLACEHOLDER. Dále forma."},
  {"id": 414, "text": "No te desanimes, PLACEHOLDER. Tu viaje acaba de comenzar."},
  {"id": 415, "text": "Ámate a ti mismo/a, PLACEHOLDER. Eres valioso/a."},
  {"id": 416, "text": "En la diversidad de tus pensamientos encuentras claridad, PLACEHOLDER."},
  {"id": 417, "text": "Nunca es tarde para descubrirte, PLACEHOLDER. Comienza ahora."},
  {"id": 418, "text": "Tu singularidad enriquece el mundo, PLACEHOLDER. Siéntete orgulloso/a."},
  {"id": 419, "text": "Despliégate, PLACEHOLDER. El mundo necesita tu autenticidad."},
  {"id": 420, "text": "¡No te rindas, PLACEHOLDER! Lo mejor está por venir."},
  {"id": 421, "text": "Estás en el camino correcto, PLACEHOLDER. Confía en el proceso."},
  {"id": 422, "text": "La duda sobre uno mismo es solo temporal, PLACEHOLDER. Tu fuerza permanece."},
  {"id": 423, "text": "Ten paciencia contigo mismo/a, PLACEHOLDER. Las cosas buenas llevan tiempo."},
  {"id": 424, "text": "Descubre la belleza en tu singularidad, PLACEHOLDER."},
  {"id": 425, "text": "Eres más que suficiente, PLACEHOLDER. Cree en ti mismo/a."},
];

const SelbstLiebeDE = [
  {"id": 426, "text": "Du schaffst das, PLACEHOLDER! Jeder Anfang ist eine Chance."},
  {"id": 427, "text": "Sei stolz auf dich, PLACEHOLDER! Du bist einzigartig."},
  {"id": 428, "text": "Glaube an dich, PLACEHOLDER! Du bist wertvoll."},
  {"id": 429, "text": "Akzeptiere dich, PLACEHOLDER! Perfektion liegt im Unvollkommenen."},
  {"id": 430, "text": "Selbstliebe ist der Schlüssel, PLACEHOLDER! Du bist genug."},
  {"id": 431, "text": "Vertraue dir, PLACEHOLDER! Deine Reise ist einzigartig."},
  {"id": 432, "text": "Liebe dich selbst, PLACEHOLDER! Du bist wundervoll."},
  {"id": 433, "text": "Bleib stark, PLACEHOLDER! Deine Stärke zeigt sich im Durchhalten."},
  {"id": 434, "text": "Akzeptiere und liebe dich, PLACEHOLDER! Du bist es wert."},
  {"id": 435, "text": "Du bist einzigartig, PLACEHOLDER! Deine Individualität ist deine Stärke."},
  {"id": 436, "text": "Gib nicht auf, PLACEHOLDER! Das Beste kommt noch."},
  {"id": 437, "text": "Du machst Fortschritte, PLACEHOLDER! Kleine Schritte führen zum Ziel."},
  {"id": 438, "text": "Lass dich nicht entmutigen, PLACEHOLDER! Du bist auf dem richtigen Weg."},
  {"id": 439, "text": "Selbstliebe heilt, PLACEHOLDER! Nimm dich an, wie du bist."},
  {"id": 440, "text": "Du bist stark, PLACEHOLDER! Glaube an deine Stärke."},
  {"id": 441, "text": "Habe Vertrauen, PLACEHOLDER! Du kannst jede Herausforderung meistern."},
  {"id": 442, "text": "Liebe deine Macken, PLACEHOLDER! Sie machen dich einzigartig."},
  {"id": 443, "text": "Bleib positiv, PLACEHOLDER! Positives Denken bringt positive Veränderungen."},
  {"id": 444, "text": "Du verdienst Liebe, PLACEHOLDER! Liebe beginnt bei dir selbst."},
  {"id": 445, "text": "Glaube an deine Schönheit, PLACEHOLDER! Du strahlst von innen."},
  {"id": 446, "text": "Akzeptiere dich ohne Bedingungen, PLACEHOLDER! Du bist liebenswert."},
  {"id": 447, "text": "Liebe deinen Weg, PLACEHOLDER! Jeder Schritt ist wertvoll."},
  {"id": 448, "text": "Du bist ein Geschenk, PLACEHOLDER! Schätze dich selbst."},
  {"id": 449, "text": "Erfolge beginnen mit Selbstliebe, PLACEHOLDER! Du bist auf dem richtigen Weg."},
  {"id": 450, "text": "Du bist genug, PLACEHOLDER! Genieße deine Einzigartigkeit."}
];
const SelbstLiebeEN = [
  {"id": 426, "text": "You can do it, PLACEHOLDER! Every beginning is an opportunity."},
  {"id": 427, "text": "Be proud of yourself, PLACEHOLDER! You are unique."},
  {"id": 428, "text": "Believe in yourself, PLACEHOLDER! You are valuable."},
  {"id": 429, "text": "Accept yourself, PLACEHOLDER! Perfection lies in imperfection."},
  {"id": 430, "text": "Self-love is the key, PLACEHOLDER! You are enough."},
  {"id": 431, "text": "Trust yourself, PLACEHOLDER! Your journey is unique."},
  {"id": 432, "text": "Love yourself, PLACEHOLDER! You are wonderful."},
  {"id": 433, "text": "Stay strong, PLACEHOLDER! Your strength is revealed in persistence."},
  {"id": 434, "text": "Accept and love yourself, PLACEHOLDER! You are worth it."},
  {"id": 435, "text": "You are unique, PLACEHOLDER! Your individuality is your strength."},
  {"id": 436, "text": "Don't give up, PLACEHOLDER! The best is yet to come."},
  {"id": 437, "text": "You are making progress, PLACEHOLDER! Small steps lead to the goal."},
  {"id": 438, "text": "Don't be discouraged, PLACEHOLDER! You are on the right path."},
  {"id": 439, "text": "Self-love heals, PLACEHOLDER! Accept yourself as you are."},
  {"id": 440, "text": "You are strong, PLACEHOLDER! Believe in your strength."},
  {"id": 441, "text": "Have confidence, PLACEHOLDER! You can overcome any challenge."},
  {"id": 442, "text": "Love your flaws, PLACEHOLDER! They make you unique."},
  {"id": 443, "text": "Stay positive, PLACEHOLDER! Positive thinking brings positive changes."},
  {"id": 444, "text": "You deserve love, PLACEHOLDER! Love starts with yourself."},
  {"id": 445, "text": "Believe in your beauty, PLACEHOLDER! You radiate from within."},
  {"id": 446, "text": "Accept yourself unconditionally, PLACEHOLDER! You are lovable."},
  {"id": 447, "text": "Love your journey, PLACEHOLDER! Every step is valuable."},
  {"id": 448, "text": "You are a gift, PLACEHOLDER! Treasure yourself."},
  {"id": 449, "text": "Success begins with self-love, PLACEHOLDER! You are on the right path."},
  {"id": 450, "text": "You are enough, PLACEHOLDER! Embrace your uniqueness."}
];

const SelbstLiebeES = [
  {"id": 426, "text": "¡Tú puedes hacerlo, PLACEHOLDER! Cada comienzo es una oportunidad."},
  {"id": 427, "text": "Siéntete orgulloso/a de ti mismo/a, PLACEHOLDER! Eres único/a."},
  {"id": 428, "text": "Cree en ti mismo/a, PLACEHOLDER! Eres valioso/a."},
  {"id": 429, "text": "Ámate a ti mismo/a, PLACEHOLDER! La perfección reside en la imperfección."},
  {"id": 430, "text": "El amor propio es la clave, PLACEHOLDER! Eres suficiente."},
  {"id": 431, "text": "Confía en ti mismo/a, PLACEHOLDER! Tu viaje es único."},
  {"id": 432, "text": "Ámate, PLACEHOLDER! Eres maravilloso/a."},
  {"id": 433, "text": "Mantente fuerte, PLACEHOLDER! Tu fuerza se revela en la persistencia."},
  {"id": 434, "text": "Ámate y quiérete, PLACEHOLDER! Tú vales la pena."},
  {"id": 435, "text": "Eres único/a, PLACEHOLDER! Tu individualidad es tu fortaleza."},
  {"id": 436, "text": "No te rindas, PLACEHOLDER! Lo mejor está por venir."},
  {"id": 437, "text": "Estás progresando, PLACEHOLDER! Pequeños pasos conducen al objetivo."},
  {"id": 438, "text": "No te desanimes, PLACEHOLDER! Estás en el camino correcto."},
  {"id": 439, "text": "El amor propio sana, PLACEHOLDER! Acéptate tal como eres."},
  {"id": 440, "text": "Eres fuerte, PLACEHOLDER! Cree en tu fuerza."},
  {"id": 441, "text": "Ten confianza, PLACEHOLDER! Puedes superar cualquier desafío."},
  {"id": 442, "text": "Ama tus imperfecciones, PLACEHOLDER! Te hacen único/a."},
  {"id": 443, "text": "Mantén una actitud positiva, PLACEHOLDER! El pensamiento positivo trae cambios positivos."},
  {"id": 444, "text": "Mereces amor, PLACEHOLDER! El amor comienza contigo mismo/a."},
  {"id": 445, "text": "Cree en tu belleza, PLACEHOLDER! Irradias desde adentro."},
  {"id": 446, "text": "Acéptate incondicionalmente, PLACEHOLDER! Eres adorable."},
  {"id": 447, "text": "Ama tu camino, PLACEHOLDER! Cada paso es valioso."},
  {"id": 448, "text": "Eres un regalo, PLACEHOLDER! Valórate a ti mismo/a."},
  {"id": 449, "text": "El éxito comienza con el amor propio, PLACEHOLDER! Estás en el camino correcto."},
  {"id": 450, "text": "Eres suficiente, PLACEHOLDER! Abraza tu singularidad."}
];

const languages = {
  "am-ET": "Amharic",
  "ar-SA": "Arabic",
  "be-BY": "Bielarus",
  "bem-ZM": "Bemba",
  "bi-VU": "Bislama",
  "bjs-BB": "Bajan",
  "bn-IN": "Bengali",
  "bo-CN": "Tibetan",
  "br-FR": "Breton",
  "bs-BA": "Bosnian",
  "ca-ES": "Catalan",
  "cop-EG": "Coptic",
  "cs-CZ": "Czech",
  "cy-GB": "Welsh",
  "da-DK": "Danish",
  "dz-BT": "Dzongkha",
  "de-DE": "German",
  "dv-MV": "Maldivian",
  "el-GR": "Greek",
  "en-GB": "English",
  "es-ES": "Spanish",
  "et-EE": "Estonian",
  "eu-ES": "Basque",
  "fa-IR": "Persian",
  "fi-FI": "Finnish",
  "fn-FNG": "Fanagalo",
  "fo-FO": "Faroese",
  "fr-FR": "French",
  "gl-ES": "Galician",
  "gu-IN": "Gujarati",
  "ha-NE": "Hausa",
  "he-IL": "Hebrew",
  "hi-IN": "Hindi",
  "hr-HR": "Croatian",
  "hu-HU": "Hungarian",
  "id-ID": "Indonesian",
  "is-IS": "Icelandic",
  "it-IT": "Italian",
  "ja-JP": "Japanese",
  "kk-KZ": "Kazakh",
  "km-KM": "Khmer",
  "kn-IN": "Kannada",
  "ko-KR": "Korean",
  "ku-TR": "Kurdish",
  "ky-KG": "Kyrgyz",
  "la-VA": "Latin",
  "lo-LA": "Lao",
  "lv-LV": "Latvian",
  "men-SL": "Mende",
  "mg-MG": "Malagasy",
  "mi-NZ": "Maori",
  "ms-MY": "Malay",
  "mt-MT": "Maltese",
  "my-MM": "Burmese",
  "ne-NP": "Nepali",
  "niu-NU": "Niuean",
  "nl-NL": "Dutch",
  "no-NO": "Norwegian",
  "ny-MW": "Nyanja",
  "ur-PK": "Pakistani",
  "pau-PW": "Palauan",
  "pa-IN": "Panjabi",
  "ps-PK": "Pashto",
  "pis-SB": "Pijin",
  "pl-PL": "Polish",
  "pt-PT": "Portuguese",
  "rn-BI": "Kirundi",
  "ro-RO": "Romanian",
  "ru-RU": "Russian",
  "sg-CF": "Sango",
  "si-LK": "Sinhala",
  "sk-SK": "Slovak",
  "sm-WS": "Samoan",
  "sn-ZW": "Shona",
  "so-SO": "Somali",
  "sq-AL": "Albanian",
  "sr-RS": "Serbian",
  "sv-SE": "Swedish",
  "sw-SZ": "Swahili",
  "ta-LK": "Tamil",
  "te-IN": "Telugu",
  "tet-TL": "Tetum",
  "tg-TJ": "Tajik",
  "th-TH": "Thai",
  "ti-TI": "Tigrinya",
  "tk-TM": "Turkmen",
  "tl-PH": "Tagalog",
  "tn-BW": "Tswana",
  "to-TO": "Tongan",
  "tr-TR": "Turkish",
  "uk-UA": "Ukrainian",
  "uz-UZ": "Uzbek",
  "vi-VN": "Vietnamese",
  "wo-SN": "Wolof",
  "xh-ZA": "Xhosa",
  "yi-YD": "Yiddish",
  "zu-ZA": "Zulu"
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState(1);
  
  const {t, i18n} = useTranslation(); 
  
  const navigation = useNavigation();
  const [firstTime, setFirstTime] = useState(false); 
  const [username, setUserName] = useState('');
  const [name, setName] = useState(''); 
  const [isPopUpVisible, setPopUpVisibility] = useState(false);

  const handleNameChange = (text) => {
    setName(text); 
  };


  const [userItems, setItems] = useReducer(userItemsReducer, initialState);
  const [userFetched, setUserFetched] = useState(false);


  const hasSentMessageToday = async (recipientWallet) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sentMessages = await AsyncStorage.getItem('sentMessages');
      if (sentMessages) {
        const parsedMessages = JSON.parse(sentMessages);
        return parsedMessages[today] && parsedMessages[today].includes(recipientWallet);
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking sent messages: ', error);
      return false;
    }
  };
  
  

   const fetchUsersList = async () => {
    try {
      const response = await fetch('https://binaramics.com:5173/getUserList');
    
      if (!response.ok) {
          return null;
      }
    
      const data = await response.json(); 
      const selectedLanguage = await AsyncStorage.getItem('selectedLanguage');
      let messagesArray;

      const secretKeyString = await AsyncStorage.getItem("walletSecretKey");
      
      const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));
  
      const wallet = Keypair.fromSecretKey(secretKey);
      let accumulatedMessages = [];
      
      if (data && data.userList) {
        for (const user of data.userList) {

            if(user.wallet == wallet.publicKey) {
              continue;
            }
            const hasSentToday = await hasSentMessageToday(user.wallet);

            if (hasSentToday) {
              continue;
            }
            
            

              let languageSel;
              if (selectedLanguage) {
                if (selectedLanguage == 2 || selectedLanguage == "en") {
                  languageSel = "EN";
                } else if (selectedLanguage == 1) {
                  languageSel = "DE";
                } else if (selectedLanguage == 3) {
                  languageSel = "ES";
                } else if (selectedLanguage == 4) {
                  languageSel = "FR";
                }
                
              }
              else {
                languageSel = "EN";
              }

              let realUserName = user.username;
              if(realUserName === null) {
                if (languageSel === "DE") {
                  realUserName = "Anonym";
                }
                if (languageSel === "EN") {
                  realUserName = "Anonymous";
                }

                if (languageSel === "FR") {
                  realUserName = "Anonyme";
                }

                
                if (languageSel === "ES") {
                  realUserName = "Anónimo";
                }
              }
              if (user.username === "Anonymous") {
                if (languageSel === "DE") {
                  realUserName = "Anonym";
                }
                if (languageSel === "EN") {
                  realUserName = "Anonymous";
                }
                if (languageSel === "FR") {
                  realUserName = "Anonyme";
                }
                if (languageSel === "ES") {
                  realUserName = "Anónimo";
                }
              }
              
              switch (user.mId) {
                case 1:
                  if(languageSel === "DE") {
                    messagesArray = gesundheitDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = gesundheitEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = gesundheitEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = gesundheitES;
                  }
                  break;
                case 2:
                  if(languageSel === "DE") {
                    messagesArray = mentalDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = mentalEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = mentalEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = mentalES;
                  }
                  break;
                case 3:
                  if(languageSel === "DE") {
                    messagesArray = familieDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = familieEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = familieEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = familieES;
                  }
                  break;
                case 4:
                  if(languageSel === "DE") {
                    messagesArray = partnerschaftenDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = partnerschaftenEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = partnerschaftenEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = partnerschaftenES;
                  }
                  break;
                case 5:
                  if(languageSel === "DE") {
                    messagesArray = einsamkeitDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = einsamtkeitEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = einsamtkeitEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = einsamtkeitES;
                  }
                  break;
                case 6:
                  if(languageSel === "DE") {
                    messagesArray = freundschaftenDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = freundschaftenEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = freundschaftenEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = freundschaftenES;
                  }
                  break;
                case 7:
                  if(languageSel === "DE") {
                    messagesArray = umzugDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = umzugEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = umzugEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = umzugES;
                  }
                  break;
                case 8:
                  if(languageSel === "DE") {
                    messagesArray = TrauerBewaeltigungDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = TrauerBewaeltigungEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = TrauerBewaeltigungEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = TrauerBewaeltigungES;
                  }
                  break;
                case 9:
                  
                  if(languageSel === "DE") {
                    messagesArray = TrennungDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = TrennungEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = TrennungES;
                  }
                  break;
                case 10:
     
                  if(languageSel === "DE") {
                    messagesArray = exAngstDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = exAngstEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = exAngstEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = exAngstES;
                  }
                  break;
                case 11:
  
                  if(languageSel === "DE") {
                    messagesArray = SinnfindungDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = SinnfindungEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = SinnfindungES;
                  }
                  break;
                case 12:
                  if(languageSel === "DE") {
                    messagesArray = spirituellDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = spirituellEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = spirituellEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = spirituellES;
                  }
                  break;
                case 13:
                  if(languageSel === "DE") {
                    messagesArray = stressDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = stressEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = stressES;
                  }
                  break;
                case 14:
                  if(languageSel === "DE") {
                    messagesArray = AngstStDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = AngstStEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = AngstStEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = AngstStES;
                  }
                  break;
                case 15:
                  if(languageSel === "DE") {
                    messagesArray = BurnOutDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = BurnOutEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = BurnOutEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = BurnOutES;
                  }
                  break;
                case 16:
                  if(languageSel === "DE") {
                    messagesArray = SelbstzweifelDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = SelbstzweifelEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = SelbstzweifelES;
                  }
                  break;
                case 17:

                  if(languageSel === "DE") {
                    messagesArray = SelbstFindungDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = SelbstFindungEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = SelbstFindungEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = SelbstFindungES;
                  }
                  break;
                case 18:

                  if(languageSel === "DE") {
                    messagesArray = SelbstLiebeDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = SelbstLiebeEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = SelbstLiebeEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = SelbstLiebeES;
                  }
                  break;
                  
                default:
                  if(languageSel === "DE") {
                    messagesArray = motivationalDE;
                  }
                  if(languageSel === "EN") {
                    messagesArray = motivationalEN;
                  }
                  if(languageSel === "FR") {
                    messagesArray = motivationalEN;
                  }
                  if(languageSel === "ES") {
                    messagesArray = motivationalES;
                  }
              }

              if (messagesArray) {
                const randomIndex = Math.floor(Math.random() * messagesArray.length);
                const text = messagesArray[randomIndex].text;
               
                const rndInt = Math.floor(Math.random() * 5) + 1
                let image;

                const finalMessage = text.replace('PLACEHOLDER', user.username);
            
                switch (user.status) {
                  case 1:
                    image = require('../assets/images/HappyIcon.png');
                    break;
                  case 2:
                    image = require('../assets/images/sad1.png');
                    break;
                  case 3:
                   
                  if (rndInt == 1) {
                    image = require('../assets/images/sad1.png');
                  }

                    if (rndInt == 2) {
                      image = require('../assets/images/sad2.png');
                    } 

                    if (rndInt == 3) {
                      image = require('../assets/images/sad3.png');
                    } 

                    if (rndInt == 4) {
                      image = require('../assets/images/sad4.png');
                    } 

                    if (rndInt == 5) {
                      image = require('../assets/images/sad5.png');
                    }
                    break;
                  default:
                    image = require('../assets/images/HappyIcon.png');
                    break;
                }

                const newMessage = {
                  id: getRandomInt(1, 100),
                  messageId: messagesArray[randomIndex].id,
                  mId: user.mId,
                  name: realUserName,
                  wallet: user.wallet,
                  image: image,
                  message: finalMessage,
                  status: user.status,
                };
              
                accumulatedMessages.push(newMessage);
            }
          }
  
          setItems({ type: 'SET_LIST', payload: accumulatedMessages });
          setUserFetched(true);
          return accumulatedMessages;
      } else {
          setUserFetched(false);
          return null;
      }
  } catch (error) {
      setUserFetched(false);
      return null;
  }
  }

  
  const checkLanguage = async () => {
    try {
      const selectedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (selectedLanguage) {
        if(selectedLanguage == 2) {
          i18n.changeLanguage("en");
          }
        if(selectedLanguage == 1) {
          i18n.changeLanguage("ger");
        }
        if(selectedLanguage == 3) {
          i18n.changeLanguage("es");
        }
        if(selectedLanguage == 4) {
          i18n.changeLanguage("fr");
        }
      }
      else {
        i18n.changeLanguage("en");
      }
    } catch (error) {
      console.error('Error checking language: ', error);
    }
  };

  useEffect(() => {
    checkFirstTimeLaunch();
    getUserName();
    fetchUsersList();
    checkLanguage();

    const intervalId = setInterval(() => {
      if(userFetched === false) {
        fetchUsersList();
        }
    }, 100000);

    return () => clearInterval(intervalId);
}, []);

  

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

  const getUserName = async () => {
    try {
      const username = await AsyncStorage.getItem('Username');

      const secretKeyString = await AsyncStorage.getItem("walletSecretKey");
      
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));
  
        const wallet = Keypair.fromSecretKey(secretKey);

      if (username !== null) {
        setUserName(username);


        let sig = await fetchData(wallet);
        if(sig === null || sig === "") {
          sig = await fetchData(wallet);
        }  


        const response = await fetch('https://binaramics.com:5173/newUser/', {
          method: 'POST',
          headers: {
            "Content-Type": `application/json`,
            'Connection': 'keep-alive',
            'Accept-Encoding': '*/*',
        
            Accept: 'application/json',
          },
          body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, username: username}),
          })
  
          const data = await response.json();
          if (data && data.error === "Profile exists") {
            console.log("Profile exists");
          } else {
              console.log("Profile was created");
          }
      }
      else {
        setUserName(null);
        await AsyncStorage.setItem('hasLaunched', 'false');
        setFirstTime(true);
      }
     
    } catch (error) {
      console.error('Error checking username: ', error);
    }
  };

  const checkFirstTimeLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
     
      if (hasLaunched === null) {
        await AsyncStorage.setItem('hasLaunched', 'true');
        setFirstTime(true);
      } else {
        setFirstTime(false);
      }
     
    } catch (error) {
      console.error('Error checking first-time launch: ', error);
    }
  };

  function emojiSwitch(item) {
  
    hidePopUp();
    if(item.id != 3) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Status', {...item})
    }
    else {

      changeStatus("Happy");

      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Toast.show({
          type: 'success',
          text1: t('homepage.success'),
          text2: t('homepage.statuschanged')
        });
      }, 1000);
    }
  }

  const removeFromUserItems = (itemId) => {
    setItems({ type: 'REMOVE_ITEM', itemId });
  };

  function containsEmojis(str) {

    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
    return emojiRegex.test(str);
  }
  
  function containsSpecialCharacters(str) {
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return specialCharsRegex.test(str);
  }


function endFirstTimeScreen(name) {
  if (
    name === null ||
    name === "" ||
    containsEmojis(name) ||
    containsSpecialCharacters(name)
  ) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Toast.show({
      type: 'error',
      text1: t('homepage.error'),
      text2: t('homepage.invaildname')
    });
  } else {
    changeUserName(name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    AsyncStorage.setItem("Username", name);
    setFirstTime(false);
    setUserName(name);
    Toast.show({
      type: 'success',
      text1: t('homepage.welcome') + " " + name,
      text2: t('homepage.welcometext')
    });
  }
}
  
  const slideUpAnimation = useRef(new Animated.Value(0)).current;

  const showPopUp = () => {
    setModalHeight(480);
    setPopUpVisibility(true);
    Animated.timing(slideUpAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };


  const handlePopUpSubmit = () => {
    Toast.show({
      type: 'success',
      text1: t('homepage.success'),
      text2: t('homepage.groupjoined'),
  });
    hidePopUp();
  };

  const [activeSlide, setActiveSlide] = useState(0);

  const renderPagination = () => {
   
   
    const isSmallDevice = height < 700; 
  
    if (!isSmallDevice) {
      return (
        <Pagination
          dotsLength={userItems.length}
          activeDotIndex={activeSlide}
          pagination={false}
          dotStyle={{
            width: 6,
            height: 6,
            borderRadius: 5,
           
            backgroundColor: themeColors.bgDark,
          }}
          inactiveDotOpacity={0.2}
          inactiveDotScale={0.8}
        />
      );
    } else {
      console.log("is null");
      return null;
    }
  };
  

  const [modalHeight, setModalHeight] = useState(null);

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

  const usernameFinal = `${username ?? "Anonymous"}`;

  return (
    <View className="flex-1 relative"  style={{
     backgroundColor: "#FAFAFA",
    }}> 

    
      <SafeAreaView>
          {firstTime && (
          <View  className="justify-between items-center" style={{ marginTop: ios? height * 0.15: height * 0.08 }}>

            <Image 
            source={require('../assets/images/WelcomeIcon.png')} 
            style={{
              height: 150,
              width: 150,
            }} 
          />


    <Text style={{ color: themeColors.text, fontSize: 50, textAlign: 'center' }}>
      {t('homepage.welcome')}
    </Text>
    <Text style={{ color: "rgba(0,0,0,0.5)", fontSize: 11, textAlign: 'center' }}>
    {t('homepage.welcomesub')}
    </Text>
    <SafeAreaView>
      <TextInput
        placeholder={t('homepage.welcomenamefield')}
        maxLength={12}
        style={{
          borderColor: themeColors.bgDark,
         
          borderWidth: 1,
          padding: 10,
          fontSize: 16,
          width: 280,
          borderRadius: 10, 
          backgroundColor: 'white', 
        }}
        value={name} 
        onChangeText={handleNameChange} 
      />

         <View className="flex-row justify-between px-4">
           <TouchableOpacity 
          onPress={() => endFirstTimeScreen(name)}
             style={{marginTop: 20,backgroundColor: themeColors.bgDark}} 
             className="p-4 rounded-full flex-1">
             <Text className="text-center text-white text-base font-semibold">{t('homepage.welcomebutton')}</Text>
           </TouchableOpacity>
         </View>
        </SafeAreaView>
       <View> 
    </View>
  </View>
)}

        {!firstTime && (
        <View className="">
        <View className="mx-4 flex-row justify-between items-center">
        </View>
        <View  className={`px-3 mt-1 items-center ${ios ? 'mt-1' : 'mt-4'}`}>
        <View>
        <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              
              backgroundColor: themeColors.primary,
            }}>

      <View style={{ alignItems: 'center', padding: 5, backgroundColor: themeColors.primary,  marginTop: 12, marginBottom: ios ?0 : 25 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: themeColors.bgLight, opacity: 1, marginBottom: 8 }}>
        Hi, {usernameFinal}

      </Text>
      
      <View style={{ height: 70, width: 240, backgroundColor: '#f3f3f3', borderRadius: 15, padding: 10}}>
        <View style={{ alignItems: 'center', justifyContent: 'space-between'}}>
         
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center'}}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{
                backgroundColor: '#d9d9d9',
                borderRadius: 15,
                padding: 10,
                marginLeft: 8,
              }}
            >
              <Cog6ToothIcon color={themeColors.bgDark} size={27} />

              
            </TouchableOpacity>


            <TouchableOpacity
              onPress={() => showPopUp()}
              style={{
                backgroundColor: '#d9d9d9',
                borderRadius: 15,
                padding: 10,
                marginLeft: 8,
              }}
            >
              {!isPopUpVisible ? (
                <FaceSmileOutline color={themeColors.bgDark} size={27} />
              ) : (
                <FaceSmileOutline color={themeColors.bgDark} size={27} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={{
                backgroundColor: '#d9d9d9',
                borderRadius: 15,
                padding: 10,
                marginLeft: 8,
              }}>

              <UserCircleIcon color={themeColors.bgDark} size={27} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Restart()}
              style={{
                backgroundColor: '#d9d9d9',
                borderRadius: 15,
                padding: 10,
                marginLeft: 8,
              }}
            >
              <ArrowPathIcon color={themeColors.bgDark} size={27} />

              
            </TouchableOpacity>
      </View>
      </View>
      </View>
      </View>
      </View>
      </View>
      </View>
      </View>
      )}

     
      </SafeAreaView>
  
  
      {!firstTime && (
      <View className={`overflow-visible flex justify-center flex-1 ${ios ? 'mt-0' : 'mt-1'}`}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {userFetched === false ? (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 120 }}>
      <Image 
      source={require('../assets/images/Load.gif')} 
      style={{
        height: 100,
        width: 100,
        marginBottom: 10,
      }} 
      />
        <Text style={{ fontSize: 15 }} className="text-center text-base font-semibold">
       
          {t('homepage.loading')}
        </Text>
        </View>
      ) : (
        <View>

    {userItems.length > 0 ? (
      <View>
      <Carousel
      containerCustomStyle={{ overflow: 'visible' }}
      data={userItems}
      renderItem={({ item, index }) => (
        <View style={{ alignItems: 'center' }}>
          <UserCard item={item} removeFromUserItems={removeFromUserItems} />
        </View>
      )}
      firstItem={1}
      loop={false}
      
      
      inactiveSlideScale={0.7}
      inactiveSlideOpacity={0.85}
      sliderWidth={width}
      itemWidth={width * 0.63}
      slideStyle={{ display: 'flex', alignItems: 'center' }}
      layout={'stack'}
      layoutCardOffset={15}
      useScrollView={true}
      onSnapToItem={(index) => setActiveSlide(index)}
      />
     
      {renderPagination()}
   
      </View>
     
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 120 }}>
        <Image 
        source={require('../assets/images/imageHappy1.png')} 
        style={{
          height: 200,
          width: 200,
          marginBottom: 10,
        }} 
        />
        <Text style={{ fontSize: 15 }} className="text-center text-base font-semibold">
       
          {t('homepage.nonewusers')}
        </Text>
        </View>
          )
      }
      </View>
      
      )}
      
    </View>
    
        <View>
        <Modal
        isVisible={isPopUpVisible}
        onBackdropPress={hidePopUp}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <Animated.View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
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
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        
        <TouchableOpacity
    onPress={() => hidePopUp()}
    style={{
      
      padding: 0, 
      marginTop: -20,
      borderRadius: 50,
    }}
  >
    <MinusIcon size={80} color={"rgba(0,0,0,0.25)"} />
    </TouchableOpacity>

        <Text style={{ marginTop: 30,color: themeColors.bgLight}} className="text-2xl font-bold"> 
        {t('homepage.feeling')} {usernameFinal}?</Text>
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
                className="p-3 px-4 mr-3 rounded-full shadow"
              >
                <Text style={{ fontSize: height < 800 && !ios ? 50 : 50 }} className="font-semibold ">
                  {item.title}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 16, marginTop: 10, marginRight: 16}} className="text-gray-500" >
              
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
        </Animated.View>
        </Modal>
        </View> 
      </View>
     )}

    <Toast config={toastConfig} />
    </View>
  );
}
        
