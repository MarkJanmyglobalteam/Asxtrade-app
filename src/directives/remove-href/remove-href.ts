import { Directive, Input } from '@angular/core';

@Directive({
  selector : '[remove-href]',
  host : {
    '(click)' : 'doNothing($event)'
  }
})
export class RemoveHrefDirective {
  @Input() href: string;

  constructor() {
    console.log('Hello RemoveHrefDirective Directive');
  }

  doNothing(event) {
  	event.preventDefault();
    // if(this.href.length === 0 || this.href === '#') {
    //   event.preventDefault();
    // }
  }
}