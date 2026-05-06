const cloudinary = require('cloudinary').v2;
const Work = require('../models/Work');
const { demoWorks } = require('../services/demoWorks');

function isMongoReady() {
  return Work.db.readyState === 1;
}

function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'rachanatmak/artworks',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}

async function getWorks(req, res) {
  try {
    if (!isMongoReady()) {
      return res.json(demoWorks);
    }

    const works = await Work.find().sort({ createdAt: -1 });
    res.json(works);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch artworks.' });
  }
}

async function createWork(req, res) {
  try {
    if (!isMongoReady()) {
      return res.status(503).json({ message: 'MongoDB is not connected. Uploads are disabled in local preview mode.' });
    }

    const { title, category, year } = req.body;

    if (!title || !category || !year || !req.file) {
      return res.status(400).json({ message: 'Title, category, year, and image are required.' });
    }

    const upload = await uploadToCloudinary(req.file.buffer);

    const work = await Work.create({
      title,
      category,
      year: Number(year),
      imageUrl: upload.secure_url,
      publicId: upload.public_id
    });

    return res.status(201).json(work);
  } catch (error) {
    return res.status(500).json({ message: 'Could not add artwork.' });
  }
}

async function deleteWork(req, res) {
  try {
    if (!isMongoReady()) {
      return res.status(503).json({ message: 'MongoDB is not connected. Deletes are disabled in local preview mode.' });
    }

    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({ message: 'Artwork not found.' });
    }

    await cloudinary.uploader.destroy(work.publicId);
    await Work.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Artwork deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete artwork.' });
  }
}

module.exports = {
  getWorks,
  createWork,
  deleteWork
};
