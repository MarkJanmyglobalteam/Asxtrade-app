import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import anchorme from "anchorme";

@Pipe({
	name: 'bypassSanitizer',
})
export class BypassSanitizerPipe implements PipeTransform {
	constructor(private domSanitizer: DomSanitizer) {

	}
  /**
   * Takes a value and bypasses security issues
   */
   transform(html: string): SafeHtml {
   	const opts = {
   		emails: false,
   		ips: false,
   		files: false,
   		attributes: [
   		{
   			name: "class",
   			value: "inactive-link"
   		},
   		function(urlObj){
   			return {
   				name: "(click)",
   				value: `viewLink('${urlObj.raw}')`
   			};
   		}
   		]
   	}
   	return this.domSanitizer.bypassSecurityTrustHtml(anchorme(html, opts));
   }
}
