import {Component, OnInit} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {getListOfUsers, getUserTableData, userColumns} from './users.util';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from "rxjs";

@Component({
  selector: 'wah-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  isLoading = true;
  columns = userColumns;
  users = [];
  tableData = [];
  statuses = [];
  userMap = new Map<string, any>();
  searchForm = new FormGroup({
    username: new FormControl(),
    email: new FormControl(),
    emailVerified: new FormControl(),
    status: new FormControl(),
  });
  subs = new Subscription();

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
  ) {
    this.subs.add(this.searchForm.valueChanges.subscribe(filter => {
      this.search(filter);
    }));
  }

  ngOnInit(): void {

    this.getAllUsers();
  }

  getAllUsers() {
    this.adminService.getUsers()
      .then((users: any[]) => {
        const {list, statuses} = getListOfUsers(users, this.userMap);
        this.users = getUserTableData(list);
        this.statuses = statuses;
        this.search();
      })
      .catch(error =>
        this.snackBar.open(
          error.message,
          'Ok',
          {duration: 10_000}
        ))
      .finally(() => this.isLoading = false);
  }

  private search(filter: {
    username: string,
    email: string,
    emailVerified: any,
    status: string,
  } = this.searchForm.value) {
    this.tableData = this.users.filter(user => {
      if (filter.username && user.username.toLowerCase().indexOf(filter.username.toLowerCase()) === -1) {
        return false;
      }

      if (filter.email && user.email.toLowerCase().indexOf(filter.email.toLowerCase()) === -1) {
        return false;
      }

      if (filter.emailVerified !== null && filter.emailVerified !== user.emailVerified) {
        return false;
      }

      if (filter.status && filter.status !== user.status) {
        return false;
      }
      return true;
    });
  }
}