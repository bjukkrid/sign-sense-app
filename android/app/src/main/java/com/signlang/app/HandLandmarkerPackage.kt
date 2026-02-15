package com.signlang.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry

class HandLandmarkerPackage : ReactPackage {
    companion object {
        init {
            // Register the Frame Processor Plugin
            FrameProcessorPluginRegistry.addFrameProcessorPlugin("detectHands") { proxy, options ->
                HandLandmarkerFrameProcessor(proxy, options)
            }
            android.util.Log.d("HandLandmarkerPackage", "✅ Registered 'detectHands' plugin")
        }
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return emptyList()
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
