import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { Place } from 'src/app/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export interface DialogData {
  places: Place[];
}

@Component({
  selector: 'app-journey-map',
  templateUrl: './journey-map.component.html',
  styleUrls: ['./journey-map.component.css']
})
export class JourneyMapComponent implements OnInit {

  @ViewChild('mapContainer', {static: false}) gmap: ElementRef;
  map: google.maps.Map;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef:MatDialogRef<JourneyMapComponent>,) { }

  ngOnInit() {
    console.log(this.data.places);
    this.initMap();
  }

  initMap() {
    let map = new google.maps.Map(document.getElementById('map'), {
      zoom: 1,
      center: {lat: 0, lng: 0},
      mapTypeId: 'hybrid'
    });

    let bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < this.data.places.length; i++) {
    let marker = new google.maps.Marker({
      position: this.data.places[i],
      map: map,
      title: this.data.places[i].title,
      icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
            scaledSize: new google.maps.Size(30, 30)
          }
    });
    const latlng = new google.maps.LatLng(this.data.places[i].lat, this.data.places[i].lng);
    bounds.extend(latlng);
    };
    map.fitBounds(bounds);  
    map.panToBounds(bounds); 
    
      var journey = new google.maps.Polyline({
        path: this.data.places,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
    
      journey.setMap(map);
    }

    closeDialog() {
      this.dialogRef.close();
    }
}
