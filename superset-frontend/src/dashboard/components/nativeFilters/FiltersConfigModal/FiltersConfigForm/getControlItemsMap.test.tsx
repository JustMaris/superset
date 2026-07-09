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
import { Filter, NativeFilterType } from '@superset-ui/core';
import { render, screen, userEvent, waitFor } from 'spec/helpers/testing-library';
import { Form as AntdForm, type FormInstance } from '@superset-ui/core/components';
import getControlItemsMap, { ControlItemsProps } from './getControlItemsMap';
import {
  getControlItems,
  setNativeFilterFieldValues,
  doesColumnMatchFilterType,
} from './utils';

jest.mock('./utils', () => ({
  getControlItems: jest.fn(),
  setNativeFilterFieldValues: jest.fn(),
  doesColumnMatchFilterType: jest.fn(),
}));

// Mock ColumnSelect to test filterValues logic
jest.mock('./ColumnSelect', () => ({
  ColumnSelect: ({
    filterValues,
  }: {
    filterValues: (column: any) => boolean;
  }) => {
    const columns = [
      { name: 'col1', filterable: true },
      { name: 'col2', filterable: false },
      { name: 'col3', filterable: true },
    ];
    return (
      <>
        {columns.filter(filterValues).map(column => (
          <div key={column.name}>{column.name}</div>
        ))}
      </>
    );
  },
}));

const formMock: FormInstance = {
  focusField: () => {},
  getFieldWarning: () => [],
  setFieldValue: () => {},
  scrollToField: () => {},
  getFieldInstance: () => {},
  getFieldValue: () => {},
  getFieldsValue: () => {},
  getFieldError: () => [],
  getFieldsError: () => [],
  isFieldsTouched: () => false,
  isFieldTouched: () => false,
  isFieldValidating: () => false,
  isFieldsValidating: () => false,
  resetFields: () => {},
  setFields: () => {},
  setFieldsValue: () => {},
  validateFields: () => Promise.resolve(),
  submit: () => {},
};

const filterMock: Filter = {
  cascadeParentIds: [],
  defaultDataMask: {},
  id: 'mock',
  name: 'mock',
  scope: {
    rootPath: [],
    excluded: [],
  },
  filterType: '',
  targets: [{}],
  controlValues: {},
  type: NativeFilterType.NativeFilter,
  description: '',
};

const createProps = (): ControlItemsProps => ({
  expanded: false,
  datasetId: 1,
  disabled: false,
  forceUpdate: jest.fn(),
  form: formMock,
  filterId: 'filterId',
  filterToEdit: filterMock,
  filterType: 'filterType',
  formChanged: jest.fn(),
});

const createControlItems = () => [
  null,
  false,
  {},
  { name: 'name_1', config: { renderTrigger: true, resetConfig: true } },
  { name: 'groupby', config: { multiple: true, required: false } },
];

beforeEach(() => {
  jest.clearAllMocks();
});

function renderControlItems(
  controlItemsMap: ReturnType<typeof getControlItemsMap>,
) {
  return render(
    <>
      {Object.values(controlItemsMap.controlItems).map(value => value.element)}
    </>,
  );
}

test('Should render null when has no "formFilter"', () => {
  const props = createProps();
  const controlItemsMap = getControlItemsMap(props);
  const { container } = renderControlItems(controlItemsMap);
  expect(container.children).toHaveLength(0);
});

test('Should render null when has no "formFilter.filterType" is falsy value', () => {
  const props = createProps();
  const controlItemsMap = getControlItemsMap({
    ...props,
    filterType: 'filterType',
  });
  const { container } = renderControlItems(controlItemsMap);
  expect(container.children).toHaveLength(0);
});

test('Should render null empty when "getControlItems" return []', () => {
  const props = createProps();
  (getControlItems as jest.Mock).mockReturnValue([]);
  const controlItemsMap = getControlItemsMap(props);
  const { container } = renderControlItems(controlItemsMap);
  expect(container.children).toHaveLength(0);
});

