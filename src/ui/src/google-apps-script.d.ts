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

declare namespace google.script {
  interface Runner {
    withSuccessHandler<T>(callback: (result: T) => void): this;
    withFailureHandler(callback: (error: Error) => void): this;

    // Server-side functions
    getCalendars(): void;
    getEvents(calendarId: string, startTime: string, endTime: string, query?: string): void;
    updateConferenceData(
      calendarId: string,
      eventId: string,
      conferenceData: GoogleAppsScript.Calendar.Schema.ConferenceData,
    ): void;
    deleteConferenceData(calendarId: string, eventId: string): void;
    [key: string]: (...args: any[]) => void;
  }

  export const run: Runner;
}
