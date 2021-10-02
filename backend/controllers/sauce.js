const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  console.log("sauce créée");
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "sauce enregistrée !" }))
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  console.log(req.headers);
  console.log(req.body);
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (sauce.userId !== req.body.userId) {
      res.status(403).json({ message: "requête non autorisée" });
      return;
    }
    const sauceObject = req.file
      ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    )
      .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
      .catch((error) => res.status(400).json({ error }));
  });
};

exports.deleteSauce = (req, res, next) => {
  //supprime l'image (fichier et objet) du dossier images et visuellement
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.likeSauce = (req, res, next) => {
  //Gestion des likes et dislikes
  console.log(req.body);
  const like = req.body.like;
  const userId = req.body.userId;

  Sauce.findOne({ _id: req.params.id }) //on recherche une sauce
    .then((sauce) => {
      if (like === 1) {
        console.log("if");
        // clic sur le like
        if (!sauce.usersLiked.includes(userId)) {
          // si l'user est différent alors on incrémente 1
          sauce.usersLiked.push(userId);
          sauce.likes++;
          sauce
            .save()
            .then(() => res.status(201).json({ message: "Sauce likée" }))
            .catch((error) => res.status(400).json({ error }));
        } else {
          console.log("else");
          //sinon on refuse le clic
          res
            .status(403)
            .json({
              message: "Vous ne pouvez pas liker deux fois la même sauce",
            })
            .catch((error) => res.status(400).json({ error }));
        }
      } else if (like === -1) {
        console.log("elseif");
        // clic sur le dislike
        if (!sauce.usersDisliked.includes(userId)) {
          console.log("if3");
          //si l'user est différent alors on incrémente -1
          sauce.usersDisliked.push(userId);
          sauce.dislikes++;
          sauce
            .save()
            .then(() => res.status(201).json({ message: "Sauce dislikée" }))
            .catch((error) => res.status(400).json({ error }));
        } else {
          console.log("else2");
          res
            .status(403)
            .json({
              message: "Vous ne pouvez pas disliker deux fois la même sauce",
            })
            .catch((error) => res.status(400).json({ error }));
        }
      } else if (like === 0) {
        // like enlevé
        if (sauce.usersLiked.includes(userId)) {
          //si c'est le même user qui a déjà liké cette sauce
          sauce.usersLiked.pull(userId);
          sauce.likes--; // on enlève le like
          sauce
            .save()
            .then(() => res.status(201).json({ message: "Sauce unlikée" }))
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.includes(userId)) {
          //si c'est le même user qui a déjà liké cette sauce
          sauce.usersDisliked.pull(userId);
          sauce.dislikes--; //on enlève le dislike
          sauce
            .save()
            .then(() => res.status(201).json({ message: "Sauce undislikée" }))
            .catch((error) => res.status(400).json({ error }));
        } else {
          res
            .status(403)
            .json({ message: "Vous ne pouvez pas intéragir" })
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
