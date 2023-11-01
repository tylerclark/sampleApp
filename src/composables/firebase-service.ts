import { toRefs, reactive, ref } from "vue";

import { Capacitor } from "@capacitor/core";
import { getApp, getApps, initializeApp } from "firebase/app";

import {
  getFirestore,
  addDoc,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  collection,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
} from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import {
  getAuth,
  OAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  signOut,
  FacebookAuthProvider,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  updateProfile,
} from "firebase/auth";
// import { getStorage, ref as firebaseRef, getDownloadURL } from 'firebase/storage';

// import { Network } from '@capacitor/network';
// import { Pet } from './types/pets';
// import * as Sentry from '@sentry/vue';

import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const FIREBASE_CONFIG = {};

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
const db = getFirestore(app);
const functions = getFunctions(app);

export const getFirebaseAuth = () => {
  if (Capacitor.isNativePlatform()) {
    return initializeAuth(getApp(), {
      persistence: indexedDBLocalPersistence,
    });
  } else {
    return getAuth(app);
  }
};

const auth = getFirebaseAuth();

if (Capacitor.isNativePlatform()) {
  initializeAuth(app, {
    persistence: indexedDBLocalPersistence,
  });
}
// const storage = getStorage(app);

// const emulatorLocation = 'MY_IP';
// if (process.env.NODE_ENV === 'development' && Capacitor.isNativePlatform()) {
//   console.log(`** Will call functions from ${emulatorLocation}:5004 ***`);
//   connectFunctionsEmulator(functions, emulatorLocation, 5004);
// }

type TState = {
  error: Error | null;
  loading: boolean;
  user: any; //firebase.auth.UserCredential | null | firebase.User;
  userData: any;
  initialized: boolean;
  isNative: boolean;
  subscribed: boolean;
};

export const state = reactive<TState>({
  user: null,
  loading: true,
  error: null,
  userData: null,
  initialized: false,
  isNative: false,
  subscribed: false,
});

export const googleSignin = async (isNative: Boolean) => {
  console.log("googleSignin");
  console.log("window.location.href", window.location.href);

  // 1. Create credentials on the native layer
  const result = await FirebaseAuthentication.signInWithGoogle({
    scopes: ["profile", "email"],
  });
  console.log("google response", result);
  // 2. Sign in on the web layer using the id token
  const credential = GoogleAuthProvider.credential(result.credential?.idToken);
  await signInWithCredential(auth, credential);
  return result.user;
};

// function getAppleDisplayName(providerData: any) {
//   if (providerData) {
//     for (let i = 0; i < providerData.length; i++) {
//       if (providerData[i].providerId === 'apple.com') {
//         return providerData[i].displayName;
//       }
//     }
//   }
//   return 'Apple User';
// }

// async function updateDetails(name: string, email: string | null | undefined) {
//   const user = auth.currentUser;
//   if (user) {
//     const updateUser = httpsCallable(functions, 'updateUserCall');
//     await updateUser({ name, email });
//     state.user.email = email;
//     state.user.displayName = name;
//     state.user.emailVerified = true;
//   }
// }

export const appleSignin = async () => {
  console.log("appleSignin");
  console.log("environment", process.env.NODE_ENV);
  const result = await FirebaseAuthentication.signInWithApple({ skipNativeAuth: false, scopes: ["name", "email"] });
  console.log("appleSignin:FirebaseAuthentication.signInWithApple()", JSON.stringify(result, null, 2));
  const provider = new OAuthProvider("apple.com");
  console.log('appleSignin:OAuthProvider("apple.com")', JSON.stringify(provider, null, 2));
  const credential = provider.credential({
    idToken: result.credential?.idToken,
    rawNonce: result.credential?.nonce,
  });
  console.log("appleSignin:provider.credential", JSON.stringify(credential, null, 2));
  const signinWith = await signInWithCredential(auth, credential);
  console.log("appleSignin:signinWithCredential", JSON.stringify(signinWith, null, 2));
  // const appleName = getAppleDisplayName(result?.user?.providerData);
  // await updateDetails(appleName, result.user?.email);
  return result;
};

export const authCheck = async () => {
  console.log("@/composables/firebase-service > authCheck()");
  return new Promise(function (resolve) {
    state.loading = true;
    if (!state.initialized) {
      getAuth().onAuthStateChanged(async (_user) => {
        // USER.value = getAuth().currentUser;
        // console.log('JS USER', getAuth().currentUser);
        // resolve(currentUser);
        console.log("_user", _user);
        if (_user) {
          state.user = _user;
        } else {
          state.user = null;
        }
        state.loading = false;
        state.initialized = true;
        resolve(true);
      });
    }
  });
};
