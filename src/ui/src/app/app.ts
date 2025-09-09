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
import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, from, Observable, of, switchMap } from 'rxjs';

import { GasService } from './gas.service';
import { CalendarSelectorComponent } from './calendar-selector/calendar-selector.component';
import { EventFilter, EventFilterComponent } from './event-filter/event-filter.component';
import { EventListComponent } from './event-list/event-list.component';
import { ConferenceEditDialogComponent } from './conference-edit-dialog/conference-edit-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatDialogModule,
    CalendarSelectorComponent,
    EventFilterComponent,
    EventListComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent implements OnInit {
  calendars$: Observable<GoogleAppsScript.Calendar.Schema.CalendarListEntry[]> = of([]);
  events$: Observable<GoogleAppsScript.Calendar.Schema.Event[]> = of([]);

  selectedCalendarId: string | null = null;
  private eventSearchTrigger$ = new BehaviorSubject<{
    filter: EventFilter;
  } | null>(null);

  constructor(
    private readonly gas: GasService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.calendars$ = from(this.gas.getCalendars());
    this.events$ = this.eventSearchTrigger$.pipe(
      switchMap((trigger) => {
        if (!trigger || !this.selectedCalendarId) {
          return of([]);
        }
        return from(
          this.gas.getEvents(
            this.selectedCalendarId,
            trigger.filter.start.toISOString(),
            trigger.filter.end.toISOString(),
            trigger.filter.query,
          ),
        );
      }),
    );
  }

  onCalendarSelected(calendarId: string): void {
    this.selectedCalendarId = calendarId;
    this.eventSearchTrigger$.next(null); // Clear events
  }

  onSearch(filter: EventFilter): void {
    this.eventSearchTrigger$.next({ filter });
  }

  onEditEvent(event: GoogleAppsScript.Calendar.Schema.Event): void {
    const dialogRef = this.dialog.open(ConferenceEditDialogComponent, {
      data: { event },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === undefined || !this.selectedCalendarId || !event.id) {
        return; // Dialog was cancelled
      }

      if (result === null) {
        // Delete conference data
        await this.gas.deleteConferenceData(this.selectedCalendarId, event.id);
      } else {
        // Update conference data
        await this.gas.updateConferenceData(this.selectedCalendarId, event.id, result);
      }
      // Refresh the event list
      this.eventSearchTrigger$.next(this.eventSearchTrigger$.value);
    });
  }
}
