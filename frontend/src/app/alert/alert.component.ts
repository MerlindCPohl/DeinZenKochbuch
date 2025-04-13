import { Component } from '@angular/core';
import { AlertService } from '../services/alertservice';
import {AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [
    AsyncPipe,
    CommonModule
  ],
  template: `
    <div *ngIf="(alertService.alertText$ | async) as message"
         class="alert alert-warning text-center alert-position"
         role="alert">
      {{ message }}
    </div>
  `
})
export class AlertComponent {
  constructor(public alertService: AlertService) {}
}
