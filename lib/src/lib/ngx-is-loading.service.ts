import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { distinctUntilChanged, debounceTime, filter } from 'rxjs/operators';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NgxIsLoadingService {
  private defaultKey = Symbol('Default loading key')
  private loadingSubjects = new Map<any, BehaviorSubject<boolean>>()
  private loadingObservables = new Map<any, Observable<boolean>>()
  private loadingStacks = new Map<any, (true | Subscription)[]>()
  
  constructor(
    router: Router,
  ) {
    this.ensureKey(this.defaultKey)

    router.events.pipe(
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        return this.addLoading()
      }

      this.removeLoading()
    })
  }

  /**
   * Used to determine if something is loading or not.
   * 
   * When called without arguments, returns the default *isLoading* 
   * observable for your app. When called with a `key` argument,
   * returns the *isLoading* observable corresponding to that key.
   * 
   * The default *isLoading* observable tracks the Angular router's
   * navigation, in addition to any other events you manually tell it
   * to track using `addLoading()`. Observables for custom keys only
   * track what you tell them to track.
   * 
   * Internally, *isLoading* observables are `BehaviorSubject`s, so
   * they will return values immediately upon subscription.
   * 
   * Example:
   ```
    class MyCustomComponent implements OnInit {
      constructor(
        private loadingService: NgxIsLoading,
      ) {}

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
  isLoading$(args: {key?: any} = {}): Observable<boolean> {
    if (!args.key) {
      // small performance optimization for the default key
      return this.loadingObservables.get(this.defaultKey)!
    }

    const key = this.ensureKey(args.key)

    return this.loadingObservables.get(key)!
  }

  /**
   * Same as `isLoading$()` except a boolean is returned,
   * rather than an observable.
   * 
   * @param args an optional argument object with a `key` prop
   */
  isLoading(args: {key?: any} = {}): boolean {
    if (!args.key) {
      // small performance optimization for the default key
      return this.loadingSubjects.get(this.defaultKey)!.value
    }

    const key = this.ensureKey(args.key)

    return this.loadingSubjects.get(key)!.value
  }

  /**
   * Used to indicate that something has started loading.
   * 
   * When called without arguments, pushes a loading indicator
   * onto the default *isLoading* observable's stack. So long
   * as any items are in an *isLoading* observable's stack, 
   * that observable will be marked as loading. You will need
   * to manually call `removeLoading()` when loading has
   * stopped.
   * 
   * When called with the `sub` argument containing a
   * `Subscription`, it pushes a loading indicator onto the
   * default *isLoading* observable's stack. This loading
   * indicator is automatically removed when the subscription
   * closes, so you will not need to manually call
   * `removeLoading()`.
   * 
   * In more advanced usage, you can call `addLoading()` with
   * an optional `key` argument. The key allows you to track
   * the loading of different things seperately. Any truthy
   * value can be used as a key. The key argument for 
   * `addLoading()` is intended to be used in conjunction with
   * the `key` argument for `isLoading$()` and `removeLoading()`.
   * 
   * Example:
   ```
    class MyCustomComponent implements OnInit, AfterViewInit {
      constructor(
        private loadingService: NgxIsLoading,
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
    }
   ```
   * 
   * @param args an optional argument object with `key` and `sub` props
   */
  addLoading(args: {sub?: Subscription, key?: any} = {}) {
    if (args.sub) {
      if (args.sub.closed) return;
      
      args.sub.add(() => this.removeLoading(args))
    }

    const key = this.ensureKey(args.key)
    
    this.loadingStacks.get(key)!.push(args.sub || true)

    this.updateLoadingStatus(key)
  }

  /**
   * Used to indicate that something has stopped loading
   * 
   * When called without arguments, `removeLoading()`
   * removes a loading indicator from the default
   * *isLoading* observable's stack. So long as any items
   * are in an *isLoading* observable's stack, that
   * observable will be marked as loading.
   * 
   * In more advanced usage, you can call `removeLoading()`
   * with an optional `key` argument. The key allows you to
   * track the loading of different things seperately. Any
   * truthy value can be used as a key. The key argument for
   * `removeLoading()` is intended to be used in conjunction
   * with the `key` argument for `isLoading$()` and
   * `addLoading()`.
   * 
   * Example:
   ```
    class MyCustomComponent implements OnInit, AfterViewInit {
      constructor(
        private loadingService: NgxIsLoading,
      ) {}

      ngOnInit() {
        // Pushes a loading indicator onto the default stack
        this.loadingService.addLoading()
      }

      ngAfterViewInit() {
        // Removes a loading indicator from the default stack
        this.loadingService.removeLoading()
      }

      performLongAction() {
        // Pushes a loading indicator onto the `'long-action'`
        // stack
        this.loadingService.addLoading({key: 'long-action'})
      }

      finishLongAction() {
        // Removes a loading indicator from the `'long-action'`
        // stack
        this.loadingService.removeLoading({key: 'long-action'})
      }
    }
   ```
   * 
   * @param args an optional argument object with `key` and `sub` props
   */
  removeLoading(args: {sub?: Subscription, key?: any} = {}) {
    const key = this.ensureKey(args.key)

    const loadingStack = this.loadingStacks.get(key)!

    loadingStack.splice(loadingStack.indexOf(args.sub || true), 1)    

    this.updateLoadingStatus(key)
  }

  private ensureKey(key: any) {
    if (key && !this.loadingObservables.has(key)) {
      const subject = new BehaviorSubject(false)

      this.loadingSubjects.set(key, subject)
      
      this.loadingObservables.set(key, subject.pipe(
        distinctUntilChanged(),
        debounceTime(10),
        distinctUntilChanged(),
      ))

      this.loadingStacks.set(key, [])
    }
    else if (!key) {
      key = this.defaultKey
    }

    return key
  }

  private updateLoadingStatus(key: any) {
    this.loadingSubjects.get(key)!.next(this.loadingStacks.get(key)!.length > 0)
  }
}
