import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../shared/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {AlertComponent} from '../alert/alert.component';
import { AlertService } from '../services/alertservice';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    MatSnackBarModule,
    AlertComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    name: new FormControl('', Validators.required),
    passwort: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  constructor(
    private alertService: AlertService
  ) {}

  hide = true;

  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  togglePasswordVisibility(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  onSubmit(): void {
    const values = this.loginForm.value;
    const name = values.name!;
    const passwort = values.passwort!;
    const user = { name, passwort };

    if (this.loginForm.valid) {
      this.auth.loginUser(user).subscribe({
        next: (response) => {
          if (response.message?.toLowerCase() === 'login erfolgreich') {
            if (response.userId) {
              localStorage.setItem('userId', response.userId);
            }
            this.alertService.zeigeAlert('Login erfolgreich', 1000);
            setTimeout(() => this.router.navigate(['/home']), 1000);
          } else {
            this.alertService.zeigeAlert('Login fehlgeschlagen, bitte versuche es noch einmal.', 2000);
          }
        },
        error: () => {
          this.alertService.zeigeAlert('Login fehlgeschlagen, bitte versuche es noch einmal.', 2000);
        },
      });
    } else {
      this.alertService.zeigeAlert('Bitte fülle alle Felder korrekt aus.', 2000);
    }
  }

  zeigeLoginStatus(nachricht: string, erfolg: boolean = true) {
    this.alertService.zeigeAlert(nachricht, erfolg ? 1500 : 1500);
  }


}
