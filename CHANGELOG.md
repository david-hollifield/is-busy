# Changelog

### Unreleased

- [FEATURE] `IsLoadingService#isLoading$(IGetLoadingOptions)` now accepts an array of keys in addition to a single key argument. If an array of keys if passed, the observable will emit `true` so long as any key is loading, and `false` otherwise.
- [FEATURE] Added a new `@service-work/scroll-position` package that integrates with the `IsLoadingService` to save and refresh an element's scroll position. The package includes a `ScrollPositionService` that can be used stand-alone as well as a `ScrollPositionDirective` that can be applied to an element to save and automatically refresh an element's scroll position after route navigation.

### 4.0.0 / 2020-11-11

- [BREAKING] The `IUpdateLoadingOptions` interface was removed and split into `IAddLoadingOptions` and `IRemoveLoadingOptions`.
- [FEATURE] `IAddLoadingOptions#unique` A new option was added to `IsLoadingService#add()`, "unique". The unique option allows you to call `IsLoadingService#add()` multiple times in a row while only adding a single loading indicator to the stack (i.e. if an active loading indicator with the same "unique" key already exists on the stack, the new loading indicator will replace it rather than be added alongside it). This can be useful in observable chain. For example, while someone is typing you might want to add a single loading indicator to the stack that can be removed later. Whenever they start typing you can call `IsLoadingService#add()` with the same unique key and know that, at most, only a single loading indicator will be added to the stack.

### 3.0.3 / 2020-1-26

- [REFACTOR] small simplification of `IsLoadingService#isLoading$()`

### 3.0.2 / 2019-9-19

- [FIX] if a syncronous observable passed to `IsLoadingService#add()` generates a closed subscription, do not add a loading indicator.
- [FIX] if a closed subscription is passed to `IsLoadingService#add()`, return the subscription to the caller.

### 3.0.1 / 2019-7-25

- [FIX] ensure `IsLoadingPipe` and `IsLoadingDirective` use the root instance of `IsLoadingService`.

### 3.0.0 / 2019-7-2

- [BREAKING] removed `@angular/router` as a peer dependency. `IsLoadingService` no longer automatically subscribes to router navigation events.

  - To achieve the same functionality as before, subscribe to router events in your app-root.
  - ```ts
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
      // Note, because `IsLoadingService#isLoading$()` returns
      // a new observable each time it is called, it shouldn't
      // be called directly inside a component template.
      // Instead, you could use `IsLoadingPipe` to simplify this.
      isLoading: Observable<boolean>;

      constructor(
        private isLoadingService: IsLoadingService,
        private router: Router
      ) {}

      ngOnInit() {
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
            // if it's the start of navigation, `add()` a loading indicator
            if (event instanceof NavigationStart) {
              this.isLoadingService.add();
              return;
            }

            // else navigation has ended, so `remove()` a loading indicator
            this.isLoadingService.remove();
          });
      }
    }
    ```

### 2.0.2 / 2019-6-30

- [FIX] bug that might occur if `IsLoadingService#remove()` was called needlessly

### 2.0.1 / 2019-6-29

- [FIX] accept either Angular `^7.0.0 || ^8.0.0` as a peer dependency

### 2.0.0 / 2019-6-29

- [BREAKING] IsLoadingService updated to support dynamic keys.
  - Technically, IsLoadingService has been updated to allow for garbage collecting of unused keys.
  - Unfortunately, this means that `IsLoadingService#isLoading$()` will now return a new observable every time it is called, make it unsuitable for calling directly inside a component template. Instead, consider the new IsLoadingPipe.
- [FEATURE] `IsLoadingService#add()` and `IsLoadingService#remove()` now both accept an array of keys.
- [FEATURE] `IsLoadingPipe` added.
- [FEATURE] `IsLoadingModule` added which combines `IsLoadingPipe` and `IsLoadingDirective`.

### 1.3.1 / 2019-6-27

- [FEATURE] `IsLoadingDirectiveModule` added

### 1.2.0 / 2019-1-27

- [FEATURE] `add` now accepts an `Observable` argument. If passed an observable, `add()` will
  subscribe to the next emission and then unsubscribe. Like Subscription/Promise arguments,
  Observablees are returned.

### 1.1.0 / 2019-1-17

- [FEATURE] If called with a Subscription/Promise, `add()` now returns the Subscription/Promise.

### 1.0.0 / 2018-12-4

- [BREAKING] Now requires typescript 3.1 and Angular 7.x
- [BREAKING] `addLoading()` changed to `add()` and arguments interface updated
- [BREAKING] `removeLoading()` changed to `remove()` and arguments interface updated
- [FEATURE] `add()` and `remove()` accept a promise argument in addition to a subscription argument

### 0.0.2 / 2018-9-28

- Initial commit
