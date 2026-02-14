//
//  HandLandmarkerFrameProcessor.swift
//  signlangapp
//
//  Frame Processor Plugin for VisionCamera
//  Detects 21 hand landmarks using MediaPipe
//

import Foundation
import MediaPipeTasksVision
import VisionCamera

@objc(HandLandmarkerFrameProcessor)
public class HandLandmarkerFrameProcessor: FrameProcessorPlugin {
    
    private static var handLandmarker: MediaPipeTasksVision.HandLandmarker?
    private static var isInitialized = false
    
    private static let landmarkNames = [
        "WRIST",
        "THUMB_CMC", "THUMB_MCP", "THUMB_IP", "THUMB_TIP",
        "INDEX_FINGER_MCP", "INDEX_FINGER_PIP", "INDEX_FINGER_DIP", "INDEX_FINGER_TIP",
        "MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP",
        "RING_FINGER_MCP", "RING_FINGER_PIP", "RING_FINGER_DIP", "RING_FINGER_TIP",
        "PINKY_MCP", "PINKY_PIP", "PINKY_DIP", "PINKY_TIP"
    ]
    
    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
        super.init(proxy: proxy, options: options)
        
        if !HandLandmarkerFrameProcessor.isInitialized {
            HandLandmarkerFrameProcessor.setupHandLandmarker()
        }
    }
    
    private static func setupHandLandmarker() {
        guard let modelPath = Bundle.main.path(forResource: "hand_landmarker", ofType: "task") else {
            print("❌ HandLandmarkerFrameProcessor: Model file not found!")
            return
        }
        
        do {
            let options = HandLandmarkerOptions()
            options.baseOptions.modelAssetPath = modelPath
            options.numHands = 2
            options.minHandDetectionConfidence = 0.5
            options.minHandPresenceConfidence = 0.5
            options.minTrackingConfidence = 0.5
            options.runningMode = .video
            
            handLandmarker = try MediaPipeTasksVision.HandLandmarker(options: options)
            isInitialized = true
            print("✅ HandLandmarkerFrameProcessor: Initialized successfully")
        } catch {
            print("❌ HandLandmarkerFrameProcessor: Failed - \(error)")
        }
    }
    
    public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any {
        guard HandLandmarkerFrameProcessor.isInitialized,
              let landmarker = HandLandmarkerFrameProcessor.handLandmarker else {
            return ["error": "Not initialized"] as [String: Any]
        }
        
        let timestampMs = Int(Date().timeIntervalSince1970 * 1000)
        
        // VisionCamera frames are typically .up (landscape left sensor)
        // We need to match the device orientation
        // For now, assume Portrait mode (.left or .right depending on camera)
        
        var orientation: UIImage.Orientation = .up
        if frame.orientation == .portrait {
            orientation = .left // Rotate 90 deg counter-clockwise
        } else if frame.orientation == .landscapeLeft {
            orientation = .up
        } else if frame.orientation == .landscapeRight {
            orientation = .down
        } else if frame.orientation == .portraitUpsideDown {
            orientation = .right
        }

        guard let mpImage = try? MPImage(sampleBuffer: frame.buffer, orientation: orientation) else {
            return ["error": "Failed to create MPImage"] as [String: Any]
        }
        
        do {
            let result = try landmarker.detect(videoFrame: mpImage, timestampInMilliseconds: timestampMs)
            return convertResult(result)
        } catch {
            return ["error": "Detection failed"] as [String: Any]
        }
    }
    
    private func convertResult(_ result: HandLandmarkerResult) -> [String: Any] {
        var handsData: [[String: Any]] = []
        
        for (handIndex, landmarks) in result.landmarks.enumerated() {
            var handData: [String: Any] = [:]
            
            if handIndex < result.handedness.count,
               let first = result.handedness[handIndex].first {
                handData["handedness"] = first.categoryName ?? "Unknown"
                handData["confidence"] = first.score
            }
            
            var landmarksArray: [[String: Any]] = []
            for (index, landmark) in landmarks.enumerated() {
                landmarksArray.append([
                    "index": index,
                    "name": index < HandLandmarkerFrameProcessor.landmarkNames.count 
                        ? HandLandmarkerFrameProcessor.landmarkNames[index] : "UNKNOWN",
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z
                ])
            }
            handData["landmarks"] = landmarksArray
            
            handsData.append(handData)
        }
        
        return [
            "hands": handsData,
            "handCount": handsData.count
        ]
    }
}
