package com.flowday.newbackgroundtimer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

class TimerService : Service() {

    companion object {
        var reactContext: ReactContext? = null
    }

    private var timer: CountDownTimer? = null
    private var totalDuration: Long = 0
    private var exerciseName: String = "Exercise"
    private var routineName: String = "Flow Day"
    private var isPaused: Boolean = false
    private var remainingTime: Long = 0

    // Format time as MM:SS
    private fun formatTime(seconds: Int): String {
        val minutes = seconds / 60
        val secs = seconds % 60
        return String.format("%02d:%02d", minutes, secs)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createNotificationChannel()
        
        when (intent?.action) {
            "PAUSE_TIMER" -> {
                pauseTimer()
                return START_STICKY
            }
            "RESUME_TIMER" -> {
                resumeTimer()
                return START_STICKY
            }
            "STOP_TIMER" -> {
                stopSelf()
                return START_NOT_STICKY
            }
        }
        
        val notification = createInitialNotification()
        startForeground(1, notification)

        val duration = intent?.getLongExtra("duration", 0) ?: 0
        totalDuration = duration
        exerciseName = intent?.getStringExtra("exerciseName") ?: "Exercise"
        routineName = intent?.getStringExtra("routineName") ?: "Flow Day"

        startCountdown(duration)

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        timer?.cancel()
    }

    private fun createInitialNotification(): android.app.Notification {
        return NotificationCompat.Builder(this, "TIMER_CHANNEL")
            .setContentTitle("$routineName - $exerciseName")
            .setContentText("Timer starting...")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setVibrate(null) // Disable notification vibration
            .setSound(null)   // Disable notification sound
            .setDefaults(0)   // Disable all default behaviors
            .setOngoing(true)
            .setAutoCancel(false)
            .build()
    }

    private fun updateNotification(remainingSeconds: Int, progress: Int) {
        // Create pause/resume action
        val actionText = if (isPaused) "Resume" else "Pause"
        val actionIntent = Intent(this, TimerService::class.java).apply {
            action = if (isPaused) "RESUME_TIMER" else "PAUSE_TIMER"
        }
        val actionPendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.getService(this, 0, actionIntent, PendingIntent.FLAG_IMMUTABLE)
        } else {
            PendingIntent.getService(this, 0, actionIntent, PendingIntent.FLAG_UPDATE_CURRENT)
        }

        // Create stop action
        val stopIntent = Intent(this, TimerService::class.java).apply {
            action = "STOP_TIMER"
        }
        val stopPendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.getService(this, 1, stopIntent, PendingIntent.FLAG_IMMUTABLE)
        } else {
            PendingIntent.getService(this, 1, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT)
        }

        val notification = NotificationCompat.Builder(this, "TIMER_CHANNEL")
            .setContentTitle("$routineName - $exerciseName")
            .setContentText("Time remaining: ${formatTime(remainingSeconds)}")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setProgress(100, progress, false)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setVibrate(null) // Disable notification vibration
            .setSound(null)   // Disable notification sound
            .setDefaults(0)   // Disable all default behaviors
            .setOngoing(true)
            .setAutoCancel(false)
            .addAction(android.R.drawable.ic_media_pause, actionText, actionPendingIntent)
            .addAction(android.R.drawable.ic_delete, "Stop", stopPendingIntent)
            .build()

        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(1, notification)
    }

    private fun pauseTimer() {
        timer?.cancel()
        isPaused = true
        // Update notification to show paused state
        updateNotification((remainingTime / 1000).toInt(), 0)
    }

    private fun resumeTimer() {
        if (isPaused && remainingTime > 0) {
            isPaused = false
            startCountdown(remainingTime)
        }
    }

    private fun startCountdown(duration: Long) {
        timer = object : CountDownTimer(duration, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                remainingTime = millisUntilFinished
                val remainingSeconds = (millisUntilFinished / 1000).toInt()
                val params = Arguments.createMap()
                params.putInt("remaining", remainingSeconds)
                sendEvent("onTick", params)

                // Calculate progress percentage
                val progress = if (totalDuration > 0) {
                    ((totalDuration - millisUntilFinished) * 100 / totalDuration).toInt()
                } else 0

                updateNotification(remainingSeconds, progress)
            }

            override fun onFinish() {
                sendEvent("onFinish", null)
                stopSelf()
            }
        }.start()
    }

    private fun sendEvent(eventName: String, params: Any?) {
        reactContext
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                "TIMER_CHANNEL",
                "Timer Service Channel",
                NotificationManager.IMPORTANCE_LOW  // Low importance = no vibration
            )
            serviceChannel.description = "Channel for timer notifications"
            serviceChannel.enableVibration(false)  // Explicitly disable vibration
            serviceChannel.setSound(null, null)    // Disable sound
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }
}
