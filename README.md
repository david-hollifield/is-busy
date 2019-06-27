# IsLoading

IsLoadingService is a simple angular service for tracking whether your app, or parts of it, are loading. By using `ngIf` and subscribing to its `isLoading$()` method, you can easily show and hide loading indicators. There is also an optional companion directive `IsLoadingDirective` which can help you automatically mark or disable a button (or other HTML element) as loading.

You can install it with

```bash
yarn add @service-work/is-loading

# or

npm install @service-work/is-loading
```

## IsLoadingService

At its most basic, you can import the service into your root component and use `ngIf` + the `AsyncPipe` to show a loading indicator during page navigation.

Example:

```typescript
@Component({
  selector: 'app-root',
  template: `
    <mat-progress-bar
      *ngIf="loadingService.isLoading$() | async"
      mode="indeterminate"
      color="warn"
      style="position: absolute; top: 0; z-index: 100;"
    >
    </mat-progress-bar>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  constructor(public loadingService: IsLoadingService) {}
}
```

This works because the IsLoadingService automatically subscribes to router events and will emit `true` or `false` from `isLoading$()` as appropriate.

If you want to manually indicate that something is loading, you can call the `loadingService.add()` method, and then call the `loadingService.remove()` method when loading has stopped.

If you call `loadingService.add()` multiple times (because multiple things are loading), `isLoading$()` will remain true until you call `remove()` an equal number of times.

Internally, the IsLoadingService maintains an array of loading indicators. Whenever you call `add()` it pushes an indicator onto the stack, and `remove()` removes an indicator from the stack. `isLoading$()` is true so long as there are loading indicators on the stack.

You can also pass a subscription (or promise or observable) argument to `loadingService.add(subscription)`. In this case, the loading service will push a loading indicator onto the stack, and then automatically remove it when the subscription or promise resolves (i.e. you don't need to manually call `remove()`). In the case of an observable, the loading service will `take(1)` and subscribe to the next emission only.

If you just want to check the current value of `isLoading$()`, you can call `isLoading()` (without the `$`) to simply get a boolean value.

### Advanced Usage

For more advanced scenarios, you can call `add()` with an options object containing a single `key` property. The key allows you to track the loading of different things seperately. Any truthy value can be used as a key. The key option for `add()` is intended to be used in conjunction with `key` options for `isLoading$()` and `remove()`.

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

#### A note about _dynamic_ keys

Using dynamic values for `IsLoadingService` keys is not supported at the moment. This is because `IsLoadingService` keys (and their values) are cached for the lifetime of an application. In general, this shouldn't be a problem as I can't imagine a typical application using more than a few hundred unique keys--that is, unless you try using dynamic keys. In the dynamic key scenerio, your application could quickly acrue a memory leak.

### Interface

```typescript
class IsLoadingService {
  isLoading$(options?: LoadingOptions): Observable<boolean>;

  isLoading(options?: LoadingOptions): boolean;

  add(): void;
  add(options: LoadingOptions): void;
  add<T extends Subscription | Promise<unknown> | Observable<unknown>>(
    sub: T,
    options?: LoadingOptions,
  ): T;

  remove(): void;
  remove(options: LoadingOptions): void;
  remove(sub: Subscription | Promise<unknown>, options?: LoadingOptions): void;
}

interface LoadingOptions {
  key?: unknown;
}
```

## IsLoadingDirective

description coming soon...

## About

This library has been made by John Carroll.
