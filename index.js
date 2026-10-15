/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { recordarDestino } from './src/services/notificaciones';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) { await recordarDestino(detail.notification); }
});

AppRegistry.registerComponent(appName, () => App);
