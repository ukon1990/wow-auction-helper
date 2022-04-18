import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Dashboard} from '@shared/models';
import {ConfigureComponent} from '../../configure/configure.component';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';

interface Data {
  dashboard: Dashboard;
  filterParameter: string;
}

@Component({
  selector: 'wah-details-dialog',
  templateUrl: './details-dialog.component.html',
})
export class DetailsDialogComponent implements OnInit {
  faCog = faCog;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ConfigureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data) { }

  ngOnInit(): void {
  }

  toggleConfig(): void {
    this.dialog.open(ConfigureComponent, {
      width: '95%',
      maxWidth: '100%',
      data: this.data.dashboard
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}