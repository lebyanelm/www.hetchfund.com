// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // FRONTEND
  frontend: 'http://localhost:8100',

  // TEST: BACKEND SERVICES
  accounts: 'http://localhost:4000/accounts',
  translator: 'http://localhost:4001/translator',
  farmhouse: 'http://localhost:4003/farmhouse',
  media_resources: 'http://localhost:4004/media-resources',

  // API KEYS
  YOCO_PUBLIC_KEY: 'pk_test_611663c4bVOW3qD3ffd4',
  COINBASE_API_KEY: 'e08db390-cb14-4874-9f10-5b946eae56b4',
  GOOGLE_CLIENT_ID:
    '625037972362-ue7a36df2d6b76iq086sbrudjkdnnjtb.apps.googleusercontent.com',
  FACEBOOK_CLIENT_ID: '281428964436653',
  H_CAPTCHA_SITEKEY: '7ab97265-f59a-403d-8526-b71b4ec454b6',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