test('Should render null empty when "getControlItems" return enableSingleValue', () => {
  const props = createProps();
  (getControlItems as jest.Mock).mockReturnValue([
    { name: 'enableSingleValue', config: { renderTrigger: true } },
  ]);
  const controlItemsMap = getControlItemsMap(props);
  const { container } = renderControlItems(controlItemsMap);
  expect(container.children).toHaveLength(0);
});

test('Should render null empty when "controlItems" are falsy', () => {
  const props = createProps();
  const controlItems = [null, false, {}, { config: { renderTrigger: false } }];
  (getControlItems as jest.Mock).mockReturnValue(controlItems);
  const controlItemsMap = getControlItemsMap(props);
  const { container } = renderControlItems(controlItemsMap);
  expect(container.children).toHaveLength(0);
});

test('Should render ControlItems', () => {
  const props = createProps();

  const controlItems = [
    ...createControlItems(),
    { name: 'name_2', config: { renderTrigger: true } },
  ];
  (getControlItems as jest.Mock).mockReturnValue(controlItems);
  const controlItemsMap = getControlItemsMap(props);
  renderControlItems(controlItemsMap);
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
});

test('Clicking on checkbox', () => {
  const props = createProps();
  (getControlItems as jest.Mock).mockReturnValue(createControlItems());
  const controlItemsMap = getControlItemsMap(props);
  renderControlItems(controlItemsMap);
  expect(props.forceUpdate).not.toHaveBeenCalled();
  expect(setNativeFilterFieldValues).not.toHaveBeenCalled();
  userEvent.click(screen.getByRole('checkbox'));
  expect(setNativeFilterFieldValues).toHaveBeenCalled();
  expect(props.forceUpdate).toHaveBeenCalled();
});

test('Clicking on checkbox when resetConfig:false', () => {
  const props = createProps();
  (getControlItems as jest.Mock).mockReturnValue([
    { name: 'name_1', config: { renderTrigger: true, resetConfig: false } },
  ]);
  const controlItemsMap = getControlItemsMap(props);
  renderControlItems(controlItemsMap);
  expect(props.forceUpdate).not.toHaveBeenCalled();
  expect(setNativeFilterFieldValues).not.toHaveBeenCalled();
  userEvent.click(screen.getByRole('checkbox'));
  expect(props.forceUpdate).toHaveBeenCalled();
  expect(setNativeFilterFieldValues).not.toHaveBeenCalled();
});

test('disabledIfControlChecked disables the checkbox when the other control is checked', () => {
  (getControlItems as jest.Mock).mockReturnValue([
    {
      name: 'multiSelect',
      config: {
        renderTrigger: true,
        disabledIfControlChecked: 'booleanCheckboxMode',
      },
    },
  ]);
  const props = {
    ...createProps(),
    formFilter: { controlValues: { booleanCheckboxMode: true } },
  };
  // @ts-expect-error: bypass incomplete formFilter type for test
  const controlItemsMap = getControlItemsMap(props);
  renderControlItems(controlItemsMap);
  expect(screen.getByRole('checkbox')).toBeDisabled();
});

test('disabledIfControlChecked leaves the checkbox enabled when the other control is unchecked', () => {
  (getControlItems as jest.Mock).mockReturnValue([
    {
      name: 'multiSelect',
      config: {
        renderTrigger: true,
        disabledIfControlChecked: 'booleanCheckboxMode',
      },
    },
  ]);
  const props = {
    ...createProps(),
    formFilter: { controlValues: { booleanCheckboxMode: false } },
  };
  // @ts-expect-error: bypass incomplete formFilter type for test
  const controlItemsMap = getControlItemsMap(props);
  renderControlItems(controlItemsMap);
  expect(screen.getByRole('checkbox')).not.toBeDisabled();
});

