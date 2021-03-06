/*
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *

@interface FIRAnalytics : NSObject

+ (void)logEventWithName:(nonnull NSString *)name
              parameters:(nullable NSDictionary<NSString *, id> *)parameters;

+ (void)setUserPropertyString:(nullable NSString *)value forName:(nonnull NSString *)name;

+ (void)setUserID:(nullable NSString *)userID;

+ (void)setAnalyticsCollectionEnabled:(BOOL)analyticsCollectionEnabled;

+ (void)setSessionTimeoutInterval:(NSTimeInterval)sessionTimeoutInterval;

+ (nullable NSString *)appInstanceID;

+ (void)resetAnalyticsData;

@end
