import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth/auth.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.minLength(8)]]
  });

  updateMessage = '';

  updateUser() {
    if (this.userForm.valid) {
      const { name, password } = this.userForm.value;
      // Hier würden Sie den AuthService aufrufen, um den Benutzer zu aktualisieren
      console.log('Updating user:', name);
      this.updateMessage = 'Benutzerdaten erfolgreich aktualisiert';
    } else {
      this.updateMessage = 'Bitte korrigieren Sie die Eingabefelder';
    }
  }

  changePassword() {
    const password = this.userForm.get('password')?.value;
    if (password && password.length >= 8) {
      // Hier würden Sie den AuthService aufrufen, um das Passwort zu ändern
      console.log('Changing password');
      this.updateMessage = 'Passwort erfolgreich geändert';
    } else {
      this.updateMessage = 'Passwort muss mindestens 8 Zeichen lang sein';
    }
  }
}
