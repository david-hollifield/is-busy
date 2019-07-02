# Changelog

### 3.0.0 / 2019-7-2

- [BREAKING] removed `@angular/router` as a peer dependency. `IsLoadingService` no longer automatically subscribes to router navigation events.

  - To achieve the same functionality as before, subscribe to router events in your app-root.
  - ```ts
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
      // Note, because `IsLoadingService#isLoading$()` returns
      // a new observable each time it is called, it shouldn't
      // be called directly inside a component template.
      // Instead, you could use `IsLoadingPipe` to simplify this.
      isLoading: Observable<boolean>;

      constructor(
        private isLoadingService: IsLoadingService,
        private router: Router,
      ) {}

      ngOnInit() {
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
