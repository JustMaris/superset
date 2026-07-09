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
import { useState } from 'react';
import { Dayjs } from 'dayjs';
import { t } from '@apache-superset/core/translation';
import { customTimeRangeDecode } from '@superset-ui/core';
import {
  RangePicker,
  Checkbox,
  AntdThemeProvider,
  Col,
  Row,
  Loading,
} from '@superset-ui/core/components';
import {
  DAYJS_FORMAT,
  customTimeRangeEncode,
  dttmToDayjs,
} from 'src/explore/components/controls/DateFilterControl/utils';
import { FrameComponentProps } from 'src/explore/components/controls/DateFilterControl/types';
import { useLocale } from 'src/hooks/useLocale';

type PickerRange = [Dayjs | null, Dayjs | null] | null;

const isPlainDayBoundary = (dttm: string) => {
  const dayjsValue = dttmToDayjs(dttm);
  return (
    dayjsValue.isValid() &&
    dayjsValue.hour() === 0 &&
    dayjsValue.minute() === 0 &&
    dayjsValue.second() === 0
  );
};

export function SimpleFrame(props: FrameComponentProps) {
  const { value, onChange, isOverflowingFilterBar } = props;
  const datePickerLocale = useLocale();

  const { customRange, matchedFlag } = customTimeRangeDecode(value);
  const isCustomRange =
    matchedFlag &&
    customRange.sinceMode === 'specific' &&
    customRange.untilMode === 'specific';

  const [includeTime, setIncludeTime] = useState<boolean>(
    isCustomRange &&
      (!isPlainDayBoundary(customRange.sinceDatetime) ||
        !isPlainDayBoundary(customRange.untilDatetime)),
  );

  const initialPickerValue: PickerRange = isCustomRange
    ? [
        dttmToDayjs(customRange.sinceDatetime),
        includeTime
          ? dttmToDayjs(customRange.untilDatetime)
          : dttmToDayjs(customRange.untilDatetime).subtract(1, 'day'),
      ]
    : null;

  const [pickerValue, setPickerValue] = useState<PickerRange>(
    initialPickerValue,
  );

  function onRangeChange(range: PickerRange) {
    setPickerValue(range);
    if (!range?.[0] || !range?.[1]) {
      return;
    }
    const [start, end] = range as [Dayjs, Dayjs];
    const sinceDatetime = includeTime
      ? start.format(DAYJS_FORMAT)
      : start.startOf('day').format(DAYJS_FORMAT);
    const untilDatetime = includeTime
      ? end.format(DAYJS_FORMAT)
      : end.startOf('day').add(1, 'day').format(DAYJS_FORMAT);
    onChange(
      customTimeRangeEncode({
        ...customRange,
        sinceMode: 'specific',
        untilMode: 'specific',
        sinceDatetime,
        untilDatetime,
      }),
    );
  }

  if (datePickerLocale === null) {
    return <Loading position="inline-centered" />;
  }

  return (
    <AntdThemeProvider locale={datePickerLocale}>
      <div data-test="simple-frame">
        <div className="section-title">{t('Pick an exact range')}</div>
        <Row gutter={24}>
          <Col span={24}>
            <RangePicker
              showTime={includeTime}
              allowClear={false}
              value={pickerValue}
              onCalendarChange={onRangeChange}
              getPopupContainer={(triggerNode: HTMLElement) =>
                isOverflowingFilterBar
                  ? (triggerNode.parentNode as HTMLElement)
                  : document.body
              }
            />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Checkbox
              checked={includeTime}
              onChange={(event: any) => setIncludeTime(event.target.checked)}
            >
              {t('Include time')}
            </Checkbox>
          </Col>
        </Row>
      </div>
    </AntdThemeProvider>
  );
}
