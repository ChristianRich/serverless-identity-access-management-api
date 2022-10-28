# User Management & Authentication API (S2S)

"Out of the box" solution for user management, user sign-ups, account activation, authentication and authorization.

Currently only supports sign-up and login using email and password - no social account support (feel free to raise a PR).

## DynamoDB StreamEvents

Used to trigger other Lambdas to dispatch emails to users for e.g account activation and password reset emails.
Events are triggered when rows are inserted or modified.

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
