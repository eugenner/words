import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { TrainingComponent } from './training/training.component';
// import { TrainingModule } from './training/training.module';
import { SettingsComponent } from './settings/settings.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  { path: 'training', component: TrainingComponent, canActivate: [AuthGuard]},
  // { path: 'training', loadChildren: () => import('./training/training.module').then(mod => mod.TrainingModule)},
  { path: 'settings', component: SettingsComponent },
  { path: 'login', component: LoginComponent, canActivate: [] },
  { path: '',  redirectTo: '/home', pathMatch: 'prefix' },
  { path: '**',   redirectTo: '/home', pathMatch: 'prefix' }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(public afAuth: AngularFireAuth) {}
}
