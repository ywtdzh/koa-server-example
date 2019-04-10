# API Reference
## reply format
```js
jsonReply = {
  status: Number,
  error: String || null,
  data: Object || null,
}
```
```js
// When error !== null
data = {
  message: String,
  trace: String,
}
```
### status code:
| status code | description                  |
| ----------- | ---------------------------- |
| 0           | Ok                           |
| 1           | Necessary parameter required |
| -1          | Unknown server error         |

## /api/user/
### status code:
| status code | description                                       |
| ----------- | ------------------------------------------------- |
| 100         | Authentication Failed, wrong username or password |
| 101         | Username has been existed                         |

- /api/user/login
  ```js
  requestBody = {
    username: String,
    password: String,
    deviceIdentifier: String,
  }
  ```
  ```js
  data = {
    token: String,
  }
  ```

- /api/user/logout
  ```js
  requestBody = {
    deviceIdentifier: String,
  }
  ```

  ```http
  HEADER:
  token: required
  ```

  ```js
  data = null
  ```

- /api/user/register

  ```js
  requestBody = {
    username: String,
    description: String,
    password: String, // Hash recommend
    deviceIdentifier: String,
  }
  ```

  ```js
  data = {
    token: String, // auto login
  }
  ```

  