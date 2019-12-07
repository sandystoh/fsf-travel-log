import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAuth = false;
  displayName = '';

  constructor(private authSvc: AuthService, private router: Router) {
    this.isAuthenticated();
  }

  isAuthenticated() {
    this.isAuth = this.authSvc.isAuthenticated();
    if(this.isAuth) this.displayName = this.authSvc.getUser().displayName;
  }

  logout() {
    this.authSvc.logout().then(() => {
      this.isAuth = false;
    });
  }
}
