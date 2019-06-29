import { NgModule } from '@angular/core';
import { IsLoadingPipe } from './is-loading.pipe';
import { IsLoadingService } from '../../is-loading.service';

@NgModule({
  declarations: [IsLoadingPipe],
  providers: [IsLoadingService],
  exports: [IsLoadingPipe],
})
export class IsLoadingPipeModule {}
