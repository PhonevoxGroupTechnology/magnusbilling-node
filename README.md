## ⚠️ Work in progress. 
***This project is a work-in-progress, and I'll appreaciate any issue or pull request you send for review.***


# 🔰 Intentions
The intentions of this project is to create a NodeJS+Express REST API for MagnusBilling's own API. 
The core part of this project is the need to have a maintained and well-explained place to find information about Magnus' API, since through using their PHP Wrapper and raw API, we got hit with some really funny and wonky behaviour that we did not like.

*I will later on document every endpoint on Postman and link it here.*


# 💫 Quickstart
- Download and access the repository folder (from now on called as root directory)
- Open `.env.example` with any text editor of your choice, and insert the required data, namely *MAGNUS_API_KEY*, *MAGNUS_API_SECRET* and *MAGNUS_PUBLIC_URL*
- Rename `.env.example` to `.env`
- On root directory, install dependencies with `npm install`
- On root directory, execute `npm run server` to run the REST API Server through Express


# ⚠️ Attention!
*might refactor everything so you dont have to create Controller-Model-Schema for each endpoint, by looping over the results of getModules:1 and abstracting everything to be simpler... lets see how it goes*
