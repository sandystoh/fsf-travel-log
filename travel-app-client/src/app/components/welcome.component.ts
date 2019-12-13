import { AuthService } from '../services/auth.service';
import { User } from '../models';
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TravelService } from '../services/travel.service';
import { MapResponse } from '../models';
import { MatDialog } from '@angular/material';
import { JourneyFormComponent } from './journeys/journey-form.component';
declare var jQuery: any;
declare var jvm: any;

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  user: User;
  resp: any;
  visitData = {};
  markers = [];

  constructor(private router: Router, private route: ActivatedRoute, public dialog: MatDialog, 
              private travelSvc: TravelService, private authSvc: AuthService) { }

  ngOnInit() {
    this.user = this.authSvc.getUser();
    console.log(">> in Welcome Component", this.user);
    this.getMapData();
  }

  getMap() {
    this.router.navigate(['/map/'+this.user.username]);
  }

  addPlace() {
    this.router.navigate(['/places/add/'+this.user.username]);
  }

  getPlacesList() {
    this.router.navigate(['/places/'+this.user.username]);
  }

  getJourneysList() {
    this.router.navigate(['/journeys/'+this.user.username]);
  }

  openJourneyDialog(): void {
    const dialogRef = this.dialog.open(JourneyFormComponent, {
      width: '85vw',
      height: '80vh',
      disableClose: false,
      data: {fromPlacesForm: false}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) this.router.navigate(['/journey', result.insertId]);
    });
  }

  getMapData() {
    this.travelSvc.getMap(this.user.username).then( (r: MapResponse) => {
      console.log(r);
      this.resp = r;
      this.visitData = r.visitData;
      this.markers = r.places;
      jQuery('#world-map').vectorMap({
        map: 'world_mill',
        scaleColors: ['#C8EEFF', '#0071A4'],
        normalizeFunction: 'polynomial',
        hoverOpacity: 0.7,
        hoverColor: false,
        markerStyle: {
          initial: {
            fill: '#F4DC00',
            stroke: '#383f47'
          }
        },
        backgroundColor: '#2a9df4',
        series: {
          regions: [{
            values: r.visitData,
            scale: ['#EBEBEB', '#FFBC42'],
            normalizeFunction: 'polynomial'
          }]
        },
        onRegionTipShow: function(e, el, code){
          if (r.visitData && r.visitData[code]) {
            el.html(el.html()+'<br>(Visited - '+ r.visitData[code]+')').css("fontSize","1rem"); ;
          }
        },
        markers: r.places,
        onMarkerTipShow: function(event, label, code) {
          if(r.places[code].image_url)
          label.html("<div style=\"font-size:1.3rem;\">"+ label.html()+
          "<br><img width=\"150px\" src=\"https://sandy-fsf-2019.sgp1.digitaloceanspaces.com/places/thumbnails/"+r.places[code].image_url+"\"></div>").css("fontFamily","Smythe");              
          else label.html("<div style=\"font-size:1.3rem;\">"+ label.html()+"</div>").css("fontFamily","Smythe"); 
        },
        onMarkerClick: (event, index) => {
            // alter the weburl
            console.log(r.places[index]);
            // Array.from(document.getElementsByClassName("jvectormap-tip")).forEach((el) => { el.style.display = 'none' });
            setTimeout(()=> { (document.getElementsByClassName("jvectormap-tip")[0] as HTMLElement).style.display = 'none' },100 );
            this.router.navigate(['/place', r.places[index].id]);
        }
      }); 
    })
  }
}
