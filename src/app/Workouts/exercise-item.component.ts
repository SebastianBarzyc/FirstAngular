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
import { WorkoutService } from './workouts.service';

@Component({
  selector: 'app-exercise-item',
  templateUrl: './exercise-item.component.html',
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
export class ExerciseItemComponent implements OnInit{
  @Input() exercise: any;
  @Input() index: number = 0;
  @Output() remove = new EventEmitter<number>();
  @Input() exercisesList: any[] = [];
  @Input() exercisesdata: any[] = [];
  @Input() planID: number = 1;
  
  exercises: any[] = [];
  tempExercises: any[] = [];

  constructor(
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadExercisesForPlan();
    await this.loadExercises3();
  }

  removeExercise(id: number) {
    this.remove.emit(id);
  }

  getExerciseTitleById(id: number): string {
    const exercise = this.exercises.find(ex => ex.id === id);
    return exercise ? exercise.title : '';
  }

  loadExercisesForPlan(): Promise<void> {
    return new Promise((resolve, reject) => {
        this.workoutService.getExercisesForPlan(this.planID)
            .subscribe({
                next: (response) => {
                    console.log('Loaded exercises:', response.data);
                    this.exercisesdata = response.data;
                    resolve();
                },
                error: (error) => {
                    console.error('Error loading exercises:', error);
                    reject(error); 
                },
            });
    });
}


  loadExercises3(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.exerciseService.getData()
        .subscribe({
          next: (data) => {
            this.exercises = data;
            resolve(); 
          },
          error: (error) => {
            console.error('Error loading exercises3:', error);
            reject(error);
          }
        });
    });
  }

  getExerciseIdByTitle(title: string): number | null {
    const exercise = this.exercises.find(ex => ex.title === title);
    return exercise ? exercise.id : null;
  }

  inputOnChange() {
    this.tempExercises = [];

    this.exercisesList.forEach((exercise) => {
      const exerciseId = this.getExerciseIdByTitle(exercise.title);

      if (exerciseId !== null) {
        const inputSets = exercise.sets ?? 0;
        const inputReps = exercise.reps ?? 0;

        this.tempExercises.push({
          idExercise: exerciseId,
          sets: inputSets,
          reps: inputReps,
        });
      }
    });

    this.workoutService.setTempExercises(this.tempExercises);
    console.log('Temp exercises:', this.tempExercises);
  }
}
