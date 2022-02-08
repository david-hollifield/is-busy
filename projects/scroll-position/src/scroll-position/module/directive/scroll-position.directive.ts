import {
  Directive,
  Input,
  ElementRef,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { ResolveEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { delay, filter, take } from "rxjs/operators"; // continue to use this entrypoint for rxjs v6 support
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

  private delay = 0;
  @Input() set swScrollPositionDelay(value: number | string) {
    this.delay = typeof value === "number" ? value : parseInt(value, 10);

    if (!Number.isInteger(this.delay) || this.delay < 0) {
      throw new Error(`invalid swScrollPositionDelay: ${value}`);
    }
  }

  @Input() swScrollPositionSaveMode: "OnNavigate" | "OnDestroy" = "OnNavigate";

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
          take(1),
          // we need to wait at least a tick before refreshing to ensure that angular
          // updates the dom before we refresh
          delay(this.delay)
        )
        .subscribe(() => this.refresh())
    );

    this.subscriptions.push(
      this.router.events
        // ResolveEnd comes right before the current view is destroyed
        .pipe(
          filter(
            (event) =>
              this.swScrollPositionSaveMode === "OnNavigate" &&
              event instanceof ResolveEnd
          )
        )
        .subscribe(() => this.save())
    );
  }

  ngOnDestroy() {
    if (this.swScrollPositionSaveMode === "OnDestroy") {
      this.save(); // in case a component is destroyed via, e.g., an ngIf
    }

    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private save() {
    this.service.save(this.key, this.el);
  }

  private refresh() {
    this.service.refresh(this.key, this.el);
  }
}
