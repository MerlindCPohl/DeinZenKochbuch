import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal, WritableSignal, computed, Signal } from '@angular/core';
import { Observable, catchError, throwError, tap } from 'rxjs';

export interface User {
  id: number;
  name: string;
  passwort: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api'; // Proxy
  user: WritableSignal<User | null> = signal(null);

  loggedIn: Signal<boolean> = computed(() => {
    const currentUser = this.user();
    return currentUser !== null && currentUser.id !== undefined && currentUser.id > 0;
  });

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    if (id && name) {
      this.user.set({ id: +id, name, passwort: '' });
    }
  }

  setUser(user: User): void {
    this.user.set(user);
    localStorage.setItem('userId', user.id.toString());
    localStorage.setItem('userName', user.name);
  }

  unsetUser(): void {
    this.user.set(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  }

  registerUser(user: { name: string, passwort: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/neu`, user).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  loginUser(user: { name: string; passwort: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/login`, user).pipe(
      tap((response: any) => {
        if (response && response.userId && response.name) {
          const loggedInUser: User = {
            id: response.userId,
            name: response.name,
            passwort: ''
          };
          this.setUser(loggedInUser);
        } else {
          throw new Error('Ungültige Login-Antwort');
        }
      }),
      catchError(error => {
        let errorMessage = 'Anmeldung fehlgeschlagen';
        if (error.error?.message) {
          errorMessage += `: ${error.error.message}`;
        } else if (error.status === 0) {
          errorMessage += ': Keine Verbindung zum Server';
        } else if (error.status) {
          errorMessage += `: Fehlercode ${error.status}`;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    this.unsetUser();
    console.log('Logout erfolgreich');
  }

  isLoggedIn(): boolean {
    const currentUser = this.user();
    return currentUser !== null && currentUser.id !== undefined && currentUser.id > 0;
  }

}
