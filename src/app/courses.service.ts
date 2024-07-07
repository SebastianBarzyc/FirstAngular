
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoursesService{
    getCourses(){
        return ["course1", "course  2", "course3"];
    }
}