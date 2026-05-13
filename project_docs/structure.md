# Structure

```
project/
├── app.js              Express app entry point
├── bin/
│   └── www             HTTP server startup script
├── models/
│   └── db.js           MongoDB connection and collection helper
├── routes/
│   ├── index.js        GET routes: /, /signin, /signup, /dashboard, /users/logout
│   ├── users.js        POST routes: /signup/submit, /signin/submit
│   └── quiz.js         POST routes: /quiz/generate, /quiz/submit (Groq API)
├── views/
│   ├── partials/
│   │   └── header.ejs  Bootstrap navbar partial
│   ├── signup.ejs
│   ├── signin.ejs
│   ├── dashboard.ejs    Main quiz page (generation, answering, results)
│   └── error.ejs
├── public/
│   └── stylesheets/
│       └── style.css
├── .env                ATLAS_URI, GROQ_API_KEY, SESSION_SECRET
├── package.json
└── README.md
```
