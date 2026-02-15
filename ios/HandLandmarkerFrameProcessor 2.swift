/**
 * HandLandmarkerFrameProcessor.swift
 * 
 * 📖 Frame Processor Plugin สำหรับ VisionCamera
 * 
 * ใช้ตรวจจับ 21 hand landmarks แบบ real-time
 * 
 * Flow:
 * 1. VisionCamera ส่ง frame มา
 * 2. แปลงเป็น MPImage
 * 3. ส่งไป HandLandmarker
 * 4. คืนค่า landmarks กลับไป JS
 */

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
    
    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable : Any]! = [:]) {
        super.init(proxy: proxy, options: options)
        
        // Initialize HandLandmarker on first use
        if !HandLandmarkerFrameProcessor.isInitialized {
            HandLandmarkerFrameProcessor.setupHandLandmarker()
        }
    }
    
    private static func setupHandLandmarker() {
        guard let modelPath = Bundle.main.path(forResource: "hand_landmarker", ofType: "task") else {
            print("❌ HandLandmarker: Model file not found!")
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
            print("✅ HandLandmarker Frame Processor initialized")
        } catch {
            print("❌ Failed to create HandLandmarker: \(error)")
        }
    }
    
    public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any? {
        guard HandLandmarkerFrameProcessor.isInitialized,
              let landmarker = HandLandmarkerFrameProcessor.handLandmarker else {
            return ["error": "HandLandmarker not initialized"]
        }
        
        // Get timestamp
        let timestampMs = Int(frame.timestamp * 1000)
        
        // Convert CMSampleBuffer to MPImage
        guard let mpImage = try? MPImage(sampleBuffer: frame.buffer) else {
            return ["error": "Failed to create MPImage"]
        }
        
        // Detect hands
        do {
            let result = try landmarker.detect(videoFrame: mpImage, timestampInMilliseconds: timestampMs)
            return convertResult(result)
        } catch {
            return ["error": "Detection failed: \(error.localizedDescription)"]
        }
    }
    
    private func convertResult(_ result: HandLandmarkerResult) -> [String: Any] {
        var handsData: [[String: Any]] = []
        
        for (handIndex, landmarks) in result.landmarks.enumerated() {
            var handData: [String: Any] = [:]
            
            // Handedness
            if handIndex < result.handedness.count,
               let first = result.handedness[handIndex].first {
                handData["handedness"] = first.categoryName ?? "Unknown"
                handData["confidence"] = first.score
            }
            
            // Landmarks (21 points)
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
