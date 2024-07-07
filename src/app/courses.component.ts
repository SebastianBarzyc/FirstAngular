
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesService } from './courses.service';

@Component({
    selector: 'courses', //Wtedy <courses>, może być id lub class, wtedy . lub # 
    standalone: true,
    imports: [CommonModule],
    //Można dodawać tekst i funkcje w template np. {{"Title: " + title}}
    template: `
        <h2>{{ title }}</h2>
        <ul>
            <li *ngFor="let course of courses">
                {{ course }}
            </li>
        </ul>
    ` 
})
export class CoursesComponent {
    title = "List of courses";
    courses;

    constructor(service: CoursesService){
        this.courses = service.getCourses();
    }
}