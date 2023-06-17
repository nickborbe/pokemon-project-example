const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express = require('express');
const multer = require('multer');


cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDINARYAPIKEY,
    api_secret: process.env.CLOUDINARYAPISECRET
  });
 

 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pokemon',
    format: async (req, file) => 'png'|| 'jpg' || 'jpeg', 
    public_id: (req, file) => file.originalname,
  },
});
 
const parser = multer({ storage: storage });


module.exports = parser;
 
