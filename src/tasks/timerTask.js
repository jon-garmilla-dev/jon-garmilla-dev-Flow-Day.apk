import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export const BACKGROUND_TIMER_TASK = "background-timer-task";

const getProgressKey = (routineId) => {
  const date = new Date().toISOString().split("T")[0];
  return `@FlowDay:Progress:${date}:${routineId}`;
};

TaskManager.defineTask(BACKGROUND_TIMER_TASK, async ({ data, error }) => {
  if (error) {
    console.error("BACKGROUND_TIMER_TASK error:", error);
    return;
  }
  if (data) {
    const { routineId, actionId, routineTitle } = data;
    try {
      const key = getProgressKey(routineId);
      const storedProgress = await AsyncStorage.getItem(key);

      if (!storedProgress) {
        return;
      }

      const progressData = JSON.parse(storedProgress);
      const { actions, pausedTimers } = progressData;

      // If action is no longer active or is paused, the task should stop.
      // The main app is responsible for stopping the task via TaskManager.stopTaskAsync
      if (actions[actionId] !== "active") {
        return;
      }

      let remainingTime = pausedTimers[actionId];

      // If there's no remaining time, something is wrong.
      if (remainingTime === undefined || remainingTime === null) {
        return;
      }

      const newRemainingTime = remainingTime - 1;

      if (newRemainingTime <= 0) {
        // Mark as complete and find next action - this logic is complex
        // For now, let's just update the timer. The completion will be handled
        // when the app is next opened.
        progressData.pausedTimers[actionId] = 0;
      } else {
        progressData.pausedTimers[actionId] = newRemainingTime;
      }

      await AsyncStorage.setItem(key, JSON.stringify(progressData));

    } catch (e) {
      console.error("Error in background timer task:", e);
    }
  }
});
