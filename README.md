# Angular IsLoading

[![NPM version](https://flat.badgen.net/npm/v/@service-work/is-loading)](https://www.npmjs.com/package/@service-work/is-loading) [![Size when minified & gzipped](https://flat.badgen.net/bundlephobia/minzip/@service-work/is-loading)](https://bundlephobia.com/result?p=@service-work/is-loading) [![Angular versions 7 and 8 supported](https://flat.badgen.net/badge/Angular/v7%20%7C%7C%20v8/cyan)](https://angular.io/)

[IsLoadingService](#isloadingservice) is a simple angular service that makes it easy to track whether your app, or parts of it, are loading. The optional companion [IsLoadingModule](#isloadingmodule) contains an [IsLoadingPipe](#isloadingpipe) that makes it easy to subscribe to IsLoadingService inside a component's template, as well as an [IsLoadingDirective](#isloadingdirective) that makes it easy to add a loading indicator (and/or disable) HTML elements while loading is happening.

#### [See simple demo](http://bit.ly/32JQOW1)

You can install it with

```bash
yarn add @service-work/is-loading

# or

npm install @service-work/is-loading
```

_For those interested: by itself, the minzipped size of IsLoadingService is a little under 1kb._

### Table of Contents

- [IsLoadingService](#isloadingservice)
  - [Advanced Usage](#advanced-usage)
  - [Interface](#interface)
- [IsLoadingModule](#isloadingmodule)
  - [IsLoadingPipe](#isloadingpipe)
  - [IsLoadingDirective](#isloadingdirective)

## IsLoadingService

_The following examples assume you are using `IsLoadingService` by itself, without the [`IsLoadingModule`](#isloadingmodule)._

At its most basic, you can import the service into your root component and use `ngIf` + the `AsyncPipe` to show a loading indicator during page navigation.

Example:

```typescript
@Component({
  selector: 'app-root',
  template: `
    <mat-progress-bar
      *ngIf="isLoading | async"
      mode="indeterminate"
      color="warn"
      style="position: absolute; top: 0; z-index: 100;"
    >
    </mat-progress-bar>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  isLoading: Observable<boolean>;

  constructor(
    private isLoadingService: IsLoadingService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Note, because `IsLoadingService#isLoading$()` returns
    // a new observable each time it is called, it shouldn't
    // be called directly inside a component template.
    this.isLoading = this.isLoadingService.isLoading$();

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
      )
      .subscribe(event => {
        // If it's the start of navigation, `add()` a loading indicator
        if (event instanceof NavigationStart) {
          this.isLoadingService.add();
          return;
        }

        // Else navigation has ended, so `remove()` a loading indicator
        this.isLoadingService.remove();
      });
  }
}
```

If you want to manually indicate that something is loading, you can call the `loadingService.add()` method, and then call the `loadingService.remove()` method when loading has stopped.

If you call `loadingService.add()` multiple times (because multiple things are loading), `isLoading$()` will remain true until you call `remove()` an equal number of times.

Internally, the IsLoadingService maintains an array of loading indicators. Whenever you call `add()` it pushes an indicator onto the stack, and `remove()` removes an indicator from the stack. `isLoading$()` is true so long as there are loading indicators on the stack.

You can also pass a `Subscription`, `Promise`, or `Observable` argument to `loadingService.add(subscription)`. In this case, the loading service will push a loading indicator onto the stack, and then automatically remove it when the subscription or promise resolves (i.e. you don't need to manually call `remove()`). In the case of an observable, the loading service will `take(1)` and subscribe to the next emission only.

If you just want to check the current value of `isLoading$()`, you can call `isLoading()` (without the `$`) to simply get a boolean value.

Helpfully, if `loadingService.add()` is called with a `Promise`, `Subscription`, or `Observable` argument, that argument will be returned from the method. This simplifies method chaining. For example, in `await isLoading.add(promise)` the `await` is referring to the `promise` variable.

### Advanced Usage

For more advanced scenarios, you can call `add()` with an options object containing a `key` property. The key allows you to track the loading of different things seperately. The key argument accepts a string, object, or symbol, or an array of these. The key option for `add()` is intended to be used in conjunction with `key` options for `isLoading$()` and `remove()`. If you pass an array of keys to `add()`, then each of those keys will be marked as loading (`remove()` works similarly).

Example:

```typescript
class MyCustomComponent implements OnInit, AfterViewInit {
  constructor(
    private loadingService: IsLoadingService,
    private myCustomDataService: MyCustomDataService,
  ) {}

  ngOnInit() {
    this.loadingService.add({ key: MyCustomComponent });

    const subscription = this.myCustomDataService.getData().subscribe();

    // Note, we don't need to call remove() when calling
    // add() with a subscription
    this.loadingService.add(subscription, {
      key: 'getting-data',
    });
  }

  ngAfterViewInit() {
    this.loadingService.remove({ key: MyCustomComponent });
  }

  isDataLoading(): boolean {
    return this.loadingService.isLoading({ key: 'getting-data' });
  }
}
```

### Interface

```typescript
class IsLoadingService {
  isLoading$(options?: IGetLoadingOptions): Observable<boolean>;

  isLoading(options?: IGetLoadingOptions): boolean;

  add(): void;
  add(options: IUpdateLoadingOptions): void;
  add<T extends Subscription | Promise<unknown> | Observable<unknown>>(
    sub: T,
    options?: IUpdateLoadingOptions,
  ): T;

  remove(): void;
  remove(options: IUpdateLoadingOptions): void;
  remove(
    sub: Subscription | Promise<unknown>,
    options?: IUpdateLoadingOptions,
  ): void;
}

type Key = string | object | symbol;

interface IGetLoadingOptions {
  key?: Key;
}

interface IUpdateLoadingOptions {
  key?: Key | Key[];
}
```

## IsLoadingModule

The optional [IsLoadingModule](#isloadingmodule) exports an [IsLoadingPipe](#isloadingpipe) and an [IsLoadingDirective](#isloadingdirective). If desired, you can also import just the IsLoadingDirective or just the IsLoadingPipe via the `IsLoadingDirectiveModule` or the `IsLoadingPipeModule`.

### IsLoadingPipe

_can be imported directly via `IsLoadingPipeModule`_

The IsLoadingPipe is a companion pipe to IsLoadingService that makes it easy to subscribe to loading status from within an angular component. The pipe accepts a single `Key` value and returns an observable subscribing to that value. Because of this, its output should be also piped through the Angular built-in `AsyncPipe`.

- _If you are wondering, how is this pipe different from simply using `IsLoadingService#isLoading$()` inside a template? The difference is that `IsLoadingPipe` memoizes the return and plays nice with Angular Change Detection._

Example:

- Note: the `"default"` key is the key used when you call `add()` without arguments.

```ts
@Component({
  selector: 'app-root',
  template: `
    <mat-progress-bar
      *ngIf="'default' | swIsLoading | async"
      mode="indeterminate"
      color="warn"
      style="position: absolute; top: 0; z-index: 100;"
    >
    </mat-progress-bar>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {}
```

### IsLoadingDirective

_can be imported directly via `IsLoadingDirectiveModule`_

The IsLoadingDirective is a companion directive to IsLoadingService that makes it easy to add a loading indicator (and/or disable) HTML elements while loading is happening.

For example, take the following `example-component`:

```ts
@Component({
  selector: 'example-component',
  template: `
    <button swIsLoading="button" (click)="submit()">
      Submit Form
    </button>
  `,
})
export class MyComponent {}
```

If you call `isLoadingService.add({key: 'button'})`, the `"button"` key will be marked as loading. This will automatically disable the `button` element in the `example-component` and apply the `sw-is-loading` css class to the element. When loading for the `"button"` key stops, the `button` element will be re-enabled and the `sw-is-loading` class will be removed. Additionally, because `[swIsLoading]` is applied to a `button` element, a `sw-is-loading-spinner` child element is added to the DOM (more on this below).

#### Directive API

If you simply apply `swIsLoading` to an HTML element, that element will be associated with the default IsLoadingService key (the key that is triggered when you call `isLoadingService.add()` without specifying a `key`). If you provide a string argument to the `swIsLoading` directive, i.e. `swIsLoading='my-key'`, then that element will be associated with that IsLoadingService key (e.g. `"my-key"`) rather than the default key. By default, when loading is triggered for an element, the css class `sw-is-loading` is applied to it, and the element gets the `disabled="disabled"` html attribute.

Additionally, if the IsLoadingDirective is applied to an HTML button element or an HTML anchor element, then a `<sw-is-loading-spinner class='sw-is-loading-spinner'></sw-is-loading-spinner>` element is inserted into the DOM as a child of whatever element the IsLoadingDirective is applied to. This element can be used to automatically add a loading spinner next to the clicked button. The `sw-is-loading-spinner` has no default styling. If you need inspiration, there are lots of free css-spinners on the internet.

Some examples:

- https://tobiasahlin.com/spinkit/
- https://projects.lukehaas.me/css-loaders/

#### Directive Customization

- By setting `[swIsLoadingDisableEl]='false'`, you can prevent an element from being disabled during loading.
- By setting `[swIsLoadingSpinner]='true|false'`, you can either prevent a spinner element from being added to a button/anchor element, or you can add a `<sw-is-loading-spinner>` child element to an element which isn't an HTML button or anchor.
- To customize the css class applied to elements when they are loading, you must supply a new global default.

To provide new global defaults, you must re-provide the `SW_IS_LOADING_DIRECTIVE_CONFIG` token.

Example:

```ts
import {
  SW_IS_LOADING_DIRECTIVE_CONFIG,
  ISWIsLoadingDirectiveConfig,
} from '@service-work/is-loading';

const myConfig: ISWIsLoadingDirectiveConfig = {
  // disable element while loading (default: true)
  disableEl: true,
  // the class used to indicate loading (default: "sw-is-loading")
  loadingClass: 'sw-is-loading',
  // should a spinner element be added to the dom
  // (default: varies --> true for button/anchor elements, false otherwise)
  addSpinnerEl: undefined,
};

@NgModule({
  providers: [{ provide: SW_IS_LOADING_DIRECTIVE_CONFIG, useValue: myConfig }],
})
export class MyModule {}
```

## About

This library has been made by John Carroll.

Special thanks to the [Angular2PromiseButtonModule](https://github.com/johannesjo/angular2-promise-buttons) which was inspiration for the `IsLoadingDirective`.
