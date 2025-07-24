package com.flowday.newbackgroundtimer

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class NewBackgroundTimerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NewBackgroundTimer"
    }

    @ReactMethod
    fun startTimer(options: ReadableMap) {
        TimerService.reactContext = reactApplicationContext
        val intent = Intent(reactApplicationContext, TimerService::class.java)
        intent.putExtra("duration", options.getInt("duration").toLong())
        
        // Pass exercise and routine names for better notifications
        if (options.hasKey("exerciseName")) {
            intent.putExtra("exerciseName", options.getString("exerciseName"))
        }
        if (options.hasKey("routineName")) {
            intent.putExtra("routineName", options.getString("routineName"))
        }
        
        reactApplicationContext.startService(intent)
    }

    @ReactMethod
    fun stopTimer() {
        val intent = Intent(reactApplicationContext, TimerService::class.java)
        reactApplicationContext.stopService(intent)
    }
}
