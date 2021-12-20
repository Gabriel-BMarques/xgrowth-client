import { Component, OnInit, Input } from '@angular/core';
import { IPanelData } from '../../models/panelData.model';
import { IItem } from '../../models/item.model';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { ICollectionPost } from '../../models/collection-post.model';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
  @Input() isLoading = true;
  @Input() message: string | undefined;
  @Input() panelData: IPanelData;
  isDesktop = false;
  selectedItems: IItem[] = [];
  footer: boolean;
  allSelected: boolean;
  deleteArray: any[];
  selectedCount: number;
  collectionId: string;
  collectionPosts: ICollectionPost[];

  constructor(private router: Router, private route: ActivatedRoute, private dataService: DataService) {}

  ngOnInit() {}

  deleteItems(type: string) {
    this.deleteArray = this.selectedItems;
    // Object.entries(this.deleteArray).forEach(([key, val]) => {
    //   this.panelData.items.splice(this.panelData.items.indexOf(val), 1);
    // });
    this.deleteArray.map(item => {
      this.panelData.items.splice(this.panelData.items.indexOf(item), 1);
    });
    switch (type) {
      case 'collection':
        this.collectionId = this.route.snapshot.params.id;
        this.dataService.find('/collections', this.collectionId).subscribe(collection => {
          const postsToDelete = this.deleteArray.map(item => {
            return item.id;
          });
          postsToDelete.map(id => {
            const index = collection.body.postsIds.indexOf(id);
            collection.body.postsIds.splice(index, 1);
          });
          this.dataService.update('/collections', collection.body).subscribe(updatedEntity => {});
        });
        break;
      default:
        break;
    }
  }

  toggleSelection(entity: IItem) {
    if (entity.selected === true) {
      this.selectedItems.push(entity);
    } else {
      this.selectedItems.splice(this.selectedItems.indexOf(entity), 1);
    }
  }

  hasSelected() {
    if (this.selectedItems.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  checkAll($event: any) {
    const selectedAll = $event.detail.checked;
    if (selectedAll) {
      Object.entries(this.panelData.items).forEach(([key, value]) => {
        value.selected = true;
      });
    } else {
      Object.entries(this.panelData.items).forEach(([key, value]) => {
        value.selected = false;
      });
    }
  }

  activeFooter() {
    this.selectedCount = 0;
    Object.entries(this.panelData.items).forEach(([key, value]) => {
      if (value.selected === true) {
        this.selectedCount++;
      }
    });
    if (this.selectedCount >= 1) {
      this.footer = true;
    } else {
      this.footer = false;
    }
  }

  selectAll() {
    this.allSelected = true;
    Object.entries(this.panelData.items).forEach(([key, val]) => {
      val.selected = true;
      this.selectedItems.push(val);
    });
  }

  deselectAll() {
    this.allSelected = false;
    Object.entries(this.panelData.items).forEach(([key, val]) => {
      val.selected = false;
      this.selectedItems = [];
    });
  }
}
