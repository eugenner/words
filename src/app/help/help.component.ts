import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { HelpService } from './help.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  email = new FormControl('');
  message = new FormControl('');
  isEmailReadonly = false;
  btnSabmitDisabled = false;
  showSent = false;

  constructor(private modalService: NgbModal, private helpSevice: HelpService) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.email.setValue(user.email);
      this.isEmailReadonly = true;
    }
  }

  ngOnInit() {
  }

  open(content) {
    this.modalService.open(HelpComponent, {ariaLabelledBy: 'modal-basic-title'});
  }

  close() {
    this.modalService.dismissAll();
  }

  onSubmit() {
    this.btnSabmitDisabled = true;
    this.helpSevice.saveMessage({email: this.email.value, message: this.message.value})
      .subscribe((result) => {
        this.showSent = true;
        setTimeout(() => {
          this.btnSabmitDisabled = false;
          this.showSent = false;
        }, 1000);
      }, (error) => {
        this.btnSabmitDisabled = false;
      });
  }

}
