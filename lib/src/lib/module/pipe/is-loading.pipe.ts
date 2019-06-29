import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { IsLoadingService, Key } from '../../is-loading.service';

@Pipe({
  name: 'swIsLoading',
})
export class IsLoadingPipe implements PipeTransform {
  constructor(private isLoadingService: IsLoadingService) {}

  transform(key: Key): Observable<boolean> {
    return this.isLoadingService.isLoading$({ key });
  }
}
