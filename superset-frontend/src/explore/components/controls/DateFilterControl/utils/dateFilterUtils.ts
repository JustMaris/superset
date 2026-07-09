/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  NO_TIME_RANGE,
  JsonObject,
  customTimeRangeDecode,
} from '@superset-ui/core';
import { useSelector } from 'react-redux';
import {
  COMMON_RANGE_VALUES_SET,
  CALENDAR_RANGE_VALUES_SET,
  CURRENT_RANGE_VALUES_SET,
  LAST_N_UNIT_PATTERN,
} from '.';
import { AdvancedSubFrameType, FrameType } from '../types';

export const guessFrame = (timeRange: string): FrameType => {
  if (timeRange === NO_TIME_RANGE) {
    return 'No filter';
  }
  if (
    COMMON_RANGE_VALUES_SET.has(timeRange) ||
    LAST_N_UNIT_PATTERN.test(timeRange)
  ) {
    return 'Last';
  }
  if (CALENDAR_RANGE_VALUES_SET.has(timeRange)) {
    return 'Previous';
  }
  if (CURRENT_RANGE_VALUES_SET.has(timeRange)) {
    return 'Current';
  }
  const { customRange, matchedFlag } = customTimeRangeDecode(timeRange);
  if (matchedFlag) {
    if (customRange.sinceMode === 'specific' && customRange.untilMode === 'specific') {
      return 'Simple';
    }
    return 'Advanced';
  }
  return 'Advanced';
};

export const guessAdvancedSubFrame = (timeRange: string): AdvancedSubFrameType => {
  if (customTimeRangeDecode(timeRange).matchedFlag) {
    return 'Custom';
  }
  return 'Expression';
};

export function useDefaultTimeFilter() {
  return (
    useSelector(
      (state: JsonObject) => state?.common?.conf?.DEFAULT_TIME_FILTER,
    ) ?? NO_TIME_RANGE
  );
}
