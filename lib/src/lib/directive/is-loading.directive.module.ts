import { NgModule } from '@angular/core';
import { IsLoadingSpinnerComponent } from './is-loading-spinner.component';
import { IsLoadingDirective } from './is-loading.directive';
import { IsLoadingService } from '../is-loading.service';

@NgModule({
  declarations: [IsLoadingDirective, IsLoadingSpinnerComponent],
  entryComponents: [IsLoadingSpinnerComponent],
  providers: [IsLoadingService],
  exports: [IsLoadingDirective],
})
export class IsLoadingDirectiveModule {}
