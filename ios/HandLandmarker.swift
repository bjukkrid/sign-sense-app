/**
 * HandLandmarker.swift
 * 
 * 📖 React Native Native Module สำหรับ Hand Landmark Detection
 * 
 * Module นี้เป็น bridge ระหว่าง React Native และ MediaPipe
 * 
 * Methods ที่ expose ไปยัง JS:
 * - initialize(): เริ่มต้น HandLandmarker
 * - detectFromBase64(): ตรวจจับ hands จาก base64 image
 */

import Foundation
import MediaPipeTasksVision
import UIKit

@objc(HandLandmarker)
class HandLandmarker: NSObject {
    
    private var handLandmarker: MediaPipeTasksVision.HandLandmarker?
    private var isInitialized = false
    
    // ชื่อ landmarks ทั้ง 21 จุด
    private let landmarkNames = [
        "WRIST",
        "THUMB_CMC", "THUMB_MCP", "THUMB_IP", "THUMB_TIP",
        "INDEX_FINGER_MCP", "INDEX_FINGER_PIP", "INDEX_FINGER_DIP", "INDEX_FINGER_TIP",
        "MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP",
        "RING_FINGER_MCP", "RING_FINGER_PIP", "RING_FINGER_DIP", "RING_FINGER_TIP",
        "PINKY_MCP", "PINKY_PIP", "PINKY_DIP", "PINKY_TIP"
    ]
    
    /**
     * Initialize HandLandmarker
     * 
     * 📖 ในการใช้งานจริง ต้อง download model file:
     * hand_landmarker.task จาก Google MediaPipe
     */
    @objc
    func initialize(_ resolve: @escaping RCTPromiseResolveBlock,
                    reject: @escaping RCTPromiseRejectBlock) {
        
        // ลองหา model file
        guard let modelPath = Bundle.main.path(forResource: "hand_landmarker", ofType: "task") else {
            // ถ้าไม่มี model file ให้แจ้งกลับพร้อมคำแนะนำ
            let error = NSError(
                domain: "HandLandmarker",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Model file 'hand_landmarker.task' not found. Please download it from MediaPipe and add to your iOS project."]
            )
            reject("MODEL_NOT_FOUND", "hand_landmarker.task not found", error)
            return
        }
        
        do {
            let options = HandLandmarkerOptions()
            options.baseOptions.modelAssetPath = modelPath
            options.numHands = 2
            options.minHandDetectionConfidence = 0.5
            options.minHandPresenceConfidence = 0.5
            options.minTrackingConfidence = 0.5
            options.runningMode = .image  // Use .image for single frame detection
            
            handLandmarker = try MediaPipeTasksVision.HandLandmarker(options: options)
            isInitialized = true
            
            resolve([
                "success": true,
                "message": "HandLandmarker initialized successfully"
            ])
        } catch {
            reject("INIT_FAILED", "Failed to initialize HandLandmarker", error)
        }
    }
    
    /**
     * Detect hands from base64 encoded image
     */
    @objc
    func detectFromBase64(_ base64Image: String,
                          timestamp: Int,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
        
        guard isInitialized, let landmarker = handLandmarker else {
            reject("NOT_INITIALIZED", "HandLandmarker not initialized", nil)
            return
        }
        
        // Decode base64 to UIImage
        guard let imageData = Data(base64Encoded: base64Image),
              let uiImage = UIImage(data: imageData) else {
            reject("INVALID_IMAGE", "Failed to decode base64 image", nil)
            return
        }
        
        // Create MPImage
        guard let mpImage = try? MPImage(uiImage: uiImage) else {
            reject("IMAGE_CONVERSION_FAILED", "Failed to create MPImage", nil)
            return
        }
        
        // Detect
        do {
            let result = try landmarker.detect(image: mpImage)
            let handsData = convertResult(result)
            resolve([
                "hands": handsData,
                "timestamp": timestamp
            ])
        } catch {
            reject("DETECTION_FAILED", "Hand detection failed", error)
        }
    }
    
    /**
     * Convert result to Dictionary for JS
     */
    private func convertResult(_ result: HandLandmarkerResult) -> [[String: Any]] {
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
                    "name": index < landmarkNames.count ? landmarkNames[index] : "UNKNOWN",
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z
                ])
            }
            handData["landmarks"] = landmarksArray
            
            // World Landmarks
            if handIndex < result.worldLandmarks.count {
                var worldLandmarksArray: [[String: Any]] = []
                for (index, landmark) in result.worldLandmarks[handIndex].enumerated() {
                    worldLandmarksArray.append([
                        "index": index,
                        "name": index < landmarkNames.count ? landmarkNames[index] : "UNKNOWN",
                        "x": landmark.x,
                        "y": landmark.y,
                        "z": landmark.z
                    ])
                }
                handData["worldLandmarks"] = worldLandmarksArray
            }
            
            handsData.append(handData)
        }
        
        return handsData
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
