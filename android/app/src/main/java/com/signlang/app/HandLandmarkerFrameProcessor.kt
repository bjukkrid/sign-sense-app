package com.signlang.app

import android.graphics.Bitmap
import android.util.Log
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.bridge.WritableNativeArray
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult

class HandLandmarkerFrameProcessor(proxy: VisionCameraProxy, options: Map<String, Any>?) : FrameProcessorPlugin() {

    private var handLandmarker: HandLandmarker? = null
    
    companion object {
        private const val TAG = "HandLandmarker"
        private const val MP_HAND_LANDMARKER_TASK = "hand_landmarker.task"
        
        private val LANDMARK_NAMES = listOf(
            "WRIST",
            "THUMB_CMC", "THUMB_MCP", "THUMB_IP", "THUMB_TIP",
            "INDEX_FINGER_MCP", "INDEX_FINGER_PIP", "INDEX_FINGER_DIP", "INDEX_FINGER_TIP",
            "MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP",
            "RING_FINGER_MCP", "RING_FINGER_PIP", "RING_FINGER_DIP", "RING_FINGER_TIP",
            "PINKY_MCP", "PINKY_PIP", "PINKY_DIP", "PINKY_TIP"
        )
    }

    init {
        setupHandLandmarker(proxy)
    }

    private fun setupHandLandmarker(proxy: VisionCameraProxy) {
        try {
            val baseOptionsBuilder = BaseOptions.builder()
                .setModelAssetPath(MP_HAND_LANDMARKER_TASK)

            val baseOptions = baseOptionsBuilder.build()

            val optionsBuilder = HandLandmarker.HandLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                // Use matching confidence as iOS for consistency (0.5)
                .setMinHandDetectionConfidence(0.5f)
                .setMinHandPresenceConfidence(0.5f)
                .setMinTrackingConfidence(0.5f)
                .setNumHands(2)
                .setRunningMode(RunningMode.VIDEO)

            val options = optionsBuilder.build()
            
            // VisionCameraProxy.context is used to load assets
            handLandmarker = HandLandmarker.createFromOptions(proxy.context, options)

            Log.i(TAG, "HandLandmarker initialized successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize HandLandmarker: ${e.message}")
            e.printStackTrace()
        }
    }

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
        val landmarker = handLandmarker
        if (landmarker == null) {
            return null
        }

        try {
            val bitmap = AndroidBitmapUtils.bitmapFromFrame(frame) ?: return null
            
            val mpImage = BitmapImageBuilder(bitmap).build()
            
            val timestampMs = System.currentTimeMillis()
            
            val result = landmarker.detectForVideo(mpImage, timestampMs)
            
            return convertResult(result)

        } catch (e: Exception) {
            Log.e(TAG, "Error processing frame: ${e.message}")
            return null
        }
    }

    /**
     * Converts MediaPipe HandLandmarkerResult to WritableNativeMap
     * Structure: { hands: [ { landmarks: [{x,y,z,name}], handedness: {categoryName, score} }] }
     */
    private fun convertResult(result: HandLandmarkerResult): Any {
        val handsArray = WritableNativeArray()

        for (i in 0 until result.landmarks().size) {
            val landmarks = result.landmarks()[i]
            val handednessList = result.handedness()[i] 
            
            val handMap = WritableNativeMap()
            
            // Handedness
            if (handednessList.isNotEmpty()) {
                val category = handednessList[0]
                // Access using getters if properties are not available directly
                handMap.putString("handedness", category.categoryName())
                handMap.putDouble("confidence", category.score().toDouble())
            }

            // Landmarks
            val landmarksArray = WritableNativeArray()
            for ((index, landmark) in landmarks.withIndex()) {
                val landmarkMap = WritableNativeMap()
                landmarkMap.putInt("index", index)
                
                val name = if (index < LANDMARK_NAMES.size) LANDMARK_NAMES[index] else "UNKNOWN"
                landmarkMap.putString("name", name)
                
                landmarkMap.putDouble("x", landmark.x().toDouble())
                landmarkMap.putDouble("y", landmark.y().toDouble())
                landmarkMap.putDouble("z", landmark.z().toDouble())
                landmarksArray.pushMap(landmarkMap)
            }
            handMap.putArray("landmarks", landmarksArray)
            
            handsArray.pushMap(handMap)
        }
        
        val resultMap = WritableNativeMap()
        resultMap.putArray("hands", handsArray)
        
        return resultMap
    }
}
