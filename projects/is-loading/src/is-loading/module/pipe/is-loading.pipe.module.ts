import { NgModule } from '@angular/core';
import { IsLoadingPipe } from './is-loading.pipe';

@NgModule({
  declarations: [IsLoadingPipe],
  exports: [IsLoadingPipe],
})
export class IsLoadingPipeModule {}
