import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export const TestClient = (
  host: string,
  options?: {
    autoConnect?: boolean;
    auth?: string;
  },
) => {
  return io('ws://' + host, {
    autoConnect: options?.autoConnect === undefined ? true : options?.autoConnect,
    forceNew: true,
    transports: ['websocket'],
    extraHeaders: {
      authorization: `Bearer ${options?.auth}`,
    },
  });
};

export const getToken = async (host: string, user: { email: string; password: string }): Promise<string> => {
  return fetch('http://' + host + '/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  }).then(async (res) =>
    res.json().then((body) => {
      return body.accessToken;
    }),
  );
};

export const getChannels = async (host: string, auth: string): Promise<string[]> => {
  return fetch('http://' + host + '/v2/channel', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + auth },
  }).then(async (res) =>
    res.json().then((body) => {
      return body.channels?.map((c: any) => c.id);
    }),
  );
};
