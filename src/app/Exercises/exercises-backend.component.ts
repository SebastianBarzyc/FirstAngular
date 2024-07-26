import { Component, OnInit,  inject} from '@angular/core';
import { ExerciseService } from './exerecise.service';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { Subscription, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseEditComponent } from './exercise-edit.component';

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
  searchSubscription: Subscription = new Subscription();
  exercise = {
    title: '',
    description: ''
  };
  private refreshSubscription: Subscription = new Subscription;

  ngOnInit(): void {
    this.searchSubscription = this.exerciseService.searchResults$.subscribe(data => {
      this.exercises = data;
      console.log('Data received in exercises-backend:', this.exercises);
    });
  
    this.exerciseService.getData().subscribe(data => {
      this.exercises = data;
    });
  }
  
  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
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

  constructor(private exerciseService: ExerciseService) {}


  onSubmit(): void {
    this.exerciseService.addExercise(this.exercise)
      .pipe(
        tap(response => {
          console.log('Exercise added successfully:', response);
          this.loadExercises();
          this.resetForm();
        })
      )
  }

  resetForm(): void {
    this.exercise = {
      title: '',
      description: ''
    };
  }

  readonly dialog = inject(MatDialog);

  openDialog(id: number, title: string, description: string): void {
    const dialogRef = this.dialog.open(ExerciseEditComponent, {
      data: { id: id, title: title, description: description },
      panelClass: 'editPanel'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  
}
