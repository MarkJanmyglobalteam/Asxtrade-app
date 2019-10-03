import { Injectable } from '@angular/core';

@Injectable()
export class HelpersProvider {

  stockSegment: string;

  constructor() {
    this.stockSegment = 'asm';
  }

  setStockSegment (segment: string) {
  	this.stockSegment = segment;
  }

  getStockSegment (): string {
  	return this.stockSegment;
  }


}
