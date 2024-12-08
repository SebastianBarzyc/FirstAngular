import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ExerciseService } from '../Exercises/exercises.service';

@Component({
  selector: 'app-workouts-item',
  templateUrl: './workouts-item.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    MatOption,
    MatSelect,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
  ],
})
export class WorkoutsItemComponent implements OnInit {
  @Output() remove = new EventEmitter<number>();
  @Input() exercisesList: any[] = [];
  @Input() exercisesdata: any[] = [];

  exercises: any[] = [];

  constructor(
    private exerciseService: ExerciseService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadExercises();
    console.log("loadexercises: ");
  }

  removeExercise(id: number) {
    this.remove.emit(id);
  }

  isExerciseSelected(exerciseTitle: string): boolean {
    return this.exercisesList.some(ex => ex.exercise_title === exerciseTitle);
  }

  loadExercises(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.exerciseService.getData().subscribe({
        next: (data) => {
          this.exercises = data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading exercises3:', error);
          reject(error);
        },
      });
    });
  }

  getExerciseIdByTitle(title: string): number | null {
    const exercise = this.exercises.find((ex) => ex.title === title);
    return exercise ? exercise.id : null;
  }

  inputOnChange() {
    this.exercisesdata.forEach((exercise) => {
      const exerciseId = this.getExerciseIdByTitle(exercise.exercise_title);
  
      if (exerciseId !== null) {
        const inputSets = exercise.sets ?? 0;
        const inputReps = exercise.reps ?? [];
  
        const existingExerciseIndex = this.exercisesList.findIndex(
          (e) => e.exercise_title === exercise.exercise_title,
        );
  
        if (existingExerciseIndex !== -1) {
          this.exercisesList[existingExerciseIndex].sets = inputSets;
          this.exercisesList[existingExerciseIndex].reps = inputReps;
          this.exercisesList[existingExerciseIndex].exercise_id = exerciseId;
        } else {
          this.exercisesList.push({
            exercise_id: exerciseId,
            exercise_title: exercise.exercise_title,
            sets: inputSets,
            reps: inputReps.length ? inputReps : Array(inputSets).fill(0),
          });
        }
      }
    });
  
    console.log('Updated exercisesList:', this.exercisesList);
  }
  
  onSetsChange(exercise: any): void {
    const currentSets = exercise.sets || 0;
    const currentReps = exercise.reps || [];
  
    if (currentSets > currentReps.length) {
      for (let i = currentReps.length; i < currentSets; i++) {
        currentReps.push(0);
      }
    } 
    else if (currentSets < currentReps.length) {
      exercise.reps.splice(currentSets);
    }
    exercise.reps = currentReps;
  }
  
}
