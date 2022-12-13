import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormGroup} from '@angular/forms';
import {AdminService} from '../../../services/admin.service';

@Component({
  selector: 'wah-recipe-dialog',
  templateUrl: './recipe-dialog.component.html',
  styleUrls: ['./recipe-dialog.component.scss']
})
export class RecipeDialogComponent implements OnInit {

  constructor(
    private services: AdminService,
    private dialogRef: MatDialogRef<RecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public recipe: FormGroup,
  ) {
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  save() {

  }
}