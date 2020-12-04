import {
  Directive,
  Input,
  ElementRef,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { filter, take } from "rxjs/operators";
import { IsLoadingService } from "@service-work/is-loading";
import { ScrollPositionService } from "../../scroll-position.service";

function invalidKeyError() {
  return new Error(
    "Must set a valid scroll position IsLoadingService key. " +
      'Use "default" for the default IsLoadingService key.'
  );
}

@Directive({
  selector: "[swScrollPosition]",
  exportAs: "swScrollPosition",
  providers: [ScrollPositionService],
})
export class ScrollPositionDirective implements AfterViewInit, OnDestroy {
  private _key?: string | string[];

  @Input("swScrollPosition")
  get key() {
    if (!this._key) {
      throw invalidKeyError();
    }

    return this._key;
  }
  set key(value: string | string[]) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      throw invalidKeyError();
    }

    this._key = value;
  }

  private subscriptions: Subscription[] = [];

  constructor(
    private el: ElementRef<HTMLElement>,
    private service: ScrollPositionService,
    private router: Router,
    private isLoadingService: IsLoadingService
  ) {}

  ngAfterViewInit() {
    this.subscriptions.push(
      this.isLoadingService
        .isLoading$({ key: this.key })
        .pipe(
          filter((v) => !v),
          take(1)
        )
        .subscribe(() => this.refresh())
    );

    this.subscriptions.push(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationStart))
        .subscribe(() => this.save())
    );
  }

  ngOnDestroy() {
    this.save(); // in case a component is destroyed via, e.g., an ngIf
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private save() {
    this.service.save(this.key, this.el);
  }

  private refresh() {
    this.service.refresh(this.key, this.el);
  }
}
