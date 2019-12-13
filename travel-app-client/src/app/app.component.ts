import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { User } from './models';
import { MatDialog, MatSnackBar } from '@angular/material';
import { JourneyFormComponent } from './components/journeys/journey-form.component';
import { TravelService } from './services/travel.service';


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
              public dialog: MatDialog, private travelSvc: TravelService,
              private snackbar: MatSnackBar) {
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

  linkToGoogle() {
    this.travelSvc.linkGoogle().then(() => {
      this.openSnackBar('Successfully Linked!', 'OK');
    }).catch(e => {
      this.openSnackBar('Error. Please Try Again!', 'OK');
  });
}

openSnackBar(message: string, action: string) {
  this.snackbar.open(message, action, {
    duration: 2000,
  });
}

  openJourneyDialog(): void {
    const dialogRef = this.dialog.open(JourneyFormComponent, {
      width: '85vw',
      height: '80vh',
      disableClose: false,
      data: {owner: this.user.username, fromPlacesForm: false}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) this.router.navigate(['/journey', result.insertId]);
    });
  }
}
