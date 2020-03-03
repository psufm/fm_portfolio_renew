import User from "../models/user";
export const login = (req, res) => {
  res.sendFile(path.join(__dirname, "../public/static/login.html"));
};

export const logout = (req, res) => {
  User.updateOne(
    {
      email: req.user.email
    },
    {
      $set: {
        user_current_page: 0
      }
    },
    logoutLogic
  );
};

export const home = (req, res) => {
  console.log("test home");
  res.send("/home");
};

export const loadData = (req, res) => {};

export const modifyData = (req, res) => {};

const logoutLogic = (err, output) => {
  if (err) throw err;

  req.logout();
  res.clearCookie("sid"); // 세션 쿠키 삭제
  res.redirect("/login");
};
