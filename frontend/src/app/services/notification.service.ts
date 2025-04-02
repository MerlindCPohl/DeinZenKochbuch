import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root' // Wichtig für Dependency Injection
})

export class NotificationService {

  constructor(private snackBar: MatSnackBar) {}

  showMessage(message: string): void {
    this.snackBar.open(message, 'Schließen', {
      duration: 3000
    });
  }
}
