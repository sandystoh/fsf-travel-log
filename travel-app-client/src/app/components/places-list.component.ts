import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TravelService } from '../services/travel.service';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.css']
})
export class PlacesListComponent implements OnInit {

  username: String;

  constructor(private router: Router, private route: ActivatedRoute,
              private authSvc: AuthService, private travelSvc: TravelService) { }

  ngOnInit() {
    this.username = this.route.snapshot.params['user'];
    this.travelSvc.getPlaces(this.username).then(r => console.log(r));
  }

}
