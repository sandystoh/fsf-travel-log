import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../../services/travel.service';
import { Place, User } from '../../models';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../helpers/confirm-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Location} from '@angular/common';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.component.html',
  styleUrls: ['./place-detail.component.css']
})
export class PlaceDetailComponent implements OnInit {

  id: number;
  place: Place;
  user: User;

  constructor(private router: Router, private route: ActivatedRoute,
              private travelSvc: TravelService, private authSvc: AuthService,
              private sanitizer: DomSanitizer, public dialog: MatDialog,
              private snackBar: MatSnackBar, private location: Location) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params.id;
      console.log(this.id);
      this.getPlace(this.id);
   });
    this.user = this.authSvc.getUser();
  }

  back() {
    this.location.back();
  }

  getPlace(id) {
    this.travelSvc.getPlaceById(id).then(r => {
      console.log(r);
      this.place = r;
    }).then(() => {
      // let url_string = `../../assets/images/placeholder.jpeg`;
      this.place.url = '';
      if (this.place.image_url !== null && this.place.image_url !== '')  {
        const urlString = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/${this.place.image_url}`;
        this.place.url = this.sanitizer.bypassSecurityTrustStyle(`url(${urlString}) no-repeat`);
      }
    });
  }

  deletePlace() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: {id: this.place.id, title: this.place.title, recordType: 'Place'}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result && result.confirm) {
        return this.travelSvc.deletePlace(this.place.id)
        .then(() => {
          this.openSnackBar('Delete Successful', 'OK');
          this.router.navigate(['/places', this.place.owner]);
        })
        .catch((e) => {
          console.log(e);
          this.openSnackBar('Something went Wrong!', 'Try Again');
        });
      }
    });
  }

  saveToDrive() {
    this.travelSvc.sendPlaceImageToGoogle(this.id).then(() => {
      this.openSnackBar('Upload Successful', 'OK');
    }).catch((e) => {
          console.log(e);
          this.openSnackBar('Something went Wrong!', 'Try Again');
        });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  sanitize(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }
}
