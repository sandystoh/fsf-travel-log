import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../../services/travel.service';
import { Place, Journey, User } from '../../models';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { JourneyMapComponent } from '../helpers/journey-map.component';
import { MatDialog } from '@angular/material';
import { JourneyFormComponent } from '../journeys/journey-form.component';
import { JourneyEditComponent } from './journey-edit.component';

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
  
  constructor(private router: Router, private route: ActivatedRoute, private authSvc: AuthService,
              private travelSvc: TravelService, private sanitizer: DomSanitizer, public dialog: MatDialog) { }

  ngOnInit() {
    this.user = this.authSvc.getUser();
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      console.log(this.id);
      this.getJourney(this.id);
   });
  }

  getJourney(id) {
    this.travelSvc.getJourneyById(id).then(r => {
      console.log(r);
      this.places = r.places
      this.journey = r.journey;
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

  sanitize(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }
}
