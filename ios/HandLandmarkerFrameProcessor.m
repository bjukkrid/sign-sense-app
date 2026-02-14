/**
 * HandLandmarkerFrameProcessor.m
 *
 * Objective-C Registration สำหรับ Frame Processor Plugin
 */

#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#import "signlangapp-Swift.h"

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(HandLandmarkerFrameProcessor, detectHands)
