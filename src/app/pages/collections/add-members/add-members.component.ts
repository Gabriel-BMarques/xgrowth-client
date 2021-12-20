import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IUser } from '@app/shared/models/user.model';
import { MatSort } from '@angular/material/sort';
import { IonContent } from '@ionic/angular';
import { PanelService } from '@app/services/panel.service';
import { DataService } from '@app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ICollection } from '@app/shared/models/collections.model';
import { IItem } from '@app/shared/models/item.model';

@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss']
})
export class AddmembersComponent implements OnInit {
  members: IUser[];
  panelMembers: PanelData;
  panelAddedMembers: PanelData;
  memberData: MatTableDataSource<IUser>;
  skeletonLoading = true;
  addedmembers: IUser[] = [];
  canEditmembers: IUser[] = [];
  viewAll = false;
  collectionId: string;
  collection: ICollection;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private mockService: MockService,
    public panelService: PanelService,
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.collectionId = this.route.snapshot.params.id;
    this.dataService.find('/collections', this.collectionId).subscribe(collection => {
      this.collection = collection.body;
    });
    this.panelMembers = {
      type: 'members',
      name: 'members',
      items: []
    };
    this.panelAddedMembers = {
      type: 'addedItems',
      name: 'Added Items',
      items: []
    };
    this.members = this.mockService.generateUsers();
    this.memberData = new MatTableDataSource(this.members.slice(0, 7));
    this.memberData.paginator = this.paginator;
    this.refreshPanelData();
    this.memberData.sort = this.sort;
    this.skeletonLoading = false;
  }

  editormembers(entity: IItem) {}

  theresAnEqual(entity: IUser) {
    const theresAnEqual = this.canEditmembers.some(member => {
      return member === entity;
    });
    return theresAnEqual;
  }

  loadData(event: any) {
    this.memberData = new MatTableDataSource(this.members.slice(0, this.memberData.data.length + 7));
    this.refreshPanelData();
    this.memberData.paginator = this.paginator;
    this.memberData.sort = this.sort;
    event.target.complete();
    if (this.memberData.data.length === this.members.length) {
      event.target.disabled = true;
    }
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.memberData.filter = '';
    } else {
      this.memberData.filter = filterValue.trim().toLowerCase();
    }

    if (this.memberData.paginator) {
      this.memberData.paginator.firstPage();
    }
    this.refreshPanelData();
  }

  addMember(entity: IUser, index: number) {
    this.panelAddedMembers.items.unshift(entity);
    this.panelMembers.items.splice(this.panelMembers.items.indexOf(entity), 1);
  }

  viewAllmembers() {
    this.viewAll = !this.viewAll;
  }

  removeMember(entity: IUser, index: number) {
    this.panelMembers.items.push(entity);
    this.panelAddedMembers.items.splice(this.panelAddedMembers.items.indexOf(entity), 1);
  }

  refreshUsers() {
    this.skeletonLoading = true;
    setTimeout(() => {
      // Timeout is being used to simulate database query
      this.members = this.mockService.generateUsers();
      this.memberData = new MatTableDataSource(this.members.slice(0, 7));
      this.refreshPanelData();
      console.table(this.panelMembers.items);
      this.memberData.paginator = this.paginator;
      this.memberData.sort = this.sort;
      this.skeletonLoading = false;
    }, 2000);
  }

  refreshPanelData() {
    this.panelMembers.items = [];
    Object.entries(this.memberData.filteredData).forEach(([key, value]) => {
      const user = this.memberData.filteredData[key];
      const userName = user.firstName + ' ' + user.familyName;
      this.panelMembers.items.push({
        title: userName,
        subtitle: user.email,
        description: user.role
      });
    });
    console.table(this.panelMembers.items);
  }
}
