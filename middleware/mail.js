const { GoogleClientID, GoogleClientSecret, GoogleRefreshToken } =  require('../config')
const {google} = require('googleapis')
const { oauth2 } = require('googleapis/build/src/apis/oauth2')

const OAuth2 = google.auth.OAuth2

const myOauth2Client = new OAuth2(
   GoogleClientID,
   GoogleClientSecret,
    "https://developers.google.com/oauthplayground"
)

myOauth2Client.setCredentials({
    refresh_token: GoogleRefreshToken
})

const myAccessToken =  myOauth2Client.getAccessToken()

module.exports = myAccessToken