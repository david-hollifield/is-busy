import { Component, ChangeDetectorRef, ElementRef } from '@angular/core';

@Component({
  selector: 'sw-is-loading-spinner',
  template: ``,
  host: { class: 'sw-is-loading-spinner' },
})
export class IsLoadingSpinnerComponent {
  // don't need change detection for this component
  constructor(private cdr: ChangeDetectorRef, public el: ElementRef) {
    this.cdr.detach();
  }
}
