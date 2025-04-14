import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../services/alertservice';
import {AlertComponent} from '../alert/alert.component';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  zeigePasswortModal: boolean = false;
  neuesPasswort: string = '';
  neuesPasswort2: string = '';

  constructor(private http: HttpClient, private alertService: AlertService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.http.get<any>(`/api/users/${userId}`).subscribe({
      next: (data) => {
        this.username = data.name;
        this.password = data.passwort;
      },
      error: () => {
        this.alertService.zeigeAlert('Fehler beim Laden deiner Daten', 2000);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  passwortSpeichern(): void {
    if (this.neuesPasswort !== this.neuesPasswort2) {
      this.alertService.zeigeAlert('Die Passwörter stimmen nicht überein.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.http.put(`/api/users/${userId}/passwort`, { passwort: this.neuesPasswort })
      .subscribe({
        next: () => {
          this.alertService.zeigeAlert('Passwort erfolgreich gespeichert! 🌶️ ' );
          this.zeigePasswortModal = false;
          this.neuesPasswort = '';
          this.neuesPasswort2 = '';
        },
        error: () => {
          this.alertService.zeigeAlert('Fehler beim Speichern des Passworts');
        }
      });
  }

  abbrechen(): void {
    this.zeigePasswortModal = false;
  }

}
