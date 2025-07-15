import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_TASK = 'workflow-notification-task';
const FOREGROUND_NOTIFICATION_ID = 'workflow-runner-notification';
const ACTIVE_WORKFLOW_KEY = '@FlowDay:ActiveWorkflowInfo';

// This task runs in the background
TaskManager.defineTask(NOTIFICATION_TASK, async () => {
  try {
    const activeWorkflowInfoJson = await AsyncStorage.getItem(ACTIVE_WORKFLOW_KEY);
    if (!activeWorkflowInfoJson) {
      // No active workflow, do nothing.
      return;
    }

    const { routineId, blockId, startTime } = JSON.parse(activeWorkflowInfoJson);

    // We need to read the routine and progress data directly from storage
    // as we don't have access to the Zustand stores here.
    const routineKey = `@FlowDay:Routine:${routineId}`;
    const routineJson = await AsyncStorage.getItem(routineKey);
    if (!routineJson) return;
    const routine = JSON.parse(routineJson);

    const date = new Date().toISOString().split('T')[0];
    const progressKey = `@FlowDay:Progress:${date}:${routineId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressData = progressJson ? JSON.parse(progressJson) : { actions: {} };

    const block = routine.blocks.find(b => b.id === blockId);
    if (!block) return;

    const firstPendingActionIndex = block.actions.findIndex(action => progressData.actions[action.id] !== 'completed');
    
    let body = 'Workflow in progress.';
    if (firstPendingActionIndex !== -1) {
      const currentAction = block.actions[firstPendingActionIndex];
      body = `Current action: ${currentAction.name}`;
    } else {
      body = 'Block complete!';
    }

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const secs = (elapsedTime % 60).toString().padStart(2, '0');
    const title = `${routine.title} (${mins}:${secs})`;

    // Update the existing notification
    await Notifications.scheduleNotificationAsync({
      identifier: FOREGROUND_NOTIFICATION_ID,
      content: {
        title: title,
        body: body,
        sticky: true,
        autoDismiss: false,
      },
      trigger: null, // Show immediately
    });

    console.log('Background notification task ran successfully.');
    // You must return a value from the task, see TaskManager docs
    return 'succeeded';
  } catch (error) {
    console.error('Background notification task failed:', error);
    return 'failed';
  }
});

export default NOTIFICATION_TASK;
