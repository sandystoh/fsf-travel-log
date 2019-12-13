import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { User } from './models';
import { MatDialog } from '@angular/material';
import { JourneyFormComponent } from './components/journeys/journey-form.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAuth = false;
  user: User;
  displayName = '';

  constructor(private authSvc: AuthService, private router: Router,
              public dialog: MatDialog) {
    this.isAuthenticated();
  }

  isAuthenticated() {
    this.isAuth = this.authSvc.isAuthenticated();
    if(this.isAuth) {
      this.user = this.authSvc.getUser();
      this.displayName = this.user.displayName;
    }
  }

  logout() {
    this.authSvc.logout().then(() => {
      this.isAuth = false;
    });
  }

  addPlace() {
    this.router.navigate(['/places/add/'+this.user.username]);
  }

  getPlacesList() {
    this.router.navigate(['/places/'+this.user.username]);
  }

  getJourneysList() {
    this.router.navigate(['/journeys/'+this.user.username]);
  }

  openJourneyDialog(): void {
    const dialogRef = this.dialog.open(JourneyFormComponent, {
      width: '85vw',
      height: '80vh',
      disableClose: false,
      data: {fromPlacesForm: false}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) this.router.navigate(['/journey', result.insertId]);
    });
  }
}
