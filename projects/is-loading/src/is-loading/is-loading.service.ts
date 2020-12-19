import { Injectable } from "@angular/core";
import { BehaviorSubject, Subscription, Observable, combineLatest } from "rxjs";
import { distinctUntilChanged, take, map } from "rxjs/operators";

export type Key = string | object | symbol;

export interface IGetLoadingOptions {
  /** Which loading "thing" do you want to track? */
  key?: Key | Key[];
}

export interface IAddLoadingOptions {
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

export interface IRemoveLoadingOptions {
  key?: Key | Key[];
}

class LoadingToken {
  constructor(
    public value: Subscription | Promise<unknown> | true = true,
    public source:
      | Subscription
      | Promise<unknown>
      | Observable<unknown>
      | true = true,
    private unique?: Key
  ) {}

  isSame(
    a: Subscription | Promise<unknown> | Observable<unknown> | true = true,
    unique?: Key
  ): boolean {
    if (a === this.source || a === this.value) return true;
    if (this.unique && unique && this.unique === unique) return true;
    return false;
  }
}

@Injectable({
  providedIn: "root",
})
export class IsLoadingService {
  protected defaultKey = "default";

  // provides an observable indicating if a particular key is loading
  private loadingSubjects = new Map<Key, BehaviorSubject<boolean>>();

  // tracks how many "things" are loading for each key
  private loadingStacks = new Map<Key, LoadingToken[]>();

  // tracks the sum of the loading indicators and subscribers for each
  // key so that unneeded keys can be deleted/garbage collected.
  private loadingKeyIndex = new Map<Key, number>();

  constructor() {}

  /**
   * Used to determine if something is loading or not.
   *
   * When called without arguments, returns the default *isLoading*
   * observable for your app. When called with an options object
   * containing a `key` property, returns the *isLoading* observable
   * corresponding to that key. When called with an array of keys,
   * returns an observable that emits true while any key is loading
   * and false otherwise.
   *
   * Internally, *isLoading* observables are `BehaviorSubject`s, so
   * they will return values immediately upon subscription.
   *
   * When called, this method creates a new observable and returns it.
   * This means that you should not use this method directly in an Angular
   * template because each time the method is called it will look
   * (to Angular change detection) like the value has changed. To make
   * subscribing in templates easier, check out the `IsLoadingPipe`.
   * Alternatively, store the observable returned from this method in
   * a variable on your component and use that variable inside your
   * template.
   *
   * Example:
   *
   * ```ts
   *  class MyCustomComponent implements OnInit {
   *    variableForUseInTemplate: Observable<boolean>;
   *
   *    constructor(private loadingService: IsLoadingService) {}
   *
   *    ngOnInit() {
   *      this.variableForUseInTemplate =
   *        this.loadingService.isLoading$({key: 'button'});
   *
   *      this.loadingService.isLoading$().subscribe(value => {
   *        // ... do stuff
   *      });
   *
   *      this.loadingService
   *        .isLoading$({key: MyCustomComponent})
   *        .subscribe(value => {
   *          // ... do stuff
   *        });
   *    }
   *  }
   * ```
   *
   * @param args.key optionally specify the key to subscribe to
   */
  isLoading$(args: IGetLoadingOptions = {}): Observable<boolean> {
    if (Array.isArray(args.key)) {
      if (args.key.length === 0) {
        throw new Error(
          `Must provide at least one key when passing an array of keys`
        );
      }

      return combineLatest(
        args.key.map((key) => this.isLoading$({ key }))
      ).pipe(
        map((values) => values.some((v) => v)),
        distinctUntilChanged()
      );
    }

    const keys = this.normalizeKeys(args.key);

    return new Observable<boolean>((observer) => {
      // this function will called each time this
      // Observable is subscribed to.
      this.indexKeys(keys);

      const subscription = this.loadingSubjects
        .get(keys[0])!
        .pipe(distinctUntilChanged())
        .subscribe(observer);

      // the return value is the teardown function,
      // which will be invoked when the new
      // Observable is unsubscribed from.
      return () => {
        subscription.unsubscribe();
        keys.forEach((key) => this.deIndexKey(key));
      };
    });
  }

