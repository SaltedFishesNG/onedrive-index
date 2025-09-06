This project is a fork from [iRedScarf/onedrive-index](https://github.com/iRedScarf/onedrive-index).

&copy; 2021-2023 [spencer woo](https://github.com/spencerwooo)

&copy; 2023 [iRedScarf](https://github.com/iRedScarf)

---

**Getting Started**

1. Get the clientId and clientSecret as described in the document <https://ovi.swo.moe/docs/advanced>.
2. [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSaltedFishesNG%2Fonedrive-index&env=USER_PRINCIPAL_NAME,CLIENT_SECRET,CLIENT_ID&project-name=onedrive-index&repository-name=onedrive-index)
3. Import to Vercel and add an Upstash integration.
4. Trigger a redeploy.


**Necessary Variables:**

`USER_PRINCIPAL_NAME` -> Your OneDrive account.

`CLIENT_ID` -> The client ID of the app you registered in Microsoft Azure.

`CLIENT_SECRET` -> The client secret of the app registered in Microsoft Azure.

**Optional Variables:**

`NEXT_PUBLIC_SITE_TITLE` -> Title of the display page.

`BASE_DIRECTORY` -> The OneDrive directory you want to share.

`NEXT_PUBLIC_PROTECTED_ROUTES` -> The path of the folder that needs password access, Format: `/route1,/route2`.

`NEXT_PUBLIC_EMAIL` -> Contact Email displayed in the upper right corner.

`KV_PREFIX` -> Prefix for KV storage (key-value pair storage). Upstash provides only one Redis database for free. If you are deploying more than one, you can set different values for each so there are no conflicts.