test('disabledIfControlUnchecked disables the checkbox until the other control is checked', () => {
  (getControlItems as jest.Mock).mockReturnValue([
    {
      name: 'booleanCheckboxInvert',
      config: {
        renderTrigger: true,
        disabledIfControlUnchecked: 'booleanCheckboxMode',
      },
    },
  ]);
  const props = {
    ...createProps(),
    formFilter: { controlValues: { booleanCheckboxMode: false } },
  };
  // @ts-expect-error: bypass incomplete formFilter type for test
  const controlItemsMap = getControlItemsMap(props);
  renderControlItems(controlItemsMap);
  expect(screen.getByRole('checkbox')).toBeDisabled();
});

test('checking a control with forcesOffControl turns the other control off', () => {
  (getControlItems as jest.Mock).mockReturnValue([
    {
      name: 'booleanCheckboxMode',
      config: {
        renderTrigger: true,
        forcesOffControl: 'multiSelect',
      },
    },
  ]);
  const props = {
    ...createProps(),
    formFilter: { controlValues: { multiSelect: true } },
  };
  // @ts-expect-error: bypass incomplete formFilter type for test
  const controlItemsMap = getControlItemsMap(props);
  renderControlItems(controlItemsMap);
  userEvent.click(screen.getByRole('checkbox'));
  expect(setNativeFilterFieldValues).toHaveBeenCalledWith(
    props.form,
    props.filterId,
    { controlValues: { multiSelect: false } },
  );
});

test('regression: forcesOffControl does not clobber the checkbox\'s own value, and unchecking it works', async () => {
  // Uses a real antd Form (unlike the tests above, which use a fully
  // stubbed FormInstance) and the real setNativeFilterFieldValues, because
  // this exact combination previously broke silently under the stub: the
  // stub's getFieldValue always returns undefined, so a bug where
  // forcesOffControl's payload was built from a stale `formFilter` React
  // prop (captured before the click, instead of the live form value) went
  // undetected by "toHaveBeenCalledWith" assertions above. That bug made
  // checking/unchecking the controlling checkbox itself silently revert.
  (getControlItems as jest.Mock).mockReturnValue([
    {
      name: 'multiSelect',
      config: {
        renderTrigger: true,
        label: 'Can select multiple values',
        disabledIfControlChecked: 'booleanCheckboxMode',
      },
    },
    {
      name: 'booleanCheckboxMode',
      config: {
        renderTrigger: true,
        label: 'Show as a checkbox for boolean columns',
        forcesOffControl: 'multiSelect',
      },
    },
  ]);
  (setNativeFilterFieldValues as jest.Mock).mockImplementation(
    jest.requireActual('./utils').setNativeFilterFieldValues,
  );

  function Harness() {
    const [form] = AntdForm.useForm();
    const [, setTick] = useState(0);
    const formFilter = form.getFieldValue('filters')?.filterId;
    const map = getControlItemsMap({
      ...createProps(),
      form,
      forceUpdate: () => setTick(t => t + 1),
      // @ts-expect-error: partial formFilter type for test
      formFilter,
    });
    return (
      <AntdForm form={form}>
        {Object.values(map.controlItems).map(v => v.element)}
      </AntdForm>
    );
  }

  render(<Harness />);
  const booleanCheckbox = screen.getByRole('checkbox', {
    name: /Show as a checkbox/,
  });
  const multiSelectCheckbox = screen.getByRole('checkbox', {
    name: /Can select multiple values/,
  });

  expect(booleanCheckbox).not.toBeChecked();

  userEvent.click(booleanCheckbox);
  await waitFor(() => expect(booleanCheckbox).toBeChecked());
  await waitFor(() => expect(multiSelectCheckbox).toBeDisabled());

  userEvent.click(booleanCheckbox);
  await waitFor(() => expect(booleanCheckbox).not.toBeChecked());
  await waitFor(() => expect(multiSelectCheckbox).not.toBeDisabled());

  (setNativeFilterFieldValues as jest.Mock).mockReset();
});

