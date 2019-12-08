import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TravelService } from '../services/travel.service';
import { MapResponse } from '../models';
declare var jQuery: any;
declare var jvm: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  username: string;
  resp: any;
  visitData = {};
  markers = [];

  constructor(private router: Router, private route: ActivatedRoute,
              private travelSvc: TravelService) { }

  ngOnInit() {
    this.username = this.route.snapshot.params['user'];
    this.travelSvc.getMap(this.username).then( (r: MapResponse) => {
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
            values: this.visitData,
            scale: ['#EBEBEB', '#FFBC42'],
            normalizeFunction: 'polynomial'
          }]
        },
        onRegionTipShow: function(e, el, code){
          if (this.visitData && this.visitData[code]) {
            el.html(el.html()+'<br>(Visited - '+ this.visitData[code]+')');
          }
        },
        markers: this.markers,
        onMarkerClick: (event, index) => {
            // alter the weburl
            console.log(this.markers[index].weburl, index);
            /*
            setTimeout(()=> { Array.from(document.getElementsByClassName("jvectormap-tip")).forEach((el: ElementRef) => { el.style.display = 'none' }); },100);
            */
            this.router.navigate([this.markers[index].weburl]);
        }
      }); 
    })
    /*
    var visitData = {
      "CN": 15,
      "RU": 2,
      "US": 80,
      "CA": 60
    };

    var markers = [
      {latLng: [37.59, -112.18], name: 'Bryce Canyon National Park', weburl:'/location/fred/123'},
      {latLng: [36.86, -111.37], name: 'Antelope Canyon', weburl:'/location/fred/antelope'},
      {latLng: [34.97, 135.77], name: 'Fushimi Inari Shrine', weburl:'/location/fred/123'}
    ] */

  }

}