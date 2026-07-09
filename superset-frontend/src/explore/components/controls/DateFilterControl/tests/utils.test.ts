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
  customTimeRangeEncode,
  guessFrame,
  guessAdvancedSubFrame,
} from 'src/explore/components/controls/DateFilterControl/utils';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('guessFrame', () => {
  test('No filter', () => {
    expect(guessFrame('No filter')).toBe('No filter');
  });
  test('legacy Common (Last X) literals are Last', () => {
    expect(guessFrame('Last day')).toBe('Last');
    expect(guessFrame('Last week')).toBe('Last');
    expect(guessFrame('Last month')).toBe('Last');
    expect(guessFrame('Last quarter')).toBe('Last');
    expect(guessFrame('Last year')).toBe('Last');
  });
  test('general "Last N <unit>" values are Last', () => {
    expect(guessFrame('Last 6 hours')).toBe('Last');
    expect(guessFrame('Last 1 hour')).toBe('Last');
    expect(guessFrame('Last 30 minutes')).toBe('Last');
    expect(guessFrame('Last 3 months')).toBe('Last');
    expect(guessFrame('Last 2 quarters')).toBe('Last');
  });
  test('previous calendar X ranges are Previous', () => {
    expect(guessFrame('previous calendar week')).toBe('Previous');
    expect(guessFrame('previous calendar month')).toBe('Previous');
  });
  test('Current X ranges are Current', () => {
    expect(guessFrame('Current day')).toBe('Current');
    expect(guessFrame('Current week')).toBe('Current');
  });
  test('specific:specific custom ranges are Simple', () => {
    expect(guessFrame('2021-03-16T00:00:00 : 2021-03-17T00:00:00')).toBe(
      'Simple',
    );
  });
  test('relative custom ranges are Advanced', () => {
    expect(
      guessFrame('DATEADD(DATETIME("now"), -7, day) : DATEADD(DATETIME("now"), 7, day)'),
    ).toBe('Advanced');
  });
  test('unrecognized freeform expressions are Advanced', () => {
    expect(guessFrame('DATEADD(DATETIME("today"), -3, month)')).toBe(
      'Advanced',
    );
  });
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('guessAdvancedSubFrame', () => {
  test('recognized relative custom ranges map to Custom', () => {
    expect(
      guessAdvancedSubFrame(
        'DATEADD(DATETIME("now"), -7, day) : DATEADD(DATETIME("now"), 7, day)',
      ),
    ).toBe('Custom');
  });
  test('unrecognized freeform expressions map to Expression', () => {
    expect(guessAdvancedSubFrame('DATEADD(DATETIME("today"), -3, month)')).toBe(
      'Expression',
    );
  });
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('Custom TimeRange', () => {
  // eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
  describe('customTimeRangeEncode', () => {
    test('1) specific : specific', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: '2021-01-20T00:00:00',
          sinceMode: 'specific',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: '2021-01-27T00:00:00',
          untilMode: 'specific',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('2021-01-20T00:00:00 : 2021-01-27T00:00:00');
    });

    test('2) specific : relative', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: '2021-01-20T00:00:00',
          sinceMode: 'specific',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: '2021-01-20T00:00:00',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual(
        '2021-01-20T00:00:00 : DATEADD(DATETIME("2021-01-20T00:00:00"), 7, day)',
      );
    });

    test('3) now : relative', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'now',
          sinceMode: 'now',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'now',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('now : DATEADD(DATETIME("now"), 7, day)');
    });

    test('4) today : relative', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'today',
          sinceMode: 'today',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'today',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('today : DATEADD(DATETIME("today"), 7, day)');
    });

    test('5) relative : specific', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: '2021-01-27T00:00:00',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: '2021-01-27T00:00:00',
          untilMode: 'specific',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual(
        'DATEADD(DATETIME("2021-01-27T00:00:00"), -7, day) : 2021-01-27T00:00:00',
      );
    });

    test('6) relative : now', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'now',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'now',
          untilMode: 'now',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('DATEADD(DATETIME("now"), -7, day) : now');
    });

    test('7) relative : today', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'today',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'today',
          untilMode: 'today',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual('DATEADD(DATETIME("today"), -7, day) : today');
    });

    test('8) relative : relative (now)', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: 'now',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: 'now',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'now',
          anchorValue: 'now',
        }),
      ).toEqual(
        'DATEADD(DATETIME("now"), -7, day) : DATEADD(DATETIME("now"), 7, day)',
      );
    });

    test('9) relative : relative (date/time)', () => {
      expect(
        customTimeRangeEncode({
          sinceDatetime: '2021-01-27T00:00:00',
          sinceMode: 'relative',
          sinceGrain: 'day',
          sinceGrainValue: -7,
          untilDatetime: '2021-01-27T00:00:00',
          untilMode: 'relative',
          untilGrain: 'day',
          untilGrainValue: 7,
          anchorMode: 'specific',
          anchorValue: '2021-01-27T00:00:00',
        }),
      ).toEqual(
        'DATEADD(DATETIME("2021-01-27T00:00:00"), -7, day) : DATEADD(DATETIME("2021-01-27T00:00:00"), 7, day)',
      );
    });
  });
});
