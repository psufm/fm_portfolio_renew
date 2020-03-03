var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");
var multer = require("multer");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var xoauth2 = require("xoauth2");
var config = require("../config.json");
var GOOGLE_CLIENT_ID = config.web.client_id;
var GOOGLE_CLIENT_SECRET = config.web.client_secret;

var Data = require("../models/portfolio");
var User = require("../models/user");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var folder_name = file.fieldname;

    cb(null, "./public/authorized_static/images/" + folder_name + "/"); // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname); // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});

var upload = multer({
  storage: storage
});

var cpUpload = upload.fields([
  {
    name: "concept_images",
    maxCount: 10
  },
  {
    name: "reference_images",
    maxCount: 10
  }
]);

function ensureAuthenticated(req, res, next) {
  console.log("is isAuthenticated");
  console.log(req.isAuthenticated());

  if (req.isAuthenticated()) {
    // 인증 성공
    return next();
  } else {
    res.redirect("/login");
  }
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

function Call_googleStrategy(req, res) {
  console.log(req.headers.host);

  if (req.headers.host == "localhost") {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: "http://localhost:80/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
          //check user table for anyone with a google ID of profile.id

          console.log(accessToken);
          console.log(profile);

          if (
            profile._json.domain == "promotion.co.kr" ||
            profile._json.domain == "fmtech.io"
          ) {
            User.findOne(
              {
                google_id: profile.id
              },
              function(err, user) {
                if (user) {
                  return done(null, user);
                } else {
                  var google_user = new User({
                    username: profile.displayName,
                    nickname: profile.name.familyName,
                    google_id: profile.id,
                    email: profile.emails[0].value,
                    user_current_page: 0
                  });

                  google_user.save(function(err, output) {
                    if (err) throw err;

                    console.log(output);

                    return done(null, output);
                  });
                }
              }
            );
          } else {
            return done(null, false);
          }
        }
      )
    );
  } else if (req.headers.host.includes("fmtech.io")) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: "http://portfolio.fmtech.io/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
          //check user table for anyone with a google ID of profile.id

          console.log(accessToken);
          console.log(profile);

          if (
            profile._json.domain == "promotion.co.kr" ||
            profile._json.domain == "fmtech.io"
          ) {
            User.findOne(
              {
                google_id: profile.id
              },
              function(err, user) {
                if (user) {
                  return done(null, user);
                } else {
                  var google_user = new User({
                    username: profile.displayName,
                    nickname: profile.name.familyName,
                    google_id: profile.id,
                    email: profile.emails[0].value,
                    user_current_page: 0
                  });

                  google_user.save(function(err, output) {
                    if (err) throw err;

                    console.log(output);

                    return done(null, output);
                  });
                }
              }
            );
          } else {
            return done(null, false);
          }
        }
      )
    );
  }

  passport.authenticate(
    "google",
    {
      scope: ["https://www.googleapis.com/auth/userinfo.email"]
    },
    function(err, user, info) {
      if (err) throw err;
    }
  )(req, res);
}

// router.get('/auth/google',
//   passport.authenticate('google', {
//     scope: ['https://www.googleapis.com/auth/userinfo.email']
//   }),
//   function(req, res) {
//
//   });

router.get("/auth/google", function(req, res) {
  console.log("auth/google");

  Call_googleStrategy(req, res);
});

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    console.log(req.user);
    res.redirect("/");
  }
);

router.get("/load_data", function(req, res) {
  console.log("load_data");

  if (req.isAuthenticated()) {
    Data.find()
      .sort({
        proj_category: 1,
        proj_start_date: -1
      })
      .exec(function(err, output) {
        User.findOne({
          email: req.user.email
        }).exec(function(err, user) {
          if (err) throw err;

          var sort_category = [];
          var order_keyword = [
            "국가 대형 프로젝트 및 대규모 이벤트",
            "기업문화 이벤트 및 마케팅",
            "브랜드 인지도 및 체험",
            "연출행사",
            "사내 이벤트 및 캠페인",
            "브랜드 유통 채널 마케팅"
          ];

          for (var i = 0; i < order_keyword.length; i++) {
            for (var j = 0; j < output.length; j++) {
              if (output[j].proj_category == order_keyword[i]) {
                sort_category.push(output[j]);
              }
            }
          }

          if (req.user.email.includes("fmtech.io")) {
            res.json({
              data: sort_category,
              isAdmin: true,
              email: req.user.email,
              current_page: user.user_current_page
            });
          } else {
            res.json({
              data: sort_category,
              isAdmin: false,
              email: req.user.email,
              current_page: user.user_current_page
            });
          }
        });
      });
  } else {
    res.json({});
  }
});

