// src/app/services/alert.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
  alertText$ = new BehaviorSubject<string | null>(null);

  zeigeAlert(nachricht: string, dauer: number = 2000) {
    this.alertText$.next(nachricht);
    setTimeout(() => this.alertText$.next(null), dauer);
  }
}
