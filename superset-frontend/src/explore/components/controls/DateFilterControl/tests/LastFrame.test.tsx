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
import { render, screen, userEvent, fireEvent } from 'spec/helpers/testing-library';
import { LastFrame } from '../components';

const TODAY = '2024-06-03';
jest.useFakeTimers();
jest.setSystemTime(new Date(TODAY).getTime());

const emptyValue = '';
const legacyPresetValue = 'Last week';

test('renders the Last N unit control', () => {
  render(<LastFrame onChange={jest.fn()} value={emptyValue} />);
  expect(screen.getByText('Select a rolling window')).toBeInTheDocument();
  expect(screen.getByText('Hours')).toBeInTheDocument();
  expect(screen.getByDisplayValue('1')).toBeInTheDocument();
});

test('picks up a legacy literal "Last week" value', () => {
  render(<LastFrame onChange={jest.fn()} value={legacyPresetValue} />);
  expect(screen.getByText('Weeks')).toBeInTheDocument();
  expect(screen.getByDisplayValue('1')).toBeInTheDocument();
});

test('picks up an existing "Last N <unit>" value', () => {
  render(<LastFrame onChange={jest.fn()} value="Last 12 minutes" />);
  expect(screen.getByDisplayValue('12')).toBeInTheDocument();
  expect(screen.getByText('Minutes')).toBeInTheDocument();
});

test('calls onChange with "Last N hours" when the amount input changes', () => {
  const onChange = jest.fn();
  render(<LastFrame onChange={onChange} value="Last 6 hours" />);
  const input = screen.getByDisplayValue('6');
  userEvent.clear(input);
  userEvent.type(input, '9');
  fireEvent.blur(input);
  expect(onChange).toHaveBeenCalledWith('Last 9 hours');
});

test('calls onChange with "Last 1 day" when the unit dropdown changes', () => {
  const onChange = jest.fn();
  render(<LastFrame onChange={onChange} value={emptyValue} />);

  const unitSelect = screen.getByRole('combobox', { name: 'Time unit' });
  userEvent.click(unitSelect);
  userEvent.click(screen.getByTitle('Days'));

  expect(onChange).toHaveBeenCalledWith('Last 1 day');
});

test('uses the singular unit form when the amount is 1', () => {
  const onChange = jest.fn();
  render(<LastFrame onChange={onChange} value="Last 6 hours" />);
  const input = screen.getByDisplayValue('6');
  userEvent.clear(input);
  userEvent.type(input, '1');
  fireEvent.blur(input);
  expect(onChange).toHaveBeenCalledWith('Last 1 hour');
});

test('all 7 time units are offered in the dropdown', () => {
  render(<LastFrame onChange={jest.fn()} value={emptyValue} />);
  const unitSelect = screen.getByRole('combobox', { name: 'Time unit' });
  userEvent.click(unitSelect);
  ['Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Quarters', 'Years'].forEach(
    label => {
      expect(screen.getAllByTitle(label).length).toBeGreaterThan(0);
    },
  );
});
