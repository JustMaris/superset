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
        <Col>
          <Select
            ariaLabel={t('Time unit')}
            options={LAST_N_UNIT_OPTIONS}
            value={lastUnit}
            onChange={(unit: LastNUnit) => onLastNChange(lastAmount, unit)}
          />
        </Col>
      </Row>
    </div>
  );
}
