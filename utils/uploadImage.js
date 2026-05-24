const cloudinary = require("cloudinary").v2;

const configureCloudinary = () => {
  if (
    process.env.cloud_name &&
    process.env.api_key &&
    process.env.api_secret
  ) {
    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
    });
    return true;
  }
  return false;
};

const uploadToCloudinary = async (filepath, folder) => {
  if (!configureCloudinary()) {
    return {
      url: `https://picsum.photos/seed/${Date.now()}/600/600`,
    };
  }
  return cloudinary.uploader.upload(filepath, { folder });
};

const uploadMany = async (fileList, folder) => {
  const files = Array.isArray(fileList) ? fileList : [fileList];
  const urls = [];
  for (const file of files) {
    const result = await uploadToCloudinary(file.filepath, folder);
    urls.push(result.url);
  }
  return urls;
};

module.exports = { uploadToCloudinary, uploadMany };
