import { NgModule } from '@angular/core';
import { SortPipe } from './sort/sort';
import { BypassSanitizerPipe } from './bypass-sanitizer/bypass-sanitizer';

@NgModule({
  declarations: [SortPipe, BypassSanitizerPipe],
  imports: [],
  exports: [SortPipe, BypassSanitizerPipe]
})
export class PipesModule {}
