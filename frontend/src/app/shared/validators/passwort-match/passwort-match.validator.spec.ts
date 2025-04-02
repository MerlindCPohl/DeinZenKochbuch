import { FormGroup, FormControl } from '@angular/forms';
import { passwortMatchValidator } from './passwort-match.validator';

describe('passwordMatchValidator', () => {
  let formGroup: FormGroup;

  beforeEach(() => {
    formGroup = new FormGroup({
      passwort: new FormControl(''),
      passwort2: new FormControl('')
    }, { validators: passwortMatchValidator });
  });

  it('should return null when passwords match', () => {
    formGroup.patchValue({
      passwort: 'password123',
      passwort2: 'password123'
    });
    expect(formGroup.hasError('passwordsNotMatching')).toBeFalsy();
  });

  it('should return error when passwords do not match', () => {
    formGroup.patchValue({
      passwort: 'password123',
      passwort2: 'password456'
    });
    expect(formGroup.hasError('passwordsNotMatching')).toBeTruthy();
  });

  it('should return null when passwords are empty', () => {
    formGroup.patchValue({
      passwort: '',
      passwort2: ''
    });
    expect(formGroup.hasError('passwordsNotMatching')).toBeFalsy();
  });
});
