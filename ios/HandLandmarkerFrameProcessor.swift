//
//  HandLandmarkerFrameProcessor.swift
//  signlangapp
//
//  Created for Hand Detection using MediaPipe Tasks Vision on iOS.
//

import VisionCamera
import MediaPipeTasksVision
import UIKit

@objc(HandLandmarkerFrameProcessor)
public class HandLandmarkerFrameProcessor: FrameProcessorPlugin {
  
  private var handLandmarker: HandLandmarker?
  private var isInitialized = false
  
  // Cache for landmarks names to avoid recreation every frame
  private let landmarkNames = [
    "WRIST",
    "THUMB_CMC", "THUMB_MCP", "THUMB_IP", "THUMB_TIP",
    "INDEX_FINGER_MCP", "INDEX_FINGER_PIP", "INDEX_FINGER_DIP", "INDEX_FINGER_TIP",
    "MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP",
    "RING_FINGER_MCP", "RING_FINGER_PIP", "RING_FINGER_DIP", "RING_FINGER_TIP",
    "PINKY_MCP", "PINKY_PIP", "PINKY_DIP", "PINKY_TIP"
  ]

  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable : Any]! = [:]) {
    super.init(proxy: proxy, options: options)
    initializeHandLandmarker()
  }

  private func initializeHandLandmarker() {
    print("🚀 [Hand] Initializing HandLandmarker...")
    // 1. Locate the model file in the bundle
    guard let modelPath = Bundle.main.path(forResource: "hand_landmarker", ofType: "task") else {
      print("❌ [Hand] Model file (hand_landmarker.task) not found in bundle! Make sure it is added to 'Copy Bundle Resources' in Xcode.")
      return
    }
    print("📂 [Hand] Model path found: \(modelPath)")

    // 2. Configure MediaPipe Options
    do {
      let baseOptions = BaseOptions()
      baseOptions.modelAssetPath = modelPath
        
      let options = HandLandmarkerOptions()
      options.baseOptions = baseOptions
      options.runningMode = .video
      options.numHands = 2
      options.minHandDetectionConfidence = 0.5
      options.minHandPresenceConfidence = 0.5
      options.minTrackingConfidence = 0.5

      print("🔧 [Hand] Options configured. Creating HandLandmarker...")
      // 3. Create the HandLandmarker
      self.handLandmarker = try HandLandmarker(options: options)
      self.isInitialized = true
      print("✅ [Hand] HandLandmarker initialized successfully (iOS)")
    } catch {
      print("❌ [Hand] Failed to initialize HandLandmarker: \(error)")
    }
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any? {
    // Return nil if not initialized to avoid crashes
    guard isInitialized, let handLandmarker = handLandmarker else {
      return nil
    }

    let buffer = frame.buffer
    // CMSampleBufferGetImageBuffer equivalent
    guard let imageBuffer = CMSampleBufferGetImageBuffer(buffer) else {
        return nil
    }
      
    do {
        // Timestamp in MS required by MediaPipe
        let timestampMs = Int(CMSampleBufferGetPresentationTimeStamp(buffer).seconds * 1000)
        
        // Create MPImage from the buffer.
        // We use .up orientation to process the raw buffer as-is.
        // Coordinate transformations (rotation/mirroring) are handled in JS.
        let mpImage = try MPImage(pixelBuffer: imageBuffer, orientation: .up)
        
        // Run detection
        let result = try handLandmarker.detect(videoFrame: mpImage, timestampInMilliseconds: timestampMs)
        
        // Convert to JS-friendly format
        return convertResult(result)
        
    } catch {
        print("❌ [Hand] Detection error: \(error)")
        return nil
    }
  }

  private func convertResult(_ result: HandLandmarkerResult) -> [String: Any] {
    var handsData: [[String: Any]] = []

    // Iterate through detected hands
    for (index, landmarks) in result.landmarks.enumerated() {
      var handData: [String: Any] = [:]

      // Extract Handedness (Left/Right)
      if index < result.handedness.count {
        let categories = result.handedness[index]
        if let category = categories.first {
            handData["handedness"] = category.displayName ?? category.categoryName ?? "Unknown"
            handData["confidence"] = category.score
        }
      }

      // Extract Landmarks
      var landmarksArray: [[String: Any]] = []
      for (lmIndex, landmark) in landmarks.enumerated() {
        landmarksArray.append([
          "index": lmIndex,
          "name": lmIndex < landmarkNames.count ? landmarkNames[lmIndex] : "UNKNOWN",
          "x": landmark.x,
          "y": landmark.y,
          "z": landmark.z
        ])
      }
      handData["landmarks"] = landmarksArray
      
      handsData.append(handData)
    }

    // Return the final structure expected by JS
    return [
      "hands": handsData,
      "handCount": handsData.count
    ]
  }
}
