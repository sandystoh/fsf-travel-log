import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../../services/travel.service';
import { Place, Journey, User } from '../../models';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { JourneyMapComponent } from '../helpers/journey-map.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { JourneyEditComponent } from './journey-edit.component';
import { ConfirmDialogComponent } from '../helpers/confirm-dialog.component';
import { PlaceReorderComponent } from '../helpers/place-reorder.component';
import {Location} from '@angular/common';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-journey-detail',
  templateUrl: './journey-detail.component.html',
  styleUrls: ['./journey-detail.component.css']
})
export class JourneyDetailComponent implements OnInit {

  id: number;
  journey: Journey;
  places: Place[];
  user: User;
  random = (new Date()).getTime();
  countries: any;
  mapImageUrl: string;
  isSending = false;
  
  constructor(private router: Router, private route: ActivatedRoute, private authSvc: AuthService,
              private travelSvc: TravelService, private sanitizer: DomSanitizer,
              public dialog: MatDialog, private snackBar: MatSnackBar, private location: Location) { }

  ngOnInit() {
    this.user = this.authSvc.getUser();
    this.route.params.subscribe(params => {
      this.id = +params.id;
      this.getJourney(this.id);
   });
  }

  back() {
    this.location.back();
  }

  getJourney(id) {
    this.random = (new Date()).getTime();
    this.travelSvc.getCountryList().then(c => {
      this.countries = c;
      return this.travelSvc.getJourneyById(id) 
    }).then(r => {
      console.log(r);
      this.journey = r.journey;
      this.mapImageUrl = '/api/journey/map/'+r.journey.id+'?nocache='+ this.random
      this.places = r.places.map(v => {
        let url_string = `../../assets/images/placeholder.jpeg`;
        if(v.image_url !== null && v.image_url != '') url_string = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/thumbnails/${v.image_url}`;
        return {
        ...v,
        journey_title: this.journey.title,
        url: this.sanitizer.bypassSecurityTrustStyle(`url(${url_string}) no-repeat`),
        country_name: this.countries.find(o => o.code === v.country).name } 
      });
    }).then(() => {
      // let url_string = `../../assets/images/placeholder.jpeg`;
      this.journey.url = '';
      if(this.journey.image_url !== null && this.journey.image_url != '')  {
        let url_string = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/journeys/${this.journey.image_url}`;
        this.journey.url = this.sanitizer.bypassSecurityTrustStyle(`url(${url_string}) no-repeat`);
      }
    }); 
  }

  openJourneyEditDialog(): void {
    const dialogRef = this.dialog.open(JourneyEditComponent, {
      width: '85vw',
      height: '80vh',
      disableClose: false,
      data: {owner: this.journey.owner, journey: this.journey, places: this.places, fromPlacesForm: false}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getJourney(this.id);
    });
  }

  openJourneyMapDialog() {
    const dialogRef = this.dialog.open(JourneyMapComponent, {
      width: '95vw',
      height: '95vh',
      disableClose: false,
      data: {places: this.places}
    });
  }

  openReorderDialog() {
    const reorderDialogRef = this.dialog.open(PlaceReorderComponent, {
      width: '85vw',
      maxWidth: '500px',
      height: '70vh',
      disableClose: false,
      data: {places: this.places, journey_id: this.journey.id}
    });
    reorderDialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if(result) {
        this.getJourney(this.id);
      }
    });
  }

  deleteJourney() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      maxWidth: '90vw',
      maxHeight: '60vh',
      data: {id: this.journey.id, title: this.journey.title, recordType: 'Journey'}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result && result.confirm) {
        return this.travelSvc.deleteJourney(this.journey.id, result.remove_child)
        .then(() => {
          this.openSnackBar('Delete Successful', 'OK');
          this.router.navigate(['/journeys', this.journey.owner]);
        })
        .catch((e) => {
          console.log(e);
          this.openSnackBar('Something went Wrong!', 'Try Again');
        });
      }
    });
  }

  saveToDrive() {
    this.isSending = true;
    this.travelSvc.sendJourneyImageToGoogle(this.id).then(() => {
      this.isSending = false;
      this.openSnackBar('Upload Successful', 'OK');
    }).catch((e) => {
      this.isSending = false;
          console.log(e);
          this.openSnackBar('Something went Wrong!', 'Try Again');
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }

  sanitize(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }
}
