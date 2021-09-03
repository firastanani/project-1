const { join, parse } = require("path");
const { createWriteStream } = require("fs");
const { sync } = require("mkdirp");
const { generate } = require("shortid");

const uploadDir = join(__dirname, "../../public/images");

sync(uploadDir);

const storeFS = ({ stream, filename }) => {
  const id = generate();
  let { ext, name } = parse(filename);

  const path = `${uploadDir}/${id}-${ext}`;
  const Location = `${id}-${ext}`;

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on("error", (err) => reject({ success: false, message: err.message }))
      .on("finish", () =>
        resolve({ id, Location, success: true, message: "Successfully Uploaded" })
      )
  );
};

const processUpload = async function (upload) {

  const { createReadStream, filename, mimetype, encoding } = await upload;
  const stream = createReadStream();

  const { id, Location , success , message } = await storeFS({ stream, filename });

  return { id, filename, mimetype, Location, encoding , success , message};
};

const multipleUpload = async function ( files ) {

  let obj = await Promise.all(files.map(processUpload))
  console.log(obj)
  return obj;
};


module.exports = {
  multipleUpload,
  processUpload
}