  /**
   * Same as `isLoading$()` except a boolean is returned,
   * rather than an observable.
   *
   * @param args.key optionally specify the key to check
   */
  isLoading(args: IGetLoadingOptions = {}): boolean {
    const keys = this.normalizeKeys(args.key);

    return keys
      .map((key) => this.loadingSubjects.get(key)?.value ?? false)
      .some((v) => v);
  }

  /**
   * Used to indicate that *something* has started loading.
   *
   * Optionally, a key or keys can be passed to track the loading
   * of different things.
   *
   * You can pass a `Subscription`, `Promise`, or `Observable`
   * argument, or you can call `add()` without arguments. If
   * this method is called with a `Subscription`, `Promise`,
   * or `Observable` argument, this method returns that argument.
   * This is to make it easier for you to chain off of `add()`.
   *
   * Example: `await isLoadingService.add(promise);`
   *
   * Options:
   *
   * - If called without arguments, the `"default"` key is
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
   * Finally, as previously noted the key option allows you
   * to track the loading of different things seperately.
   * Any truthy value can be used as a key. The key option
   * for `add()` is intended to be used in conjunction with
   * the `key` option for `isLoading$()` and `remove()`. If
   * you pass multiple keys to `add()`, each key will be
   * marked as loading.
   *
   * Example:
   *
   * ```ts
   *  class MyCustomComponent implements OnInit, AfterViewInit {
   *    constructor(
   *      private loadingService: IsLoadingService,
   *      private myCustomDataService: MyCustomDataService,
   *    ) {}
   *
   *    ngOnInit() {
   *      const subscription = this.myCustomDataService.getData().subscribe();
   *
   *      // Note, we don't need to call remove() when calling
   *      // add() with a subscription
   *      this.loadingService.add(subscription, {
   *        key: 'getting-data'
   *      });
   *
   *      // Here we mark `MyCustomComponent` as well as the "default" key
   *      // as loading, and then mark them as no longer loading in
   *      // ngAfterViewInit()
   *      this.loadingService.add({key: [MyCustomComponent, 'default']});
   *    }
   *
   *    ngAfterViewInit() {
   *      this.loadingService.remove({key: [MyCustomComponent, 'default']})
   *    }
   *
   *    async submit(data: any) {
   *      // here we take advantage of the fact that `add()` returns the
   *      // Promise passed to it.
   *      await this.loadingService.add(
   *        this.myCustomDataService.updateData(data),
   *        { key: 'button' }
   *      )
   *
   *      // do stuff...
   *    }
   *  }
   * ```
   *
   * @return If called with a `Subscription`, `Promise` or `Observable`,
   *         the Subscription/Promise/Observable is returned.
   *         This allows code like `await this.isLoadingService.add(promise)`.
   */
  add(): void;
  add(options: IAddLoadingOptions): void;
  add<T extends Subscription | Promise<unknown> | Observable<unknown>>(
    sub: T,
    options?: IAddLoadingOptions
  ): T;
  add(
    a?:
      | Subscription
      | Promise<unknown>
      | Observable<unknown>
      | IAddLoadingOptions,
    b?: IAddLoadingOptions
  ) {
    const options =
      b ||
      (!(
        a instanceof Promise ||
        a instanceof Subscription ||
        a instanceof Observable
      ) &&
        a) ||
      undefined;

    let subs: Array<Subscription | Promise<unknown>> | undefined;
    let source:
      | Subscription
      | Promise<unknown>
      | Observable<unknown>
      | undefined;

    const teardown = (s: Subscription | Promise<unknown>) => () =>
      this.remove(s, options);

    const keys = this.normalizeKeys(options?.key);

    if (a instanceof Subscription || a instanceof Observable) {
      source = a;
      subs =
        a instanceof Observable
          ? keys.map(() => a.pipe(take(1)).subscribe())
          : keys.map(() => a);

      if ((subs[0] as Subscription).closed) return a;

      subs.forEach((s) => (s as Subscription).add(teardown(s)));
    } else if (a instanceof Promise) {
      source = a;
      // important for `subs` to contain the original promise and not a new
      // promise created by `Promise#then()`. Hence the separate `forEach`
      // call below
      subs = keys.map(() => a);
      // Unfortunately, if the promise is already resolved,
      // this still executes asynchronously. There is no way around this.
      subs.forEach((s) =>
        (s as Promise<unknown>).then(teardown(a), teardown(a))
      );
    }

    this.indexKeys(keys);

    keys.forEach((key, keyIndex) => {
      const sub = subs && subs[keyIndex];
      const loadingStack = this.loadingStacks.get(key)!;

      // if the "unique" option is present, remove any existing
      // loading idicators with the same "unique" value
      if (options?.unique) {
        const index = loadingStack.findIndex((t) =>
          t.isSame(sub, options?.unique)
        );

        if (index >= 0) {
          const loadingToken = loadingStack.splice(index, 1)[0];

          if (loadingToken.source instanceof Observable) {
            (loadingToken.value as Subscription).unsubscribe();
          }
        }
      }

      loadingStack.push(
        new LoadingToken(
          sub,
          a instanceof Observable ? a : sub,
          options?.unique
        )
      );

      this.updateLoadingStatus(key);
    });

    return source;
  }

