/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authz from "../authz.js";
import type * as claims from "../claims.js";
import type * as contributors from "../contributors.js";
import type * as emailLog from "../emailLog.js";
import type * as emails from "../emails.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as investors from "../investors.js";
import type * as media from "../media.js";
import type * as perks from "../perks.js";
import type * as polls from "../polls.js";
import type * as programmes from "../programmes.js";
import type * as seed from "../seed.js";
import type * as startups from "../startups.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authz: typeof authz;
  claims: typeof claims;
  contributors: typeof contributors;
  emailLog: typeof emailLog;
  emails: typeof emails;
  events: typeof events;
  files: typeof files;
  investors: typeof investors;
  media: typeof media;
  perks: typeof perks;
  polls: typeof polls;
  programmes: typeof programmes;
  seed: typeof seed;
  startups: typeof startups;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
