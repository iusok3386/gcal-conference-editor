/**
 * Copyright 2025 ita.kosu55
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Copyright 2025 ita.kosu55
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export function getCalendars() {
  const calendars = Calendar.CalendarList?.list({
    minAccessRole: 'writer',
  });
  return calendars?.items;
}

export function getEvents(
  calendarId: string,
  startTime: string,
  endTime: string,
  query?: string
) {
  const options = {
    timeMin: startTime,
    timeMax: endTime,
    q: query,
    showDeleted: false,
    singleEvents: true,
    orderBy: 'startTime' as const,
  };
  const events = Calendar.Events?.list(calendarId, options);
  return events?.items;
}

export function updateConferenceData(
  calendarId: string,
  eventId: string,
  conferenceData: GoogleAppsScript.Calendar.Schema.ConferenceData
) {
  const event = Calendar.Events?.patch(
    { conferenceData },
    calendarId,
    eventId,
    {
      conferenceDataVersion: 1,
    }
  );
  return event;
}

export function deleteConferenceData(calendarId: string, eventId: string) {
  const event = Calendar.Events?.patch(
    { conferenceData: undefined },
    calendarId,
    eventId,
    {
      conferenceDataVersion: 1,
    }
  );
  return event;
}
