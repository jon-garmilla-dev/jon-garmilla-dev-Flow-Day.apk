import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NOTIFICATION_TASK from '../tasks/notificationTask';

const FOREGROUND_NOTIFICATION_ID = 'workflow-runner-notification';
const ACTIVE_WORKFLOW_KEY = '@FlowDay:ActiveWorkflowInfo';

export const startForegroundNotification = async (routine, block) => {
  // Store the necessary info for the background task
  await AsyncStorage.setItem(ACTIVE_WORKFLOW_KEY, JSON.stringify({
    routineId: routine.id,
    blockId: block.id,
    startTime: Date.now(),
  }));

  // Schedule the initial notification immediately
  await Notifications.scheduleNotificationAsync({
    identifier: FOREGROUND_NOTIFICATION_ID,
    content: {
      title: `${routine.title}`,
      body: 'Starting workflow...',
      sticky: true,
      autoDismiss: false,
    },
    trigger: null,
  });

  // Register the background task to run periodically
  await Notifications.registerTaskAsync(NOTIFICATION_TASK, {
    taskName: NOTIFICATION_TASK,
    // Note: Minimum interval is 15 minutes for background tasks on iOS,
    // but foreground services on Android can be more frequent.
    // This approach is more of a "best effort" for live updates.
    // For true real-time, a more complex native foreground service would be needed.
    // We will trigger it manually for now from the app.
  });
  console.log('Notification task registered.');
};

export const updateNotificationContent = async (title, body) => {
  await Notifications.scheduleNotificationAsync({
    identifier: FOREGROUND_NOTIFICATION_ID,
    content: {
      title,
      body,
      sticky: true,
      autoDismiss: false,
      color: '#58a6ff',
    },
    trigger: null,
  });
};

export const stopForegroundNotification = async () => {
  // Clear the active workflow info
  await AsyncStorage.removeItem(ACTIVE_WORKFLOW_KEY);
  // Dismiss the notification
  await Notifications.dismissNotificationAsync(FOREGROUND_NOTIFICATION_ID);
  // Unregister the background task
  const isRegistered = await TaskManager.isTaskRegisteredAsync(NOTIFICATION_TASK);
  if (isRegistered) {
    await Notifications.unregisterTaskAsync(NOTIFICATION_TASK);
    console.log('Notification task unregistered.');
  }
};
