import { Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MatOption, MatSelect} from '@angular/material/select';
import { MatFormFieldModule,} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ExerciseService } from '../Exercises/exercises.service';
import { WorkoutService } from './workouts.service';
import { workoutEditComponent } from './workouts-edit.component';

interface Exercise {
  idExercise: number;
  sets: number;
  reps: number;
}

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
    MatButtonModule
  ]
})
export class ExerciseItemComponent {
  @Input() exercise: any;
  @Input() index: number = 0;
  @Output() remove = new EventEmitter<number>();

  selectedExercise: string[] = []; 
  exercises: any[] = [];
  exercises2: any[] = [];
  exercises3: any[] = [];
  tempExercises: Exercise[] = [];
  ExercisesList: any[] = [];

  constructor(private workoutService: WorkoutService, private exerciseService: ExerciseService, private WorkoutEdit: workoutEditComponent, private cdr: ChangeDetectorRef) {};

  async ngOnInit(): Promise<void> {
      await this.loadExercises();
      await this.loadExercises2();
      await this.loadExercises3();
      await this.getExercisesList();
  }

  removeExercise() {
    this.remove.emit(this.exercise.exercise_id);
  }

  getExerciseTitleById(id: number): string {
    const exercise = this.exercises3.find(ex => ex.id === id);
    return exercise ? exercise.title : '';
  }

  getId(){
    return this.WorkoutEdit.data.id;
  }

  loadExercises(): Promise<void> {
    return this.workoutService.getExercises(this.getId()).toPromise().then(response => {
      this.exercises = response;
    });
  }

  loadExercises2(): Promise<void> {
    this.loadExercises3();
    return this.workoutService.getData().toPromise().then(response => {
      if (response && Array.isArray(response.data)) {
        this.exercises2 = response.data;
      }
      this.exercises = this.exercises.map(exercise => {
        const foundExercise = this.exercises3.find(ex => ex.id === exercise.id);
        return {
          ...exercise,
          title: foundExercise ? foundExercise.title : 'Unknown Exercise'
        };
      });
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error loading exercises2:', error);
      this.exercises2 = [];
    });
  }

  loadExercises3(){
    this.exerciseService.getData().subscribe(data => {
      this.exercises3 = data;
      this.cdr.detectChanges();
    });
  }

  getExerciseIdByTitle(title: string): number | null {
    const exercise = this.exercises3.find(ex => ex.title === title);
    return exercise ? exercise.id : null;
  }

  getExercisesList(){
    this.ExercisesList = this.workoutService.getExercisesList();
  }
  
  inputOnChange(){
    this.tempExercises = [];
    this.ExercisesList.forEach((exercise, index) => {
      const selectedValue = this.selectedExercise[index];
      
      const inputExercise2 = this.getExerciseIdByTitle(selectedValue);
      const inputSets = document.getElementById(`sets-${index}`) as HTMLInputElement;
      const inputReps = document.getElementById(`reps-${index}`) as HTMLInputElement;

      if (inputExercise2 !== null && inputSets) {
        this.tempExercises.push({
          idExercise: inputExercise2,
          sets: parseInt(inputSets.value),
          reps: parseInt(inputReps.value)
        });
      }
    });
    this.workoutService.setTempExercises(this.tempExercises);
    console.log(this.tempExercises);
  }
}
