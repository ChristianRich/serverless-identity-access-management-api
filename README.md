# User Management & Authentication API (S2S)

Serverless API for secure user management and authentication.

## Features

- User management (DynamoDB)
  - Registration
  - Account activation
  - Password reset
  - Querying and updating user records
- Security (Cognito)
  - Authorization using login and access token flow
  - Authentication using ID token verification

Currently only supports sign-up and login using email and password - no social account support (feel free to raise a PR).

## DynamoDB StreamEvents

Used to trigger email dispatcher Lambda for e.g account activation and password reset emails.

## AWS resources

- IAM
- API Gateway
- Lambda
- Cognito
- DynamoDB
- DynamoDB Streams (trigger dispatch emails)

## Service overview

- Users
  - `POST /user`
  - `GET /user`
  - `PUT /user/status`
  - `GET /user/activate/{activationCode}`
- Auth
  - `POST /user/auth`
  - `GET /token/verify/{token}`

## Solutions architecture

TBA

## TODO

- Support social logins
- Miro
- Unit tests
- Data migration script
