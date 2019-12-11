import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../services/travel.service';
import { Place, Journey, User } from '../models';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { JourneyMapComponent } from './helpers/journey-map.component';
import { MatDialog } from '@angular/material';


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
  
  constructor(private router: Router, private route: ActivatedRoute, private authSvc: AuthService,
              private travelSvc: TravelService, private sanitizer: DomSanitizer, public dialog: MatDialog) { }

  ngOnInit() {
    this.user = this.authSvc.getUser();
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      console.log(this.id);
      this.getPlace(this.id);
   });
    
  }

  getPlace(id) {
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
