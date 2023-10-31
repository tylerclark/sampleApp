<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Sample App</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Sample App</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <div v-if="!user">Not Authenticated<br/>&nbsp;</div>
        <div v-if="user">
          <p>
            Authenticated as
            <span v-if="user.name">{{ user.name }}</span>
            <span v-if="!user.name">Unknown</span>

            <div v-if="user.email">({{ user.email }})</div>
            <div v-if="!user.email">(Unknown)</div>
          </p>
        </div>

        <div class="ion-margin-top">
          <ion-button :disabled="user" @click="googleSignin">Login with Google</ion-button>
        </div>
        <div>
          <ion-button :disabled="user" @click="appleSignin">Login with Apple</ion-button>
        </div>
        <div>
          <ion-button :disabled="!user" @click="logout">Logout</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from "@ionic/vue";
import { state, googleSignin, appleSignin, logout } from "@/composables/firebase-service";

const user = computed(() => {
  return state.userData;
});
</script>

<style scoped>
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
