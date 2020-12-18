import { APP_BASE_HREF } from "@angular/common";
import { TestBed, inject, ComponentFixture } from "@angular/core/testing";
import {
  render as _render,
  screen,
  fireEvent,
  RenderComponentOptions,
} from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { RouterModule } from "@angular/router";

import { Component, ElementRef, Type, ViewChild } from "@angular/core";
import { ScrollPositionDirectiveModule } from "./scroll-position.directive.module";
import { ScrollPositionDirective } from "./scroll-position.directive";
import { SW_SCROLL_POSITION_CONFIG } from "../../scroll-position.config";

function render<ComponentType>(
  component: Type<ComponentType>,
  renderOptions: RenderComponentOptions<ComponentType> = {}
) {
  return _render(component, {
    ...renderOptions,
    imports: [
      RouterModule.forRoot([]),
      ScrollPositionDirectiveModule,
      ...(renderOptions.imports || []),
    ],
    providers: [
      {
        provide: APP_BASE_HREF,
        useValue: "http://localhost",
      },
      ...(renderOptions.providers || []),
    ],
  });
}

@Component({
  selector: "my-test",
  template: `
    <div #theDiv swScrollPosition="the-div" style="height: 100px"></div>
  `,
})
export class SimpleTestComponent {
  @ViewChild("theDiv", { read: ElementRef, static: true }) div: ElementRef;
  @ViewChild(ScrollPositionDirective, { static: true })
  scrollPosition: ScrollPositionDirective;
}

@Component({
  selector: "my-test",
  template: `
    <div
      #theDiv
      [swScrollPosition]="['one', 'two']"
      swScrollPositionDelay="10"
      swScrollPositionSaveMode="OnDestroy"
      style="height: 100px"
    ></div>
  `,
  providers: [
    {
      provide: SW_SCROLL_POSITION_CONFIG,
      useValue: {
        myTest: true,
      },
    },
  ],
})
export class ComplexTestComponent {
  @ViewChild("theDiv", { read: ElementRef, static: true }) div: ElementRef;
  @ViewChild(ScrollPositionDirective, { static: true })
  scrollPosition: ScrollPositionDirective;
}

describe("ScrollPositionService", () => {
  describe("SimpleTestComponent", () => {
    let container: Element;
    let fixture: ComponentFixture<SimpleTestComponent>;
    let component: SimpleTestComponent;

    beforeEach(async () => {
      try {
        ({ container, fixture } = await render(SimpleTestComponent));
      } catch (e) {
        console.error(e);
      }

      component = fixture.componentInstance;
    });

    it("should be created", () => {
      expect(component).toBeTruthy();
    });

    it("has key", () => {
      expect(component.scrollPosition.key).toEqual("the-div");
    });

    it("swScrollPositionDelay", () => {
      expect((component.scrollPosition as any).delay).toEqual(0);
    });

    it("swScrollPositionSaveMode", () => {
      expect(component.scrollPosition.swScrollPositionSaveMode).toEqual(
        "OnNavigate"
      );
    });
  });

  describe("ComplexTestComponent", () => {
    let container: Element;
    let fixture: ComponentFixture<ComplexTestComponent>;
    let component: ComplexTestComponent;

    beforeEach(async () => {
      try {
        ({ container, fixture } = await render(ComplexTestComponent));
      } catch (e) {
        console.error(e);
      }

      component = fixture.componentInstance;
    });

    it("should be created", () => {
      expect(component).toBeTruthy();
    });

    it("has keys", () => {
      expect(component.scrollPosition.key).toEqual(["one", "two"]);
    });

    it("swScrollPositionDelay", () => {
      expect((component.scrollPosition as any).delay).toEqual(10);
    });

    it("swScrollPositionSaveMode", () => {
      expect(component.scrollPosition.swScrollPositionSaveMode).toEqual(
        "OnDestroy"
      );
    });
  });
});
