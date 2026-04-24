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

const isSecure = (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https';

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  forceTLS: isSecure,
  enabledTransports: isSecure ? ['wss', 'ws'] : ['ws'],
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
