import { Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { IsLoadingService, Key } from "../../is-loading.service";

@Pipe({
  name: "swIsLoading",
})
export class IsLoadingPipe implements PipeTransform {
  constructor(private isLoadingService: IsLoadingService) {}

  transform(key: Key): Observable<boolean> {
    return this.isLoadingService
      .isLoading$({ key })
      .pipe(debounceTime(10), distinctUntilChanged());
  }
}
