import { InjectionToken } from "@angular/core";

export const SW_SCROLL_POSITION_CONFIG = new InjectionToken(
  "SW_SCROLL_POSITION_CONFIG"
);

/**
 * Config object for ScrollPositionService
 */
export interface IScrollPositionServiceConfig {
  urlSerializer?: (url: string) => string;
}
