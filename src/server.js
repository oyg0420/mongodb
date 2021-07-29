const express = require("express");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const dotenv = require("dotenv");
const app = express();

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

(async () => {
  try {
    mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    app.use(express.json());

    app.put("/user/:userId", async (req, res, next) => {
      try {
        const { userId } = req.params;
        const { age } = req.body;
        if (mongoose.isValidObjectId(userId)) {
          if (!age) {
            return res.status(400).send("require age");
          }
          if (typeof age !== "number") {
            return res.status(400).send("invalid age");
          }
          /**
           * 업데이트된 user 객체를 리턴 new: true인 경우
           */
          const user = await User.findByIdAndUpdate(
            userId,
            { $set: { age } },
            { new: true }
          );
          return res.status(200).send({ user });
        } else {
          return res.status(400).send("invalid user id");
        }
      } catch (err) {
        next(err);
      }
    });

    app.delete("/user/:userId", async (req, res, next) => {
      try {
        const { userId } = req.params;
        /**
         * @todo isValidObjectId 찾아보기
         */
        if (mongoose.isValidObjectId(userId)) {
          /**
           * 삭제된 경우 user 객체 리턴
           */

          const user = await User.findOneAndDelete({ _id: userId });
          return res.status(200).send({ user });
        } else {
          return res.status(400).send("invalid user id");
        }
      } catch (err) {
        next(err);
      }
    });

    app.get("/user/:userId", async (req, res) => {
      try {
        const { userId } = req.params;
        if (mongoose.isValidObjectId(userId)) {
          const user = await User.findOne({ _id: userId });
          return res.status(200).send({ user });
        } else {
          return res.status(400).send("invalid user id");
        }
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const users = await User.find();
        return res.status(200).send({ users });
      } catch (err) {
        return res.status(500).send(err.message);
      }
    });

    app.post("/users", async (req, res, next) => {
      try {
        const user = new User(req.body);
        await user.save();
        return res.status(200).send(user);
      } catch (err) {
        next(err);
      }
    });

    app.use((err, req, res, next) => {
      res.status(500).send(err.message);
    });

    app.listen(3000, () => console.log("Server Listening on port 3000"));
  } catch (err) {
    console.log(err);
  }
})();
