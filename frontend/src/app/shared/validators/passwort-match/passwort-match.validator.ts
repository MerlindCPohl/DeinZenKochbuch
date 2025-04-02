import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwortMatchValidator(control: AbstractControl): ValidationErrors | null {
  const passwort = control.get('passwort')?.value;
  const passwort2 = control.get('passwort2')?.value;

  if (passwort && passwort2 && passwort !== passwort2) {
    return { passwordsNotMatching: true };
  }

  return null;
}
