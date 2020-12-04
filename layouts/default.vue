<template>
  <v-app>
    <v-navigation-drawer app>
      <!-- -->
      <Navbar></Navbar>
    </v-navigation-drawer>

    <v-app-bar app>
      <!-- -->
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-main>

      <!-- Provides the application the proper gutter -->
      <v-container fluid>


        <Nuxt />

      </v-container>
    </v-main>

    <v-footer app>
      <!-- -->
    </v-footer>
  </v-app>
</template>

<script>


import Navbar from "@/components/Navbar";

export default {
  components: {
    Navbar
  }
}
</script>

<style>
</style>

