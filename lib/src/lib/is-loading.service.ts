import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  debounceTime,
  filter,
  take
} from 'rxjs/operators';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';

export interface LoadingOptions {
  key?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class IsLoadingService {
  private defaultKey = Symbol('Default loading key');
  private loadingSubjects = new Map<unknown, BehaviorSubject<boolean>>();
  private loadingObservables = new Map<unknown, Observable<boolean>>();
  private loadingStacks = new Map<
    unknown,
    (true | Subscription | Promise<unknown>)[]
  >();

  constructor(router: Router) {
    this.ensureKey(this.defaultKey);

    router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          return this.add();
        }

        this.remove();
      });
  }

  /**
   * Used to determine if something is loading or not.
   *
   * When called without arguments, returns the default *isLoading*
   * observable for your app. When called with an options object
   * containing a `key` property, returns the *isLoading* observable
   * corresponding to that key.
   *
   * The default *isLoading* observable tracks the Angular router's
   * navigation, in addition to any other events you manually tell it
   * to track using `add()`. Observables for custom keys only
   * track what you tell them to track.
   *
   * Internally, *isLoading* observables are `BehaviorSubject`s, so
   * they will return values immediately upon subscription.
   *
   * Example:
   ```
    class MyCustomComponent implements OnInit {
      constructor(private loadingService: IsLoadingService) {}

      ngOnInit() {
        this.loadingService.isLoading$().subscribe(value => {
          // ... do stuff
        })

        this.loadingService.isLoading$({key: MyCustomComponent}).subscribe(value => {
          // ... do stuff
        })
      }
    }
   ```
   *
   * @param args an optional argument object with a `key` prop
   */
  isLoading$(args: LoadingOptions = {}): Observable<boolean> {
    if (!args.key) {
      // small performance optimization for the default key
      return this.loadingObservables.get(this.defaultKey)!;
    }

    const key = this.ensureKey(args.key);

    return this.loadingObservables.get(key)!;
  }

  /**
   * Same as `isLoading$()` except a boolean is returned,
   * rather than an observable.
   *
   * @param args an optional argument object with a `key` prop
   */
  isLoading(args: LoadingOptions = {}): boolean {
    if (!args.key) {
      // small performance optimization for the default key
      return this.loadingSubjects.get(this.defaultKey)!.value;
    }

    const key = this.ensureKey(args.key);

    return this.loadingSubjects.get(key)!.value;
  }

  /**
   * Used to indicate that *something* has started loading.
   *
   * Optionally, a key can be passed to track the loading
   * of different things.
   *
   * You can pass a `Subscription`, `Promise`, or `Observable`
   * argument, or you can call `add()` without arguments.
   *
   * - If called without arguments, the "keyless" key is
   *   marked as loading. It will remain loading until you
   *   manually call `remove()` once. If you call `add()`
   *   twice without arguments, you will need to call
   *   `remove()` twice without arguments for loading to
   *   stop. Etc.
   * - If called with a `Subscription` or `Promise`
   *   argument, the appropriate key is marked as loading
   *   until the `Subscription` or `Promise` resolves, at
   *   which point it is automatically marked as no longer
   *   loading. There is no need to call `remove()` in this
   *   scenerio.
   * - If called with an `Observable` argument, the
   *   appropriate key is marked as loading until the
   *   next emission of the `Observable`, at which point
   *   IsLoadingService will unsubscribe from the
   *   observable and mark the key as no longer loading.
   *
   * If you pass a `Subscription`, `Promise`, or
   * `Observable` argument to `add()`, then `add()` will
   * return that argument. This is to make it easier for
   * you to chain off of `add()`.
   *
   * Example: `await isLoadingService.add(promise);`
   *
   * Finally, as previously noted the key option allows you
   * to track the loading of different things seperately.
   * Any truthy value can be used as a key. The key option
   * for `add()` is intended to be used in conjunction with
   * the `key` option for `isLoading$()` and `remove()`.
   *
   * Example:
   ```
    class MyCustomComponent implements OnInit, AfterViewInit {
      constructor(
        private loadingService: IsLoadingService,
        private myCustomDataService: MyCustomDataService,
      ) {}

      ngOnInit() {
        this.loadingService.add({key: MyCustomComponent})

        const subscription = this.myCustomDataService.getData().subscribe()

        // Note, we don't need to call remove() when calling
        // add() with a subscription
        this.loadingService.add(subscription, {
          key: 'getting-data'
        })
      }

      ngAfterViewInit() {
        this.loadingService.remove({key: MyCustomComponent})
      }
    }
   ```
   *
   * @return If called with a `Subscription`, `Promise` or `Observable`,
   *         the Subscription/Promise/Observable is returned.
   *         This allows code like `await this.isLoadingService.add(promise)`.
   */
  add(): void;
  add(options: LoadingOptions): void;
  add<T extends Subscription | Promise<unknown> | Observable<unknown>>(
    sub: T,
    options?: LoadingOptions
  ): T;
  add(
    first?: Subscription | Promise<unknown> | LoadingOptions,
    second?: LoadingOptions
  ) {
    let key: unknown;
    let sub: Subscription | Promise<unknown> | undefined;

    if (first instanceof Subscription) {
      if (first.closed) {
        return;
      }
      sub = first;

      first.add(() => this.remove(first, second));
    } else if (first instanceof Promise) {
      sub = first;

      // If the promise is already resolved, this executes syncronously
      first.then(
        () => this.remove(first, second),
        () => this.remove(first, second)
      );
    } else if (first instanceof Observable) {
      sub = first.pipe(take(1)).subscribe();

      sub.add(() => this.remove(sub as Subscription, second));
    } else if (first) {
      key = this.ensureKey(first.key);
    }

    if (!key) {
      key = this.ensureKey(second && second.key);
    }

    this.loadingStacks.get(key)!.push(sub || true);

    this.updateLoadingStatus(key);

    return first instanceof Observable ? first : sub;
  }

  /**
   * Used to indicate that something has stopped loading
   *
   * When called without arguments, `remove()`
   * removes a loading indicator from the default
   * *isLoading* observable's stack. So long as any items
   * are in an *isLoading* observable's stack, that
   * observable will be marked as loading.
   *
   * In more advanced usage, you can call `remove()` with
   * an options object which accepts a single `key` property.
   * The key allows you to track the loading of different
   * things seperately. Any truthy value can be used as a
   * key. The key option for `remove()` is intended to be
   * used in conjunction with the `key` option for
   * `isLoading$()` and `add()`.
   *
   * Example:
   ```
    class MyCustomComponent implements OnInit, AfterViewInit {
      constructor(private loadingService: IsLoadingService) {}

      ngOnInit() {
        // Pushes a loading indicator onto the default stack
        this.loadingService.add()
      }

      ngAfterViewInit() {
        // Removes a loading indicator from the default stack
        this.loadingService.remove()
      }

      performLongAction() {
        // Pushes a loading indicator onto the `'long-action'`
        // stack
        this.loadingService.add({key: 'long-action'})
      }

      finishLongAction() {
        // Removes a loading indicator from the `'long-action'`
        // stack
        this.loadingService.remove({key: 'long-action'})
      }
    }
   ```
   *
   */
  remove(): void;
  remove(options: LoadingOptions): void;
  remove(sub: Subscription | Promise<unknown>, options?: LoadingOptions): void;
  remove(
    first?: Subscription | Promise<unknown> | LoadingOptions,
    second?: LoadingOptions
  ) {
    let key: unknown;
    let sub: Subscription | Promise<unknown> | undefined;

    if (first instanceof Subscription) {
      sub = first;
    } else if (first instanceof Promise) {
      sub = first;
    } else if (first) {
      key = this.ensureKey(first.key);
    }

    if (!key) {
      key = this.ensureKey(second && second.key);
    }

    const loadingStack = this.loadingStacks.get(key)!;

    loadingStack.splice(loadingStack.indexOf(sub || true), 1);

    this.updateLoadingStatus(key);
  }

  private ensureKey(key: unknown) {
    if (key && !this.loadingObservables.has(key)) {
      const subject = new BehaviorSubject(false);

      this.loadingSubjects.set(key, subject);

      this.loadingObservables.set(
        key,
        subject.pipe(
          distinctUntilChanged(),
          debounceTime(10),
          distinctUntilChanged()
        )
      );

      this.loadingStacks.set(key, []);
    } else if (!key) {
      key = this.defaultKey;
    }

    return key;
  }

  private updateLoadingStatus(key: unknown) {
    this.loadingSubjects
      .get(key)!
      .next(this.loadingStacks.get(key)!.length > 0);
  }
}
