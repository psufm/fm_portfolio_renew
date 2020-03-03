import session from "express-session";

export const connectSession = () => {
  return session({
    key: "sid",
    secret: "secret",
    saveUninitialized: false,
    resave: true,
    cookie: {
      // cookie가 사라지는 시간
      maxAge: 3000 * 1000
    }
  });
};
