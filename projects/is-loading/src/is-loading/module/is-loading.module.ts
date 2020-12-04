import { NgModule } from "@angular/core";
import { IsLoadingDirectiveModule } from "./directive/is-loading.directive.module";
import { IsLoadingPipeModule } from "./pipe/is-loading.pipe.module";

@NgModule({
  imports: [IsLoadingDirectiveModule, IsLoadingPipeModule],
  providers: [],
  exports: [IsLoadingDirectiveModule, IsLoadingPipeModule],
})
export class IsLoadingModule {}
