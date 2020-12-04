import { ElementRef, Inject, Injectable, Optional } from "@angular/core";
import { Router } from "@angular/router";
import {
  IScrollPositionServiceConfig,
  SW_SCROLL_POSITION_CONFIG,
} from "./scroll-position.config";

const baseConfig: Required<IScrollPositionServiceConfig> = {
  urlSerializer: (url: string) => url,
};

@Injectable({ providedIn: "root" })
class ScrollPositionStore extends Map<string, number> {}

@Injectable()
export class ScrollPositionService {
  private config: Required<IScrollPositionServiceConfig>;

  constructor(
    private store: ScrollPositionStore,
    private router: Router,
    @Optional()
    @Inject(SW_SCROLL_POSITION_CONFIG)
    config: IScrollPositionServiceConfig
  ) {
    this.config = { ...baseConfig, ...config };
  }

  get(key: string | string[]) {
    return this.store.get(this.getPositionKey(key)) || 0;
  }

  save(key: string | string[], value: number) {
    this.store.set(this.getPositionKey(key), value);
  }

  refresh(el: ElementRef<HTMLElement> | HTMLElement, key: string | string[]) {
    const _el = el instanceof ElementRef ? el.nativeElement : el;

    _el.scrollTop = this.get(key);
  }

  private getPositionKey(base: string | string[]) {
    if (Array.isArray(base)) {
      base = base.sort().join("::");
    }

    return base + this.config.urlSerializer(this.router.url);
  }
}
