import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HelpComponent } from './help/help.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isNavbarCollapsed: boolean; //class="collapse navbar-collapse"
  navBarClassList = 'collapse navbar-collapse';

  constructor(private modalService: NgbModal) {}

  showHelp() {
    this.modalService.open(HelpComponent, {});
  }

  getIsNavbarCollapsed() {
    return this.isNavbarCollapsed;
  }

  trainingClick() {
    console.log('trainingClick: ' + this.isNavbarCollapsed);
      this.navBarClassList = 'collapse navbar-collapse show';
      this.isNavbarCollapsed = true;
  }

  ngOnInit() {
    this.navBarClassList = 'collapse navbar-collapse hide';
  }

}
