import { Component } from '@angular/core';

@Component({
    selector: 'navbtn',
    standalone: true,
    template: `
    <button class="btn fw-bold"><ng-content></ng-content></button>
    `
})

export class NavBtnComponent {};