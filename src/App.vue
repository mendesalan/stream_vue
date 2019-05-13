<template>
  <div id="app">
        <router-view></router-view>
  </div>
</template>

<script>

    import jQuery from "jquery";
    const $ = jQuery;
    window.$ = $;

    export default {
        name: 'app',
        //no components being loaded since we're using router.
        components: {

        },

        mounted () {
            console.log("App vue mounted")
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
