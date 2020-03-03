var mongoose = require("mongoose");
var connection = mongoose.createConnection('mongodb://localhost:27017/fmportfolio', {
  useNewUrlParser: true
});

var userSchema = mongoose.Schema({
  username: {
    type: String,
    lowercase: true
  },
  password: {
    type: String,
    trim: true
  },
  google_id: {
    type: String,
    required: true,
    unique: true,
  },
  nickname: {
    type: String,
  },
  email: {
    type: String,
    unique: true
  },
  user_current_page: Number,
});

//var User = module.exports = mongoose.model('users', userSchema);
var User = module.exports = connection.model('users', userSchema);

module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.getUserByUsername = function(username, callback) {
  var query = {
    username: username
  };

  User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
}
