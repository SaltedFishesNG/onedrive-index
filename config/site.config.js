/**
 * This file contains the configuration used for customising the website, such as the folder to share,
 * the title, used Google fonts, site icons, contact info, etc.
 */
module.exports = {
  // [OPTIONAL] This is the website icon to the left of the title inside the navigation bar.
  // It should be placed under the /public directory of your GitHub project (not your OneDrive folder!), and referenced here by its relative path to /public.
  // Now you can use FontAwesomeIcon as the logo (it can follow the system's day/night mode to change color), 
  // and the writing format is 'iconPrefix-iconName', e.g. icon: 'fab-github',
  // If the FontAwesomIcon you choose does not display properly, you may need to import it in `src/pages/_app.tsx`.
  // However, the browser's tab bar icon is STILL determined by /public/favicon.ico
  icon: 'fas-cube', // or icon: '/icons/128.png', to use a image.

  // Prefix for KV Storage.
  // You can put this in Vercel's environment variable 'KV_PREFIX' without any modification here.
  kvPrefix: process.env.KV_PREFIX || '',

  // The name of your website. Present alongside your icon.
  // You can put this in Vercel's environment variable 'NEXT_PUBLIC_SITE_TITLE' without any modification here.
  title: process.env.NEXT_PUBLIC_SITE_TITLE || 'OneDrive-Index',

  // [OPTIONAL] This is where you specify the folders that are password protected.
  // It is an array of paths pointing to all the directories in which you have .password set. Check the documentation for details.
  // You can put this in Vercel's environment variable 'NEXT_PUBLIC_PROTECTED_ROUTES' without any modification here.
  protectedRoutes: process.env.NEXT_PUBLIC_PROTECTED_ROUTES ? process.env.NEXT_PUBLIC_PROTECTED_ROUTES.split(',') : [],

  // [OPTIONAL] If you want to display the email used to contact you on the right side of the nav bar, 
  // you can set it in Vercel's environment variable 'NEXT_PUBLIC_EMAIL' without any modification here.
  email: process.env.NEXT_PUBLIC_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_EMAIL}` : '',
  
  // [OPTIONAL] This is an array of names and links for setting your social information and links.
  // In the latest update, all brand icons inside font awesome is supported and the icon to render is based on the name you provide. See the documentation for details.
  links: [
    {
      name: 'GitHub',
      link: 'https://github.com/SaltedFishesNG/onedrive-index/',
    },
  ],
  
  // [OPTIONAL] This represents the maximum number of items that one directory lists, pagination supported.
  // Do note that this is limited up to 200 items by the upstream OneDrive API.
  maxItems: 200,

  // This is a day.js-style datetime format string to format datetimes in the app. Ref to
  // https://day.js.org/docs/en/display/format for detailed specification. The default value is ISO 8601 full datetime
  // without timezone and replacing T with space.
  datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
}
