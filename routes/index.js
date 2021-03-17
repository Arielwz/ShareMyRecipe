var express = require("express");
var router = express.Router();

const myDB = require("../db/MyDB.js");

/* 
Some further suggestions for authentication. It's highly recommended to not store the original password in the database
since there's a high risk of password leaks. Try to do some simple hash on your own or include some hash packages such as 
bcrypt, or even passport.js in your future app. :)
*/

// login
router.post("/login", async (req, res) => {
  const userInfo = req.body;

  const userRes = await myDB.searchUser(userInfo);
  if (userRes && userRes.length > 0) {
    req.session.userInfo = userInfo;
    res.send({ success: true });
    return;
  }
  return res.send({ success: false, message: "username or password error" });
});

// regist
router.post("/regist", async (req, res) => {
  const userInfo = req.body;
  const userRes = await myDB.searchUser({ username: userInfo.username });
  if (userRes && userRes.length > 0) {
    return res.send({ success: false, message: "username already exist" });
  }
  const newUser = await myDB.creatUser(userInfo);
  if (newUser) {
    req.session.userinfo = userInfo;
    return res.send({ success: true });
  }

  return res.send({ success: false, message: "regist faield" });
});

// log out
router.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/index.html");
  });
});

// get users
router.get("/getUsers", async (req, res) => {
  const users = await myDB.searchUser({ username: req.query.username });
  res.send({ users });
});

// create recipe
router.post("/createRecipe", async (req, res) => {
  if (!req.session.userInfo) {
    res.redirect("/index.html");
    res.status(401).send({ success: false });
  }
  let uploadPath;
  const recipe = req.body;

  const image = req.files.image;
  recipe.img = "/images/" + image.name;

  await myDB.createRecipe(recipe);

  uploadPath = __dirname + "/../public/images/" + image.name;

  image.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/viewRecipe.html");
  });
});

// check session
router.get("/checkSession", async (req, res) => {
  if (!req.session.userInfo) {
    return res.status(401).send({ success: false });
  }
  res.send({ success: true });
});

// recipe created
router.get("/getRecipes", async (req, res) => {
  if (!req.session.userInfo) {
    return res.status(401).send({ success: false });
  }
  res.send({ recipes: await myDB.getRecipes(), success: true });
});

// write comment
router.post("/writeComment", async (req, res) => {
  console.log(req.session);
  if (!req.session.userInfo) {
    return res.status(401).send({ success: false });
  }
  console.log(req.body);
  await myDB.writeComment(
    req.body.recipeId,
    req.body.comment,
    req.session.userInfo.username
  );
  res.send({ success: true });
});

module.exports = router;
