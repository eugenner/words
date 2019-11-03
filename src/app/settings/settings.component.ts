import { Component, OnInit } from '@angular/core';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  wpLoop = 0;
  fAnswers = 0;
  fLangCouple = null;
  langCouples = ['ru-en', 'en-ru'];
  btnSaveDisabled = true;

  constructor(private settingsSevice: SettingsService) { }

  get fakeAnswers(): any {
    return this.fAnswers;
  }

  set fakeAnswers(value) {
    this.fAnswers = value;
  }

  get favoriteLangCouple(): any {
    return this.fLangCouple;
  }

  set favoriteLangCouple(value) {
    this.fLangCouple = value;
  }

  get wordsPerLoop(): any {
    return this.wpLoop;
  }

  set wordsPerLoop(value) {
    this.wpLoop = value;
  }

  save() {
    this.btnSaveDisabled = true;
    this.updateUserPreferences();
  }

  ngOnInit() {
    this.settingsSevice.getUserPreferences().subscribe((data) => {
      console.log('getUserPreferences: ' + JSON.stringify(data));

      if (data != null && typeof(data) === 'object' && Object.keys(data).length > 0) {
        this.wordsPerLoop = data['wordsPerLoop'];
        this.fLangCouple = data['langPair'];
        this.fAnswers = data['fakeAnswers'];
      }
      this.btnSaveDisabled = false;
    });

  }

  updateUserPreferences() {
    const data = { wordsPerLoop: this.wpLoop,
      langPair: this.fLangCouple, fakeAnswers: this.fAnswers };
    this.settingsSevice.updateUserPreferences(data).subscribe((userPreferences) => {
      const up = JSON.parse(userPreferences);
      // TODO update values from response?
      setTimeout(() => {
        this.fLangCouple = up.langPair;
        this.wpLoop = up.wordsPerLoop;
        this.fAnswers = up.fakeAnswers;
        this.btnSaveDisabled = false;
      }, 1000);
    });
  }

}
