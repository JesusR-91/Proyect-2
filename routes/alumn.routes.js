const router = require("express").Router();
const Alumn = require("../models/Alumn.model.js");
const Class = require("../models/Class.model.js");
const User = require("../models/User.model.js");
const Comment = require("../models/Comment.model.js");
const uploader = require("../middlewares/cloudinary.middleware.js");

const { isLoggedIn } = require("../middlewares/middlewares");

router.use(isLoggedIn);

//GET /alumn/:idAlumno/details
router.get("/:idAlumn/details", async (req, res, next) => {
  try {
    //variables
    const foundUser = await User.findById(req.session.user._id).populate(
      "tutorClass"
    );
    const alumnDetails = await Alumn.findById(req.params.idAlumn);
    const {_id, firstName, lastName, image, classroom, contactEmail, contactPerson, contactPhone} = alumnDetails;

    //tutor finding
    const { tutorClass } = foundUser;
    let isTutor = false;
    if (
      tutorClass !== undefined &&
      `${tutorClass.name} ${tutorClass.subName}` === classroom
    ) {
      isTutor = true;
    }

    const alumnComments = await Comment.find({
      madeTo: req.params.idAlumn,
    }).populate("madeBy");

    res.render("alumn/profile.hbs", {
      _id,
      firstName,
      lastName,
      image,
      classroom,
      contactEmail,
      contactPerson,
      contactPhone,
      isTutor,
      alumnComments,
    });
  } catch (error) {
    next(error);
  }
});

//GET /alumn/:idAlumn/edit
router.get("/:idAlumn/edit", async (req, res, next) => {
  try {
    const editAlumn = await Alumn.findById(req.params.idAlumn);
    const alumnClass = await Class.findOne({
      $and: [
        { name: editAlumn.classroom[0] },
        { subName: editAlumn.classroom[2] },
      ],
    });
    res.render("alumn/edit.hbs", { editAlumn, alumnClass });
  } catch (error) {
    next(error);
  }
});

//POST /alumn/:idAlumn/edit
router.post(
  "/:idAlumn/edit",
  uploader.single("image"),
  async (req, res, next) => {
    try {
      const {firstName, lastName, classroom, contactEmail, contactPerson, contactPhone, name, subName} = req.body;
      let profileImg = "";
      if (req.file === undefined) {
        profileImg = undefined;
      } else {
        profileImg = req.file.path;
      }

      const editAlumn = await Alumn.findById(req.params.idAlumn);
      let alumnClass = await Class.findOne({
        $and: [
          { name: editAlumn.classroom[0] },
          { subName: editAlumn.classroom[2] },
        ],
      });
      const newClass = await Class.findOne({
        $and: [{ name: name }, { subName: subName }],
      });

      if (newClass !== alumnClass) {
        await Class.findByIdAndUpdate(alumnClass._id, {
          $pull: { alumns: editAlumn._id },
        });
        await Class.findByIdAndUpdate(newClass._id, {
          $push: { alumns: editAlumn._id },
        });
      }

      await Alumn.findByIdAndUpdate(req.params.idAlumn, {
        firstName,
        lastName,
        image: profileImg,
        classroom: `${name} ${subName}`,
        contactEmail,
        contactPerson,
        contactPhone,
      });
      res.redirect(`/alumn/${req.params.idAlumn}/details`);
    } catch (error) {
      next(error);
    }
  }
);

//GET '/alumn/create'

router.get("/create", async (req, res, next) => {
  try {
    res.render("alumn/create");
  } catch (error) {
    next(error);
  }
});

//POST '/alumn/create'

router.post("/create", uploader.single("image"), async (req, res, next) => {
  try {
    const {firstName, lastName, classroom, contactEmail, contactPerson, contactPhone} = req.body;

    let profileImg = "";
    if (req.file === undefined) {
      profileImg = undefined;
    } else {
      profileImg = req.file.path;
    }
    const alumnClass = await Class.findOne({
      $and: [{ name: classroom[0] }, { subName: classroom[2] }],
    });
    const newAlumn = await Alumn.create({firstName, lastName, classroom, contactEmail, contactPerson, contactPhone, image: profileImg});
    await Class.findByIdAndUpdate(alumnClass._id, {
      $push: { alumns: newAlumn._id },
    });
    res.redirect("/class");
  } catch (error) {
    next(error);
  }
});

//POST "/alumn/:idAlumn/delete"

router.post("/:idAlumn/delete", async (req, res, next) => {
  try {
    await Alumn.findByIdAndDelete(req.params.idAlumn);
    res.redirect("/class");
  } catch (error) {
    next(error);
  }
});

//GET "/alumn/:idAlumn/newcomment"

router.get("/:idAlumn/newcomment", async (req, res, next) => {
  try {
    const alumn = await Alumn.findById(req.params.idAlumn);
    res.render("alumn/newcomment", alumn);
  } catch (error) {
    next(error);
  }
});

// POST "/alumn/:idAlumn/newcomment"

router.post("/:idAlumn/newcomment", async (req, res, next) => {
  try {
    const { comment } = req.body;
    await Comment.create({comment, madeBy: req.session.user._id, madeTo: req.params.idAlumn});

    res.redirect(`/alumn/${req.params.idAlumn}/details`);
  } catch (error) {
    next(error);
  }
});

//GET '/alumn/find-list/:alumn'

router.get("/find-list/:alumn", async (req, res, next) => {
  try {
    const alumns = await Alumn.find({ firstName: req.params.alumn });

    res.render("alumn/find-list.hbs", { alumns });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
