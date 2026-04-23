import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
    axios: any;
  }
}

window.Pusher = Pusher;

import api from './api';
window.axios = api;

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  forceTLS: false,
  enabledTransports: ['ws'],
  authorizer: (channel: any, options: any) => {
    return {
      authorize: (socketId: string, callback: any) => {
        import('./api').then(({ default: api }) => {
          api.post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name
          }, { baseURL: '' }) // Reset baseURL since api.ts uses /api/v1
          .then(response => {
            callback(false, response.data);
          })
          .catch(error => {
            callback(true, error);
          });
        });
      }
    };
  },
});

export default echo;
