import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { ExercisesService } from './exercises.service';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [MatExpansionModule, CommonModule],
  templateUrl: './exercises.component.html',
})
export class ExercisesComponent {
  isPanelExpanded = false;

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  ExercisesTitleList: string[];
  ExercisesDescList: string[];
  ExercisesIndexArray: number[];

  constructor(Exercise: ExercisesService){
    this.ExercisesTitleList = Exercise.getExercisesTitle();
    this.ExercisesDescList = Exercise.getExercisesDesc();

    const ExercisesMaxLength = Math.min(this.ExercisesTitleList.length, this.ExercisesDescList.length);
    this.ExercisesIndexArray = Array.from({ length: ExercisesMaxLength }, (_, index) => index);
  }
}