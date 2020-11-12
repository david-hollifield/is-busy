import { Component, ViewChild, ElementRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { IsLoadingDirectiveModule } from "./is-loading.directive.module";
import { IsLoadingService } from "../../is-loading.service";
import { IsLoadingDirective } from "./is-loading.directive";

@Component({
  selector: "sw-test",
  template: `
    <div #one swIsLoading></div>
    <button #two swIsLoading="button"></button>
    <div #three swIsLoading="spinner" swIsLoadingSpinner></div>
    <button
      #four
      swIsLoading
      swIsLoadingSpinner="false"
      [swIsLoadingDisableEl]="false"
    ></button>
  `,
})
class TestComponent {
  @ViewChild("one", { static: true, read: ElementRef }) one: ElementRef<
    HTMLDivElement
  >;
  @ViewChild("one", { static: true, read: IsLoadingDirective })
  dirOne: IsLoadingDirective;

  @ViewChild("two", { static: true, read: ElementRef }) two: ElementRef<
    HTMLButtonElement
  >;
  @ViewChild("two", { static: true, read: IsLoadingDirective })
  dirTwo: IsLoadingDirective;

  @ViewChild("three", { static: true, read: ElementRef }) three: ElementRef<
    HTMLDivElement
  >;
  @ViewChild("three", { static: true, read: IsLoadingDirective })
  dirThree: IsLoadingDirective;

  @ViewChild("four", { static: true, read: ElementRef }) four: ElementRef<
    HTMLButtonElement
  >;
  @ViewChild("four", { static: true, read: IsLoadingDirective })
  dirFour: IsLoadingDirective;
}

describe("IsLoadingDirective", () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let isLoadingService: IsLoadingService;

  async function wait(ms: number) {
    fixture.detectChanges();
    await new Promise((res) => setTimeout(res, ms));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    const testingModule = TestBed.configureTestingModule({
      imports: [IsLoadingDirectiveModule],
      declarations: [TestComponent],
    });

    await testingModule.compileComponents();

    isLoadingService = testingModule.get(IsLoadingService);
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should work without args", async () => {
    isLoadingService.add();
    await wait(50);

    // this should do nothing
    isLoadingService.remove({ key: "button" });
    await wait(50);

    // one
    expect(component.one.nativeElement.className).toBe("sw-is-loading");
    expect(component.one.nativeElement.innerHTML).toBe("");
    expect(component.dirOne.isLoading).toBe(true);

    // two
    expect(component.two.nativeElement.disabled).toBe(false);
    expect(component.two.nativeElement.className).toBe("");
    expect(component.two.nativeElement.innerHTML).toBe(
      '<sw-is-loading-spinner class="sw-is-loading-spinner"></sw-is-loading-spinner>'
    );
    expect(component.dirTwo.isLoading).toBe(false);

    // three
    expect(component.three.nativeElement.className).toBe("");
    expect(component.three.nativeElement.innerHTML).toBe(
      '<sw-is-loading-spinner class="sw-is-loading-spinner"></sw-is-loading-spinner>'
    );
    expect(component.dirThree.isLoading).toBe(false);

    // four
    expect(component.four.nativeElement.disabled).toBe(false);
    expect(component.four.nativeElement.className).toBe("sw-is-loading");
    expect(component.four.nativeElement.innerHTML).toBe("");
    expect(component.dirFour.isLoading).toBe(true);

    isLoadingService.remove();
    await wait(50);

    // one
    expect(component.one.nativeElement.className).toBe("");
    expect(component.one.nativeElement.innerHTML).toBe("");
    expect(component.dirOne.isLoading).toBe(false);

    // two
    expect(component.two.nativeElement.disabled).toBe(false);
    expect(component.two.nativeElement.className).toBe("");
    expect(component.two.nativeElement.innerHTML).toBe(
      '<sw-is-loading-spinner class="sw-is-loading-spinner"></sw-is-loading-spinner>'
    );
    expect(component.dirTwo.isLoading).toBe(false);

    // three
    expect(component.three.nativeElement.className).toBe("");
    expect(component.three.nativeElement.innerHTML).toBe(
      '<sw-is-loading-spinner class="sw-is-loading-spinner"></sw-is-loading-spinner>'
    );
    expect(component.dirThree.isLoading).toBe(false);

    // four
    expect(component.four.nativeElement.disabled).toBe(false);
    expect(component.four.nativeElement.className).toBe("");
    expect(component.four.nativeElement.innerHTML).toBe("");
    expect(component.dirFour.isLoading).toBe(false);
  });

  it("should work with key arg", async () => {
    isLoadingService.add({ key: "button" });
    await wait(50);

    // this should do nothing
    isLoadingService.remove();
    await wait(50);

    // one
    expect(component.one.nativeElement.className).toBe("");
    expect(component.one.nativeElement.innerHTML).toBe("");
    expect(component.dirOne.isLoading).toBe(false);

    // two
    expect(component.two.nativeElement.disabled).toBe(true);
    expect(component.two.nativeElement.className).toBe("sw-is-loading");
    expect(component.two.nativeElement.innerHTML).toBe(
      '<sw-is-loading-spinner class="sw-is-loading-spinner"></sw-is-loading-spinner>'
    );
    expect(component.dirTwo.isLoading).toBe(true);

    // three
    expect(component.three.nativeElement.className).toBe("");
    expect(component.three.nativeElement.innerHTML).toBe(
      '<sw-is-loading-spinner class="sw-is-loading-spinner"></sw-is-loading-spinner>'
    );
    expect(component.dirThree.isLoading).toBe(false);

    // four
    expect(component.four.nativeElement.disabled).toBe(false);
    expect(component.four.nativeElement.className).toBe("");
    expect(component.four.nativeElement.innerHTML).toBe("");
    expect(component.dirFour.isLoading).toBe(false);

    isLoadingService.remove({ key: "button" });
    await wait(50);

    // one
    expect(component.one.nativeElement.className).toBe("");
    expect(component.one.nativeElement.innerHTML).toBe("");
    expect(component.dirOne.isLoading).toBe(false);

    // two
    expect(component.two.nativeElement.disabled).toBe(false);
    expect(component.two.nativeElement.className).toBe("");
    expect(component.two.nativeElement.innerHTML).toBe(
      '<sw-is-loading-spinner class="sw-is-loading-spinner"></sw-is-loading-spinner>'
    );
    expect(component.dirTwo.isLoading).toBe(false);

    // three
    expect(component.three.nativeElement.className).toBe("");
    expect(component.three.nativeElement.innerHTML).toBe(
      '<sw-is-loading-spinner class="sw-is-loading-spinner"></sw-is-loading-spinner>'
    );
    expect(component.dirThree.isLoading).toBe(false);

    // four
    expect(component.four.nativeElement.disabled).toBe(false);
    expect(component.four.nativeElement.className).toBe("");
    expect(component.four.nativeElement.innerHTML).toBe("");
    expect(component.dirFour.isLoading).toBe(false);
  });
});
