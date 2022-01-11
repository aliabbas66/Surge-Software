//Import the express dependency
const express = require('express');

const app = express();              //Instantiate an express app, the main work horse of this server
const port = process.env.PORT || 5000;                  //Save the port number where your server will be listening
app.use(express.json()); // It parses incoming requests with JSON payloads and is based on body-parser


//used for validation
const Joi = require('joi');

// Importing the fb business sdk dependency.
const bizSdk = require('facebook-nodejs-business-sdk');

// Access Token .
let access_token = 'EAAGn8ZC8UjGMBAOJSidJA2dlZChJwnbe2VKJJfYU7waIzaT2RIiEca0v2A2lWrc38kx2oC7SCVEUrkqMH9g31CTB5CLlZAekZCs7qZAHOQm2BUI3nZBdDFfIj1TPoO8ms8rysOer7eXkKExKded1IgNlgnIrRVDBS6l2YzMHErgkYx7IUT8dfKaPQzj0X5jCoYhhuaGpyNYAZDZD';

// Account Id to add.
// let ad_account_id = 'act_451318816611942';
// let ad_account_id = 'act_231039647562725';

// let ad_account_id = 'act_231039647562725';

// Getting Some Objects from fb sdk..
const AdAccount = bizSdk.AdAccount;
const AdsInsights = bizSdk.AdsInsights;
const Campaign = bizSdk.Campaign;

// My App Secrete and app Id.
// let app_secret = '3ced430ce27fc9e0684c1f0fbbd7a91d';
// let app_id = '466141375138915';

// instantiating an api and AdAccount objects.
const api = bizSdk.FacebookAdsApi.init(access_token);


const getfdata = (id, res) => {
    const account = new AdAccount(id);

// Setting this below to true shows more debugging info.
    const showDebugingInfo = true;
    if (showDebugingInfo) {
        api.setDebug(true);
    }

    /*
    * Clicks, Impressions, Reach, CTR, Messages, On-Facebook Leads, CPM, CPC
    * */

// Dummy Endpoints for
// getting campaign and Insight with details ...
// act_231039647562725/campaigns?fields=name,id,daily_budget,insights{clicks,campaign_name,cpc,cpm,reach,spend,ctr,impressions,conversions}

// console.log(account.id);

// fields to get
    const fields = [
        'name',
        'id',
        'daily_budget',
        ' insights{clicks,campaign_name,cpc,cpm,reach,spend,ctr,impressions,conversions}',
    ];

// Parameters to modify the request.
    const params = {
        'time_range' : {'since':'2021-12-08','until':'2022-01-07'},
        'filtering' : [],
        'level' : 'campaign',
        'breakdowns' : [],
    };

    account.getCampaigns(fields, { limit: 10 })
        .then((campaigns) => {
            for (let i = 0; i < campaigns.length; i++) {
                books.push(campaigns[i]._data);
            }
            // console.log(campaigns[0]._data);
            // console.log(campaigns[0]._data.insights);
            res.send(books);
            /*  if (campaigns.length >= 2 && campaigns.hasNext()) {
                  return campaigns.next();
              } else {
                  Promise.reject(
                      new Error('campaigns length < 2 or not enough campaigns')
                  );
              } */
        })
        .catch((error) => {
            console.log(error);
        });

}





app.get('/', (req, res) => {
    res.send('Welcome to Surge Connects.');
});

const books = [

];

app.get('/api/campaignsttt', (req,res)=> {
    res.send(books);
});


app.post('/api/campaigns', (req, res)=> {

    const id = req.query.id;
    getfdata(id, res);
    // books.push(id);
});



app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});