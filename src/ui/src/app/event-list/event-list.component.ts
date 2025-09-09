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
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, MatIconModule],
  templateUrl: './event-list.component.html',
})
export class EventListComponent {
  @Input() events: GoogleAppsScript.Calendar.Schema.Event[] = [];
  @Output() edit = new EventEmitter<GoogleAppsScript.Calendar.Schema.Event>();

  onEdit(event: GoogleAppsScript.Calendar.Schema.Event): void {
    this.edit.emit(event);
  }
}
