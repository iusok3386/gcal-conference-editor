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
/// <reference types="google-apps-script" />
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GasService {
  constructor() {}

  private run<T>(functionName: string, ...args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName](...args);
    });
  }

  getCalendars(): Promise<GoogleAppsScript.Calendar.Schema.CalendarListEntry[]> {
    return this.run('getCalendars');
  }

  getEvents(
    calendarId: string,
    startTime: string,
    endTime: string,
    query?: string,
  ): Promise<GoogleAppsScript.Calendar.Schema.Event[]> {
    return this.run('getEvents', calendarId, startTime, endTime, query);
  }

  updateConferenceData(
    calendarId: string,
    eventId: string,
    conferenceData: GoogleAppsScript.Calendar.Schema.ConferenceData,
  ): Promise<GoogleAppsScript.Calendar.Schema.Event> {
    return this.run('updateConferenceData', calendarId, eventId, conferenceData);
  }

  deleteConferenceData(
    calendarId: string,
    eventId: string,
  ): Promise<GoogleAppsScript.Calendar.Schema.Event> {
    return this.run('deleteConferenceData', calendarId, eventId);
  }
}
