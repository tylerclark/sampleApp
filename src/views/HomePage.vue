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
        <div v-if="!user">Not Authenticated</div>
        <div v-if="user">
          <p>Authenticated as {{ user.displayName }}</p>
        </div>

        <div class="ion-margin-top"><ion-button>Login with Google</ion-button></div>
        <div><ion-button>Login with Apple</ion-button></div>
        <div><ion-button>Logout</ion-button></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from "@ionic/vue";
import { state, googleSignin, appleSignin } from "@/composables/firebase-service";

const user = computed(() => {
  console.log("state", state);
  return state?.user ? state.user : null;
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

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
