import { Component, OnInit, Inject } from '@angular/core';
import { Place } from 'src/app/models';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { TravelService } from 'src/app/services/travel.service';

@Component({
  selector: 'app-place-reorder',
  templateUrl: './place-reorder.component.html',
  styleUrls: ['./place-reorder.component.css']
})
export class PlaceReorderComponent implements OnInit {

  newPlaces: Place[];
  changedPlaces = [];
  random = (new Date()).getTime();
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, 
              private travelSvc: TravelService, private snackbar: MatSnackBar,
              private dialogRef:MatDialogRef<PlaceReorderComponent>,) { }

  ngOnInit() {
    this.newPlaces = JSON.parse(JSON.stringify(this.data.places));
  }

  upOne(order) {
    let primary = this.newPlaces.find(o => o.journey_order == order);
    let secondary = this.newPlaces.find(o => o.journey_order == order -1);
    primary.journey_order -= 1;
    primary.changed = true;
    secondary.journey_order += 1;
    secondary.changed = true;
    this.newPlaces.sort((a, b) => a.journey_order - b.journey_order);
  }

  downOne(order) {
    let primary = this.newPlaces.find(o => o.journey_order == order);
    let secondary = this.newPlaces.find(o => o.journey_order == order +1);
    primary.journey_order += 1;
    primary.changed = true;
    secondary.journey_order -= 1;
    secondary.changed = true;
    this.newPlaces.sort((a, b) => a.journey_order - b.journey_order);
  }

  close() {
    this.dialogRef.close();
  }

  confirm = async() => {
    this.changedPlaces = [];
    await this.newPlaces.forEach(v => {
      if(v.changed == true) this.changedPlaces.push(v);
    })
    console.log('changed', this.changedPlaces)
    if(this.changedPlaces.length == 0) {
      this.openSnackBar('No Changes Made', 'OK');
      this.dialogRef.close();
    }
    this.travelSvc.reorderJourneyPlaces(this.data.journey_id, this.changedPlaces)
    .then(() => {
      this.openSnackBar('Journey Order Changed', 'OK');
      this.dialogRef.close(true);
    })
    .catch(e => {
      this.openSnackBar('Error. Please Try Again!', 'OK');
      console.log(e);
    })
  }

  openSnackBar(message: string, action: string) {
    this.snackbar.open(message, action, {
      duration: 2000,
    });
  }
}
