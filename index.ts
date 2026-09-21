import { registerRootComponent } from 'expo';

import App from './App';
import { Platform } from 'react-native';
import { startPwa } from './src/pwa';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
if (Platform.OS === 'web' && !__DEV__) startPwa();
