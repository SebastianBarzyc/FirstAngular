// exercises-backend.component.ts
import { Component, OnInit, Input, OnDestroy, inject } from '@angular/core';
import { ExerciseService } from './exercises.service';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { Subscription, Subject, debounceTime, distinctUntilChanged, catchError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseEditComponent } from './exercise-edit.component';
import { Observable } from 'rxjs';
import { getUser } from '../supabase-client';
import { Router } from '@angular/router';

@Component({
  selector: 'exercises-backend',
  templateUrl: './exercises-backend.component.html',
  standalone: true,
  providers: [ExerciseService],
  imports: [CommonModule, MatExpansionModule, FormsModule]
})
export class ExercisesBackend implements OnInit, OnDestroy {
  @Input() isLoggedIn: boolean = false;
  @Input() searchQuery: string = '';
  @Input() includeUserExercises: boolean = false; // Add this input
  exercises: any[] = [];
  filteredExercises: any[] = [];
  isPanelExpanded = false;
  searchSubscription: Subscription = new Subscription();
  searchSubject: Subject<string> = new Subject<string>();
  exercise = {
    title: '',
    description: ''
  };
  private refreshSubscription: Subscription = new Subscription();
  private staticUserId = '5d3ab3e6-e980-4df6-af92-e0063728a5fc'; // Static user ID

  ngOnInit(): void {
    this.refreshSubscription = this.exerciseService.onRefreshNeeded().subscribe(() => {
      console.log('Refresh needed triggered');
      this.loadExercises(this.includeUserExercises); // Use the input flag
    });

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.filterExercises();
    });

    if (!this.isLoggedIn) {
      console.warn('User is not logged in. Redirecting to Profile.');
      this.router.navigate(['/Profile']);
    } else {
      this.loadExercises(this.includeUserExercises); // Use the input flag
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  loadExercises(includeUserExercises: boolean = false): void {
    this.exerciseService.getData(includeUserExercises).subscribe(data => {
      this.exercises = data.map(exercise => ({
        ...exercise,
        isDefault: exercise.user_id === this.staticUserId
      }));
      this.filterExercises();
      console.log('Loaded exercises:', this.exercises);
    });
  }

  filterExercises(): void {
    if (this.searchQuery) {
      this.filteredExercises = this.exercises.filter(exercise =>
        exercise.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredExercises = this.exercises;
    }
  }

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
    if (this.isPanelExpanded) {
      this.loadExercises(this.includeUserExercises); // Use the input flag
    }
  }

  constructor(private exerciseService: ExerciseService, private router: Router) {}

  onSubmit(): void {
    console.log(this.exercise);
    if (getUser() === null) {
      console.error('User ID is null, cannot add exercise.');
      this.router.navigate(['/Profile']);
    } else {
      this.exerciseService.addExercise(this.exercise).pipe(
        tap(response => {
          console.log('Exercise added successfully:', response);
          this.loadExercises(this.includeUserExercises); // Use the input flag
          this.resetForm();
        }),
        catchError(error => {
          console.error('Error adding exercise:', error);
          throw error;
        })
      ).subscribe();
    }
  }

  resetForm(): void {
    this.exercise = { title: '', description: '' };
  }

  readonly dialog = inject(MatDialog);

  openDialog(id: number, title: string, description: string): void {
    const dialogRef = this.dialog.open(ExerciseEditComponent, {
      data: { id, title, description },
      panelClass: 'editPanel'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      if (result) {
        this.loadExercises(this.includeUserExercises); // Use the input flag
      }
    });
  }

  handleClick(exercise: any): void {
    if (exercise.isDefault) {
      console.log('Default exercise clicked, no action taken.');
      return;
    }
    this.openDialog(exercise.id, exercise.title, exercise.description);
  }
}
function tap<T>(next: (value: T) => void): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) => new Observable<T>(observer => {
    return source.subscribe({
      next(value) {
        try {
          next(value);
          observer.next(value);
        } catch (err) {
          observer.error(err);
        }
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      }
    });
  });
}

