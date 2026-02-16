package com.signlang.app

import android.content.Context
import android.util.Log
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import android.graphics.Bitmap
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult

class HandLandmarkerFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?) : FrameProcessorPlugin() {

    private var handLandmarker: HandLandmarker? = null
    private var poseLandmarker: PoseLandmarker? = null
    private var isInitialized = false

    companion object {
        private const val TAG = "HandLandmarker"
        
        // Landmark names cache (same as iOS/JS)
        private val HAND_LANDMARK_NAMES = listOf(
            "WRIST", "THUMB_CMC", "THUMB_MCP", "THUMB_IP", "THUMB_TIP",
            "INDEX_FINGER_MCP", "INDEX_FINGER_PIP", "INDEX_FINGER_DIP", "INDEX_FINGER_TIP",
            "MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP",
            "RING_FINGER_MCP", "RING_FINGER_PIP", "RING_FINGER_DIP", "RING_FINGER_TIP",
            "PINKY_MCP", "PINKY_PIP", "PINKY_DIP", "PINKY_TIP"
        )
        // Only subset of pose names we care about (for consistency)
        private val POSE_LANDMARK_NAMES = listOf(
            "NOSE", "LEFT_EYE_INNER", "LEFT_EYE", "LEFT_EYE_OUTER", "RIGHT_EYE_INNER", "RIGHT_EYE", "RIGHT_EYE_OUTER",
            "LEFT_EAR", "RIGHT_EAR", "MOUTH_LEFT", "MOUTH_RIGHT",
            "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW", "LEFT_WRIST", "RIGHT_WRIST",
            "LEFT_PINKY", "RIGHT_PINKY", "LEFT_INDEX", "RIGHT_INDEX", "LEFT_THUMB", "RIGHT_THUMB",
            "LEFT_HIP", "RIGHT_HIP", "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE",
            "LEFT_HEEL", "RIGHT_HEEL", "LEFT_FOOT_INDEX", "RIGHT_FOOT_INDEX"
        )
    }

    init {
        initializeLandmarkers(proxy.context)
    }

    private fun initializeLandmarkers(context: Context) {
        Log.d(TAG, "🚀 [Vision] Initializing Landmarkers (Android)...")

        try {
            // --- 1. Hand Landmarker ---
            val handBaseOptions = BaseOptions.builder()
                .setModelAssetPath("hand_landmarker.task")
                .build()

            val handOptions = HandLandmarker.HandLandmarkerOptions.builder()
                .setBaseOptions(handBaseOptions)
                .setRunningMode(RunningMode.VIDEO)
                .setNumHands(2)
                .setMinHandDetectionConfidence(0.5f)
                .setMinHandPresenceConfidence(0.5f)
                .setMinTrackingConfidence(0.5f)
                .build()

            this.handLandmarker = HandLandmarker.createFromOptions(context, handOptions)
            Log.d(TAG, "✅ [Hand] Initialized Successfully")
            isInitialized = true

        } catch (e: Exception) {
            Log.e(TAG, "❌ [Hand] Failed to initialize: ${e.message}")
        }

        try {
            // --- 2. Pose Landmarker ---
            // Use _lite for performance on Android first
            val poseBaseOptions = BaseOptions.builder()
                .setModelAssetPath("pose_landmarker_lite.task") 
                .build()

            val poseOptions = PoseLandmarker.PoseLandmarkerOptions.builder()
                .setBaseOptions(poseBaseOptions)
                .setRunningMode(RunningMode.VIDEO)
                .setNumPoses(1)
                .setMinPoseDetectionConfidence(0.5f) // Float value .5f
                .setMinPosePresenceConfidence(0.5f)
                .setMinTrackingConfidence(0.5f)
                .build()

            this.poseLandmarker = PoseLandmarker.createFromOptions(context, poseOptions)
            Log.d(TAG, "✅ [Pose] Initialized Successfully")
            isInitialized = true // At least one works

        } catch (e: Exception) {
            Log.e(TAG, "❌ [Pose] Failed to initialize (trying fallback): ${e.message}")
            // Fallback to non-lite if needed logic could go here
        }
    }

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
        Log.d(TAG, "Callback invoked!")
        if (!isInitialized) return null
        
        try {
            // Convert VisionCamera Frame to Bitmap (This is expensive but easiest)
            // Ideally use HardwareBuffer directly if MediaPipe supports it in future
            val bitmap = AndroidBitmapUtils.convertFrameToBitmap(frame) ?: return null
            val timestampMs = android.os.SystemClock.uptimeMillis() // Monotonic time is safer for MediaPipe
            
            // Create MPImage from Bitmap
            val mpImage = BitmapImageBuilder(bitmap).build()
            val resultData = HashMap<String, Any?>()

            // --- 1. Hand Detection ---
            handLandmarker?.let { detector ->
                val result = detector.detectForVideo(mpImage, timestampMs)
                resultData["hands"] = convertHandResult(result)
                resultData["handCount"] = result.landmarks().size
            }

            // --- 2. Pose Detection ---
            poseLandmarker?.let { detector ->
                val result = detector.detectForVideo(mpImage, timestampMs)
                resultData["pose"] = convertPoseResult(result)
            }

            return resultData

        } catch (e: Exception) {
            Log.e(TAG, "❌ [Vision] Error in frame: ${e.message}")
            return null
        }
    }

    private fun convertHandResult(result: HandLandmarkerResult): List<Map<String, Any>> {
        val handsList = ArrayList<Map<String, Any>>()
        
        for (i in 0 until result.landmarks().size) {
            val handData = HashMap<String, Any>()
            val landmarks = result.landmarks()[i]
            
            // Handedness
            if (i < result.handedness().size) {
                val category = result.handedness()[i][0]
                handData["handedness"] = category.displayName() ?: category.categoryName() ?: "Unknown"
                handData["confidence"] = category.score().toDouble() // Convert Float to Double for JS safety
            } else {
                handData["handedness"] = "Unknown"
                handData["confidence"] = 0.0
            }

            // Landmarks
            val landmarksArray = ArrayList<Map<String, Any>>()
            for (j in landmarks.indices) {
                val lm = landmarks[j]
                val lmMap = HashMap<String, Any>()
                lmMap["x"] = lm.x().toDouble()
                lmMap["y"] = lm.y().toDouble()
                lmMap["z"] = lm.z().toDouble()
                landmarksArray.add(lmMap)
            }
            handData["landmarks"] = landmarksArray
            handsList.add(handData)
        }
        return handsList
    }

    private fun convertPoseResult(result: PoseLandmarkerResult): Map<String, Any>? {
        if (result.landmarks().isEmpty()) return null
        
        val firstPose = result.landmarks()[0]
        val landmarksArray = ArrayList<Map<String, Any>>()
        
        for (j in firstPose.indices) {
             val lm = firstPose[j]
             val lmMap = HashMap<String, Any>()
             lmMap["name"] = if (j < POSE_LANDMARK_NAMES.size) POSE_LANDMARK_NAMES[j] else "UNKNOWN"
             lmMap["x"] = lm.x().toDouble()
             lmMap["y"] = lm.y().toDouble()
             lmMap["z"] = lm.z().toDouble()
             
             // Pose has visibility
             if (lm.visibility().isPresent) {
                 lmMap["visibility"] = lm.visibility().get().toDouble()
             } else {
                 lmMap["visibility"] = 0.0
             }
             landmarksArray.add(lmMap)
        }
        
        val poseData = HashMap<String, Any>()
        poseData["landmarks"] = landmarksArray
        
        return poseData
    }
}
