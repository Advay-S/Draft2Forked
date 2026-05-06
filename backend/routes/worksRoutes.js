const express = require('express');
const multer = require('multer');
const { getWorks, createWork, deleteWork } = require('../controllers/worksController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image uploads are allowed.'));
    }

    return callback(null, true);
  }
});

router.get('/', getWorks);
router.post('/', requireAdmin, upload.single('image'), createWork);
router.delete('/:id', requireAdmin, deleteWork);

module.exports = router;
