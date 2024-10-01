# User Score Management API
This project is a simple Node.js backend using Express and SQLite to manage user scores for different teams. The API allows for user sign-ups, score updates, and retrieving user/team information.

## Running the Server
To start the server locally:
```bash
npm start
```

## Endpoints

### 1. Sign Up a User
- URL: /signup
- Method: POST
- Description: Adds a new user to the database

***Request Example***
```bash
curl -X POST https://kind-hermit-freely.ngrok-free.app/signup \
-H "Content-Type: application/json" \
-d '{"id": "123456", "name": "John", "score": 10, "team": "A"}'
```

### 2. Set User Score
- URL: /set-score
- Method: PATCH
- Description: Sets the score of a specific user to the value provided

***Request Example***
```bash
curl -X POST https://kind-hermit-freely.ngrok-free.app/set-score \
-H "Content-Type: application/json" \
-d '{"id": "123456", "newScore": "0"}'
```

#### Add Score to a User
- URL: /add-score
- Method: POST
- Description: Adds the provided score to score saved for a specific user

***Request Example***
```bash
curl -X POST https://kind-hermit-freely.ngrok-free.app/add-score \
-H "Content-Type: application/json" \
-d '{"id": "123456", "increment": "10"}'
```

#### Subtract Score from a User
- URL: /subtract-score
- Method: POST
- Description: Subtracts the provided score from score saved for a specific user

***Request Example***
```bash
curl -X POST https://kind-hermit-freely.ngrok-free.app/subtract-score \
-H "Content-Type: application/json" \
-d '{"id": "123456", "decrement": "10"}'
```

### 3. Get User Score
- URL: /get-user-score/:id
- Method: GET
- Description: Retrieves the score for the user with specified id

***Request Example***
```bash
curl https://kind-hermit-freely.ngrok-free.app/get-user-score/123456
```

### 4. Get Team Info (Users & Total Score)
- URL: /get-team-score/:team
- Method: GET
- Description: Retrieves users, individual score and total score for specified team

***Request Example***
```bash
curl https://kind-hermit-freely.ngrok-free.app/get-team-score/a
```

### 5. Get All Teams and Users
- URL: /get-teams
- Method: GET
- Description: Retrieves all teams and each of their users

***Request Example***
```bash
 curl https://kind-hermit-freely.ngrok-free.app/get-teams
```

## Deploy

### Ngrok option
This is to enable endpoints to public internet

```bash
ngrok http --url https://kind-hermit-freely.ngrok-free.app 3000
```

### Hotspot option
1. Get private IP for server PC
```bash
ipconfig getiflist
```
2. Provide private IP to the clients so that they can send http request to endpoints like
```bash
http://[SERVER_IP]:[SERVER_PORT]/[API_ENDPOINT]
```


