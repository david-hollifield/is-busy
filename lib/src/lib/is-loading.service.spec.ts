import { TestBed, inject, async } from '@angular/core/testing';

import { IsLoadingService } from './is-loading.service';
import { take } from 'rxjs/operators';
import { BehaviorSubject, defer } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('IsLoadingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [IsLoadingService]
    });
  });

  it('should be created', inject([IsLoadingService], (service: IsLoadingService) => {
    expect(service).toBeTruthy();
  }));

  describe("with isLoading$", () => {
    describe("default key", () => {
      it('#isLoading$ simple', async(inject([IsLoadingService], async (service: IsLoadingService) => {
        let value = await service.isLoading$().pipe(take(1)).toPromise()
        
        expect(value).toBeFalsy();
      })));
  
      it('#addLoading & #removeLoading', async(inject([IsLoadingService], async (service: IsLoadingService) => {
        service.addLoading()
        
        let value = await service.isLoading$().pipe(take(1)).toPromise()
  
        expect(value).toBeTruthy();
  
        service.addLoading()
        
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeTruthy();
  
        service.removeLoading()
        
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeTruthy();
  
        service.removeLoading()
        
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeFalsy();
      })));
  
      it('#addLoading w/ subscription', async(inject([IsLoadingService], async (service: IsLoadingService) => {
        let subject = new BehaviorSubject(true)
  
        let subscription = subject.subscribe()
        
        service.addLoading({sub: subscription})
        
        let value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeTruthy();
  
        service.addLoading({sub: subscription})
        
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeTruthy();
  
        subject.complete()
  
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeFalsy();
      })));
  
      // it('#isLoading$ observable', async(inject([IsLoadingService], async (service: IsLoadingService) => {
      //   let count=0
  
      //   service.isLoading$().subscribe(value => {
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
      it('#isLoading$ simple', async(inject([IsLoadingService], async (service: IsLoadingService) => {
        let value = true
        
        value = await service.isLoading$({key: IsLoadingService}).pipe(take(1)).toPromise()
  
        expect(value).toBeFalsy();
      })));
  
      it('#addLoading & #removeLoading', async(inject([IsLoadingService], async (service: IsLoadingService) => {
        let value = false
        
        service.addLoading({key: IsLoadingService})
        
        value = await service.isLoading$({key: IsLoadingService}).pipe(take(1)).toPromise()
        expect(value!).toBeTruthy();
  
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value!).toBeFalsy();
  
  
        service.addLoading({key: IsLoadingService})
        
        value = await service.isLoading$({key: IsLoadingService}).pipe(take(1)).toPromise()
        expect(value!).toBeTruthy();
  
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value!).toBeFalsy();
  
  
        service.removeLoading({key: IsLoadingService})
        
        value = await service.isLoading$({key: IsLoadingService}).pipe(take(1)).toPromise()
        expect(value!).toBeTruthy();
  
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value!).toBeFalsy();
  
  
        service.removeLoading({key: IsLoadingService})
        
        value = await service.isLoading$({key: IsLoadingService}).pipe(take(1)).toPromise()
        expect(value!).toBeFalsy();
  
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value!).toBeFalsy();
      })));
  
      it('#addLoading w/ subscription', async(inject([IsLoadingService], async (service: IsLoadingService) => {
        let value = false
  
        let subject = new BehaviorSubject(true)
  
        let subscription = subject.subscribe()
        
        service.addLoading({sub: subscription, key: IsLoadingService})
        
        value = await service.isLoading$({key: IsLoadingService}).pipe(take(1)).toPromise()
        expect(value).toBeTruthy();
  
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeFalsy();
  
        service.addLoading({sub: subscription, key: IsLoadingService})
        
        value = await service.isLoading$({key: IsLoadingService}).pipe(take(1)).toPromise()
        expect(value).toBeTruthy();
  
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeFalsy();
  
        subject.complete()
  
        expect(subscription.closed).toBeTruthy()
  
        value = await service.isLoading$({key: IsLoadingService}).pipe(take(1)).toPromise()
        expect(value).toBeFalsy();
  
        value = await service.isLoading$().pipe(take(1)).toPromise()
        expect(value).toBeFalsy();
      })));
  
      // it('#isLoading$ observable', async(inject([IsLoadingService], (service: IsLoadingService) => {
      //   new Promise((resolve, reject) => {
      //     let countKey=0
      //     let countDefault=0
    
      //     service.isLoading$({key: IsLoadingService}).subscribe(value => {
      //       countKey++
    
      //       if (countKey % 2 === 0) {
      //         expect(value).toBeFalsy()
      //       }
      //       else {
      //         expect(value).toBeTruthy()
      //       }
      //     })
    
      //     service.isLoading$().subscribe(() => {
      //       countDefault++
      //     })
          
      //     service.addLoading({key: IsLoadingService})
      //     service.addLoading({key: IsLoadingService})
      //     service.addLoading({key: IsLoadingService})
      //     service.removeLoading({key: IsLoadingService})
      //     service.removeLoading({key: IsLoadingService})
      //     service.removeLoading({key: IsLoadingService})
    
      //     expect(countKey).toBe(2)
      //     expect(countDefault).toBe(0)
      //     resolve()
      //   })
      // })));
    })
  })

  describe("with isLoading", () => {
    describe("default key", () => {
      it('#isLoading$ simple', (inject([IsLoadingService],  (service: IsLoadingService) => {        
        expect(service.isLoading()).toBeFalsy();
      })));
  
      it('#addLoading & #removeLoading', (inject([IsLoadingService],  (service: IsLoadingService) => {
        service.addLoading()
          
        expect(service.isLoading()).toBeTruthy();
  
        service.addLoading()
        
        expect(service.isLoading()).toBeTruthy();
  
        service.removeLoading()
        
        expect(service.isLoading()).toBeTruthy();
  
        service.removeLoading()
        
        expect(service.isLoading()).toBeFalsy();
      })));
  
      it('#addLoading w/ subscription', (inject([IsLoadingService],  (service: IsLoadingService) => {
        let subject = new BehaviorSubject(true)
  
        let subscription = subject.subscribe()
        
        service.addLoading({sub: subscription})
        
        expect(service.isLoading()).toBeTruthy();
  
        service.addLoading({sub: subscription})
        expect(service.isLoading()).toBeTruthy();
  
        subject.complete()

        expect(service.isLoading()).toBeFalsy();
      })));
    })
  
    describe("class key", () => {
      it('#isLoading$ simple', (inject([IsLoadingService],  (service: IsLoadingService) => {  
        expect(service.isLoading({key: IsLoadingService})).toBeFalsy();
      })));
  
      it('#addLoading & #removeLoading', (inject([IsLoadingService],  (service: IsLoadingService) => {        
        service.addLoading({key: IsLoadingService})
        
        expect(service.isLoading({key: IsLoadingService})).toBeTruthy();
        expect(service.isLoading()).toBeFalsy();
  
        service.addLoading({key: IsLoadingService})
        
        expect(service.isLoading({key: IsLoadingService})).toBeTruthy();
        expect(service.isLoading()).toBeFalsy();
  
        service.removeLoading({key: IsLoadingService})
        
        expect(service.isLoading({key: IsLoadingService})).toBeTruthy();  
        expect(service.isLoading()).toBeFalsy();
  
        service.removeLoading({key: IsLoadingService})
        
        expect(service.isLoading({key: IsLoadingService})).toBeFalsy();
        expect(service.isLoading()).toBeFalsy();
      })));
  
      it('#addLoading w/ subscription', (inject([IsLoadingService],  (service: IsLoadingService) => {
        let subject = new BehaviorSubject(true)
  
        let subscription = subject.subscribe()
        
        service.addLoading({sub: subscription, key: IsLoadingService})
        
        expect(service.isLoading({key: IsLoadingService})).toBeTruthy();
        expect(service.isLoading()).toBeFalsy();
  
        service.addLoading({sub: subscription, key: IsLoadingService})
        
        expect(service.isLoading({key: IsLoadingService})).toBeTruthy();
        expect(service.isLoading()).toBeFalsy();
  
        subject.complete()
  
        expect(subscription.closed).toBeTruthy()
  
        expect(service.isLoading({key: IsLoadingService})).toBeFalsy();
        expect(service.isLoading()).toBeFalsy();
      })));
    })
  })
});
