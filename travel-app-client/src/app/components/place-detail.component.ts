import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../services/travel.service';
import { Place } from '../models';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.component.html',
  styleUrls: ['./place-detail.component.css']
})
export class PlaceDetailComponent implements OnInit {

  id: number;
  place: Place = {
    id: 2,
    journey_id: 1,
    journey_order: 2,
    type: "BEEN",
    title: "Bryce Canyon National Park",
    owner: "sandystoh",
    date: "2016-07-05T16:00:00.000Z",
    lat: 37.593,
    lng: -112.1871,
    country: "US",
    rating: 4,
    image_url: null,
    description: "Lovely Place 2!",
    private_notes: "Got Lost in the Desert!",
    last_updated: "2019-11-04T16:00:00.000Z",
    active: 1,
    journey_title: "United States and Canada and Mexico and Cayman Islands",
    journey_count: 4,
    next_id: 80,
    prev_id: 1,
    country_name: "United States of America"
    };
  
  constructor(private router: Router, private route: ActivatedRoute,
              private travelSvc: TravelService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      console.log(this.id);
      this.getPlace(this.id);
   });
    
  }

  getPlace(id) {
    this.travelSvc.getPlaceById(id).then(r => {
      console.log(r);
      this.place = r;
    }).then(() => {
      // let url_string = `../../assets/images/placeholder.jpeg`;
      this.place.url = '';
      if(this.place.image_url !== null && this.place.image_url != '')  {
        let url_string = `https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/${this.place.image_url}`;
        this.place.url = this.sanitizer.bypassSecurityTrustStyle(`url(${url_string}) no-repeat`);
      }
    }); 
  }

  sanitize(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
}
}
