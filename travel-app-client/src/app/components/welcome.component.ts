import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  user: User;

  constructor(private authSvc: AuthService, private router: Router) {  }

  ngOnInit() {
    this.user = this.authSvc.getUser();
    console.log(">> in Welcome Component", this.user)
  }

  getMap() {
    this.router.navigate(['/map/'+this.user.username]);
  }

  getPlacesList() {
    this.router.navigate(['/places/'+this.user.username]);
  }

}