  /**
   * Used to indicate that something has stopped loading.
   *
   * - Note: if you call `add()` with a `Subscription`,
   *   `Promise`, or `Observable` argument, you do not need
   *   to manually call `remove().
   *
   * When called without arguments, `remove()`
   * removes a loading indicator from the default
   * *isLoading* observable's stack. So long as any items
   * are in an *isLoading* observable's stack, that
   * observable will be marked as loading.
   *
   * In more advanced usage, you can call `remove()` with
   * an options object which accepts a `key` property.
   * The key allows you to track the loading of different
   * things seperately. Any truthy value can be used as a
   * key. The key option for `remove()` is intended to be
   * used in conjunction with the `key` option for
   * `isLoading$()` and `add()`. If you pass an array of
   * keys to `remove()`, then each key will be marked as
   * no longer loading.
   *
   * Example:
   *
   * ```ts
   *  class MyCustomComponent implements OnInit, AfterViewInit {
   *    constructor(private loadingService: IsLoadingService) {}
   *
   *    ngOnInit() {
   *      // Pushes a loading indicator onto the `"default"` stack
   *      this.loadingService.add()
   *    }
   *
   *    ngAfterViewInit() {
   *      // Removes a loading indicator from the default stack
   *      this.loadingService.remove()
   *    }
   *
   *    performLongAction() {
   *      // Pushes a loading indicator onto the `'long-action'`
   *      // stack
   *      this.loadingService.add({key: 'long-action'})
   *    }
   *
   *    finishLongAction() {
   *      // Removes a loading indicator from the `'long-action'`
   *      // stack
   *      this.loadingService.remove({key: 'long-action'})
   *    }
   *  }
   * ```
   *
   */
  remove(): void;
  remove(options: IRemoveLoadingOptions): void;
  remove(
    sub: Subscription | Promise<unknown> | Observable<unknown>,
    options?: IRemoveLoadingOptions
  ): void;
  remove(
    a?:
      | Subscription
      | Promise<unknown>
      | Observable<unknown>
      | IRemoveLoadingOptions,
    b?: IRemoveLoadingOptions
  ) {
    let options = b;
    let sub: Subscription | Promise<unknown> | Observable<unknown> | undefined;

    if (
      a instanceof Subscription ||
      a instanceof Promise ||
      a instanceof Observable
    ) {
      sub = a;
    } else {
      options = a;
    }

    const keys = this.normalizeKeys(options?.key);

    for (const key of keys) {
      const loadingStack = this.loadingStacks.get(key);

      // !loadingStack means that a user has called remove() needlessly
      if (!loadingStack) continue;

      const index = loadingStack.findIndex((t) => t.isSame(sub));

      if (index < 0) continue;

      const loadingToken = loadingStack.splice(index, 1)[0];

      if (sub instanceof Observable && loadingToken.source === sub) {
        (loadingToken.value as Subscription).unsubscribe();
      }

      this.updateLoadingStatus(key);

      this.deIndexKey(key);
    }
  }

