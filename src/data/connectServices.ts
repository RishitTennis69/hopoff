import { Platform } from 'react-native';
import type { ConnectService } from '@/data/mock';

const NOTION: ConnectService = { id: 'notion', name: 'Notion', brand: 'notion', method: 'oauth' };

/** Platform-appropriate goal import options. */
export function getConnectServicesForPlatform(): ConnectService[] {
  if (Platform.OS === 'android' || Platform.OS === 'ios') return [];
  return [NOTION];
}
