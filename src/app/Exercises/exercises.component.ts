import { MatExpansionModule } from '@angular/material/expansion';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExercisesBackend } from './exercises-backend.component';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  standalone: true,
  imports: [FormsModule, MatExpansionModule, CommonModule, ExercisesBackend]
})

export class ExercisesComponent {
  @ViewChild(ExercisesBackend) exercisesBackend!: ExercisesBackend;

  constructor() {}

  togglePanel() {
    if (this.exercisesBackend) {
      this.exercisesBackend.togglePanel();
    }
  }
}
