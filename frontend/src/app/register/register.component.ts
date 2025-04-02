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
import { passwortMatchValidator } from '../shared/validators/passwort-match/passwort-match.validator'; // Import des Validators
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { ConfirmComponent } from '../shared/components/confirm/confirm.component';
import {RouterLink} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


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
    RouterLink,
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

  registerMessage: string = '';

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
  }

    ngOnInit(): void {
    // Scrollen beim Initialisieren der Seite deaktivieren
    document.body.style.overflow = 'hidden';
    }

  onSubmit(): void {
    const values = this.registerForm.value;
    const name = values.name!;
    const passwort1 = values.passwort!;
    const passwort2 = values.passwort2!;

    if (passwort1 !== passwort2) {
      this.showSnackbar('Die Passwörter stimmen nicht überein.', 'error');
      return;
    }

    else if(name.length < 5) {
      this.showSnackbar('Der Username muss mindestens 5 Zeichen lang sein.', 'error');
      return;
    }

    else if (!name || !passwort1) {
      this.showSnackbar('Bitte fülle alle Pflichtfelder aus.', 'error');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwort1)) {
      this.showSnackbar(
        'Das Passwort entspricht nicht den Anforderungen.',
        'error'
      );
      return;
    }

    if (this.registerForm.valid) {
      this.authService.registerUser({name, passwort: passwort1}).subscribe({
        next: () => {
          this.showSnackbar('Registrierung erfolgreich!', 'success');
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (error) => {
          console.error('Fehlermeldung vom Server:', error);
          let errorMessage = 'Ein Fehler ist aufgetreten.';

          if (error.status === 0) {
            errorMessage = 'Keine Verbindung zum Server.';

          } else if (error.status === 400) {
            console.log('Server Error Response:', error.error);
            if (error.error?.message === 'Benutzername bereits vergeben') {
              errorMessage = 'Der Benutzername ist bereits vergeben. \nBitte wähle einen anderen Namen oder melde dich an.';
            } else {
              errorMessage = error.error?.message || 'Fehler bei der Registrierung.';
            }
          }
          this.showSnackbar(errorMessage, 'error');
        }
      });
    }
  }

  //code für snackbar (also pop-up)
  private showSnackbar(message: string, type: 'success' | 'error'): void {
    const config = {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'center',
      verticalPosition: 'top',
      overlayPanelClass: ['red-snackbar']

    };
    // @ts-ignore
    this.snackBar.open(message, '', config);
  }

  //registrieren abbrechen dialog
  onCancelRegistration(): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Registrierung abbrechen',
        message: 'Möchtest du die Registrierung wirklich abbrechen? Alle Eingaben gehen dann verloren.',
        confirmText: 'Ja, abbrechen',
        cancelText: 'Nein, fortfahren',
      },
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-backdrop',
    });
    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector('.custom-dialog-container');
      if (dialogContainer) {
        dialogContainer.setAttribute('style', `
        background-color:#722a35;
        color: #f7ede8;
      `);
      }

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/login']);
        }
      });
    });
  }


}
