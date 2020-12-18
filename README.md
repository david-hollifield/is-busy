# Angular IsLoading & ScrollPosition

[![NPM version](https://flat.badgen.net/npm/v/@service-work/is-loading)](https://www.npmjs.com/package/@service-work/is-loading) [![Size when minified & gzipped](https://flat.badgen.net/bundlephobia/minzip/@service-work/is-loading)](https://bundlephobia.com/result?p=@service-work/is-loading) [![Angular versions 8+ are supported - see compatibility below](https://flat.badgen.net/badge/Angular/v8%2B/cyan)](https://angular.io/)

[IsLoadingService](#isloadingservice) is a simple angular service that makes it easy to track whether your app, or parts of it, are loading. The optional companion [IsLoadingModule](#isloadingmodule) contains an [IsLoadingPipe](#isloadingpipe) that makes it easy to subscribe to IsLoadingService inside a component's template, as well as an [IsLoadingDirective](#isloadingdirective) that makes it easy to add a loading indicator (and/or disable) HTML elements while loading is happening.

These is a separate and optional [ScrollPositionDirective](#scrollpositiondirective) and `ScrollPositionService` that integrates with `IsLoadingService` and can be used to easily refresh the scroll position of individual HTML elements on router navigation.

#### [See simple demo](https://codesandbox.io/s/isloadingservice-example-ujlgm?file=/src/app/app.component.ts)

You can install the `IsLoadingService` with

```bash
yarn add @service-work/is-loading

# or

npm install @service-work/is-loading
```

You can install the `ScrollPositionDirective` with

```bash
yarn add @service-work/is-loading @service-work/scroll-position

# or

npm install @service-work/is-loading @service-work/scroll-position
```

_For those interested: by itself, the minzipped size of IsLoadingService is around 1kb._

### Table of Contents

- [IsLoadingService](#isloadingservice)
  - [Advanced IsLoadingService Usage](#advanced-isloadingservice-usage)
  - [IsLoadingService Interface](#isloadingservice-interface)
- [IsLoadingModule](#isloadingmodule)
  - [IsLoadingPipe](#isloadingpipe)
  - [IsLoadingDirective](#isloadingdirective)
- [ScrollPositionDirective](#scrollpositiondirective)
  - [Advanced ScrollPositionDirective Usage](#advanced-scrollpositiondirective-usage)
  - [ScrollPosition Interface](#scrollposition-interface)

## IsLoadingService

_The following examples assume you are using `IsLoadingService` by itself, without the [`IsLoadingModule`](#isloadingmodule)._

At its most basic, you can import the service into your root component and use `ngIf` + the `AsyncPipe` to show a loading indicator during page navigation.

Example:

```typescript
@Component({
  selector: "app-root",
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
    private router: Router
  ) {}

  ngOnInit() {
    // Note, because `IsLoadingService#isLoading$()` returns
    // a new observable each time it is called, it shouldn't
    // be called directly inside a component template.
    this.isLoading = this.isLoadingService.isLoading$();

    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe((event) => {
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

### Advanced IsLoadingService Usage

For more advanced scenarios, you can call `add()` with an options object containing a `key` property. The key allows you to track the loading of different things seperately. The key argument accepts a string, object, or symbol, or an array of these. The key option for `add()` is intended to be used in conjunction with `key` options for `isLoading$()` and `remove()`. If you pass an array of keys to `add()`, then each of those keys will be marked as loading (`remove()` works similarly).

Example:

```typescript
class MyCustomComponent implements OnInit, AfterViewInit {
  constructor(
    private loadingService: IsLoadingService,
    private myCustomDataService: MyCustomDataService
  ) {}

  ngOnInit() {
    this.loadingService.add({ key: MyCustomComponent });

    const subscription = this.myCustomDataService.getData().subscribe();

    // Note, we don't need to call remove() when calling
    // add() with a subscription
    this.loadingService.add(subscription, {
      key: "getting-data",
    });
  }

  ngAfterViewInit() {
    this.loadingService.remove({ key: MyCustomComponent });
  }

  isDataLoading(): boolean {
    return this.loadingService.isLoading({ key: "getting-data" });
  }
}
```

### IsLoadingService Interface

````typescript
class IsLoadingService {
  isLoading$(options?: IGetLoadingOptions): Observable<boolean>;

  isLoading(options?: IGetLoadingOptions): boolean;

  add(): void;
  add(options: IAddLoadingOptions): void;
  add<T extends Subscription | Promise<unknown> | Observable<unknown>>(
    sub: T,
    options?: IAddLoadingOptions
  ): T;

  remove(): void;
  remove(options: IRemoveLoadingOptions): void;
  remove(
    sub: Subscription | Promise<unknown>,
    options?: IRemoveLoadingOptions
  ): void;
}

type Key = string | object | symbol;

interface IGetLoadingOptions {
  key?: Key | Key[];
}

interface IAddLoadingOptions {
  /** Used to track the loading of different things */
  key?: Key | Key[];
  /**
   * The first time you call IsLoadingService#add() with
   * the "unique" option, it's the same as without it.
   * The second time you call add() with the "unique" option,
   * the IsLoadingService will see if
   * an active loading indicator with the same "unique" ID
   * already exists.
   * If it does, it will remove that indicator and replace
   * it with this one (ensuring that calling add() with a
   * unique key multiple times in a row only adds a single
   * loading indicator to the stack). Example:
   *
   * ```ts
   * this.isLoadingService.isLoading(); // false
   * this.isLoadingService.add({ unique: 'test' });
   * this.isLoadingService.add({ unique: 'test' });
   * this.isLoadingService.isLoading(); // true
   * this.isLoadingService.remove();
   * this.isLoadingService.isLoading(); // false
   * ```
   */
  unique?: Key;
}

interface IRemoveLoadingOptions {
  key?: Key | Key[];
}
````

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
  selector: "app-root",
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
  selector: "example-component",
  template: `
    <button swIsLoading="button" (click)="submit()">Submit Form</button>
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

You can also borrow the spinner styling from the [demo app](https://codesandbox.io/s/isloadingservice-example-ujlgm?file=/src/app/app.component.ts).

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
} from "@service-work/is-loading";

const myConfig: ISWIsLoadingDirectiveConfig = {
  // disable element while loading (default: true)
  disableEl: true,
  // the class used to indicate loading (default: "sw-is-loading")
  loadingClass: "sw-is-loading",
  // should a spinner element be added to the dom
  // (default: varies --> true for button/anchor elements, false otherwise)
  addSpinnerEl: undefined,
};

@NgModule({
  providers: [{ provide: SW_IS_LOADING_DIRECTIVE_CONFIG, useValue: myConfig }],
})
export class MyModule {}
```

## ScrollPositionDirective

The `ScrollPositionDirective` integrates with the `IsLoadingService` and allows you to easily refresh the scroll position of an HTML element (including angular components) on router navigation.

Basic usage:

```ts
@Component({
  selector: "app-root",
  template: `
    <user-list swScrollPosition="user-list">
      <user-profile *ngFor="let user of users | async" [user]="user">
      </user-profile>
    </user-list>
  `,
})
export class AppComponent {
  users: Observable<IUser[]>;

  constructor(
    private isLoadingService: IsLoadingService,
    // assuming `UserService` is a service you made for your app
    private userService: UserService
  ) {}

  ngOnInit() {
    this.users = this.isLoadingService.add(
      // assuming `UserService#getUsers()` returns `Observable<IUser[]>`
      this.userService.getUsers(),
      { key: "user-list" }
    );
  }
}
```

In this example, the `ScrollPositionDirective` hooks into the angular router. When a user navigates away from the current page, the `ScrollPositionDirective` saves the current scroll position (i.e. `scrollTop`) of the `user-list` component. When the user navigates back to this page, the `ScrollPositionDirective` will subscribe to the `user-list` isLoading state. When the `user-list` isLoading state next emits `false`, then the `ScrollPositionDirective` will refresh the last known scroll position of the `user-list` component (if one exists).

### Advanced ScrollPositionDirective Usage

The `ScrollPositionDirective` has a few configuation options.

1. You can configure an optional milliseconds delay that is added before the scroll position is refreshed using the `swScrollPositionDelay` input property (e.g. `swScrollPositionDelay='10'` or `[swScrollPositionDelay]='10'`).
2. You can configure whether the scroll position should be saved on router navigation (the default) or instead when the host component is destroyed via the `swScrollPositionSaveMode` input property (e.g. `swScrollPositionSaveMode='OnDestroy'`). Consider using `OnDestroy` if the host component is removed from the DOM via, for example, an `ngIf` directive. In this case, you might want to refresh the scroll position without ever having triggered a router navigation event.

Note also that the scroll position is automatically associated with the provided loading key as well as the current URL. This means that whenever the URL updates the current scroll position will be saved with the current, provided isLoading keys + url used as the scroll position key. It's possible that some aspects of the URL should not be associated with the current scroll position. You can provide a custom url serializer function by re-providing the `SW_SCROLL_POSITION_CONFIG` in a component or module.

For example:

```ts
export function myUrlSerializer(url: string): string {
  // manually strip parts of the URL (e.g. query params) that are unrelated
  // to the scroll position...
}

@Component({
  selector: "app-root",
  template: `
    <user-list swScrollPosition="user-list">
      <user-profile *ngFor="let user of users | async" [user]="user">
      </user-profile>
    </user-list>
  `,
  providers: [
    {
      provide: SW_SCROLL_POSITION_CONFIG,
      userValue: {
        urlSerializer: myUrlSerializer,
      },
    },
  ],
})
export class AppComponent {
  // etc...
}
```

You can also use the `ScrollPositionService` without using the `ScrollPositionDirective`.

### ScrollPosition Interface

```ts
class ScrollPositionDirective {
  @Input("swScrollPosition") key: string | string[];
  @Input() swScrollPositionDelay: number | string; // string values will be coerced into integers
  @Input() swScrollPositionSaveMode: "OnNavigate" | "OnDestroy";
}

class ScrollPositionService {
  get(key: string | string[]): number;

  save(
    key: string | string[],
    value: ElementRef<HTMLElement> | HTMLElement | number
  ): void;

  refresh(
    key: string | string[],
    el: ElementRef<HTMLElement> | HTMLElement
  ): void;
}

interface IScrollPositionServiceConfig {
  urlSerializer?: (url: string) => string;
}
```

## Compatibility

- Version 3 of this library is compatible with Angular v7+.
- Version 4 of this library is compatible with Angular v8+.

## About

This library has been made by John Carroll.

Special thanks to the [Angular2PromiseButtonModule](https://github.com/johannesjo/angular2-promise-buttons) which was inspiration for the `IsLoadingDirective`.