  // /**
  //  * Clears all the loading indicators for the given key or keys,
  //  * reseting the loading status for those keys to `false`.
  //  *
  //  * Use `"default"` to clear the default key.
  //  */
  // clear(key: Key | Key[]) {
  //   const keys = this.normalizeKeys(key);

  //   for (const k of keys) {
  //     const loadingStack = this.loadingStacks.get(k);

  //     // !loadingStack means that a user has called clear() needlessly
  //     if (!loadingStack) continue;

  //     for (const loadingToken of loadingStack) {
  //       this.deIndexKey(k);

  //       if (!loadingToken.isManagedByIsLoadingService) continue;

  //       (loadingToken.value as Subscription).unsubscribe();
  //     }

  //     this.loadingStacks.set(k, []);
  //     this.updateLoadingStatus(k);
  //   }
  // }

  private normalizeKeys(key?: Key | Key[]): Key[] {
    if (!key) key = [this.defaultKey];
    else if (!Array.isArray(key)) key = [key];
    return key as Key[];
  }

  /**
   * `indexKeys()` along with `deIndexKeys()` helps us track which
   * keys are being watched so that unused keys can be deleted
   * / garbage collected.
   *
   * `indexKeys` is called both when there's a new subscriber to
   * a key as well as when a loading indicator is added for a key.
   * A key is only deIndexed when all of the subscribers have
   * unsubscribed *and* all of the loading indicators have been
   * removed.
   *
   * When `indexKeys()` is called with an array of keys,
   * we need to make sure that a loadingSubject
   * and loadingStack exists for that key. We also need to increase
   * the index for that key in the `loadingKeyIndex` map (which
   * tracks the sum of the subscribers and loading indicators for
   * that key).
   *
   * When `deIndexKeys()` is called with an array of keys, it
   * means that either a subscriber has unsubscribed from a key or
   * a loading stack counter has been removed for a key. For keys
   * where the index reaches 0, we need
   * to delete the associated `loadingKeyIndex`, `loadingSubject`,
   * and `loadingStack`. So that the `key` can be properly
   * released for garbage collection.
   */

  private indexKeys(keys: Key[]) {
    for (const key of keys) {
      if (this.loadingKeyIndex.has(key)) {
        const curr = this.loadingKeyIndex.get(key)!;
        this.loadingKeyIndex.set(key, curr + 1);
      } else {
        const subject = new BehaviorSubject(false);

        this.loadingKeyIndex.set(key, 1);
        this.loadingSubjects.set(key, subject);
        this.loadingStacks.set(key, []);
      }
    }
  }

  private deIndexKey(key: Key) {
    const curr = this.loadingKeyIndex.get(key)!;

    if (curr === 1) {
      this.loadingKeyIndex.delete(key);
      this.loadingSubjects.delete(key);
      this.loadingStacks.delete(key);
    } else {
      this.loadingKeyIndex.set(key, curr - 1);
    }
  }

  private updateLoadingStatus(key: Key) {
    const loadingStatus = this.loadingStacks.get(key)!.length > 0;

    this.loadingSubjects.get(key)!.next(loadingStatus);
  }
}
