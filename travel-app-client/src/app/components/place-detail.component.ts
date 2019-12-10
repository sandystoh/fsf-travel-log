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
  place: Place = { "id": 86, "journey_id": 2, "journey_order": 2, "type": "BEEN", "title": "THe United Federation of Planets Headquarters", 
  "owner": "sandystoh", "date": "2017-01-05T16:00:00.000Z", "lat": -37.8109, "lng": 175.7765, "country": "NZ", "rating": 3, "image_url": "sandystoh/4d1e3f5745ae8cb4d83040dd85fc6fd3", "description": "Lovely Place 4!", "private_notes": "Got Lost in the Hobbit Holes!", "last_updated": "2019-11-04T16:00:00.000Z", "active": 1, "journey_title": "New Zealand", "journey_count": 3 }

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
