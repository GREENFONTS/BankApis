# BankApis
Bank Api which has the functionalities similar to the transactions done by customers such as deposit, withdraw, tranfers and list of transactions, also provides functionalities for the banker to add or remove customers from the system and also revert failed transactions. A standard backend developed routes using expressJs 

Interaction  with the endpoints can be done using fetch, Axios, e.t.c

## Endpoint 
```` 
curl -x GET
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
   \
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
   \
  -d '{
    "email": "email@gmail.com",
    "password": "123456"
}'
````
##### Response
````
    Login Successful
````

#### Create User
##### Request
```` 
curl -x POST \
  -H 'Content-Type: application/json' \
   \
  -d '{
    "email": "email@gmail.com",
    "password": "123456"
}'
````
##### Response
````
    Login Successful
````