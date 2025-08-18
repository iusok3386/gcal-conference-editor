import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GasService } from './gas.service';

// Define the types we expect from the GAS backend
type CalendarInfo = {
  id: string;
  summary: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'gcal-conference-editor';
  calendars: CalendarInfo[] = [];
  status = 'Loading calendars...';

  constructor(private gasService: GasService) {}

  ngOnInit() {
    this.gasService.run<CalendarInfo[]>('getCalendars')
      .then(calendars => {
        if (calendars && calendars.length > 0) {
          this.calendars = calendars;
          this.status = 'Calendars loaded.';
        } else {
          this.status = 'No calendars found.';
        }
      })
      .catch(err => {
        console.error(err);
        this.status = `Error loading calendars: ${err.message}`;
      });
  }
}
