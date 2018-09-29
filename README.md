# IsLoadingService

IsLoadingService is a simple angular service for tracking whether your app, or parts of it, are loading. By using `ngIf` and subscribing to its `isLoading$()` method, you can easily show and hide loading indicators.

You can install it with

```bash
yarn add @service-work/is-loading

# or

npm install @service-work/is-loading
```

At its most basic, you can import the service into your root component and use `ngIf` + the `AsyncPipe` to show a loading indicator during page navigation.

Example:

```typescript
@Component({
  selector: 'app-root',
  template: `
    <mat-progress-bar
        *ngIf='loadingService.isLoading$() | async'
        mode='indeterminate'
        color='warn'
        style='position: absolute; top: 0; z-index: 100;'
        >
    </mat-progress-bar>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    public loadingService: IsLoadingService,
  ) {}
}
```

This works because the IsLoadingService automatically subscribes to router events and will emit `true` or `false` from `isLoading$()` as appropriate.

If you want to manually indicate that something is loading, you can call the `loadingService.addLoading()` method, and then call the `loadingService.removeLoading()` method when loading has stopped.

If you call `loadingService.addLoading()` multiple times (because multiple things are loading), `isLoading$()` will remain true until you call `removeLoading()` an equal number of times.

Internally, the IsLoadingService maintains an array of loading indicators. Whenever you call `addLoading()` it pushes an indicator onto the stack, and `removeLoading()` removes an indicator from the stack. `isLoading$()` is true so long as there are loading indicators on the stack.

You can also pass a subscription argument to `loadingService.addLoading({sub: subscription})`. In this case, the loading service will push a loading indicator onto the stack, and then automatically remove it when the subscription resolves (i.e. you don't need to manually call `removeLoading()`.

If you just want to check the current value of `isLoading$()`, you can call `isLoading()` (without the `$`) to simply get a boolean value.

## Advanced Usage

For more advanced scenarios, you can call `addLoading()` with an optional `key` argument. The key allows you to track the loading of different things seperately. Any truthy value can be used as a key. The key argument for `addLoading()` is intended to be used in conjunction with `key` arguments for `isLoading$()` and `removeLoading()`.

Example:

```typescript
class MyCustomComponent implements OnInit, AfterViewInit {
  constructor(
    private loadingService: IsLoadingService,
    private myCustomDataService: MyCustomDataService,
  ) {}

  ngOnInit() {
    this.loadingService.addLoading({key: MyCustomComponent})

    const subscription = this.myCustomDataService.getData().subscribe()

    // Note, we don't need to call removeLoading() when calling
    // addLoading() with a subscription
    this.loadingService.addLoading({
      sub: subscription,
      key: 'getting-data'
    })
  }

  ngAfterViewInit() {
    this.loadingService.removeLoading({key: MyCustomComponent})
  }

  isDataLoading(): boolean {
    return this.loadingService.isLoading({key: 'getting-data'})
  }
}
```

## Interface

```typescript
class IsLoadingService {
  isLoading$(args?: {key?: any}): Observable<boolean>
  isLoading(args?: {key?: any}): boolean
  addLoading(args?: {sub?: Subscription, key?: any}): void
  removeLoading(args?: {sub?: Subscription, key?: any}): void
}
```

## About

This library has been made by John Carroll.
