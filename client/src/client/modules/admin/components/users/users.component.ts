import {Component, OnInit} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {getListOfUsers, getUserTableData, userColumns} from './users.util';

@Component({
  selector: 'wah-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  isLoading = true;
  columns = userColumns;
  users = [];
  userMap = new Map<string, any>();

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {

    this.getAllUsers();
  }

  getAllUsers() {
    this.adminService.getUsers()
      .then((users: any[]) => {
        const list = getListOfUsers(users, this.userMap);
        this.users = getUserTableData(list);
      })
      .catch(error =>
        this.snackBar.open(
          error.message,
          'Ok',
          {duration: 10_000}
        ))
      .finally(() => this.isLoading = false);
  }
}