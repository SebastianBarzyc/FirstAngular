import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExercisesBackend } from './exercises-backend.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule,FormsModule, MatExpansionModule, CommonModule, ExercisesBackend],
})

export class ExercisesComponent {
  @ViewChild(ExercisesBackend) exercisesBackend!: ExercisesBackend;

  constructor() {}

  exercises: any[] = [];
  searchQuery: string = '';

  togglePanel() {
    if (this.exercisesBackend) {
      this.exercisesBackend.togglePanel();
    }
  }

  Search() {

  }
  
}