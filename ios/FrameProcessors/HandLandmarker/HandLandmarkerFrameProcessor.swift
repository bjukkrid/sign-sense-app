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
  private var poseLandmarker: PoseLandmarker?
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

  // Pose landmarks (subset related to upper body mostly)
  // MediaPipe Pose has 33 landmarks.
  private let poseLandmarkNames = [
    "NOSE", "LEFT_EYE_INNER", "LEFT_EYE", "LEFT_EYE_OUTER", "RIGHT_EYE_INNER", "RIGHT_EYE", "RIGHT_EYE_OUTER",
    "LEFT_EAR", "RIGHT_EAR", "MOUTH_LEFT", "MOUTH_RIGHT",
    "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW", "LEFT_WRIST", "RIGHT_WRIST",
    "LEFT_PINKY", "RIGHT_PINKY", "LEFT_INDEX", "RIGHT_INDEX", "LEFT_THUMB", "RIGHT_THUMB",
    "LEFT_HIP", "RIGHT_HIP", "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE",
    "LEFT_HEEL", "RIGHT_HEEL", "LEFT_FOOT_INDEX", "RIGHT_FOOT_INDEX"
  ]

  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable : Any]! = [:]) {
    super.init(proxy: proxy, options: options)
    initializeLandmarkers()
  }

  private func initializeLandmarkers() {
    print("🚀 [Vision] Initializing Landmarkers...")
    
    // --- 1. Hand Landmarker ---
    if let modelPath = Bundle.main.path(forResource: "hand_landmarker", ofType: "task") {
        print("📂 [Hand] Model path found: \(modelPath)")
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
            self.handLandmarker = try HandLandmarker(options: options)
            print("✅ [Hand] Initialized Successfully")
            self.isInitialized = true // At least one works
        } catch {
            print("❌ [Hand] Failed to initialize: \(error)")
        }
    } else {
        print("❌ [Hand] Model file 'hand_landmarker.task' not found in bundle!")
        // Debug bundle contents
        // print("Ref - Bundle Resources: \(Bundle.main.paths(forResourcesOfType: "task", inDirectory: nil))")
    }

    // --- 2. Pose Landmarker ---
    // CHANGED: Try loading 'pose_landmarker_lite' OR 'pose_landmarker'
    var posePath = Bundle.main.path(forResource: "pose_landmarker_lite", ofType: "task")
    if posePath == nil {
        posePath = Bundle.main.path(forResource: "pose_landmarker", ofType: "task")
    }

    if let poseModelPath = posePath {
        print("📂 [Pose] Model path found: \(poseModelPath)")
        do {
            let baseOptions = BaseOptions()
            baseOptions.modelAssetPath = poseModelPath
            let options = PoseLandmarkerOptions()
            options.baseOptions = baseOptions
            options.runningMode = .video
            options.numPoses = 1
            options.minPoseDetectionConfidence = 0.5
            options.minPosePresenceConfidence = 0.5
            options.minTrackingConfidence = 0.5
            self.poseLandmarker = try PoseLandmarker(options: options)
            print("✅ [Pose] Initialized Successfully")
            self.isInitialized = true
        } catch {
            print("❌ [Pose] Failed to initialize: \(error)")
        }
    } else {
         print("❌ [Pose] Model file (pose_landmarker.task or _lite) not found in bundle!")
    }
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any? {
    guard isInitialized else { return nil }

    let buffer = frame.buffer
    guard let imageBuffer = CMSampleBufferGetImageBuffer(buffer) else { return nil }
      
    do {
        let timestampMs = Int(CMSampleBufferGetPresentationTimeStamp(buffer).seconds * 1000)
        let mpImage = try MPImage(pixelBuffer: imageBuffer, orientation: .up)
        
        var resultData: [String: Any] = [:]

        // --- Run Hand Detection ---
        if let handLandmarker = self.handLandmarker {
            let handResult = try handLandmarker.detect(videoFrame: mpImage, timestampInMilliseconds: timestampMs)
            resultData["hands"] = convertHandResult(handResult)
            resultData["handCount"] = handResult.landmarks.count
        }

        // --- Run Pose Detection ---
        if let poseLandmarker = self.poseLandmarker {
             let poseResult = try poseLandmarker.detect(videoFrame: mpImage, timestampInMilliseconds: timestampMs)
             resultData["pose"] = convertPoseResult(poseResult)
        }
        
        return resultData
        
    } catch {
        print("❌ [Vision] Detection error: \(error)")
        return nil
    }
  }

  private func convertHandResult(_ result: HandLandmarkerResult) -> [[String: Any]] {
    var handsData: [[String: Any]] = []
    for (index, landmarks) in result.landmarks.enumerated() {
      var handData: [String: Any] = [:]
      if index < result.handedness.count {
        let categories = result.handedness[index]
        if let category = categories.first {
            handData["handedness"] = category.displayName ?? category.categoryName ?? "Unknown"
            handData["confidence"] = category.score
        }
      }
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
    return handsData
  }

  private func convertPoseResult(_ result: PoseLandmarkerResult) -> [String: Any]? {
      // We only care about the first detected pose usually
      guard let landmarks = result.landmarks.first else { return nil }
      
      var landmarksArray: [[String: Any]] = []
      for (lmIndex, landmark) in landmarks.enumerated() {
          landmarksArray.append([
            "index": lmIndex,
            "name": lmIndex < poseLandmarkNames.count ? poseLandmarkNames[lmIndex] : "UNKNOWN",
            "x": landmark.x,
            "y": landmark.y,
            "z": landmark.z,
            "visibility": landmark.visibility ?? 0.0 // Pose landmarks have visibility score
          ])
      }
      
      return [
        "landmarks": landmarksArray
      ]
  }
}
