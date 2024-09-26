import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  SimpleChanges,
  OnInit,
  OnDestroy,
  OnChanges,
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
import { Subject, takeUntil } from 'rxjs';

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
export class ExerciseItemComponent implements OnInit, OnDestroy, OnChanges {
  @Input() exercise: any;
  @Input() index: number = 0;
  @Output() remove = new EventEmitter<number>();
  @Input() exercisesList: any[] = [];
  @Input() exercisesdata: any[] = [];
  @Input() planID: number = 1;
  
  selectedExercise: string[] = [];
  exercises2: any[] = [];
  exercises3: any[] = [];
  tempExercises: any[] = [];
  availableExercises: any[] = [];
  
  private exercisesLoaded = false;
  private initialized = false;
  private unsubscribe$ = new Subject<void>();
  private isLoading: boolean = false;

  constructor(
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {

    // Ładowanie ćwiczeń dla planu
    this.loadExercisesForPlan();

    if (!this.exercisesLoaded) {
      this.exercisesLoaded = true;

      await this.loadAvailableExercises();
      //await this.loadExercises2();
      await this.loadExercises3();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.initialized = false;
    this.exercisesLoaded = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['planID'] && changes['planID'].currentValue !== changes['planID'].previousValue) {
      this.loadExercisesForPlan();
    }
  }

  trackByFn(index: number, item: any): number {
    return item.exercise_id; // lub inny unikalny identyfikator
  }

  removeExercise(id: number) {
    this.remove.emit(id);
  }

  getExerciseTitleById(id: number): string {
    const exercise = this.exercises3.find(ex => ex.id === id);
    return exercise ? exercise.title : '';
  }

  loadExercisesForPlan(): void {
    if (this.isLoading) {
      console.log('Exercises are already loading, skipping call.');
      return;
    }

    this.isLoading = true;

    this.workoutService.getExercisesForPlan(this.planID)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          console.log('Loaded exercises:', response.data);
          this.exercisesdata = response.data;
        },
        error: (error) => {
          console.error('Error loading exercises:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  loadAvailableExercises(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.workoutService.getAvailableExercises()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (response) => {
            this.availableExercises = response.data;
            resolve();  // Rozwiązuje Promise po załadowaniu
          },
          error: (error) => {
            console.error('Error loading available exercises:', error);
            reject(error);  // Odrzuca Promise w przypadku błędu
          }
        });
    });
  }


  loadExercises3(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.exerciseService.getData()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (data) => {
            this.exercises3 = data;
            this.cdr.detectChanges();
            resolve();  // Rozwiązuje Promise po załadowaniu
          },
          error: (error) => {
            console.error('Error loading exercises3:', error);
            reject(error);  // Odrzuca Promise w przypadku błędu
          }
        });
    });
  }

  getExerciseIdByTitle(title: string): number | null {
    const exercise = this.exercises3.find(ex => ex.title === title);
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
