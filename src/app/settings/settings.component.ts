import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  wpLoop = 0;
  fLangCouple = 'ru-en';
  langCouples = ['ru-en', 'en-ru'];

  constructor(private settingsSevice: SettingsService) { }

  get favoriteLangCouple(): any {
    return this.fLangCouple;
  }

  set favoriteLangCouple(value) {
    this.fLangCouple = value;
    this.updateUserPreferences();
  }

  get wordsPerLoop(): any {
    return this.wpLoop;
  }

  set wordsPerLoop(value) {
    this.wpLoop = value;
    this.updateUserPreferences();
  }

  ngOnInit() {
    this.settingsSevice.getUserPreferences().subscribe((data) => {
      console.log('getUserPreferences: ' + JSON.stringify(data));

      if (Object.keys(data).length > 0) {
        this.wordsPerLoop = data['wordsPerLoop'];
        this.fLangCouple = data['langPair'];
      }
    });
  }

  updateUserPreferences() {
    const data = { wordsPerLoop: this.wpLoop, langPair: this.fLangCouple };
    this.settingsSevice.updateUserPreferences(data).subscribe((userPreferences) => {
      // TODO update values from response
    });
  }

}
