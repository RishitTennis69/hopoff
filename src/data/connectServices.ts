import { Platform } from 'react-native';
import type { ConnectService } from '@/data/mock';

const NOTION: ConnectService = { id: 'notion', name: 'Notion', brand: 'notion', method: 'oauth' };
const REMINDERS: ConnectService = { id: 'reminders', name: 'Reminders', brand: 'reminders', method: 'shortcut' };
const NOTES: ConnectService = { id: 'notes', name: 'Notes', brand: 'notes', method: 'shortcut' };
const GOOGLE_TASKS: ConnectService = {
  id: 'google_tasks',
  name: 'Google Tasks',
  brand: 'googleTasks',
  method: 'intent',
};

/** Platform-appropriate goal import options. */
export function getConnectServicesForPlatform(): ConnectService[] {
  if (Platform.OS === 'android') return [NOTION, GOOGLE_TASKS];
  if (Platform.OS === 'ios') return [NOTION, REMINDERS, NOTES];
  return [NOTION];
}
