package com.flowday.backgroundtimer

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class BackgroundTimerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BackgroundTimer"
    }

    @ReactMethod
    fun startTimer(promise: Promise) {
        TimerService.reactContext = reactApplicationContext
        val intent = Intent(reactApplicationContext, TimerService::class.java)
        reactApplicationContext.startService(intent)
        promise.resolve("Timer started")
    }

    @ReactMethod
    fun stopTimer(promise: Promise) {
        val intent = Intent(reactApplicationContext, TimerService::class.java)
        reactApplicationContext.stopService(intent)
        promise.resolve("Timer stopped")
    }
}
