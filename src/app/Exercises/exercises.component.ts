import { MatExpansionModule } from '@angular/material/expansion';
import { Component } from '@angular/core';
import { ExercisesService } from './exercises.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  standalone: true,
  imports: [FormsModule, MatExpansionModule, CommonModule]
})

export class ExercisesComponent {
  exercisesTitleList: string[];
  exercisesDescList: string[];
  exercisesIndexArray: number[];

  isPanelExpanded = false;
  exerciseTitle: string = "";
  exerciseDesc: string = "";

  constructor(private cookieService: CookieService, private exerciseService: ExercisesService) {
    this.exercisesTitleList = this.exerciseService.getExercisesTitle();
    this.exercisesDescList = this.exerciseService.getExercisesDesc();
    this.loadFromCookies();

    const exercisesMaxLength = Math.min(this.exercisesTitleList.length, this.exercisesDescList.length);
    this.exercisesIndexArray = Array.from({ length: exercisesMaxLength }, (_, index) => index);
  }

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  onSubmit() {
    this.exercisesTitleList.push(this.exerciseTitle);
    this.exercisesDescList.push(this.exerciseDesc);

    this.exerciseService.addExerciseTitle(this.exerciseTitle);
    this.exerciseService.addExerciseDesc(this.exerciseDesc);

    this.saveToCookies();

    this.exerciseTitle = "";
    this.exerciseDesc = "";
  }

  private saveToCookies() {
    this.cookieService.set('exercisesTitleList', JSON.stringify(this.exercisesTitleList));
    this.cookieService.set('exercisesDescList', JSON.stringify(this.exercisesDescList));
  }
  private loadFromCookies() {
    const savedExercisesTitleList = this.cookieService.get('exercisesTitleList');
    const savedExercisesDescList = this.cookieService.get('exercisesDescList');
    if (savedExercisesTitleList && savedExercisesDescList) {
      this.exercisesTitleList = JSON.parse(savedExercisesTitleList);
      this.exercisesDescList = JSON.parse(savedExercisesDescList);
    }
  }
}
