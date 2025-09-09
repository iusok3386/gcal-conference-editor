/// <reference types="google-apps-script" />
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, filter } from 'rxjs';

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
    MatTabsModule,
  ],
  templateUrl: './conference-edit-dialog.component.html',
})
export class ConferenceEditDialogComponent implements OnInit {
  form = new FormGroup({
    conferenceId: new FormControl(''),
    name: new FormControl('', Validators.required),
    iconUri: new FormControl(''),
    entryPointUri: new FormControl('', Validators.required),
    entryPointLabel: new FormControl(''),
    json: new FormControl(''),
  });

  dialogRef = inject(MatDialogRef<ConferenceEditDialogComponent>);
  data: { event: GoogleAppsScript.Calendar.Schema.Event } =
    inject(MAT_DIALOG_DATA);

  private isUpdating = false;

  constructor() {
    if (this.data.event.conferenceData) {
      const conf = this.data.event.conferenceData;
      this.form.patchValue({
        conferenceId: conf.conferenceId,
        name: conf.conferenceSolution?.name,
        iconUri: conf.conferenceSolution?.iconUri,
        entryPointUri: conf.entryPoints?.[0]?.uri,
        entryPointLabel: conf.entryPoints?.[0]?.label,
      });
    }
  }

  ngOnInit(): void {
    this.updateJsonFromForm();

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        filter(() => !this.isUpdating)
      )
      .subscribe(() => {
        this.updateJsonFromForm();
      });
  }

  updateJsonFromForm(): void {
    this.isUpdating = true;
    const conferenceData = this.buildConferenceDataFromForm();
    this.form.controls.json.setValue(
      JSON.stringify(conferenceData, null, 2)
    );
    this.isUpdating = false;
  }

  updateFormFromJson(): void {
    try {
      this.isUpdating = true;
      const jsonValue = this.form.controls.json.value;
      if (jsonValue) {
        const conferenceData: GoogleAppsScript.Calendar.Schema.ConferenceData =
          JSON.parse(jsonValue);
        this.form.patchValue({
          conferenceId: conferenceData.conferenceId,
          name: conferenceData.conferenceSolution?.name,
          iconUri: conferenceData.conferenceSolution?.iconUri,
          entryPointUri: conferenceData.entryPoints?.[0]?.uri,
          entryPointLabel: conferenceData.entryPoints?.[0]?.label,
        });
      }
      this.isUpdating = false;
    } catch (e) {
      // Invalid JSON, do nothing
      this.isUpdating = false;
    }
  }

  buildConferenceDataFromForm(): GoogleAppsScript.Calendar.Schema.ConferenceData {
    return {
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
  }

  onSave(): void {
    try {
      const jsonValue = this.form.controls.json.value;
      if (jsonValue) {
        const conferenceData: GoogleAppsScript.Calendar.Schema.ConferenceData =
          JSON.parse(jsonValue);
        this.dialogRef.close(conferenceData);
      }
    } catch (e) {
      // Should not happen if JSON is kept valid, but as a safeguard.
      console.error('Invalid JSON in text area', e);
      // Maybe show an error to the user in a real app
    }
  }

  onDelete(): void {
    this.dialogRef.close(null);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
