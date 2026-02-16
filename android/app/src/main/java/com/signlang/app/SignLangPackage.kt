package com.signlang.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry
import android.util.Log

class SignLangPackage : ReactPackage {
    init {
        // Register the Frame Processor Plugin
        Log.d("SignLangPkg", "Registering detectHands Frame Processor...")
        FrameProcessorPluginRegistry.addFrameProcessorPlugin("detectHands") { proxy, options ->
            HandLandmarkerFrameProcessorPlugin(proxy, options)
        }
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return emptyList()
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
