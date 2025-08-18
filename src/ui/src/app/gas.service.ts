import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

// These types are copied from src/index.ts. We should find a way to share them.
export type AppResponse = {
  success: boolean;
  message: string;
};

export type CalendarInfo = {
  id: string;
  summary: string;
};

export type EventInfo = {
  id:string;
  summary: string;
};

// This is a simplified version of the ConferenceData type.
// We can't import the GoogleAppsScript types here directly.
export type ConferenceData = any;


@Injectable({
  providedIn: 'root'
})
export class GasService {

  private runGoogleScript(functionName: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName](...args);
    });
  }

  getCalendars(): Observable<CalendarInfo[]> {
    return from(this.runGoogleScript('getCalendars'));
  }

  getEvents(calendarId: string): Observable<EventInfo[]> {
    return from(this.runGoogleScript('getEvents', calendarId));
  }

  getConferenceData(calendarId: string, eventId: string): Observable<ConferenceData> {
    return from(this.runGoogleScript('getConferenceData', calendarId, eventId));
  }

  updateConferenceData(calendarId: string, eventId: string, conferenceData: ConferenceData | null): Observable<AppResponse> {
    return from(this.runGoogleScript('updateConferenceData', calendarId, eventId, conferenceData));
  }
}