router.get("/get_modify_data", function(req, res) {
  console.log("get_modify_data");

  if (req.isAuthenticated()) {
    Data.findOne({
      _id: req.query._id
    }).exec(function(err, output) {
      if (
        req.user.email.includes("fmtech.io") ||
        req.user.email == output.regist_email
      ) {
        res.json({
          data: output,
          isAdmin: true
        });
      } else {
        res.json({
          data: output,
          isAdmin: false
        });
      }
    });
  } else {
    res.json({});
  }
});

router.post("/regist", cpUpload, function(req, res) {
  console.log("regist");

  var concept_images = [];
  var reference_images = [];

  console.log(req.body);

  if (req.files.concept_images != undefined) {
    for (var i = 0; i < req.files.concept_images.length; i++) {
      concept_images.push(req.files.concept_images[i].originalname);
    }
  }

  if (req.files.reference_images != undefined) {
    for (var i = 0; i < req.files.reference_images.length; i++) {
      reference_images.push(req.files.reference_images[i].originalname);
    }
  }

  if (req.isAuthenticated()) {
    var data = Data({
      proj_category: req.body.proj_category,
      proj_division: req.body.proj_division,
      proj_title: req.body.proj_title,
      proj_detail: req.body.proj_detail,
      proj_start_date: req.body.proj_start_date,
      proj_end_date: req.body.proj_end_date,
      proj_location: req.body.proj_location,
      proj_subject: req.body.proj_subject,
      proj_target: req.body.proj_target,
      concept_images: concept_images,
      reference_images: reference_images,
      regist_email: req.user.email
    });

    data.save(function(err, output) {
      if (err) throw err;

      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

router.post("/modify", cpUpload, function(req, res) {
  console.log("modify");

  console.log(req.body);

  if (req.isAuthenticated()) {
    //1. 기존에 이미지를 지운다.
    //2. 새로운 이미지를 추가한다.
    // req.body.modify_images_concept;

    var concept_images = [];
    var reference_images = [];

    if (req.files.concept_images != undefined) {
      for (var i = 0; i < req.files.concept_images.length; i++) {
        concept_images.push(req.files.concept_images[i].originalname);
      }
    }

    if (req.files.reference_images != undefined) {
      for (var i = 0; i < req.files.reference_images.length; i++) {
        reference_images.push(req.files.reference_images[i].originalname);
      }
    }

    Data.findOne({
      _id: req.body._id
    }).exec(function(err, output) {
      var modify_images_concept = [];
      var modify_images_reference = [];

      if (req.body.modify_images_concept != undefined) {
        for (var i = 0; i < req.body.modify_images_concept.length; i++) {
          modify_images_concept.push(
            output.concept_images[req.body.modify_images_concept[i]]
          );
        }
      }

      if (req.body.modify_images_reference != undefined) {
        for (var i = 0; i < req.body.modify_images_reference.length; i++) {
          modify_images_reference.push(
            output.reference_images[req.body.modify_images_reference[i]]
          );
        }
      }

      if (
        req.user.email.includes("fmtech.io") ||
        req.user.email == output.regist_email
      ) {
        Data.update(
          {
            _id: req.body._id
          },
          {
            $pull: {
              concept_images: {
                $in: modify_images_concept
              },
              reference_images: {
                $in: modify_images_reference
              }
            }
          },
          function(err, update) {
            console.log(update);

            Data.update(
              {
                _id: req.body._id
              },
              {
                $pull: {
                  concept_images: null,
                  reference_images: null
                }
              },
              function(err, update) {
                Data.updateOne(
                  {
                    _id: req.body._id
                  },
                  {
                    $set: {
                      proj_category: req.body.proj_category,
                      proj_division: req.body.proj_division,
                      proj_title: req.body.proj_title,
                      proj_detail: req.body.proj_detail,
                      proj_start_date: req.body.proj_start_date,
                      proj_end_date: req.body.proj_end_date,
                      proj_location: req.body.proj_location,
                      proj_target: req.body.proj_target
                    },
                    $push: {
                      concept_images: concept_images,
                      reference_images: reference_images
                    }
                  },
                  function(err, update) {
                    console.log(update);

                    res.json({
                      modify: true
                    });
                  }
                );
              }
            );
          }
        );
      } else {
        // you are not register

        res.json({
          modify: false
        });
      }
    });
  } else {
    res.redirect("/");
  }
});

router.post("/image_add", cpUpload, function(req, res) {
  console.log("image_add");
  console.log(req);

  if (req.isAuthenticated()) {
    //1. 새로운 이미지를 추가한다.
    // req.body.modify_images_concept;

    var concept_images = [];
    var reference_images = [];

    if (req.files.concept_images != undefined) {
      for (var i = 0; i < req.files.concept_images.length; i++) {
        concept_images.push(req.files.concept_images[i].originalname);
      }
    }

    if (req.files.reference_images != undefined) {
      for (var i = 0; i < req.files.reference_images.length; i++) {
        reference_images.push(req.files.reference_images[i].originalname);
      }
    }

    Data.findOne({
      _id: req.body._id
    }).exec(function(err, output) {
      Data.update(
        {
          _id: req.body._id
        },
        {
          $push: {
            concept_images: concept_images,
            reference_images: reference_images
          }
        },
        function(err, update) {
          console.log(update);

          res.json({
            modify: true
          });
        }
      );
    });
  } else {
    res.json({
      modify: false
    });
  }
});

router.post("/image_remove", function(req, res) {
  console.log("image_remove");

  var remove_image_index =
    req.body.remove_image_type + "_images." + req.body.remove_image_index;

  console.log(remove_image_index);

  if (req.isAuthenticated()) {
    Data.findOne({
      _id: req.body.remove_image_id
    }).exec(function(err, output) {
      if (
        req.user.email.includes("fmtech.io") ||
        req.user.email == output.regist_email
      ) {
        if (req.body.remove_image_type == "concept") {
          Data.update(
            {
              _id: req.body.remove_image_id
            },
            {
              $pull: {
                concept_images: {
                  $in: output.concept_images[req.body.remove_image_index]
                }
              }
            },
            function(err, update) {
              console.log(update);

              Data.update(
                {
                  _id: req.body.remove_image_id
                },
                {
                  $pull: {
                    concept_images: null
                  }
                },
                function(err, update) {
                  res.json({
                    remove: true
                  });
                }
              );
            }
          );
        } else if (req.body.remove_image_type == "reference") {
          Data.update(
            {
              _id: req.body.remove_image_id
            },
            {
              $pull: {
                reference_images: {
                  $in: output.reference_images[req.body.remove_image_index]
                }
              }
            },
            function(err, update) {
              console.log(update);

              Data.update(
                {
                  _id: req.body.remove_image_id
                },
                {
                  $pull: {
                    reference_images: null
                  }
                },
                function(err, update) {
                  res.json({
                    remove: true
                  });
                }
              );
            }
          );
        }
      } else {
        res.json({
          remove: false
        });
      }
    });
  } else {
    res.json({
      remove: false
    });
  }
});

router.post("/save_current_page", function(req, res) {
  console.log("save_current_page");

  if (req.isAuthenticated()) {
    User.updateOne(
      {
        email: req.user.email
      },
      {
        $set: {
          user_current_page: req.body.current_page
        }
      },
      function(err, output) {
        if (err) throw err;

        res.json({
          save_current_page: true
        });
      }
    );
  } else {
    res.json({
      save_current_page: false
    });
  }
});

router.delete("/delete", function(req, res) {
  console.log("delete");

  if (req.isAuthenticated()) {
    Data.findOne(
      {
        _id: req.body._id
      },
      function(err, output) {
        if (
          req.user.email.includes("fmtech.io") ||
          req.user.email == output.regist_email
        ) {
          Data.deleteOne(
            {
              _id: req.body._id
            },
            function(err) {
              if (err) throw err;

              console.log("delete complete");

              res.json({
                delete: true
              });
            }
          );
        } else {
          // you are not register`

          res.json({
            delete: false
          });
        }
      }
    );
  } else {
    res.json({
      delete: false
    });
  }
});

router.get("/login", function(req, res) {
  console.log("/login");
  res.sendFile(path.join(__dirname, "../public/static/login.html"));
});

router.get("/", ensureAuthenticated, function(req, res) {
  console.log("/");
  res.sendFile(path.join(__dirname, "../public/authorized_static/main.html"));
});

router.get("/logout", function(req, res) {
  User.updateOne(
    {
      email: req.user.email
    },
    {
      $set: {
        user_current_page: 0
      }
    },
    function(err, output) {
      if (err) throw err;

      req.logout();
      res.clearCookie("sid"); // 세션 쿠키 삭제
      res.redirect("/login");
    }
  );
});

module.exports = router;
