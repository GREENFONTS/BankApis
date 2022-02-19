# BankApis
Bank Api which has the functionalities similar to the transactions done by customers such as deposit, withdraw, tranfers and list of transactions, also provides functionalities for the banker to add or remove customers from the system and also revert failed transactions. A standard backend developed routes using expressJs 

Interaction  with the endpoints can be done using fetch, Axios, e.t.c

## Endpoint 
```` 
curl -x GET https://stan-bank-apis.herokuapp.com/
````

## Admin 
#### Admin Priviledges
- Create Users Accounts
- Get all User Accounts
- Delete User Accounts
- Disable Users Accounts
- Reverse User Transactions

### Admin Endpoints

#### Admin Registration 

##### Request
```` 
curl -x POST \
  -H 'Content-Type: application/json' \
   https://stan-bank-apis.herokuapp.com/register \
  -d '{
    "firstName": "firstname",
    "lastName": "lastname",
    "username": "username",
    "email": "email@gmail.com",
    "password": "123456"
}'
````
##### Response
````
    Registration Successful
````

#### Admin Login 
##### Request
```` 
curl -x POST \
  -H 'Content-Type: application/json' \
  https://stan-bank-apis.herokuapp.com/login \
  -d '{
    "email": "email@gmail.com",
    "password": "123456"
}'
````
##### Response
````
    {token : "6c67493d-8fc2-4cd4-9161-4f1ec11cbe69"}
````

#### Create User
Only authenticated User with admin role can access this route
##### Request
```` 
curl -x POST \
  -H 'Content-Type: application/json' \
   https://stan-bank-apis.herokuapp.com/addUser \
  -d '{
    "firstName": "firstname",
    "lastName": "lastname",
    "tel": "5161566",
    "balance" : 563",
    "role" : "user"
    "email": "email@gmail.com",
    "password": "123456"
}'
````
##### Response
````
    {"id" : "6c67493d-8fc2-4cd4-9161-4f1ec11cbe69",
    "firstName": "firstname",
    "lastName": "lastname",
    "tel": "5161566",
    "balance" : 563",
    "role" : "user",
    'status" : "active",
    "email": "email@gmail.com",
    "password": "123456",
    "acctNo" : "4984645489"
    }
````

#### Get all Users
Only authenticated User with admin role can access this route
##### Request
```` 
curl -x GET \
-H 'Content-Type: application/json' \
https://stan-bank-apis.herokuapp.com/users
````
##### Response 
````
[
       {
        "id" : "6c67493d-8fc2-4cd4-9161-4f1ec11cbe69",
        "firstName": "firstname",
        "lastName": "lastname",
        "tel": "5161566",
        "balance" : 563",
        "role" : "user",
        'status" : "active",
        "email": "email@gmail.com",
        "password": "123456",
        "acctNo" : "4984645489"
    },
    {
      ...
    },
    ...
    ]
````

#### Delete User
Only authenticated User with admin role can access this route
##### Request
```` 
curl -x POST \
-H 'Content-Type: application/json' \
https://stan-bank-apis.herokuapp.com/deleteUser \
-d '{
    "id": "e89jns-sa6864654d"
}'

````
##### Response
```` 
User with account Number e89jns-sa6864654d deleted
````

#### Disable User
Only authenticated User with admin role can access this route
##### Request
```` 
curl -x GET \
-H 'Content-Type: application/json' \
https://stan-bank-apis.herokuapp.com/disableUser/e89jns-sa6864654d
````
##### Response
```` 
User e89jns-sa6864654d disabled
````

#### Enable User
Only authenticated User with admin role can access this route
##### Request
```` 
curl -x GET \
-H 'Content-Type: application/json' \
https://stan-bank-apis.herokuapp.com/enableUser/e89jns-sa6864654d
````
##### Response
```` 
User e89jns-sa6864654d enabled
````

#### Reverse Transaction
Only authenticated User with admin role can access this route
##### Request
```` 
curl -x POST \
-H 'Content-Type: application/json' \
https://stan-bank-apis.herokuapp.com/reverse \
-d '{
    "acctNo": "5345434465"
}'
````
##### Response
```` 
Transaction with transaction id 5345434465 reversed 
````

### User Endpoints
Only authenticated User with user role can access this routes

#### User Login 
##### Request
```` 
curl -x POST \
  -H 'Content-Type: application/json' \
  https://stan-bank-apis.herokuapp.com/user/login \
  -d '{
    "email": "email@gmail.com",
    "password": "123456"
}'
````
##### Response
````
    {token : "6c67493d-8fc2-4cd4-9161-4f1ec11cbe69"}
````

#### Deposit Money 
##### Request
```` 
curl -x POST \
  -H 'Content-Type: application/json' \
  https://stan-bank-apis.herokuapp.com/user/deposit \
  -d '{
    "acctNo": "216832168",
    "amount": 54700
}'
````
##### Response
````
    Deposit Successful
````

#### Withdraw Money 
##### Request
```` 
curl -x POST \
  -H 'Content-Type: application/json' \
  https://stan-bank-apis.herokuapp.com/user/withdraw \
  -d '{
    "acctNo": "216832168",
    "amount": 54700
}'
````
##### Response
````
    Withdrawal Successful
````

#### Transfer Money 
##### Request
```` 
curl -x POST \
  -H 'Content-Type: application/json' \
  https://stan-bank-apis.herokuapp.com/user/transfer \
  -d '{
    "recieverNo": "216832168",
    "amount": 54700
}'
````
##### Response
````
    Transfer Successful
````

#### Get all Transactions
##### Request
```` 
curl -x GET \
-H 'Content-Type: application/json' \
https://stan-bank-apis.herokuapp.com/user/transactions
````
##### Response 
````
[
       {
        "id" : "6c67493d-8fc2-4cd4-9161-4f1ec11cbe69",
        "amount" : 563,
        'status" : "active",
        "time" : "20210117:293049"
        "acctNo" : "4984645489"
    },
    {
      ...
    },
    ...
    ]
````