import { Component, OnInit } from '@angular/core';
import { ExerciseService } from './exerecise.service';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { Subscription, tap } from 'rxjs';

@Component({
  selector: 'exercises-backend',
  templateUrl: './exercises-backend.component.html',
  standalone: true,
  providers: [ExerciseService] ,
  imports: [CommonModule, MatExpansionModule, FormsModule]
})
export class ExercisesBackend implements OnInit {
  exercises: any[] = [];
  isPanelExpanded = false;
  exercise = {
    title: '',
    description: ''
  };
  private refreshSubscription: Subscription = new Subscription;

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.exerciseService.getData()
      .subscribe(data => {
        this.exercises = data;
      });
  }
  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  loadExercises(): void {
    this.exerciseService.getData()
      .subscribe(data => {
        this.exercises = data;
      });
  }

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  constructor(private exerciseService: ExerciseService) { }

  onSubmit(): void {
    this.exerciseService.addExercise(this.exercise)
      .pipe(
        tap(response => {
          console.log('Exercise added successfully:', response);
          this.loadExercises();
          this.resetForm();
        })
      )
      .subscribe(
        () => {},
        error => {
          console.error('Error adding exercise:', error);
        }
      );
  }

  resetForm(): void {
    this.exercise = {
      title: '',
      description: ''
    };
  }
  private subscribeToRefresh(): void {
    this.refreshSubscription = this.exerciseService.onRefreshNeeded()
      .subscribe(() => {
        this.loadExercises(); // Automatyczne odświeżenie listy po emitowaniu zdarzenia
      });
  }
}
