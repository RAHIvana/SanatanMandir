# Pointing shrisanatanmandir.org at the new website

For whoever holds the **GoDaddy** login for the domain. Takes about 10 minutes of clicking; the change itself can take up to an hour to be visible everywhere (occasionally longer).

Nothing here touches the old hosting until the last step, so the old site keeps working while you set this up.

## Step 1 — DNS records at GoDaddy

1. Sign in at godaddy.com → **My Products** → next to *shrisanatanmandir.org* click **DNS** (or *Manage DNS*).
2. Find the existing **A** record whose *Name* is `@`. Edit it so its value is `185.199.108.153`. Then add three more **A** records with Name `@` and these values (one record each):

   | Type | Name | Value | TTL |
   | --- | --- | --- | --- |
   | A | @ | 185.199.108.153 | 1 hour |
   | A | @ | 185.199.109.153 | 1 hour |
   | A | @ | 185.199.110.153 | 1 hour |
   | A | @ | 185.199.111.153 | 1 hour |

   If there are other A records for `@` pointing at the old GoDaddy hosting, delete those (only after adding the four above).

3. Find the **CNAME** record with Name `www`. Edit it (or add it) so its value is:

   | Type | Name | Value | TTL |
   | --- | --- | --- | --- |
   | CNAME | www | rahivana.github.io | 1 hour |

4. If GoDaddy shows a "Forwarding" section for the domain, make sure it is **off** (forwarding would fight with the records above).

Leave every other record alone — especially **MX** or **TXT** records, which handle email.

## Step 2 — Tell GitHub about the domain

Done by Raju (or anyone with access to the GitHub repository):

1. Add a file named `CNAME` (no extension) to the `src/` folder containing exactly one line:

   ```
   shrisanatanmandir.org
   ```

   and add this line to `eleventy.config.js` next to the other passthrough copies so it ends up in the built site:

   ```js
   eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
   ```

   Commit and push.

2. On github.com: **Settings → Pages → Custom domain**, type `shrisanatanmandir.org`, click **Save**. GitHub checks the DNS (a green check appears once the records from Step 1 have spread).
3. Once the check passes, tick **Enforce HTTPS**. The certificate is issued automatically; it may take up to an hour to become available.

## Step 3 — Verify

- https://shrisanatanmandir.org and https://www.shrisanatanmandir.org both open the new site with a padlock.
- The old address https://rahivana.github.io/SanatanMandir/ now redirects to the real domain.

## Step 4 — Old hosting

The old site's GoDaddy *hosting* plan (separate from the domain registration) can be cancelled once the new site has been live for a week or two. The domain registration itself must stay, and so must the email setup if the temple uses GoDaddy for email. Keep the old `application.shrisanatanmandir.org` server only if the Stripe donation flow from the old site is still wanted; the new Donate page does not use it.

## If something goes wrong

Change the four A records back to whatever they were before (take a screenshot of the DNS page before editing) and the old site returns within the hour.
