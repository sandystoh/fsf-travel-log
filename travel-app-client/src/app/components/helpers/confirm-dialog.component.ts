import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface ConfirmDialogData {
  id: number;
  title: string;
  recordType: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  removeChild = false;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close({confirm: false});
  }

  confirm() {
    this.dialogRef.close({confirm: true, remove_child: this.removeChild});
  }
}
