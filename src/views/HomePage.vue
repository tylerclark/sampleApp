<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div id="container">
        <div style="display: inline-block; width: 200px">
          <div v-if="!user">Not Authenticated<br />&nbsp;</div>
          <div v-if="user">
            Authenticated as
            <span v-if="user.name">{{ user.name }}</span>
            <span v-if="!user.name">Unknown</span>

            <div v-if="user.email">({{ user.email }})</div>
            <div v-if="!user.email">(Unknown)</div>
          </div>

          <ion-button class="ion-margin-top" :disabled="user" @click="googleSignin">Login with Google</ion-button>
          <ion-button :disabled="user" @click="appleSignin">Login with Apple</ion-button>
          <ion-button :disabled="!user" @click="logout">Logout</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonContent, IonPage, IonButton } from "@ionic/vue";
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
ion-button {
  width: 100%;
}
</style>
