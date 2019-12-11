import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelService } from '../../services/travel.service';
import { Place, User } from '../../models';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';

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
              private travelSvc: TravelService, private authSvc:AuthService,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      console.log(this.id);
      this.getPlace(this.id);
   });
   this.user = this.authSvc.getUser();
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
