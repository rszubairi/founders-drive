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
import type * as founderAuth from "../founderAuth.js";
import type * as founderProfile from "../founderProfile.js";
import type * as http from "../http.js";
import type * as investorAuth from "../investorAuth.js";
import type * as investorProfile from "../investorProfile.js";
import type * as investors from "../investors.js";
import type * as media from "../media.js";
import type * as mentors from "../mentors.js";
import type * as news from "../news.js";
import type * as outreach from "../outreach.js";
import type * as passwords from "../passwords.js";
import type * as perks from "../perks.js";
import type * as polls from "../polls.js";
import type * as programmes from "../programmes.js";
import type * as seed from "../seed.js";
import type * as startups from "../startups.js";
import type * as stripe from "../stripe.js";

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
  founderAuth: typeof founderAuth;
  founderProfile: typeof founderProfile;
  http: typeof http;
  investorAuth: typeof investorAuth;
  investorProfile: typeof investorProfile;
  investors: typeof investors;
  media: typeof media;
  mentors: typeof mentors;
  news: typeof news;
  outreach: typeof outreach;
  passwords: typeof passwords;
  perks: typeof perks;
  polls: typeof polls;
  programmes: typeof programmes;
  seed: typeof seed;
  startups: typeof startups;
  stripe: typeof stripe;
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
