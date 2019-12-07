import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  invalidLogin = false;

  constructor(private router: Router, private authSvc: AuthService) {
    this.loginForm = this.createFormGroup();
  }

  ngOnInit() {
  }

  get f() { return this.loginForm.controls; }

  createFormGroup() {
    return new FormGroup({
     username: new FormControl('', [Validators.required]),
     password: new FormControl('', [Validators.required])
     });
  }

  onSubmit() {
    this.invalidLogin = false;
    const val = this.loginForm.value;
    console.log(val);
    this.authSvc.authenticate(val.username, val.password).then((r) => {
      if (r) {
        this.router.navigate(['/']);
      }
      this.loginForm.reset();
      this.invalidLogin = true;
    });
  }

}
