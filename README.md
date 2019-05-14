# stream_vue

## Project Overview
```
It is a simple vue-cli app that listen to events from a given streamer, creating a simple embedded Twitch Player on screen.
```

## Project setup
```
npm install and then npm run serve, if you wish to run on specific port you can npm run serve -- port=3000. npm run build for dist production folder.
```

## Resources used
```
On the research to build this Twitch-App i have used resources from twitch, they're all linked below:

https://github.com/twitchdev/authentication-samples

https://github.com/twitchdev/pubsub-samples
```

## Questions

```
1 - How would you deploy the above on AWS? (ideally a rough architecture diagram will help)

[https://i.imgur.com/LYwOYQH.png] - Diagram


2 - Where do you see bottlenecks in your proposed architecture and how would you approach scaling this app starting from 100 reqs/day to 900MM reqs/day over 6 months?

  Having API Limits!
- Clients can listen on up to 50 topics per connection. Trying to listen on more topics will result in an error message.
- A single client IP address establishes no more than 10 simultaneous connections.
- Malicious or careless applications that result in abnormally high server load may be blacklisted from establishing connections.
- If clients are slow to read messages from their connection and the server is simultaneous buffering more than 30 messages to an individual client, the client will be disconnected.

The webpage itself needs to handle that many requests.
A load balancer like NGINX, Kubernetes could help with that.
AWS also can scale out based on how much work they're doing and automatically spool things up and drop down based on load,
and where the streamer name listens for events, we would need a scalable backend for that.

```
