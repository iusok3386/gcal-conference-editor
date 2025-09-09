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
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-conference-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './conference-edit-dialog.component.html',
})
export class ConferenceEditDialogComponent {
  form = new FormGroup({
    conferenceId: new FormControl(''),
    name: new FormControl('', Validators.required),
    iconUri: new FormControl(''),
    entryPointUri: new FormControl('', Validators.required),
    entryPointLabel: new FormControl(''),
  });

  dialogRef = inject(MatDialogRef<ConferenceEditDialogComponent>);
  data: { event: GoogleAppsScript.Calendar.Schema.Event } = inject(MAT_DIALOG_DATA);

  constructor() {
    if (this.data.event.conferenceData) {
      this.form.patchValue({
        conferenceId: this.data.event.conferenceData.conferenceId,
        name: this.data.event.conferenceData.conferenceSolution?.name,
        iconUri: this.data.event.conferenceData.conferenceSolution?.iconUri,
        entryPointUri: this.data.event.conferenceData.entryPoints?.[0]?.uri,
        entryPointLabel: this.data.event.conferenceData.entryPoints?.[0]?.label,
      });
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const conferenceData: GoogleAppsScript.Calendar.Schema.ConferenceData = {
        createRequest: {
          requestId: `${Date.now()}`,
          conferenceSolutionKey: {
            type: 'addOn',
          },
        },
        conferenceId: this.form.value.conferenceId ?? undefined,
        conferenceSolution: {
          name: this.form.value.name ?? '',
          iconUri: this.form.value.iconUri ?? undefined,
          key: { type: 'addOn' },
        },
        entryPoints: [
          {
            entryPointType: 'video',
            uri: this.form.value.entryPointUri ?? undefined,
            label: this.form.value.entryPointLabel ?? undefined,
          },
        ],
      };
      this.dialogRef.close(conferenceData);
    }
  }

  onDelete(): void {
    this.dialogRef.close(null);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
