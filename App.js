import React, { useEffect, useState } from 'react';
import AppNavigation from './navigation/appNavigation';
import 'react-native-get-random-values';
import { Keypair} from "@solana/web3.js";
import nacl from 'tweet-nacl-react-native-expo';
import { messagesToSend } from './constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

let messagesSaved = [];
let messagesLoaded = false; 

function loadMessages() {
  if (!messagesLoaded) {
    messagesSaved = messagesToSend;
    messagesLoaded = true; 
  }
}

export default function App() {
  const WALLET_STORAGE_KEY = 'walletSecretKey';
  const [signature, setSignature] = useState(null);

  const saveWalletSecretKey = async (wallet) => {
    try {
      await AsyncStorage.setItem(WALLET_STORAGE_KEY, wallet.secretKey.toString());
      console.log('Wallet secret key saved.');
    } catch (error) {
      console.error('Error saving secret key:', error);
    }
  };


  const loadWalletSecretKey = async () => {
    try {
      const secretKeyString = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (secretKeyString) {
        const secretKey = new Uint8Array(secretKeyString.split(',').map(Number));

        const wallet = Keypair.fromSecretKey(secretKey);
        console.log('Wallet secret key loaded:', wallet.publicKey);

        try {
          fetch('https://binaramics.com:5173/health');
        }
        catch (error) {
        
        }

        let sig = await fetchData(wallet);
        if(sig === null || sig === "") {
          sig = await fetchData(wallet);
        }

        
        return wallet;
      } else {
        const wallet = Keypair.generate(); // Generate a new wallet
        saveWalletSecretKey(wallet); // Save the secret key
        console.log('New wallet generated and saved:', wallet.publicKey);

        try {
          fetch('https://binaramics.com:5173/health');
        }
        catch (error) {
        
        }

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
        body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, username: "Anonymous"}),
        })

        if (!response.ok) {
          console.log(`HTTP error! Status: ${response.json} `);
          const response = await fetch('https://binaramics.com:5173/newUser/', {
        method: 'POST',
        headers: {
          "Content-Type": `application/json`,
          'Connection': 'keep-alive',
          'Accept-Encoding': '*/*',
      
          Accept: 'application/json',
        },
        body: JSON.stringify({ wallet: wallet.publicKey, signature: sig, username: "Anonymous"}),
        })

        }

        const data = await response.json();
        if (data && data.error === "Profile exists") {
          console.log("Profile exists");
        } else {
            console.log("Profile was created");
        }

        return wallet;
      }
    } catch (error) {
      console.error('Error loading secret key:', error);
      return null;
    }
  };
  useEffect(() => {
    loadMessages();
  
    
    const loadWalletAndFetchData = async () => {
      const loadedWallet = await loadWalletSecretKey(); // Load the secret key
  
      if (loadedWallet !== null) {
        fetchData(loadedWallet);
      }
    };
  
    loadWalletAndFetchData();
  }, []);

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
      const { nonce } = data.nonce;

        const message = `Sign this message for authenticating with your wallet. Nonce: ${data.nonce}`;
        const encodedMessage = new Uint8Array(message.length);
        for (let i = 0; i < message.length; i++) {
          encodedMessage[i] = message.charCodeAt(i);
        }

        const signature = nacl.sign.detached(encodedMessage, wallet.secretKey);
     
        setSignature(signature);

        const signatureBase64 = nacl.util.encodeBase64(signature);
        return signatureBase64;
        }catch(e) {
          console.log("Fucking dumbass: "+ e);
        }
  
       
      }
    }
  
  return (
    <AppNavigation />
  );
}
