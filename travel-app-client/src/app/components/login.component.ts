import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TravelService } from '../services/travel.service';

export const matchPassword: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  // Validates if password and re-entered password are the same
  const password = control.get('password');
  const reEnter = control.get('second_password');
  if (password.value !== '' && reEnter.value !== '' ) {
    return (password.value === reEnter.value) ? null : { matchPassword: true };
  }
  return null;
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  invalidLogin = false;
  isLogin = true;

  signupForm: FormGroup;
  invalidSignup = false;
  isChecked = false;
  isAvailable;

  constructor(private router: Router, private authSvc: AuthService,
              private travelSvc: TravelService) {
    this.loginForm = this.createFormGroup();
    this.signupForm = this.createSignupFormGroup();
  }

  ngOnInit() {
  }

  get f() { return this.loginForm.controls; }

  get f2() { return this.signupForm.controls; }

  createFormGroup() {
    return new FormGroup({
     username: new FormControl('', [Validators.required]),
     password: new FormControl('', [Validators.required])
     });
  }

  createSignupFormGroup() {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#\$])/; // (?=.{8,})/;
    // passwordPattern validates for Uppercase/Lowercase/Digit/Symbol. minlength validator validates length

    return new FormGroup({
     username: new FormControl('', [Validators.required]),
     email: new FormControl('', [Validators.required, Validators.email]),
     display_name: new FormControl('', [Validators.required]),
     password: new FormControl('', [Validators.required,  Validators.minLength(8), Validators.pattern(passwordPattern)]),
     second_password: new FormControl('', [Validators.required])
    }, { validators: matchPassword });
  }

  checkUsername(e) {
    console.log(e.target.value);
    this.travelSvc.checkUsername(e.target.value).then(r => {
      this.isChecked = true;
      this.isAvailable = r.available;
    })
  }

  onSubmit() {
    this.invalidLogin = false;
    const val = this.loginForm.value;
    this.authSvc.authenticate(val.username, val.password).then((r) => {
      if (r) {
        this.router.navigate(['/']);
      }
      this.loginForm.reset();
      this.invalidLogin = true;
    });
  }

  onSignup() {
    this.invalidSignup = false;
    const val = this.signupForm.value;
    this.travelSvc.signup(val).then((r) => {
      this.authSvc.authenticate(val.username, val.password).then((r) => {
        if (r) {
          this.router.navigate(['/']);
        }
        this.loginForm.reset();
        this.invalidLogin = true;
      });
    }).catch(e => { console.log(e); this.invalidSignup = true; });
  }
}
