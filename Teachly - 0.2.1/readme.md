# teaching website


list of tasks
  >in the auth route, with the 3 different register/login types, users can access the same account in multiple ways, stop that

  >in the auth route, there isn't a lot of protection for bad input, what happens when a logged in user GETS emailValidation?

  >changing the html tags dimensions to auto might be a good idea, it could add a lot of resizing power

  >reviews for students as well as tutors

  >make it so that the css is sent seperately, so that the loading time is better, also js

  >change all packages to the better import solution 

  >make more custom images

  >protect the db from malicious data

  >all requests are exploitable, add protection

  >make is so that redirects are hidden, such as included in the js, not the url

  >add error handling

  > express.js has an advanced page, it contains stuff like optimizations and caching


  >the db schema needs works, for instance the "user settings" is praciticly empty

  >using local storage to store images and css

  >I gotta fix the non user navbar

  >change the en-us to en in everything

  >searchbar https://www.youtube.com/watch?v=szfUbzsKvtE


This app uses Node.js/Express/MongoDB with Google OAuth for authentication

## Usage

Add your mongoDB URI and Google OAuth credentials to the config.env file

```
# Install dependencies
npm install

# Run in development
npm run dev

# Run in production
npm start
```
