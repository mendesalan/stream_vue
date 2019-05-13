<template>
  <div>
        <div class="container">
            <div v-if="!state" class="col-md-12">
                <h1>Who to Watch ?</h1>
                <input v-model="login" placeholder="edit me">
                <p>Who to Watch: {{ login }}</p>
                <button @click="changeState()">Watch</button>
            </div>

            <div v-if="state" class="col-md-8">
                <div class="col-md-8">
                    <div>

                        <div id="twitch-embed"></div>

                    </div>
                </div>
            </div>

            <div class="row" v-if="state">
<!--                 <div style="display:none" class="text-center auth">
                    <p>First, connect with your Twitch Account:</p>
                    <a id="auth-link"><img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png" /></a>
                </div> -->
                <div style="display:none" class="socket">
                    <textarea class="ws-output" rows="20" style="font-family:Courier;width:100%"></textarea>
                    <form id="topic-form" class="text-right form-inline" >
                        <label id="topic-label" for="topic-text"></label>
                        <input type="text" id="topic-text" placeholder="Topic">
                        <button type="submit" class="btn">Listen</button>
                    </form>
                </div>
            </div>
        </div>
  </div>
</template>

<script>
    import axios from 'axios'
    import jQuery from "jquery";
    const $ = jQuery;
    window.$ = $;

    export default {
        name: 'TwitchApp',

        data () {
            return {
                login: 'monstercat',
                state: false,
                // Twitch Variables
                clientId: '02c4bfiuom48llbhjncnz61zrd3jqa',
                redirectURI: 'http://localhost:3000/app',
                scope: 'chat:edit chat:read user_read',
                ws: new WebSocket('wss://pubsub-edge.twitch.tv'),
                loginInfo: null
            }
        },

        methods: {
            callTwitch() {

                var embed = new Twitch.Embed("twitch-embed", {
                    width: 854,
                    height: 480,
                    channel: this.login
                });

                embed.addEventListener(Twitch.Embed.VIDEO_READY, function() {
                    console.log('The video is ready');
                });

                if (document.location.hash.match(/access_token=(\w+)/)) {
                    this.parseFragment(document.location.hash)
                }

                if (sessionStorage.twitchOAuthToken) {
                    this.connect();
                    $('.socket').show()
                    $.ajax({
                        url: "https://api.twitch.tv/kraken/user",
                        method: "GET",
                        headers: {
                            "Client-ID": this.clientId,
                            "Authorization": "OAuth " + sessionStorage.twitchOAuthToken
                        }})
                        .done(function(user) {
                            $('#topic-label').text("Enter a topic to listen to. For example, to listen to whispers enter topic 'whispers."+user._id+"'");
                        });
                } else {
                    var url = this.authUrl()
                    $('#auth-link').attr("href", url);
                    $('.auth').show()
                }

                $('#topic-form').submit(function() {
                    listen($('#topic-text').val());
                    event.preventDefault();
                });
            },

            getUserInfo() {
                $.ajax({
                    url: "https://api.twitch.tv/helix/users?login="+this.login,
                    method: "GET",
                    headers: {
                        "Client-ID": this.clientId,
                        "Authorization": "OAuth " + sessionStorage.twitchOAuthToken
                    }})
                    .done(function(user) {
                        this.loginInfo = user.data
                        console.log("======>", this.loginInfo)
                    });
            },

            changeState() {
                this.getUserInfo()

                this.state = !this.state
                setTimeout(this.callTwitch, 1500);
            },

            /* Twitch Socket Functions */

            parseFragment(hash) {
                var hashMatch = function(expr) {
                  var match = hash.match(expr);
                  return match ? match[1] : null;
                };
                var state = hashMatch(/state=(\w+)/);
                if (sessionStorage.twitchOAuthState == state)
                    sessionStorage.twitchOAuthToken = hashMatch(/access_token=(\w+)/);
                return
            },

            authUrl() {
                sessionStorage.twitchOAuthState = this.nonce(15);
                var url = 'https://api.twitch.tv/kraken/oauth2/authorize' +
                    '?response_type=token' +
                    '&client_id=' + this.clientId +
                    '&redirect_uri=' + this.redirectURI +
                    '&state=' + sessionStorage.twitchOAuthState +
                    '&scope=' + this.scope;
                return url
            },

            // Source: https://www.thepolyglotdeveloper.com/2015/03/create-a-random-nonce-string-using-javascript/
            nonce(length) {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < length; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            },

            heartbeat() {
                message = {
                    type: 'PING'
                };
                $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
                this.ws.send(JSON.stringify(message));
            },

            listen(topic) {
                message = {
                    type: 'LISTEN',
                    nonce: nonce(15),
                    data: {
                        topics: [topic],
                        auth_token: sessionStorage.twitchOAuthToken
                    }
                };
                $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
                this.ws.send(JSON.stringify(message));
            },

            connect() {
                var heartbeatInterval = 1000 * 60; //ms between PING's
                var reconnectInterval = 1000 * 3; //ms to wait before reconnect
                var heartbeatHandle;
                //redeclared at data.
                // this.ws = new WebSocket('wss://pubsub-edge.twitch.tv');

                this.ws.onopen = function(event) {
                    $('.ws-output').append('INFO: Socket Opened\n');
                    this.heartbeat()
                    heartbeatHandle = setInterval(heartbeat, heartbeatInterval);
                };

                this.ws.onerror = function(error) {
                    $('.ws-output').append('ERR:  ' + JSON.stringify(error) + '\n');
                };

                this.ws.onmessage = function(event) {
                    message = JSON.parse(event.data);
                    $('.ws-output').append('RECV: ' + JSON.stringify(message) + '\n');
                    if (message.type == 'RECONNECT') {
                        $('.ws-output').append('INFO: Reconnecting...\n');
                        setTimeout(connect, reconnectInterval);
                    }
                };

                this.ws.onclose = function() {
                    $('.ws-output').append('INFO: Socket Closed\n');
                    clearInterval(heartbeatHandle);
                    $('.ws-output').append('INFO: Reconnecting...\n');
                    setTimeout(connect, reconnectInterval);
                };
            }
        },

        mounted() {
            console.log("TwitchApp vue mounted")
        }
}
</script>

<style>
input {
    text-align: center;
}
</style>
