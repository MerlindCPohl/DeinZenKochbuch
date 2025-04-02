import { Component, inject } from '@angular/core';
import { AuthService } from '../shared/auth/auth.service';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [LoginComponent, CommonModule, RouterModule]
})
export class HomeComponent {
  private authService = inject(AuthService);

  loggedIn(): boolean {
    return this.authService.loggedIn();
  }
}
