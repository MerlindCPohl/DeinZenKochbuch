import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { User } from '../shared/user';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../shared/auth/auth.service';
import { CommonModule } from '@angular/common';
import { passwortMatchValidator } from '../shared/validators/passwort-match/passwort-match.validator';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { AlertService } from '../services/alertservice';
import {AlertComponent} from '../alert/alert.component';


export interface DialogData {
  headline: string;
  info: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true,
  providers: [AuthService],
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule,
    AlertComponent,
  ],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup(
    {
      name: new FormControl('', Validators.required),
      passwort: new FormControl('', [Validators.required, Validators.minLength(8)]),
      passwort2: new FormControl('', [Validators.required, Validators.minLength(8)])
    },
    {validators: passwortMatchValidator} // Benutzerdefinierter Validator wird hier hinzugefügt
  );
  hide = true;
  hide2 = true;
  user!: User;
  zeigeAbbrechenDialog = false;



  registerMessage: string = '';

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private alertService: AlertService
  ) {
  }

    ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    }

  onSubmit(): void {
    const values = this.registerForm.value;
    const name = values.name!;
    const passwort1 = values.passwort!;
    const passwort2 = values.passwort2!;


    if (passwort1 !== passwort2) {
      this.alertService.zeigeAlert('Die Passwörter stimmen nicht überein.', 2000);
      return;
    } else if(name.length < 5) {
      this.alertService.zeigeAlert('Dein Username muss mindestens 5 Zeichen lang sein.', 2000);
      return;
    } else if (!name || !passwort1) {
      this.alertService.zeigeAlert('Bitte fülle alle Pflichtfelder aus.', 2000);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwort1)) {
      this.alertService.zeigeAlert('Dein Passwort entspricht nicht den Anforderungen.', 2000);
      return;
    }

    if (this.registerForm.valid) {
      this.authService.registerUser({name, passwort: passwort1}).subscribe({
        next: () => {
          this.alertService.zeigeAlert('Registrierung erfolgreich! 🍉 ', 2000);
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (error) => {
          console.error('Fehlermeldung vom Server:', error);
          let errorMessage = 'Ein Fehler ist aufgetreten.';

          if (error.status === 0) {
            errorMessage = 'Keine Verbindung zum Server.';
          } else if (error.status === 400) {
            console.log('Server Error Response:', error.error);
            if (error.error?.message === 'Der Username ist bereits vergeben') {
              errorMessage = 'Der Username ist bereits vergeben. \nBitte wähle einen anderen Namen oder melde dich an.';
            } else {
              errorMessage = error.error?.message || 'Fehler bei der Registrierung.';
            }
          }
          this.alertService.zeigeAlert(errorMessage, 2000);
        }
      });
    }
  }

  //registrieren abbrechen dialog
  abbrechenUndZurueck() {
    this.router.navigate(['/login']);
  }

}


