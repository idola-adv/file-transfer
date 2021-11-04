const path = require("path");
const fs = require("fs");
const express = require("express");
const fileUpload = require("express-fileupload");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const _ = require("lodash");

const config = require("./config");

const get_time = () => {
  const datetime = new Date().toLocaleString();
  const date = datetime.split(", ")[0];
  const [bulan, tanggal, tahun] = date.split("/");
  return {
    datetime,
    tanggal,
    bulan,
    tahun,
  };
};

const bulan_indo = (bulan) => {
  switch (bulan) {
    case 1:
      return "Januari";
    case 2:
      return "Februari";
    case 3:
      return "Maret";
    case 4:
      return "April";
    case 5:
      return "Mei";
    case 6:
      return "Juni";
    case 7:
      return "Juli";
    case 8:
      return "Agustus";
    case 9:
      return "September";
    case 10:
      return "Oktober";
    case 11:
      return "November";
    case 12:
      return "Desember";
    default:
      return null;
  }
};

const app = express();
const server = http.createServer(app);

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, //2MB max file(s) size
    },
  })
);

//add other middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

//make uploads directory static
app.use(express.static("public"));

server.listen(config.port, config.hostname, () => {
  require("dns").lookup(require("os").hostname(), function (err, add, fam) {
    if (config.port === 80) {
      console.log(`Server is running at http://${add}`);
    } else {
      console.log(`Server is running at http://${add}:${config.port}`);
    }
  });
});

// ============================================================================

app.post("/upload", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "files") to retrieve the uploaded file
      let files = req.files.files;

      const { tahun, bulan, tanggal } = get_time();
      //
      const path_tahun = path.join(config.upload_path, tahun);
      const path_bulan = path.join(path_tahun, bulan_indo(parseInt(bulan)));
      const path_tanggal = path.join(path_bulan, tanggal);
      //
      //   console.log({
      //     tahun,
      //     bulan,
      //     tanggal,
      //     path_tahun,
      //     path_bulan,
      //     path_tanggal,
      //   });
      //
      if (!fs.existsSync(path_tahun)) {
        await fs.mkdirSync(path_tahun);
      }
      //
      if (!fs.existsSync(path_bulan)) {
        await fs.mkdirSync(path_bulan);
      }
      //
      if (!fs.existsSync(path_tanggal)) {
        await fs.mkdirSync(path_tanggal);
      }
      //
      const path_full = path_tanggal;

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      files.mv(path.join(path_full, files.name));

      //send response
      res.send({
        status: true,
        message: "File is uploaded",
        data: {
          name: files.name,
          mimetype: files.mimetype,
          size: files.size,
        },
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
