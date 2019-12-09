import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TravelService } from '../services/travel.service';
import { Place, Country } from '../models';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.css']
})
export class PlacesListComponent implements OnInit {

  username: String;
  places: Place[];
  countries: Country[];
  hearts = 5;
  url="https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/thumbnails/sandystoh/9c86c1a2c9d09e77f583898e8561e9b0";
  url2="https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/thumbnails/sandystoh/2154e0b20643ea7bd6a831acf017f18f";

  constructor(private router: Router, private route: ActivatedRoute,
              private authSvc: AuthService, private travelSvc: TravelService,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.username = this.route.snapshot.params['user'];
    
    this.travelSvc.getPlaces(this.username).then(r => {
      console.log(r);
      this.travelSvc.getCountryList().then(c => {
        this.countries = c;
        this.places = r.places.map(v => { return {
          ...v,
          url: this.sanitizer.bypassSecurityTrustStyle(`url(https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/thumbnails/${v.image_url}) no-repeat`),
          country_name: this.countries.find(o => o.code === v.country).name } });
      });
    });
  }

  sanitize(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
}

}
