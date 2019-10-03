import { Component } from '@angular/core';

/**
 * Generated class for the TermsOfUseAndPrivacyPolicyComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'terms-of-use-and-privacy-policy',
  templateUrl: 'terms-of-use-and-privacy-policy.html'
})
export class TermsOfUseAndPrivacyPolicyComponent {

  text: string;

  constructor() {
    console.log('Hello TermsOfUseAndPrivacyPolicyComponent Component');
    this.text = 'Hello World';
  }

}
