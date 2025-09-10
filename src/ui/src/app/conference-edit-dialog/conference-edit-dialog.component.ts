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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, debounceTime, filter, finalize, from } from 'rxjs';
import { GasService } from '../gas.service';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './conference-edit-dialog.component.html',
  styleUrls: ['./conference-edit-dialog.component.css'],
})
export class ConferenceEditDialogComponent implements OnInit {
  allowedIconDomains = [
    'fonts.gstatic.com',
    'lh3.googleusercontent.com',
    'lh4.googleusercontent.com',
    'lh5.googleusercontent.com',
    'lh6.googleusercontent.com',
  ];
  showIconDomainWarning$ = new BehaviorSubject<boolean>(false);
  isLoading = false;
  errorMessage: string | null = null;

  form: FormGroup;

  private readonly gas = inject(GasService);
  dialogRef = inject(MatDialogRef<ConferenceEditDialogComponent>);
  data: {
    event: GoogleAppsScript.Calendar.Schema.Event;
    calendarId: string;
  } = inject(MAT_DIALOG_DATA);

  private isUpdating = false;

  constructor() {
    this.form = new FormGroup({
      conferenceId: new FormControl(''),
      name: new FormControl('', Validators.required),
      iconUri: new FormControl('', [Validators.pattern(/^https?:\/\/.+/)]),
      entryPointUri: new FormControl('', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/),
      ]),
      entryPointLabel: new FormControl(''),
      json: new FormControl(''),
    });

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
    this.checkIconDomain(this.form.get('iconUri')?.value);

    this.form
      .get('iconUri')
      ?.valueChanges.subscribe((value) => this.checkIconDomain(value));

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        filter(() => !this.isUpdating)
      )
      .subscribe(() => {
        this.updateJsonFromForm();
      });
  }

  checkIconDomain(value: string | null | undefined): void {
    if (!value) {
      this.showIconDomainWarning$.next(false);
      return;
    }
    try {
      const url = new URL(value);
      const isAllowed = this.allowedIconDomains.includes(url.hostname);
      this.showIconDomainWarning$.next(!isAllowed);
    } catch (e) {
      this.showIconDomainWarning$.next(false);
    }
  }

  updateJsonFromForm(): void {
    this.isUpdating = true;
    const conferenceData = this.buildConferenceDataFromForm();
    this.form.get('json')?.setValue(JSON.stringify(conferenceData, null, 2));
    this.isUpdating = false;
  }

  updateFormFromJson(): void {
    try {
      this.isUpdating = true;
      const jsonValue = this.form.get('json')?.value;
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
      this.isUpdating = false;
    }
  }

  buildConferenceDataFromForm(): GoogleAppsScript.Calendar.Schema.ConferenceData {
    return {
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
    if (!this.form.valid) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const jsonValue = this.form.get('json')?.value;
      if (jsonValue && this.data.event.id) {
        const conferenceData: GoogleAppsScript.Calendar.Schema.ConferenceData =
          JSON.parse(jsonValue);
        from(
          this.gas.updateConferenceData(
            this.data.calendarId,
            this.data.event.id,
            conferenceData
          )
        )
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: () => this.dialogRef.close(true),
            error: (err: any) =>
              (this.errorMessage = `保存に失敗しました: ${err.message}`),
          });
      } else {
        this.isLoading = false;
      }
    } catch (e) {
      this.isLoading = false;
      this.errorMessage = `JSON の解析に失敗しました: ${
        e instanceof Error ? e.message : e
      }`;
    }
  }

  onDelete(): void {
    if (!this.data.event.id) return;
    this.isLoading = true;
    this.errorMessage = null;
    from(this.gas.deleteConferenceData(this.data.calendarId, this.data.event.id))
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: any) =>
          (this.errorMessage = `削除に失敗しました: ${err.message}`),
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
