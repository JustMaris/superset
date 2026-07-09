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
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import {
  render,
  screen,
  userEvent,
  waitForElementToBeRemoved,
  waitFor,
} from 'spec/helpers/testing-library';
import { SimpleFrame } from '../components';

const TODAY = '2024-06-03';
jest.useFakeTimers();
jest.setSystemTime(new Date(TODAY).getTime());

const emptyValue = '';
const specificValue = '2021-03-16T00:00:00 : 2021-03-17T00:00:00';

const mockStore = configureStore([thunk]);
const store = mockStore({
  common: { locale: 'en' },
});

test('renders an empty calendar picker by default', async () => {
  render(<SimpleFrame onChange={jest.fn()} value={emptyValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  expect(screen.getByText('Pick an exact range')).toBeInTheDocument();
  expect(screen.getByText('Include time')).toBeInTheDocument();
});

test('renders an existing specific:specific range in the calendar picker', async () => {
  render(<SimpleFrame onChange={jest.fn()} value={specificValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  // stored range is inclusive-start/exclusive-end (16th to 17th), which is
  // a single inclusive day, so both calendar inputs show 2021-03-16
  expect(screen.getAllByDisplayValue('2021-03-16')).toHaveLength(2);
});

test('calls onChange with an inclusive-start/exclusive-end range when picking dates', async () => {
  const onChange = jest.fn();
  render(<SimpleFrame onChange={onChange} value={specificValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));

  const [startInput, endInput] = screen.getAllByPlaceholderText(/./);
  userEvent.click(startInput);
  userEvent.click(screen.getByTitle('2021-03-10'));
  userEvent.click(endInput);
  userEvent.click(screen.getByTitle('2021-03-12'));

  await waitFor(() => expect(onChange).toHaveBeenCalled());
  const lastCallValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
  expect(lastCallValue).toBe('2021-03-10T00:00:00 : 2021-03-13T00:00:00');
});

test('"Include time" checkbox toggles without losing an in-progress selection', async () => {
  render(<SimpleFrame onChange={jest.fn()} value={specificValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));

  const [startInput] = screen.getAllByPlaceholderText(/./);
  userEvent.click(startInput);
  userEvent.click(screen.getByTitle('2021-03-10'));

  const includeTimeCheckbox = screen.getByRole('checkbox', {
    name: 'Include time',
  });
  expect(includeTimeCheckbox).not.toBeChecked();
  userEvent.click(includeTimeCheckbox);
  expect(includeTimeCheckbox).toBeChecked();

  // the in-progress start selection should still be reflected, not reset
  expect(screen.getByDisplayValue(/2021-03-10/)).toBeInTheDocument();
});
