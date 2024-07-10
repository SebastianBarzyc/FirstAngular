
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WhatsnextService{
    getWhatsnextWorkout(){
        return ["Biceps Workout", "Back Workout", "Legs Workout"];
    }
    getWhatsnextDay(){
      return ["Tommorow", "Thursday", "Friday"];
  }
}