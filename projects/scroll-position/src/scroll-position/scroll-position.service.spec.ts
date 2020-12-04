import { APP_BASE_HREF } from "@angular/common";
import { TestBed, inject } from "@angular/core/testing";
import { RouterModule } from "@angular/router";

import { ScrollPositionService } from "./scroll-position.service";

describe("ScrollPositionService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [
        ScrollPositionService,
        {
          provide: APP_BASE_HREF,
          useValue: "http://localhost",
        },
      ],
    });
  });

  it("should be created", inject(
    [ScrollPositionService],
    (service: ScrollPositionService) => {
      expect(service).toBeTruthy();
    }
  ));
});
