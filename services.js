/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow
 */

const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;
const AdsInsights = bizSdk.AdsInsights;

let access_token = 'EAAGn8ZC8UjGMBADAeHTw8gzKUHZB1joeQZBtZA5y7ZBwXTzh0sJGrtwxzSff3IZCQZBZA2nXwGhfpqGN3mNf3VcEgukVYk6pYGhLmp9OoK9MkPuAIC44gveNrZAdtfdHR2nzIvZC6Gd1HjHhCDWFt2LstY76FXouaMVvdVzNxhMqGFgDmIf2sbBtwwaBM1yZBGHPQUZD';
let ad_account_id = 'act_451318816611942';
let app_secret = '3ced430ce27fc9e0684c1f0fbbd7a91d';
let app_id = '466141375138915';
const api = bizSdk.FacebookAdsApi.init(access_token);
const account = new AdAccount(ad_account_id);
const showDebugingInfo = true; // Setting this to true shows more debugging info.
if (showDebugingInfo) {
    api.setDebug(true);
}

let ads_insights;
let ads_insights_id;

const logApiCallResult = (apiCallName, data) => {
    console.log(apiCallName);
    if (showDebugingInfo) {
        console.log('Data:' + JSON.stringify(data));
    }
};

const fields = [
    'clicks',
    'impressions',
    'reach',
    'ctr',
    'cpm',
    'cpc',
];
const params = {
    'time_range' : {'since':'2021-12-08','until':'2022-01-07'},
    'filtering' : [],
    'level' : 'campaign',
    'breakdowns' : [],
};
(new AdAccount(ad_account_id)).getInsights(
    fields,
    params
)
    .then((result) => {
        logApiCallResult('ads_insights api call complete.', result);
        ads_insights_id = result[0].id;
    })
    .catch((error) => {
        console.log(error);
    });