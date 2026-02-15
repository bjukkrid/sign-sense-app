package com.signlang.app

import android.graphics.Bitmap
import android.media.Image
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MediaImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy

/**
 * HandLandmarkerFrameProcessor for Android
 * 
 * Detects 21 hand landmarks using Google MediaPipe
 * Compatible with react-native-vision-camera Frame Processor
 */
class HandLandmarkerFrameProcessor(proxy: VisionCameraProxy, options: Map<String, Any>?) : FrameProcessorPlugin() {

    companion object {
        private const val TAG = "HandLandmarker"
        
        private var handLandmarker: HandLandmarker? = null
        private var isInitialized = false
        
        private val landmarkNames = arrayOf(
            "WRIST",
            "THUMB_CMC", "THUMB_MCP", "THUMB_IP", "THUMB_TIP",
            "INDEX_FINGER_MCP", "INDEX_FINGER_PIP", "INDEX_FINGER_DIP", "INDEX_FINGER_TIP",
            "MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP",
            "RING_FINGER_MCP", "RING_FINGER_PIP", "RING_FINGER_DIP", "RING_FINGER_TIP",
            "PINKY_MCP", "PINKY_PIP", "PINKY_DIP", "PINKY_TIP"
        )

        fun initialize(context: android.content.Context) {
            if (isInitialized) return

            try {
                val modelPath = "hand_landmarker.task"
                
                val baseOptions = BaseOptions.builder()
                    .setModelAssetPath(modelPath)
                    .build()

                val options = HandLandmarker.HandLandmarkerOptions.builder()
                    .setBaseOptions(baseOptions)
                    .setNumHands(2)
                    .setMinHandDetectionConfidence(0.5f)
                    .setMinHandPresenceConfidence(0.5f)
                    .setMinTrackingConfidence(0.5f)
                    .setRunningMode(RunningMode.VIDEO)
                    .build()

                handLandmarker = HandLandmarker.createFromOptions(context, options)
                isInitialized = true
                android.util.Log.d(TAG, "✅ HandLandmarker initialized successfully")
            } catch (e: Exception) {
                android.util.Log.e(TAG, "❌ Failed to initialize HandLandmarker: ${e.message}", e)
            }
        }
    }

    override fun callback(frame: Frame, params: Map<String, Any>?): Map<String, Any> {
        
        if (!isInitialized || handLandmarker == null) {
            return mapOf("error" to "HandLandmarker not initialized")
        }

        try {
            val image = frame.image
            if (image == null) {
                return mapOf("error" to "Image is null")
            }
            
            // Use MediaImageBuilder
            val mpImage = MediaImageBuilder(frame.image).build()
            
            val timestampMs = System.currentTimeMillis()

            val result = handLandmarker!!.detectForVideo(mpImage, timestampMs)
            
            return convertResult(result)
        } catch (e: Exception) {
            android.util.Log.e(TAG, "❌ EXCEPTION in HandProcessor: ${e.message}", e)
            return mapOf("error" to "EXCEPTION: ${e.message}")
        }
    }

    private fun convertResult(result: HandLandmarkerResult): Map<String, Any> {
        val handsData = mutableListOf<Map<String, Any>>()

        result.landmarks().forEachIndexed { handIndex, landmarks ->
            val handData = mutableMapOf<String, Any>()

            // Add handedness
            if (handIndex < result.handedness().size) {
                val category = result.handedness()[handIndex].firstOrNull()
                if (category != null) {
                    handData["handedness"] = category.categoryName() ?: "Unknown"
                    handData["confidence"] = category.score().toDouble() // Convert to Double
                }
            }

            // Add landmarks
            val landmarksArray = mutableListOf<Map<String, Any>>()
            landmarks.forEachIndexed { index, landmark ->
                landmarksArray.add(
                    mapOf(
                        "index" to index,
                        "name" to if (index < landmarkNames.size) landmarkNames[index] else "UNKNOWN",
                        "x" to landmark.x().toDouble(), // Convert to Double
                        "y" to landmark.y().toDouble(), 
                        "z" to landmark.z().toDouble()
                    )
                )
            }
            handData["landmarks"] = landmarksArray

            handsData.add(handData)
        }

        return mapOf(
            "hands" to handsData,
            "handCount" to handsData.size
        )
    }
}
