# Putting the site on GitHub and turning on GitHub Pages

Repository: **https://github.com/RAHIvana/SanatanMandir** (must be **public** for free GitHub Pages).
Project folder on your PC: `C:\Users\rajua\Downloads\Sanatan Mandir Austin\sanatan-mandir-website`

You only do this once. After it, every push publishes the site automatically.

## Part 1 — Get the files into the repository

### Option A: Git in PowerShell (you have an SSH key set up)

Open PowerShell (Start → type *PowerShell*) and paste these lines one block at a time.

```powershell
cd "C:\Users\rajua\Downloads\Sanatan Mandir Austin"
git clone git@github.com:RAHIvana/SanatanMandir.git
```

Copy the project files into the clone (this copies everything, including the hidden `.github` folder, and skips nothing important):

```powershell
robocopy "C:\Users\rajua\Downloads\Sanatan Mandir Austin\sanatan-mandir-website" "C:\Users\rajua\Downloads\Sanatan Mandir Austin\SanatanMandir" /E /XD node_modules _site
```

Put the GitHub Actions workflow file in its place (it was parked in `_setup\` because the tool that wrote the folder cannot create `.github` folders on your PC):

```powershell
cd "C:\Users\rajua\Downloads\Sanatan Mandir Austin\SanatanMandir"
New-Item -ItemType Directory -Force -Path ".github\workflows" | Out-Null
Move-Item -Force "_setup\github-workflow-deploy.yml" ".github\workflows\deploy.yml"
Remove-Item -Recurse -Force "_setup"
```

Commit and push:

```powershell
git add -A
git commit -m "New website: Eleventy site with events, gallery, services, seva, donate, contact"
git branch -M main
git push -u origin main
```

If `git` is not recognised, install it from https://git-scm.com/download/win (defaults are fine), close and reopen PowerShell, and try again. If the SSH clone asks *"Are you sure you want to continue connecting?"*, type `yes`.

### Option B: same thing from WSL

```bash
cd "/mnt/c/Users/rajua/Downloads/Sanatan Mandir Austin"
git clone git@github.com:RAHIvana/SanatanMandir.git
rsync -a --exclude node_modules --exclude _site sanatan-mandir-website/ SanatanMandir/
cd SanatanMandir
mkdir -p .github/workflows && mv _setup/github-workflow-deploy.yml .github/workflows/deploy.yml && rm -rf _setup
git add -A
git commit -m "New website: Eleventy site with events, gallery, services, seva, donate, contact"
git branch -M main
git push -u origin main
```

### Option C: GitHub Desktop (no command line)

1. Install GitHub Desktop from https://desktop.github.com and sign in.
2. **File → Clone repository → RAHIvana/SanatanMandir**, local path `C:\Users\rajua\Downloads\Sanatan Mandir Austin\SanatanMandir`.
3. In File Explorer, open `sanatan-mandir-website`, select everything **except** `node_modules` and `_site` (if present), and copy it into the `SanatanMandir` folder. Then inside `SanatanMandir` create a folder named `.github`, inside it a folder `workflows`, and move `_setup\github-workflow-deploy.yml` there renamed to `deploy.yml` (Explorer may warn about the leading dot — accept). Delete the now-empty `_setup` folder. (Alternative: extract `sanatan-mandir-website.zip` from the chat instead — it already contains `.github\workflows\deploy.yml`.)
4. Back in GitHub Desktop the changes appear on the left. Type a summary (e.g. *New website*), click **Commit to main**, then **Push origin**.

After any option, refresh https://github.com/RAHIvana/SanatanMandir in the browser — you should see `.github`, `src`, `photos`, `docs`, `README.md` and the rest. If `.github` is missing, the workflow file didn't make it and Pages will have nothing to run; repeat the move step.

## Part 2 — Turn on GitHub Pages (two clicks)

1. On the repository page click **Settings** (top tab) → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **GitHub Actions**. That's it — no save button.
3. Click the **Actions** tab. A run called *Build and deploy website* starts (it already ran once when you pushed, and may have failed only because Pages wasn't switched on yet — if so, open it and click **Re-run all jobs**).
4. When the run shows a green check (about 1–2 minutes), the site is live at:

   **https://rahivana.github.io/SanatanMandir/**

That temporary address works until the real domain is moved over (`docs/DOMAIN-SWITCH.md`). It's fine to share it with the committee for review.

## Making changes later

1. Edit files in the `SanatanMandir` folder (or ask Claude to).
2. Push: in PowerShell `git add -A; git commit -m "what changed"; git push` — or in GitHub Desktop, Commit then Push.
3. The Actions tab shows the build; the site updates in a minute or two.

Small edits (a phone number, an event note) can also be made directly on github.com: open the file, click the pencil icon, edit, **Commit changes**. That also triggers a rebuild.

## If the Actions build fails

Open the failed run in the **Actions** tab and read the red step. Common causes:

- A photo file the build can't read (rare; HEIC files are not supported — convert to JPG).
- A typo in a `.json` file in `src/_data/` (a missing comma or quote). The error names the file.

Fix, commit, push again.
