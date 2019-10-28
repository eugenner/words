import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userData: any;

  constructor(public authService: AuthService, public router: Router, public ngZone: NgZone) {
    this.userData = this.authService.userData;
  }

  getLastLoginDate() {
    // tslint:disable-next-line: radix
    return new Date(parseInt(this.userData.toJSON().lastLoginAt));
  }

  getUserPic() {
    return this.userData.photoURL;
  }

  isLoggedIn() {
    return (this.userData && this.authService.isLoggedIn);
  }


  logout() {
    this.authService.SignOut();
    this.ngZone.run(() => {
      this.router.navigate(['login']);
    });
  }

  ngOnInit() { }
}
