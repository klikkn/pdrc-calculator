/* eslint-disable */

importScripts('./ngsw-worker.js');

self.addEventListener('notificationclick', (event) => {
  console.log('notification clicked!');
});
