const router = require("express").Router();
const Alumn = require("../models/Alumn.model.js");

//GET /profile/alumn/create =>create Alumns
router.get("/create", async (req, res, next) => {
  try {
    res.render("alumn/create.hbs");
  } catch (error) {
    next(error);
  }
});

//POST /profile/alumn/create
router.post("/create", async (req, res, next) => {
  try {
    const { firstName, lastName, image } = req.body;
    await Alumn.create({ firstName, lastName, image });
    res.redirect("/create");
  } catch (error) {
    next(error);
  }
});

//GET /profile/:idAlumno/details
router.get("/:idAlumn/details", (req, res, next) => {
  const { firstName, lastName, image } = req.body;

  Alumn.findById(req.params.idAlumn)
    .populate("class")
    .then((alumnDetails) => {
      res.render("alumn/profile.hbs", {
        alumnDetails: alumnDetails,
      });
    })
    .catch((error) => {
      next(error);
    });
});

//GET /profile/:idAlumn/edit
router.get("/:idAlumn/edit", async (req, res, next) => {
  try {
    const editAlumn = await Alumn.findById(req.params.idAlumn).populate(
      "class"
    );
    res.render("alumn/edit.hbs");
  } catch (error) {
    next(error);
  }
});

//POST /profile/:idAlumn/edit
router.post("/:idAlumn/edit", async (req, res, next) => {
  try {
    const { firstName, lastName, image } = req.body;
    await Alumn.findByIdAndUpdate(req.params.idAlumn, {
      firstName,
      lastName,
      image,
    });
    res.redirect("alumn/edit.hbs");
  } catch (error) {
    next(error);
  }
});

//POST "/profile/:idAlumn/delete"
router.post(":idAlumn/delete", async (req, res, next) => {
  try {
    Alumn.findByIdAndDelete(req.params.idAlumn);
    res.redirect("alumn/edit.hbs");
  } catch (error) {
    next(error);
  }
});

module.exports = router;