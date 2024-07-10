
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavService{
    getNav(){
        return ["Dashboard", "Exercises", "Workouts", "Progress", "Calendar"];
    }
}