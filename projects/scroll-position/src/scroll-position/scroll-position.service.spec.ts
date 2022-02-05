import { APP_BASE_HREF } from "@angular/common";
import { TestBed, inject } from "@angular/core/testing";
import { RouterModule } from "@angular/router";

import { ScrollPositionService } from "./scroll-position.service";
import { SW_SCROLL_POSITION_CONFIG } from "./scroll-position.config";
import { ElementRef } from "@angular/core";

function swTest(name: string, fn: (service: ScrollPositionService) => void) {
  return it(name, inject([ScrollPositionService], fn));
}

interface IGetPositionKey {
  getPositionKey(base: string | string[]): string;
}

const TEST_ROUTER_URL = "/";

function configureTestingModule(args: { providers?: any[] } = {}) {
  return TestBed.configureTestingModule({
    imports: [RouterModule.forRoot([])],
    providers: [
      ScrollPositionService,
      {
        provide: APP_BASE_HREF,
        useValue: "http://localhost",
      },
      ...(args.providers || []),
    ],
  });
}

describe("ScrollPositionService", () => {
  beforeEach(() => configureTestingModule());

  swTest("should be created", (service: ScrollPositionService) => {
    expect(service).toBeTruthy();
  });

  describe("config", () => {
    swTest("default", (service: ScrollPositionService) => {
      const config = (service as any).config;

      expect(config).toEqual({
        urlSerializer: expect.any(Function),
      });
    });

    it("user provided", () => {
      const testModule = configureTestingModule({
        providers: [
          {
            provide: SW_SCROLL_POSITION_CONFIG,
            useValue: { myTest: true },
          },
        ],
      });

      const service = testModule.inject(ScrollPositionService);

      const config = (service as any).config;

      expect(config).toEqual({
        urlSerializer: expect.any(Function),
        myTest: true,
      });
    });
  });

  describe("getPositionKey", () => {
    swTest("one key", (_service) => {
      const service = _service as unknown as IGetPositionKey;

      expect(service.getPositionKey("one")).toEqual(`one::${TEST_ROUTER_URL}`);
    });

    swTest("three keys", (_service) => {
      const service = _service as unknown as IGetPositionKey;

      expect(service.getPositionKey(["one", "two", "three"])).toEqual(
        `one::three::two::${TEST_ROUTER_URL}`
      );
    });
  });

  describe("one key", () => {
    swTest("save and get ElementRef", async (service) => {
      const div = document.createElement("div");
      div.style.height = "100px";
      div.scrollTop = 50;
      const el = new ElementRef(div);

      service.save("one", el);

      expect(service.get("one")).toEqual(50);

      div.scrollTop = 0;
      service.refresh("one", el);
      expect(div.scrollTop).toEqual(50);

      div.remove();
    });

    swTest("save and get HTMLElement", (service) => {
      const div = document.createElement("div");
      div.style.height = "100px";
      div.scrollTop = 50;
      const el = div;

      service.save("one", el);

      expect(service.get("one")).toEqual(50);

      div.scrollTop = 0;
      service.refresh("one", el);
      expect(div.scrollTop).toEqual(50);

      div.remove();
    });

    swTest("save and get value", (service) => {
      service.save("one", 50);

      expect(service.get("one")).toEqual(50);

      const el = document.createElement("div");
      el.style.height = "100px";

      service.refresh("one", el);
      expect(el.scrollTop).toEqual(50);

      el.remove();
    });
  });

  describe("three keys", () => {
    swTest("save and get ElementRef", async (service) => {
      const div = document.createElement("div");
      div.style.height = "100px";
      div.scrollTop = 50;
      const el = new ElementRef(div);

      service.save(["one", "two", "three"], el);

      expect(service.get(["one", "two"])).toEqual(0);
      expect(service.get(["two", "one", "three"])).toEqual(50);

      div.scrollTop = 0;
      service.refresh(["one", "three"], el);
      expect(div.scrollTop).toEqual(0);

      div.scrollTop = 0;
      service.refresh(["one", "three", "two"], el);
      expect(div.scrollTop).toEqual(50);

      div.remove();
    });

    swTest("save and get HTMLElement", (service) => {
      const div = document.createElement("div");
      div.style.height = "100px";
      div.scrollTop = 50;
      const el = div;

      service.save(["three", "two", "one"], el);

      expect(service.get(["one", "two"])).toEqual(0);
      expect(service.get(["two", "one", "three"])).toEqual(50);

      div.scrollTop = 0;
      service.refresh(["one", "three"], el);
      expect(div.scrollTop).toEqual(0);

      div.scrollTop = 0;
      service.refresh(["one", "three", "two"], el);
      expect(div.scrollTop).toEqual(50);

      div.remove();
    });

    swTest("save and get value", (service) => {
      service.save(["three", "two", "one"], 50);

      expect(service.get("one")).toEqual(0);
      expect(service.get(["two", "one", "three"])).toEqual(50);

      const el = document.createElement("div");
      el.style.height = "100px";

      service.refresh("one", el);
      expect(el.scrollTop).toEqual(0);

      service.refresh(["one", "two", "three"], el);
      expect(el.scrollTop).toEqual(50);

      el.remove();
    });
  });
});
