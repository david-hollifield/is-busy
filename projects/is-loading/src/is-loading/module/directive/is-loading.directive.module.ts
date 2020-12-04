import { NgModule } from '@angular/core';
import { IsLoadingSpinnerComponent } from './is-loading-spinner.component';
import { IsLoadingDirective } from './is-loading.directive';

@NgModule({
  declarations: [IsLoadingDirective, IsLoadingSpinnerComponent],
  entryComponents: [IsLoadingSpinnerComponent],
  exports: [IsLoadingDirective],
})
export class IsLoadingDirectiveModule {}
