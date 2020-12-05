import {AbstractControl, FormGroup, ValidationErrors} from '@angular/forms';

export class ValidatorsUtil {
  static password(control: AbstractControl): ValidationErrors {
    const isValid = control.value && control.value.length >= 8 && (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/).test(control.value);
    if (!isValid) {
      return {'passwordEqualityInvalid': true};
    }
    return null;
  }

  static confirmPassword(control: AbstractControl, form: FormGroup): ValidationErrors {
    if (control.value && control.value !== form.getRawValue().password) {
      return {'passwordEqualityInvalid': true};
    }
    return null;
  }
}
