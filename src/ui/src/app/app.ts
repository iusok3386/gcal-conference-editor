import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { GasService, CalendarInfo, EventInfo, ConferenceData, AppResponse } from './gas.service';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  calendars: CalendarInfo[] = [];
  events: EventInfo[] = [];
  selectedCalendarId: string = '';
  selectedEventId: string = '';

  conferenceForm: FormGroup;
  jsonEditorValue: string = '';
  @ViewChild('jsonEditor') jsonEditor!: ElementRef<HTMLTextAreaElement>;


  isLoadingCalendars = true;
  isLoadingEvents = false;
  isLoadingConferenceData = false;
  isSubmitting = false;

  editorVisible = false;
  selectedTabIndex = 0;

  constructor(
    private gasService: GasService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.conferenceForm = this.fb.group({
      conferenceSolution: this.fb.group({
        key: this.fb.group({
          type: ['addOn'],
        }),
        name: [''],
        iconUri: [''],
      }),
      conferenceId: [''],
      notes: [''],
      entryPoints: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.gasService.getCalendars().subscribe(calendars => {
      this.calendars = calendars;
      this.isLoadingCalendars = false;
      this.cdr.detectChanges();
    });
  }

  onCalendarChange() {
    if (!this.selectedCalendarId) {
      return;
    }
    this.isLoadingEvents = true;
    this.editorVisible = false;
    this.events = [];
    this.selectedEventId = '';
    this.gasService.getEvents(this.selectedCalendarId).subscribe(events => {
      this.events = events;
      this.isLoadingEvents = false;
      this.cdr.detectChanges();
    });
  }

  onEventChange() {
    if (!this.selectedEventId || !this.selectedCalendarId) {
      return;
    }
    this.isLoadingConferenceData = true;
    this.editorVisible = false;
    this.gasService.getConferenceData(this.selectedCalendarId, this.selectedEventId).subscribe(data => {
      this.populateForm(data);
      this.isLoadingConferenceData = false;
      this.editorVisible = true;
      this.cdr.detectChanges();
    });
  }

  populateForm(data: ConferenceData | null) {
    if (data) {
      this.conferenceForm.reset();
      this.conferenceForm.patchValue({
        conferenceSolution: {
          key: {
            type: data.conferenceSolution?.key?.type || 'addOn',
          },
          name: data.conferenceSolution?.name || '',
          iconUri: data.conferenceSolution?.iconUri || '',
        },
        conferenceId: data.conferenceId || '',
        notes: data.notes || '',
      });

      const entryPoints = this.conferenceForm.get('entryPoints') as FormArray;
      entryPoints.clear();
      if (data.entryPoints && data.entryPoints.length > 0) {
        data.entryPoints.forEach((ep: any) => entryPoints.push(this.createEntryPoint(ep)));
      } else {
        entryPoints.push(this.createEntryPoint());
      }
    } else {
      this.conferenceForm.reset({
        conferenceSolution: { key: { type: 'addOn' } }
      });
      const entryPoints = this.conferenceForm.get('entryPoints') as FormArray;
      entryPoints.clear();
      entryPoints.push(this.createEntryPoint());
    }
  }

  createEntryPoint(data: any = {}): FormGroup {
    return this.fb.group({
      entryPointType: [data.entryPointType || 'video'],
      label: [data.label || ''],
      uri: [data.uri || '', Validators.required],
    });
  }

  get entryPoints() {
    return this.conferenceForm.get('entryPoints') as FormArray;
  }

  addEntryPoint() {
    this.entryPoints.push(this.createEntryPoint());
  }

  removeEntryPoint(index: number) {
    this.entryPoints.removeAt(index);
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index;
    if (this.selectedTabIndex === 1) { // Switched to JSON editor
      this.jsonEditorValue = JSON.stringify(this.conferenceForm.getRawValue(), null, 2);
    } else { // Switched to Form
      try {
        if (this.jsonEditorValue) {
          const data = JSON.parse(this.jsonEditorValue);
          this.populateForm(data);
        }
      } catch (e) {
        this.snackBar.open('JSONの形式が正しくありません。フォームに反映できませんでした。', '閉じる', { duration: 3000 });
      }
    }
  }

  onSubmit() {
    if (!this.selectedCalendarId || !this.selectedEventId) return;

    let conferenceData: ConferenceData | null;
    if (this.selectedTabIndex === 0) { // Form is active
        if (this.conferenceForm.invalid) {
            this.snackBar.open('フォームにエラーがあります。', '閉じる', { duration: 3000 });
            return;
        }
        conferenceData = this.conferenceForm.getRawValue();
    } else { // JSON editor is active
        try {
            conferenceData = JSON.parse(this.jsonEditorValue);
        } catch (e) {
            this.snackBar.open('JSONの形式が正しくありません。', '閉じる', { duration: 3000 });
            return;
        }
    }

    this.isSubmitting = true;
    this.gasService.updateConferenceData(this.selectedCalendarId, this.selectedEventId, conferenceData)
      .subscribe(response => {
        this.isSubmitting = false;
        this.snackBar.open(response.message, '閉じる', { duration: 3000 });
      }, () => {
        this.isSubmitting = false;
        this.snackBar.open('更新中にエラーが発生しました。', '閉じる', { duration: 3000 });
      });
  }

  onDelete() {
    if (!this.selectedCalendarId || !this.selectedEventId) return;

    if (confirm('本当にこのイベントの会議情報をすべて削除しますか？')) {
      this.isSubmitting = true;
      this.gasService.updateConferenceData(this.selectedCalendarId, this.selectedEventId, null)
        .subscribe(response => {
          this.isSubmitting = false;
          this.snackBar.open(response.message, '閉じる', { duration: 3000 });
          if (response.success) {
            this.populateForm(null);
          }
        }, () => {
          this.isSubmitting = false;
          this.snackBar.open('削除中にエラーが発生しました。', '閉じる', { duration: 3000 });
        });
    }
  }
}
