require("dotenv").config();
const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/main",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

router.get("/", (req, res) => {
  res.render("intro");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

router.get(
  "/auth/google/main",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/main");
  }
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/main", (req, res) => {
  res.render("main");
});

router.get("/sections", (req, res) => {
  res.render("sections");
});

router.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      log.error(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("main");
      });
    }
  });
});

router.post("/register", (req, res) => {
  User.register(
    {
      username: req.body.username,
      email: req.body.email,
    },
    req.body.confirm_password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/main");
        });
      }
    }
  );
});

module.exports = router;
