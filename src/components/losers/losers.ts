import { Component } from '@angular/core';

/**
 * Generated class for the LosersComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'losers',
  templateUrl: 'losers.html'
})
export class LosersComponent {

  text: string;

  constructor() {
    console.log('Hello LosersComponent Component');
    this.text = 'Hello World';
  }

}
