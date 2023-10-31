import { reactive } from "vue";

import { Capacitor } from "@capacitor/core";
import { getApp, getApps, initializeApp } from "firebase/app";

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
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  updateProfile,
} from "firebase/auth";

import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const app =
  getApps().length === 0
    ? initializeApp({
        apiKey: "AIzaSyCUau57fHwusLPrshfGzz1VuCcKXh6WNHE",
        authDomain: "app.umbrella.vet",
        projectId: "umbrella-vet",
        storageBucket: "umbrella-vet_chat-media",
        messagingSenderId: "993776523745",
        appId: "1:993776523745:web:abe8e6e3138ad680709aa0",
      })
    : getApps()[0];
// const db = getFirestore(app);
// const functions = getFunctions(app);

const getFirebaseAuth = () => {
  if (Capacitor.isNativePlatform()) {
    return initializeAuth(getApp(), {
      persistence: indexedDBLocalPersistence,
    });
  } else {
    return getAuth(app);
  }
};

const auth = getFirebaseAuth();

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

export const googleSignin = async () => {
  console.log("@/composables/firebase-service > googleSignin()");

  // 1. Create credentials on the native layer
  const result = await FirebaseAuthentication.signInWithGoogle();
  console.log("google response", result);
  // 2. Sign in on the web layer using the id token
  const credential = GoogleAuthProvider.credential(result.credential?.idToken);
  await signInWithCredential(auth, credential);

  // Fixes ----------------------------------------------------
  if (!state.userData) state.userData = {};
  if (result.user?.email) {
    state.userData.email = result.user?.email;
  } else if (result.additionalUserInfo?.profile?.email) {
    state.userData.email = result.additionalUserInfo?.profile?.email;
  } else {
    state.userData.email = null;
  }
  if (result.user?.displayName) {
    state.userData.name = result.user?.displayName;
  } else if (result.additionalUserInfo?.profile?.name) {
    state.userData.name = result.additionalUserInfo?.profile?.name;
  } else if (result.additionalUserInfo?.profile?.given_name && result.additionalUserInfo?.profile?.family_name) {
    state.userData.name = `${result.additionalUserInfo?.profile?.given_name} ${result.additionalUserInfo?.profile?.family_name}`;
  } else {
    state.userData.name = "Google User";
  }
  // ----------------------------------------------------------
  console.log("state.userData.name", state.userData.name);
  console.log("state.userData.email", state.userData.email);
  return result;
};

export const appleSignin = async () => {
  console.log("@/composables/firebase-service > appleSignin()");

  const result = await FirebaseAuthentication.signInWithApple({
    skipNativeAuth: true,
    scopes: ["name", "email"],
  });
  console.log(
    "@/composables/firebase-service > appleSignin() > FirebaseAuthentication.signInWithApple({ skipNativeAuth: false, scopes: ['name','email'] })",
    result
  );
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: result.credential?.idToken,
    rawNonce: result.credential?.nonce,
  });
  await signInWithCredential(auth, credential);
  // Fixes ----------------------------------------------------
  // Email
  if (!state.userData) state.userData = {};
  if (result.user?.email) {
    state.userData.email = result.user?.email;
  } else if (result.additionalUserInfo?.profile?.email) {
    state.userData.email = result.additionalUserInfo?.profile?.email;
  } else if (result.additionalUserInfo?.profile?.email) {
    state.userData.email = result.additionalUserInfo?.profile?.email;
  } else if (result.user?.providerData) {
    for (let i = 0; i < result.user.providerData.length; i++) {
      if (result.user.providerData[i].providerId === "apple.com") {
        state.userData.email = result.user.providerData[i].email;
      }
    }
  } else if (!state.userData.email) {
    state.userData.email = "Unknown";
  }
  // Name
  if (result.user?.displayName) {
    state.userData.name = result.user?.displayName;
  } else if (result.additionalUserInfo?.profile?.name) {
    state.userData.name = result.additionalUserInfo?.profile?.name;
  } else if (result.additionalUserInfo?.profile?.given_name && result.additionalUserInfo?.profile?.family_name) {
    state.userData.name = `${result.additionalUserInfo?.profile?.given_name} ${result.additionalUserInfo?.profile?.family_name}`;
  } else if (result.user?.providerData) {
    for (let i = 0; i < result.user.providerData.length; i++) {
      if (result.user.providerData[i].providerId === "apple.com") {
        state.userData.name = result.user.providerData[i].displayName;
      }
    }
  } else {
    state.userData.name = "Apple User";
  }
  // ----------------------------------------------------------
  console.log("state.userData.name", state.userData.name);
  console.log("state.userData.email", state.userData.email);
  return result;
};

export const authCheck = async () => {
  console.log("@/composables/firebase-service > authCheck()");

  return new Promise(function (resolve) {
    state.loading = true;
    if (!state.initialized) {
      getAuth().onAuthStateChanged(async (_user) => {
        console.log("@/composables/firebase-service > getAuth().currentUser", getAuth().currentUser);
        console.log("@/composables/firebase-service > onAuthStateChanged()", _user);
        if (_user) {
          state.user = _user;
          if (!state.userData) state.userData = {};
          if (_user.displayName) state.userData.name = _user.displayName;
          if (_user.email) state.userData.email = _user.email;
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

export const logout = async () => {
  console.log("@/composables/firebase-service > logout()");

  await FirebaseAuthentication.signOut();
  const result = await signOut(auth);
  state.error = null;
  state.loading = false;
  state.user = null;
  state.userData = null;
  return result;
};
