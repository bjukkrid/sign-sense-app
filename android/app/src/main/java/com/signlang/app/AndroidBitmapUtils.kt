package com.signlang.app

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Matrix
import android.graphics.Rect
import android.graphics.YuvImage
import android.media.Image
import android.util.Log
import androidx.camera.core.ImageProxy
import com.mrousavy.camera.frameprocessors.Frame
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer

object AndroidBitmapUtils {

    /**
     * Converts a VisionCamera Frame (wrapping an ImageProxy) to a Bitmap.
     * Note: This operation can be slow on older devices.
     */
    fun convertFrameToBitmap(frame: Frame): Bitmap? {
        // Use imageProxy which returns androidx.camera.core.ImageProxy
        val imageProxy = frame.imageProxy
        
        // On Android, VisionCamera usually provides images in YUV_420_888 format
        if (imageProxy.format == ImageFormat.YUV_420_888) {
            return yuv420ToBitmap(imageProxy)
        }
        
        // Handle RGB/RGBA formats (often format 1)
        if (imageProxy.format == 1 || imageProxy.format == 4) { // 1 = RGB_565, 4 = RGB_565 (Legacy) or RGBA_8888 (Hardware)
             return rgbaToBitmap(imageProxy)
        }
        
        Log.e("AndroidBitmapUtils", "Unsupported Frame Format: ${imageProxy.format}")
        return null
    }

    private fun rgbaToBitmap(image: ImageProxy): Bitmap? {
        try {
            val buffer = image.planes[0].buffer
            val pixelStride = image.planes[0].pixelStride
            val rowStride = image.planes[0].rowStride
            val width = image.width
            val height = image.height

            // Start by assuming RGBA_8888 (4 bytes per pixel) configuration for Bitmap
            // VisionCamera with pixelFormat="rgb" usually delivers RGBA buffers on Android
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            
            buffer.rewind()
            bitmap.copyPixelsFromBuffer(buffer)
            
            return bitmap
        } catch (e: Exception) {
            Log.e("AndroidBitmapUtils", "Error converting RGBA to Bitmap: ${e.message}")
            e.printStackTrace()
            return null
        }
    }

    private fun yuv420ToBitmap(image: ImageProxy): Bitmap? {
        try {
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
            
            // Create Bitmap
            val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
            
            // Handle Rotation? usually VisionCamera handles orientation but we might need to rotate bitmap
            // keeping it simple for now, as Frame Processor receives frame.orientation info
            return bitmap
            
        } catch (e: Exception) {
            Log.e("AndroidBitmapUtils", "Error converting YUV to Bitmap: ${e.message}")
            e.printStackTrace()
            return null
        }
    }
}
