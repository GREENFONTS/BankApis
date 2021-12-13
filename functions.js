const { PrismaClient } = require("@prisma/client");
const express = require("express");
const prisma = new PrismaClient();
const router = express.Router();
const jwt = require("jsonwebtoken");
const { adminAuthenticated } = require("./config/auth");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  //acctNo generator
  randomGenerator: (length) => {
    let acctNo = []; let i = 0;
    while (i < length) {
    let num =  Math.floor(Math.random() * 10);
      acctNo.push(num)
    }
    return acctNo.join("")
  },
  //addAdmin function
  addAdmin: async (req, res, Email, password) => {
      let user = await prisma.admin.findFirst({
          where: {
              email: Email,
              password: password,
          },
      });
      if (user != null) {
          res.send("Admin already exists found")
      } else {
          await prisma.admin.create({
              data: {
                  email: Email,
                  password: password,
                  role: "admin",
                  id: uuidv4(),
              },
          });
      }
  },

  //admin Login function
    Login: async (req, res, Email, password, data) => {
        let user;
        if (data == "admin") {
            user = await prisma.admin.findUnique({
                where: {
                    email: Email,
                },
            });
        } else {
            if (data == "user") {
                user = await prisma.user.findFirst({
                    where: {
                        email: Email,
                    },
                });
            }
        }

    if (user == null) {
      res.send("Admin not found");
    } else if (user.password != password) {
      res.send("password is Incorrect");
    } else {
      const token = jwt.sign(
        { user_id: user.id, Email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      let session = req.session;
      session.token = token;
        session.user = user;
        };
        res.send("Login successful")
  },

  //user transaction (deposit or withdraw)
  Transact: async (req, res, acctNo, amount, operator, action) => {
    try {
      parseInt(acctNo)
    }
    catch {
      res.status(404).send("AccountNo input is invalid")
    }
    
    let user = await prisma.user.findFirst({
      where: {
        acctNo: parseInt(acctNo),
      },
    });
    if (user.acctNo != req.session.user.acctNo) {
      res.sendStatus(403)
    }
    if (user.status == "inactive") {
      res.status(403).send("account is inactive")
    }
    let id = uuidv4();
      try {
        if (action == "withdraw") {
          if (amount > user.balance) {
          res.send("Insufficient Fund")
          }
      }
      await prisma.user.updateMany({
        where: {
          acctNo: parseInt(acctNo),
        },
        data: {
          balance: parseInt(`${user.balance} ${operator} ${parseInt(amount)}`),
        },
      });
      await prisma.transaction.create({
        data: {
          acctNo: user.acctNo,
          amount: parseInt(amount),
          date: new Date(),
          status: "",
          id: id,
        },
      });
    } catch (err) {
      throw err;
    }
    await prisma.transaction.update({
      where: {
        id: id,
      },
      data: {
        status: "success",
      },
    });
    res.send(`${action} successfully`);
  },
};
