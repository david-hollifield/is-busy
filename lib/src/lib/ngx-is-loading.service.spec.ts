import { TestBed, inject, async } from '@angular/core/testing';

import { NgxIsLoadingService } from './ngx-is-loading.service';
import { take } from 'rxjs/operators';
import { BehaviorSubject, defer } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('NgxIsLoadingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [NgxIsLoadingService]
    });
  });

  it('should be created', inject([NgxIsLoadingService], (service: NgxIsLoadingService) => {
    expect(service).toBeTruthy();
  }));

  describe("default key", () => {
    it('#isLoading simple', async(inject([NgxIsLoadingService], async (service: NgxIsLoadingService) => {
      let value = await service.isLoading().pipe(take(1)).toPromise()
      
      expect(value).toBeFalsy();
    })));

    it('#addLoading & #removeLoading', async(inject([NgxIsLoadingService], async (service: NgxIsLoadingService) => {
      service.addLoading()
      
      let value = await service.isLoading().pipe(take(1)).toPromise()

      expect(value).toBeTruthy();

      service.addLoading()
      
      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeTruthy();

      service.removeLoading()
      
      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeTruthy();

      service.removeLoading()
      
      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeFalsy();
    })));

    it('#addLoading w/ subscription', async(inject([NgxIsLoadingService], async (service: NgxIsLoadingService) => {
      let subject = new BehaviorSubject(true)

      let subscription = subject.subscribe()
      
      service.addLoading({sub: subscription})
      
      let value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeTruthy();

      service.addLoading({sub: subscription})
      
      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeTruthy();

      subject.complete()

      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeFalsy();
    })));

    // it('#isLoading observable', async(inject([NgxIsLoadingService], async (service: NgxIsLoadingService) => {
    //   let count=0

    //   service.isLoading().subscribe(value => {
    //     count++

    //     if (count % 2 === 0) {
    //       expect(value).toBeFalsy()
    //     }
    //     else {
    //       expect(value).toBeTruthy()
    //     }
    //   })
      
    //   service.addLoading()
    //   service.addLoading()
    //   service.addLoading()
    //   service.removeLoading()
    //   service.removeLoading()
    //   service.removeLoading()

    //   expect(count).toBe(2)
    // })));
  })

  describe("class key", () => {
    it('#isLoading simple', async(inject([NgxIsLoadingService], async (service: NgxIsLoadingService) => {
      let value = true
      
      value = await service.isLoading({key: NgxIsLoadingService}).pipe(take(1)).toPromise()

      expect(value).toBeFalsy();
    })));

    it('#addLoading & #removeLoading', async(inject([NgxIsLoadingService], async (service: NgxIsLoadingService) => {
      let value = false
      
      service.addLoading({key: NgxIsLoadingService})
      
      value = await service.isLoading({key: NgxIsLoadingService}).pipe(take(1)).toPromise()
      expect(value!).toBeTruthy();

      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value!).toBeFalsy();


      service.addLoading({key: NgxIsLoadingService})
      
      value = await service.isLoading({key: NgxIsLoadingService}).pipe(take(1)).toPromise()
      expect(value!).toBeTruthy();

      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value!).toBeFalsy();


      service.removeLoading({key: NgxIsLoadingService})
      
      value = await service.isLoading({key: NgxIsLoadingService}).pipe(take(1)).toPromise()
      expect(value!).toBeTruthy();

      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value!).toBeFalsy();


      service.removeLoading({key: NgxIsLoadingService})
      
      value = await service.isLoading({key: NgxIsLoadingService}).pipe(take(1)).toPromise()
      expect(value!).toBeFalsy();

      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value!).toBeFalsy();
    })));

    it('#addLoading w/ subscription', async(inject([NgxIsLoadingService], async (service: NgxIsLoadingService) => {
      let value = false

      let subject = new BehaviorSubject(true)

      let subscription = subject.subscribe()
      
      service.addLoading({sub: subscription, key: NgxIsLoadingService})
      
      value = await service.isLoading({key: NgxIsLoadingService}).pipe(take(1)).toPromise()
      expect(value).toBeTruthy();

      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeFalsy();

      service.addLoading({sub: subscription, key: NgxIsLoadingService})
      
      value = await service.isLoading({key: NgxIsLoadingService}).pipe(take(1)).toPromise()
      expect(value).toBeTruthy();

      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeFalsy();

      subject.complete()

      expect(subscription.closed).toBeTruthy()

      value = await service.isLoading({key: NgxIsLoadingService}).pipe(take(1)).toPromise()
      expect(value).toBeFalsy();

      value = await service.isLoading().pipe(take(1)).toPromise()
      expect(value).toBeFalsy();
    })));

    // it('#isLoading observable', async(inject([NgxIsLoadingService], (service: NgxIsLoadingService) => {
    //   new Promise((resolve, reject) => {
    //     let countKey=0
    //     let countDefault=0
  
    //     service.isLoading({key: NgxIsLoadingService}).subscribe(value => {
    //       countKey++
  
    //       if (countKey % 2 === 0) {
    //         expect(value).toBeFalsy()
    //       }
    //       else {
    //         expect(value).toBeTruthy()
    //       }
    //     })
  
    //     service.isLoading().subscribe(() => {
    //       countDefault++
    //     })
        
    //     service.addLoading({key: NgxIsLoadingService})
    //     service.addLoading({key: NgxIsLoadingService})
    //     service.addLoading({key: NgxIsLoadingService})
    //     service.removeLoading({key: NgxIsLoadingService})
    //     service.removeLoading({key: NgxIsLoadingService})
    //     service.removeLoading({key: NgxIsLoadingService})
  
    //     expect(countKey).toBe(2)
    //     expect(countDefault).toBe(0)
    //     resolve()
    //   })
    // })));
  })
});
