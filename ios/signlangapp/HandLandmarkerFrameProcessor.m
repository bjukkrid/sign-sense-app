/**
 * HandLandmarkerFrameProcessor.m
 *
 * Objective-C Registration สำหรับ Frame Processor Plugin
 *
 * 📖 ใช้วิธีเดียวกับ react-native-mediapipe
 */

#import <Foundation/Foundation.h>

#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#import "signlangapp-Swift.h"

@interface HandLandmarkerFrameProcessor (FrameProcessorPluginLoader)
@end

@implementation HandLandmarkerFrameProcessor (FrameProcessorPluginLoader)
+ (void)load {
  [FrameProcessorPluginRegistry
      addFrameProcessorPlugin:@"detectHands"
              withInitializer:^FrameProcessorPlugin *(
                  VisionCameraProxyHolder *proxy, NSDictionary *options) {
                return [[HandLandmarkerFrameProcessor alloc]
                    initWithProxy:proxy
                      withOptions:options];
              }];
}
@end
