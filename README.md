# Anake Lodge website

The website for Anake Lodge, Cape Maclear, Lake Malawi. It is built for **GitHub Pages**, which is free. GitHub builds the site automatically from these files each time something changes.

- **Pages:** Home, Gallery (41 photos with filters and a full-screen viewer), Booking, Our story, and a 404 page
- **Bookings** go to **anakelodge@gmail.com** (by email) and to **WhatsApp +265 888 743 955**
- **Admin panel:** add or remove photos and change text, prices and rooms without touching any code
- **SEO:** each page has its own Google title and description, plus Google business data (Hotel, FAQ, Gallery, Breadcrumbs), a sitemap, robots.txt and social-sharing images

---

## 1. Put the site on GitHub (about 10 minutes)

1. Create a free account at https://github.com, then create a new repository, for example `anake-lodge`. Make it **Public**.
2. Click **"uploading an existing file"**. Drag **everything inside this folder** into the page, including the hidden `.pages.yml` file (on a Mac, press Cmd+Shift+. to show hidden files). Then click **Commit changes**.
3. In the repository, go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, set the branch to **main** and the folder to **/ (root)**, then click **Save**.
4. After a minute or two the site will be live at `https://YOUR-USERNAME.github.io/anake-lodge/`.
5. Open `_config.yml` and set the address:
   - While you are testing on GitHub's own address: `url: "https://YOUR-USERNAME.github.io"` and `baseurl: "/anake-lodge"`
   - When www.anakelodge.com points to GitHub (step 3 below): `url: "https://www.anakelodge.com"` and `baseurl: ""`

## 2. Turn on booking emails (one time only)

The first time anyone sends a booking request, **FormSubmit** (a free form service) emails **anakelodge@gmail.com** asking you to *activate* the form. Open that email and click **Activate**. Every request after that arrives in the inbox as a neat table. The guest's email is set as the reply-to address, so you can just press Reply.

To activate it now: open the live Booking page, send a test request, and click the activation link in the email. Check the Spam folder if you can't find it.

Every booking request also opens WhatsApp on the guest's phone or computer, with all the details already typed in for +265 888 743 955. The guest can turn this off with the checkbox on the form.

> To change where bookings go, edit `booking_email` and `whatsapp` in **Contact & settings** in the admin panel, or in `_data/settings.yml`.

## 3. Use www.anakelodge.com

**Before you switch**, copy the photos off the old website. Right now most photos are still loaded from the old site, and they will disappear when it is turned off. On a computer with Python, run this once from inside this folder:

```
python3 tools/localize_images.py
```

This downloads every photo into `images/site/` and updates the links. Then upload (commit) the changes to GitHub.

Next:
1. Go to GitHub **Settings → Pages → Custom domain**, enter `www.anakelodge.com` and save.
2. At your domain company (where you bought anakelodge.com), add these DNS records:
   - `CNAME` record: `www` → `YOUR-USERNAME.github.io`
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Once it works, tick **Enforce HTTPS** in GitHub Pages settings, and set `url`/`baseurl` in `_config.yml` as shown in step 1.5.

## 4. Admin panel: add or remove photos and edit content

The site uses **Pages CMS**, a free admin panel that works with GitHub.

1. Go to **https://app.pagescms.org** and click **Sign in with GitHub**.
2. Choose the `anake-lodge` repository.
3. On the left you will see: **Gallery photos, Rooms & prices, Home page, Things to do, Transfers, Guest reviews, FAQ, About page, Contact & settings**.
   - **Add a gallery photo:** Gallery photos → *Add an entry* → upload the photo, write a caption and choose a category → **Save**
   - **Remove a photo:** click the bin icon next to it → **Save**
   - **Reorder photos:** drag them up or down
   - **Change a price:** Rooms & prices → change the number → **Save**
4. The live website updates by itself about 1–2 minutes after you click **Save**.

To give a staff member access, add them as a collaborator in GitHub under **Settings → Collaborators**.

*Without the admin panel:* every text and photo list is in the `_data/` folder. You can edit those files directly on github.com: click the file, then the pencil icon, then **Commit changes**. Each file has notes at the top explaining it.

## 5. Help Google rank the site (these matter most)

The pages already have the right keywords (Cape Maclear lodge, Cape Maclear accommodation, Lake Malawi lodge, Chembe village, Lake Malawi National Park) and structured data. Google ranking, though, depends a lot on things that happen outside the website:

1. **Google Business Profile:** create or claim "Anake Lodge" at https://business.google.com. Use exactly the same name, address and phone number as the website, add at least 20 photos, and ask every guest for a Google review. This has the single biggest effect on local searches like "lodge Cape Maclear".
2. **Google Search Console:** go to https://search.google.com/search-console, add www.anakelodge.com, then submit `https://www.anakelodge.com/sitemap.xml`.
3. **Listings and links:** get listed on Tripadvisor, Booking.com and Lonely Planet, and in Malawi tourism directories. Link each listing back to the website, and add your Tripadvisor/Facebook/Instagram links in **Contact & settings** so Google connects them.
4. **Fresh content:** add new photos and answer new questions in the FAQ now and then. Keep every photo caption descriptive (for example "Sunset over Thumbi Island from Anake Lodge", not "IMG_2041").

## Folder guide

| Path | What it is |
|---|---|
| `_data/*.yml` | All the content: text, prices, photo lists, contact details |
| `index.html`, `gallery/`, `booking/`, `about/` | Page templates |
| `_includes/`, `_layouts/` | Shared header, footer and SEO tags |
| `assets/css/style.css`, `assets/js/main.js` | Design and interactive features |
| `images/uploads/` | Photos uploaded through the admin panel |
| `.pages.yml` | Admin panel settings |
| `tools/localize_images.py` | Copies photos from the old site into this one |

**Preview on your own computer (optional):** install Ruby, run `bundle install`, then `bundle exec jekyll serve`, and open http://localhost:4000.
