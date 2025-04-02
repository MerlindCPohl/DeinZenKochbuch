import {Component, OnInit, inject} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../shared/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';


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
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',

})

export class LoginComponent implements OnInit{
  loginForm = new FormGroup({
    name: new FormControl('', Validators.required),
    passwort: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
  hide = true;
  loginMessage: string = '';

  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);


  togglePasswordVisibility(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.hide = !this.hide;

  }

  ngOnInit(): void {
    // Scrollen beim Initialisieren der Seite deaktivieren
    document.body.style.overflow = 'hidden';
  }

  onSubmit(): void {
    const values = this.loginForm.value;
    const name = values.name!;
    const passwort = values.passwort!;

    const user = { name, passwort };
    console.log('user', user);

    if (this.loginForm.valid) {
      this.auth.loginUser(user).subscribe({
        next: (response) => {
          console.log('success:', response.success);
          console.log('message:', response.message);

          if (response.message && response.message.toLowerCase() === 'login erfolgreich') {
            console.log('user logged in');
            this.showSnackbar('Login erfolgreich', "success");
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);

          } else {
            console.log('Login failed, unexpected response format.');
            this.showSnackbar('Login fehlgeschlagen, bitte versuche es noch einmal.', "error");
          }
        },
        error: (err) => {
          console.log('login error', err);
          this.showSnackbar('Login fehlgeschlagen, bitte versuche es noch einmal.', "error");
        },
        complete: () => console.log('login completed')
      });
    } else {
      this.showSnackbar('Bitte fülle alle Felder korrekt aus.', "error");
    }
  }

  //code für snackbar (also pop-up)
  private showSnackbar(message: string, type: 'success' | 'error'): void {
    const config = {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'center',
      verticalPosition: 'top',
      color: "#722a35",

    };
    // @ts-ignore
    this.snackBar.open(message, '', config);
  }


  valid(): boolean {
    const check =
      !this.loginForm.controls['name'].hasError('required') &&
      !this.loginForm.controls['passwort'].hasError('required') &&
      !this.loginForm.controls['passwort'].hasError('minlength')
    console.log('valid : ', check)
    return check;
  }
}
