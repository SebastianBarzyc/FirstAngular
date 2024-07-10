import { Component } from '@angular/core';
import { NavBtnComponent } from './nav-btn.component';
import { CommonModule } from '@angular/common';
import { NavService } from './nav.service';

@Component({
    selector: 'nav',
    standalone: true,
    imports: [ NavBtnComponent, CommonModule],
    templateUrl: './nav.component.html'
})

export class NavComponent {
    NavList;

    constructor(service: NavService){
        this.NavList = service.getNav();
    }
};