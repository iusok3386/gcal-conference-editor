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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './calendar-selector.component.html',
})
export class CalendarSelectorComponent {
  @Input() calendars: GoogleAppsScript.Calendar.Schema.CalendarListEntry[] = [];
  @Output() selectionChange = new EventEmitter<string>();

  onSelectionChange(calendarId: string): void {
    this.selectionChange.emit(calendarId);
  }
}
