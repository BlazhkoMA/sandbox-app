<template>
  <v-navigation-drawer
    v-model="drawer"
    :color="color"
    :expand-on-hover="expandOnHover"
    :mini-variant="miniVariant"
    :right="right"
    :permanent="permanent"
    :src="bg"
    absolute
    dark
  >
    <v-list
      dense
      nav
      class="py-0"
    >
      <v-list-item two-line :class="miniVariant && 'px-0'">

        <v-list-item-content>
          <v-list-item-title>Nuxt</v-list-item-title>
          <v-list-item-subtitle>Vue</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <nuxt-link
        v-for="item in items"
        :key="item.title"
        :to="item.link">
      <v-list-item
        link
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      </nuxt-link>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'Navbar',
  data () {
    return {
      drawer: true,
      items: [
        { title: 'Home', icon: 'mdi-view-dashboard', link: '/'  },
        { title: 'Calendar 1', icon: 'mdi-image', link: '/calendar-tutor' },
        { title: 'Calendar 2', icon: 'mdi-image', link: '/calendar-user' },
      ],
      color: 'primary',
      colors: [
        'primary',
        'blue',
        'success',
        'red',
        'teal',
      ],
      right: false,
      permanent: true,
      miniVariant: false,
      expandOnHover: false,
      background: false,
    }
  },
  computed: {
    bg () {
      return this.background ? 'https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg' : undefined
    },
  },
}
</script>

<style>
</style>