test('unchecking booleanCheckboxMode also forces booleanCheckboxInvert off', async () => {
  (getControlItems as jest.Mock).mockReturnValue([
    {
      name: 'booleanCheckboxMode',
      config: {
        renderTrigger: true,
        label: 'Show as a checkbox for boolean columns',
        forcesOffControlOnUncheck: 'booleanCheckboxInvert',
      },
    },
    {
      name: 'booleanCheckboxInvert',
      config: {
        renderTrigger: true,
        label: 'Checkbox filters to "False" instead of "True"',
        disabledIfControlUnchecked: 'booleanCheckboxMode',
      },
    },
  ]);
  (setNativeFilterFieldValues as jest.Mock).mockImplementation(
    jest.requireActual('./utils').setNativeFilterFieldValues,
  );

  function Harness() {
    const [form] = AntdForm.useForm();
    const [, setTick] = useState(0);
    const formFilter = form.getFieldValue('filters')?.filterId;
    const map = getControlItemsMap({
      ...createProps(),
      form,
      forceUpdate: () => setTick(t => t + 1),
      // @ts-expect-error: partial formFilter type for test
      formFilter,
    });
    return (
      <AntdForm form={form}>
        {Object.values(map.controlItems).map(v => v.element)}
      </AntdForm>
    );
  }

  render(<Harness />);
  const booleanCheckbox = screen.getByRole('checkbox', {
    name: /Show as a checkbox/,
  });
  const invertCheckbox = screen.getByRole('checkbox', {
    name: /Checkbox filters to/,
  });

  // Turn on booleanCheckboxMode so the invert checkbox becomes enabled,
  // then check it.
  userEvent.click(booleanCheckbox);
  await waitFor(() => expect(invertCheckbox).not.toBeDisabled());
  userEvent.click(invertCheckbox);
  await waitFor(() => expect(invertCheckbox).toBeChecked());

  // Turning booleanCheckboxMode back off should force the invert checkbox
  // off too, not just disable/hide it while leaving it checked underneath.
  userEvent.click(booleanCheckbox);
  await waitFor(() => expect(booleanCheckbox).not.toBeChecked());
  await waitFor(() => expect(invertCheckbox).not.toBeChecked());

  (setNativeFilterFieldValues as jest.Mock).mockReset();
});

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ColumnSelect filterValues behavior', () => {
  beforeEach(() => {
    (getControlItems as jest.Mock).mockReturnValue([
      {
        name: 'groupby',
        config: { label: 'Column', multiple: false, required: false },
      },
    ]);
  });

  test('only renders filterable columns when doesColumnMatchFilterType returns true', () => {
    (doesColumnMatchFilterType as jest.Mock).mockReturnValue(true);
    const props = {
      ...createProps(),
      formFilter: { filterType: 'filterType' },
    };
    // @ts-expect-error: bypass incomplete formFilter type for test
    const element = getControlItemsMap(props).mainControlItems.groupby
      .element as React.ReactElement;
    render(element);
    expect(screen.getByText('col1')).toBeInTheDocument();
    expect(screen.getByText('col3')).toBeInTheDocument();
    expect(screen.queryByText('col2')).not.toBeInTheDocument();
  });

  test('renders no columns when doesColumnMatchFilterType returns false', () => {
    (doesColumnMatchFilterType as jest.Mock).mockReturnValue(false);
    const props = {
      ...createProps(),
      formFilter: { filterType: 'filterType' },
    };
    // @ts-expect-error: bypass incomplete formFilter type for test
    const element = getControlItemsMap(props).mainControlItems.groupby
      .element as React.ReactElement;
    render(element);
    expect(screen.queryByText('col1')).not.toBeInTheDocument();
    expect(screen.queryByText('col3')).not.toBeInTheDocument();
    expect(screen.queryByText('col2')).not.toBeInTheDocument();
  });
});
