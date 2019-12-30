import * as express from 'express';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as path from 'path';

import * as AWS from 'aws-sdk';
import HttpException from '../exceptions/HttpException';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const s3 = new AWS.S3();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/');
  },
  filename: (req, file, cb) =>
    // cb(null, new Date().toString() + file.originalname),
    cb(null, file.originalname),
});

const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
): void => {
  const mimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
  if (mimeTypes.includes(file.mimetype)) cb(null, true);
  else {
    cb(new HttpException(), false);
  }
};

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1024 * 1024 * 5 },
//   fileFilter: fileFilter,
// });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'gs-s3-item',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read-write',
    key: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      cb(null, Date.now().toString() + extension);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
