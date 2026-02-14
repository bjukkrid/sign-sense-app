package com.signlang.app

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.media.Image
import androidx.camera.core.ImageProxy
import com.mrousavy.camera.frameprocessors.Frame
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer

/**
 * Utility class to convert VisionCamera Frame (wrapping ImageProxy) to Android Bitmap.
 * MediaPipe on Android prefers Bitmap or ByteBuffer input.
 * 
 * Crucial Function: YUV_420_888 -> ARGB_8888 Bitmap
 */
object AndroidBitmapUtils {
    
    fun bitmapFromFrame(frame: Frame): Bitmap? {
        try {
            // VisionCamera V3/V4 wraps ImageProxy.
            // We access the underlying ImageProxy directly.
            // Note: This requires 'androidx.camera:camera-core' dependency.
            val imageProxy = frame.imageProxy
            val image = imageProxy.image ?: return null
            
            // Handle different formats. Most improved camera frames are YUV_420_888
            if (image.format == ImageFormat.YUV_420_888) {
                return yuv420ToBitmap(image)
            } else if (image.format == ImageFormat.JPEG) {
                 val buffer = image.planes[0].buffer
                 val bytes = ByteArray(buffer.remaining())
                 buffer.get(bytes)
                 return BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
            }
            
            return null
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    /**
     * Converts YUV_420_888 Image to Bitmap.
     * This is a standard Android conversion using YuvImage class.
     */
    private fun yuv420ToBitmap(image: Image): Bitmap? {
        val yBuffer = image.planes[0].buffer // Y
        val uBuffer = image.planes[1].buffer // U
        val vBuffer = image.planes[2].buffer // V

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)

        // U and V are swapped
        yBuffer.get(nv21, 0, ySize)
        vBuffer.get(nv21, ySize, vSize)
        uBuffer.get(nv21, ySize + vSize, uSize)

        val yuvImage = YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)
        val out = ByteArrayOutputStream()
        yuvImage.compressToJpeg(Rect(0, 0, image.width, image.height), 100, out)
        val imageBytes = out.toByteArray()
        
        return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
    }
}
