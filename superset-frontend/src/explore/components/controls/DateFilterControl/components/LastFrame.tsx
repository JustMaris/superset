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
import { useLayoutEffect, useRef, useState } from 'react';
import { t } from '@apache-superset/core/translation';
import { Select, Col, Row, InputNumber } from '@superset-ui/core/components';
import {
  DateFilterTestKey,
  LAST_N_UNIT_OPTIONS,
  LAST_N_UNIT_PATTERN,
  LastNUnit,
} from 'src/explore/components/controls/DateFilterControl/utils';
import { FrameComponentProps } from 'src/explore/components/controls/DateFilterControl/types';

// The 5 legacy literal "Last day/week/month/quarter/year" values (kept for
// backwards compatibility with previously-saved charts) don't carry an
// amount, so they can't be parsed by LAST_N_UNIT_PATTERN. Map them to their
// equivalent (amount=1, unit) here purely so the control initializes
// correctly when opened against an old saved value.
const LEGACY_LAST_UNIT: Record<string, LastNUnit> = {
  'Last day': 'days',
  'Last week': 'weeks',
  'Last month': 'months',
  'Last quarter': 'quarters',
  'Last year': 'years',
};

// Extra room beyond the current label's text itself: the select's
// internal horizontal padding and the dropdown caret icon.
const UNIT_SELECT_EXTRA_WIDTH = 44;
const UNIT_SELECT_FALLBACK_WIDTH = 100;

function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return 0;
  }
  context.font = font;
  return context.measureText(text).width;
}

export function LastFrame(props: FrameComponentProps) {
  const { value, onChange } = props;

  const lastNMatch = LAST_N_UNIT_PATTERN.exec(value);
  const legacyUnit = LEGACY_LAST_UNIT[value];
  const [lastAmount, setLastAmount] = useState<number>(
    lastNMatch ? parseInt(lastNMatch[1], 10) : 1,
  );
  const [lastUnit, setLastUnit] = useState<LastNUnit>(
    lastNMatch
      ? (`${lastNMatch[2].replace(/s$/i, '')}s` as LastNUnit)
      : (legacyUnit ?? 'hours'),
  );

  // Sized to the *currently selected* label's own width — measured in the
  // font actually rendered for this viewer, so it adapts to OS font
  // substitution, browser zoom, and locale (translated labels vary a lot
  // in length) — rather than a fixed width matching the longest option,
  // which left visible empty space for every shorter one (most of them).
  // The dropdown popup is intentionally NOT tied to this width (see
  // popupMatchSelectWidth below): it needs to fit the longest option
  // regardless of what's currently selected, and antd's default ties the
  // popup width to the trigger's width, which is exactly what this box's
  // width is now deliberately avoiding.
  const unitSelectRef = useRef<HTMLDivElement>(null);
  const [unitSelectWidth, setUnitSelectWidth] = useState<number>(
    UNIT_SELECT_FALLBACK_WIDTH,
  );

  useLayoutEffect(() => {
    const { font } = window.getComputedStyle(
      unitSelectRef.current || document.body,
    );
    const currentLabel =
      LAST_N_UNIT_OPTIONS.find(option => option.value === lastUnit)?.label ??
      '';
    setUnitSelectWidth(
      Math.ceil(measureTextWidth(currentLabel, font)) + UNIT_SELECT_EXTRA_WIDTH,
    );
  }, [lastUnit]);

  function onLastNChange(amount: number | null, unit: LastNUnit) {
    if (!amount || amount < 1) {
      return;
    }
    setLastAmount(amount);
    setLastUnit(unit);
    const singularUnit = unit.replace(/s$/, '');
    onChange(`Last ${amount} ${amount === 1 ? singularUnit : unit}`);
  }

  return (
    <div data-test="last-frame">
      <div className="section-title" data-test={DateFilterTestKey.CommonFrame}>
        {t('Select a rolling window')}
      </div>
      <Row gutter={8} align="middle">
        <Col>{t('Last')}</Col>
        <Col>
          <InputNumber
            min={1}
            value={lastAmount}
            onChange={amount => onLastNChange(amount as number | null, lastUnit)}
          />
        </Col>
        <Col ref={unitSelectRef}>
          <Select
            ariaLabel={t('Time unit')}
            options={LAST_N_UNIT_OPTIONS}
            value={lastUnit}
            onChange={(unit: LastNUnit) => onLastNChange(lastAmount, unit)}
            style={{ width: unitSelectWidth }}
            popupMatchSelectWidth={false}
          />
        </Col>
      </Row>
    </div>
  );
}
