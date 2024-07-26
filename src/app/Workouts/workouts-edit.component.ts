import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { Component, ElementRef, Inject, inject, model, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA,MatDialogActions,MatDialogClose,MatDialogContent,MatDialogRef,MatDialogTitle,} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
  
  @Component({
    selector: 'workout-edit',
    templateUrl: './workouts-edit.component.html',
    standalone: true,
    imports: [
      MatFormFieldModule,
      MatInputModule,
      FormsModule,
      MatButtonModule,
      MatDialogTitle,
      MatDialogContent,
      MatDialogActions,
      MatDialogClose,
      CommonModule
    ],
  })
   
  export class workoutEditComponent {
    readonly dialogRef = inject(MatDialogRef<workoutEditComponent>);
    workout = model(this.data);
    workouts: any[] = [];

    constructor(private workoutService: WorkoutService, @Inject(MAT_DIALOG_DATA) public data: any) {}

    @ViewChild('textarea') textarea!: ElementRef;


    ngOnInit(): void {
        this.loadworkouts();
    }

    ngAfterViewInit(): void {
      if (this.textarea) {
        this.autoResize(this.textarea.nativeElement);
      }
    }
    
    loadworkouts(): void {
        this.workoutService.getData()
        .subscribe(data => {
        this.workouts = data;
        setTimeout(() => {
          if (this.textarea) {
            this.autoResize(this.textarea.nativeElement);
          }
        }, 0);
        });
    }

    getId(): void{
       return this.data.id;
    }

    Save(id: number, newTitle: string, newDescription: string): void {
        this.workoutService.editworkout(id, newTitle, newDescription)
          .subscribe({
            next: response => {
              console.log('Response from server:', response);
              this.dialogRef.close();
              this.loadworkouts();
            },
            error: error => {
              console.error('Error from server:', error);
            }
          });
      }

      autoResize(textarea: HTMLTextAreaElement) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }

      Delete(id: number) {
        this.workoutService.deleteworkout(id)
          .subscribe({
            next: response => {
              console.log('Response from server:', response);
              this.dialogRef.close();
            },
            error: error => {
              console.error('Error from server:', error);
            }
          });
        this.loadworkouts();
      }
  }