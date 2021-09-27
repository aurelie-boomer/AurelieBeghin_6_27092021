const multer = require("multer"); //permet de gérer les fichiers entrants

const MIME_TYPES = {
  // = extension du fichier
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    //explique dans quel dossier enregistrer
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_"); //on remplace les espaces par des underscores pour les noms créés
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension); //création d un nom de fichier unique
  },
});

module.exports = multer({ storage: storage }).single("image"); // on explique à multer que ce sont des images
