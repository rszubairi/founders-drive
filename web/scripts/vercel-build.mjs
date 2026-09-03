// Vercel build entry — deploys Convex (prod) then builds Next.
// Fails fast with an actionable message instead of a cryptic 401.
import { spawnSync } from "node:child_process";

const key = process.env.CONVEX_DEPLOY_KEY;

if (!key) {
  console.error(`
────────────────────────────────────────────────────────────────────
  CONVEX_DEPLOY_KEY is not set for this Vercel deployment.

  1. Convex dashboard → your project → Settings →
     "Production" deployment → Deploy Keys → Generate Production Deploy Key.
     It looks like:  prod:some-name-123|ey...
     (Do NOT use a key generated on the *Development* deployment —
      that is what caused the 401.)

  2. Vercel → Project → Settings → Environment Variables →
     add   CONVEX_DEPLOY_KEY = <that key>     (Production + Preview)

  3. If CONVEX_DEPLOYMENT or NEXT_PUBLIC_CONVEX_URL are set in the
     Vercel env, DELETE them. \`convex deploy\` sets the URL itself.

  Full steps: web/README.md → "Deploy to Vercel".
────────────────────────────────────────────────────────────────────`);
  process.exit(1);
}

if (process.env.CONVEX_DEPLOYMENT) {
  console.warn(
    "⚠  CONVEX_DEPLOYMENT is set in the Vercel env — remove it. " +
      "With CONVEX_DEPLOY_KEY present it is ignored at best and conflicts at worst.",
  );
}
if (!/^(prod|preview):/i.test(key) && !/^project:/i.test(key)) {
  console.warn(
    '⚠  CONVEX_DEPLOY_KEY does not start with "prod:" / "preview:". ' +
      "If the deploy returns 401, regenerate it from the Production deployment's settings.",
  );
}

const res = spawnSync("npx", ["convex", "deploy", "--cmd", "npm run build"], {
  stdio: "inherit",
  shell: true,
});
process.exit(res.status ?? 1);
