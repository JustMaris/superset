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
import { ReactElement } from 'react';

import { t } from '@apache-superset/core/translation';
import { Checkbox } from '@superset-ui/core/components';
import { Dataset } from '@superset-ui/chart-controls';
import ControlHeader from 'src/explore/components/ControlHeader';
import { Operators } from 'src/explore/constants';

export const isBooleanColumn = (
  columnName: string | undefined,
  datasource: Dataset,
): boolean => {
  const column = datasource.columns?.find(
    col => col.column_name === columnName,
  );
  return !!column && (column.type === 'BOOL' || column.type === 'BOOLEAN');
};

interface BooleanCheckboxInFilterProps {
  columnName?: string;
  operatorId?: Operators;
  datasource: Dataset;
  onChange: (operatorId: Operators) => void;
}

export const useBooleanCheckboxInAdhocFilter = ({
  columnName,
  operatorId,
  datasource,
  onChange,
}: BooleanCheckboxInFilterProps): ReactElement | undefined => {
  if (!columnName || !isBooleanColumn(columnName, datasource)) {
    return undefined;
  }

  const checked = operatorId === Operators.IsTrue;

  return (
    <>
      <ControlHeader label={t('Value')} />
      <Checkbox
        checked={checked}
        onChange={(event: any) =>
          onChange(event.target.checked ? Operators.IsTrue : Operators.IsFalse)
        }
      >
        {checked ? t('True') : t('False')}
      </Checkbox>
    </>
  );
};
