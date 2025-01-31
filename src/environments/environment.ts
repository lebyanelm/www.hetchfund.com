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

  // API ENDPOINTS
  NOWPAYMENTS_ENDPOINT: "https://api-sandbox.nowpayments.io/v1",
  
  // API KEYS
  YOCO_PUBLIC_KEY: 'pk_test_611663c4bVOW3qD3ffd4',
  NOWPAYMENTS_API_KEY: '3479V5H-JATM1PZ-NZCMX41-JNNE8XX',
  GOOGLE_CLIENT_ID:
    '625037972362-ue7a36df2d6b76iq086sbrudjkdnnjtb.apps.googleusercontent.com',
  FACEBOOK_CLIENT_ID: '281428964436653',
  H_CAPTCHA_SITEKEY: 'cc1f333d-b759-43b0-84d7-b46ec576cd2e',
  UPLOADCARE_PUBLIC_KEY: '2313d2a4f4ed2887fc7c',
  VERIFIED_AFRICA_PUBLIC_KEY: 'xvlCPQpbxL9q8k7NCs55'
};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
