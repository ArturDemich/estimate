/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(protected)'}/document` | `/document`; params?: Router.UnknownInputParams; } | { pathname: `${'/(protected)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(protected)'}/plant` | `/plant`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/login`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(protected)'}/document` | `/document`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(protected)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(protected)'}/plant` | `/plant`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/login${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(protected)'}/document${`?${string}` | `#${string}` | ''}` | `/document${`?${string}` | `#${string}` | ''}` | `${'/(protected)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(protected)'}/plant${`?${string}` | `#${string}` | ''}` | `/plant${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/login`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(protected)'}/document` | `/document`; params?: Router.UnknownInputParams; } | { pathname: `${'/(protected)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(protected)'}/plant` | `/plant`; params?: Router.UnknownInputParams; };
    }
  }
}
