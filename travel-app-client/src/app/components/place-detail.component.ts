import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../services/travel.service';
import { Place } from '../models';

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
              private travelSvc: TravelService) { }

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.params['id']);
    console.log(this.id);
    /*
    this.travelSvc.getPlaceById(this.id).then(r => {
      console.log(r);
      this.place = r;
    }); */
  }

}
