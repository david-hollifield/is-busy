import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  ComponentFactoryResolver,
  SimpleChange,
  OnChanges,
  ComponentRef,
  Injector,
  Inject,
  Optional,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { IsLoadingService } from "../../is-loading.service";
import { IsLoadingSpinnerComponent } from "./is-loading-spinner.component";
import {
  SW_IS_LOADING_DIRECTIVE_CONFIG,
  ISWIsLoadingDirectiveConfig,
} from "./is-loading.directive.config";

// This code was inspired by angular2-promise-buttons
// https://github.com/johannesjo/angular2-promise-buttons

@Directive({
  selector: "[swIsLoading]",
  exportAs: "swIsLoading",
})
export class IsLoadingDirective implements OnChanges, AfterViewInit, OnDestroy {
  @Input()
  set swIsLoading(value: unknown) {
    if (typeof value === "string") {
      this.stringValue(value);
    } else {
      this.notStringValue();
    }

    if (value instanceof Subscription) {
      this.subscriptionValue(value);
    } else {
      this.notSubscriptionValue();
    }

    if (value instanceof Promise) {
      this.promiseValue(value);
    } else {
      this.notPromiseValue();
    }

    if (typeof value === "boolean") {
      this.booleanValue(value);
    } else {
      this.notBooleanValue();
    }

    if (value instanceof Observable) {
      this.observableValue();
    } else {
      this.notObservableValue();
    }
  }

  @Input() set swIsLoadingDisableEl(value: boolean) {
    this._swIsLoadingDisableEl = coerceBooleanValue(value);
  }
  get swIsLoadingDisableEl() {
    return this._swIsLoadingDisableEl;
  }

  // By default, if this directive is attached to an anchor or a button
  // element, add a `sw-is-loading-spinner` element to the dom (for styling)
  @Input() set swIsLoadingSpinner(value: boolean) {
    this._swIsLoadingSpinner = coerceBooleanValue(value);
  }
  get swIsLoadingSpinner() {
    return this._swIsLoadingSpinner;
  }

  get isLoading() {
    return this._isLoading;
  }

  private _isLoading = false;

  private spinnerEl?: ComponentRef<IsLoadingSpinnerComponent>;

  private config: ISWIsLoadingDirectiveConfig = {};

  private _swIsLoadingDisableEl =
    this.config.disableEl === undefined ? true : this.config.disableEl;

  private _swIsLoadingSpinner =
    this.config.addSpinnerEl !== undefined
      ? this.config.addSpinnerEl
      : this.el.nativeElement instanceof HTMLButtonElement ||
        this.el.nativeElement instanceof HTMLAnchorElement;

  private loadingClass = this.config.loadingClass
    ? this.config.loadingClass
    : "sw-is-loading";

  private set pending(value: Promise<unknown>) {
    this.startLoading();
    value.finally(() => this.stopLoading());
  }

  private textValueSubscription?: Subscription;
  private booleanValueResolveFn?: () => void;

  constructor(
    @Optional()
    @Inject(SW_IS_LOADING_DIRECTIVE_CONFIG)
    config: ISWIsLoadingDirectiveConfig | null,
    private renderer: Renderer2,
    private isLoadingService: IsLoadingService,
    private el: ElementRef<HTMLElement>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {
    this.config = config || {};
  }

  ngOnChanges(changes: {
    swIsLoadingSpinner?: SimpleChange;
    swIsLoadingDisableEl?: SimpleChange;
  }) {
    if (
      changes.swIsLoadingSpinner &&
      !changes.swIsLoadingSpinner.isFirstChange() &&
      !changes.swIsLoadingSpinner.currentValue
    ) {
      this.removeSpinnerEl();
    }

    if (
      changes.swIsLoadingDisableEl &&
      !changes.swIsLoadingDisableEl.isFirstChange() &&
      !changes.swIsLoadingDisableEl.currentValue
    ) {
      this.renderer.removeAttribute(this.el.nativeElement, "disabled");
    }
  }

  ngAfterViewInit() {
    if (this.swIsLoadingSpinner) {
      this.addSpinnerEl();
    }
  }

  ngOnDestroy() {
    if (this.textValueSubscription) {
      this.textValueSubscription.unsubscribe();
    }
  }

  private startLoading() {
    this.renderer.addClass(this.el.nativeElement, this.loadingClass);
    if (this.swIsLoadingDisableEl) {
      this.renderer.setAttribute(this.el.nativeElement, "disabled", "disabled");
    }
    this._isLoading = true;
  }

  private stopLoading() {
    this.renderer.removeClass(this.el.nativeElement, this.loadingClass);
    if (this.swIsLoadingDisableEl) {
      this.renderer.removeAttribute(this.el.nativeElement, "disabled");
    }
    this._isLoading = false;
  }

  private addSpinnerEl() {
    this.spinnerEl = this.componentFactoryResolver
      .resolveComponentFactory(IsLoadingSpinnerComponent)
      .create(this.injector);

    // need to use Renderer2#appendChild instead of
    // ViewContainerRef#createComponent because the injected
    // view container is not for the element this directive
    // is applied to
    this.renderer.appendChild(
      this.el.nativeElement,
      this.spinnerEl.instance.el.nativeElement
    );
  }

  private removeSpinnerEl() {
    if (!this.spinnerEl) return;

    this.renderer.removeChild(
      this.el.nativeElement,
      this.spinnerEl.instance.el.nativeElement
    );

    this.spinnerEl.destroy();
    this.spinnerEl = undefined;
  }

  /**
   * Input value handlers
   */

  private stringValue(value: string) {
    if (this.textValueSubscription) {
      this.textValueSubscription.unsubscribe();
    }

    this.textValueSubscription = this.isLoadingService
      .isLoading$({
        key: value || "default",
      })
      .pipe(debounceTime(10), distinctUntilChanged())
      .subscribe((loading) => {
        if (loading) {
          this.startLoading();
        } else if (this.isLoading) {
          this.stopLoading();
        }
      });
  }

  private notStringValue() {
    if (this.textValueSubscription) {
      this.textValueSubscription.unsubscribe();
    }
  }

  private observableValue() {
    throw new TypeError(
      "swBtnPending must be an instance of Subscription. Instance of Observable given."
    );
  }

  private notObservableValue() {}

  private subscriptionValue(value: Subscription) {
    this.pending = new Promise((resolve) => value.add(resolve));
  }

  private notSubscriptionValue() {}

  private promiseValue(value: Promise<unknown>) {
    this.pending = value;
  }

  private notPromiseValue() {}

  private booleanValue(value: boolean) {
    if (value) {
      this.pending = new Promise((resolve) => {
        this.booleanValueResolveFn = resolve;
      });
    } else if (this.booleanValueResolveFn) {
      this.booleanValueResolveFn();
    } else {
      this.stopLoading();
    }
  }

  private notBooleanValue() {
    if (this.booleanValueResolveFn) {
      this.booleanValueResolveFn();
    }
  }
}

function coerceBooleanValue(val: string | boolean) {
  if (typeof val === "boolean") return val;
  if (["", "true"].includes(val)) return true;
  return false;
}
