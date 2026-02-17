/**
 * HandLandmarkerFrameProcessor.m
 *
 * Registers the Swift Frame Processor with VisionCamera.
 */

#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

// Import the generated Swift header.
// Make sure "signlangapp" matches your target name in Xcode.
#import "signlangapp-Swift.h"

// Register the Swift class "HandLandmarkerFrameProcessor" as "detectHands" for
// use in JS.
VISION_EXPORT_SWIFT_FRAME_PROCESSOR(HandLandmarkerFrameProcessor, detectHands)