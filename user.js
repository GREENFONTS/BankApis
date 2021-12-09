const { PrismaClient } = require("@prisma/client");
const express = require("express");
const prisma = new PrismaClient();
const router = express.Router();
const jwt = require("jsonwebtoken");
const { userAuthenticated } = require("./config/auth");
const { v4: uuidv4 } = require("uuid");

//user login
router.post("/", (req, res) => {
  try {
    async function adminPost() {
      const { Email, password } = req.body;

      let user = await prisma.user.findFirst({
        where: {
          email: Email,
        },
      });
      if (user == null) {
          res.send('User not found')
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
        res.send("login successful")
      }
    }
    adminPost(req, res)
      .catch((err) => {
        throw err;
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (err) {
    console.log(err);
  }
});

//deposit money
router.post('/deposit', userAuthenticated, async (req, res) => {
    const { acctNo, amount } = req.body;
    let user = await prisma.user.findFirst({
        where: {
            acctNo: parseInt(acctNo)
        }
    });
    let id = uuidv4()
    try {
        await prisma.user.updateMany({
            where: {
                acctNo: parseInt(acctNo)
            },
            data: {
                balance: (user.balance + parseInt(amount))
            }
        })
        await prisma.transaction.create({
            data: {
                acctNo: user.acctNo,
                amount: parseInt(amount),
                date: new Date(),
                status: "",
                id: id
            }
        })
    }
    catch (err) {
        throw err
    }
    await prisma.transaction.update({
        where: {
            id: id
        },
        data: {
            status: "success"
        }
    })
    res.send("deposited successfully")
});

//withdraw money
router.post('/withdraw', userAuthenticated, async (req, res) => {
    const { acctNo, amount } = req.body;
    let user = await prisma.user.findFirst({
        where: {
            acctNo: parseInt(acctNo)
        }
    });
    let id = uuidv4()
    try {
        await prisma.user.updateMany({
            where: {
                acctNo: parseInt(acctNo)
            },
            data: {
                balance: (user.balance - parseInt(amount))
            }
        })
        await prisma.transaction.create({
            data: {
                acctNo: user.acctNo,
                amount: parseInt(amount),
                date: new Date(),
                status: "",
                id: id
            }
        })
    }
    catch (err) {
        throw err
    }
    await prisma.transaction.updateMany({
        where: {
            id: id
        },
        data: {
            status: "success"
        }
    })
    res.send("withdrawal successful")
});

//user transfer
router.post('/transfer', userAuthenticated, async (req, res) => {
    const { recieverNo, amount } = req.body;
    const id = uuidv4()
    //get sender
    const sender = await prisma.user.findFirst({
        where: {
            email: req.session.user.email
        }
    });
    //get reciever
    const reciever = await prisma.user.findFirst({
        where: {
            acctNo: parseInt(recieverNo)
        }
    })

    try {
        //update sender's balance
        await prisma.user.updateMany({
            where: {
                acctNo: sender.acctNo
            },
            data: {
                balance: (sender.balance - parseInt(amount))
            }
        });

        //update reciever's balance
        await prisma.user.updateMany({
            where: {
                acctNo: reciever.acctNo
            },
            data: {
                balance: (reciever.balance + parseInt(amount))
            }
        });

        await prisma.transfer.create({
          data: {
            sender: sender.acctNo,
            reciever: reciever.acctNo,
            date: new Date(),
            amount: parseInt(amount),
            status: "",
            id: id,
          },
        });
    }
    catch (err) {
        throw err
    }
    await prisma.transfer.update({
        where: {
            id: id
        },
        data: {
            status: "failed"
        }
    })
    res.send("transfer successful")
});

//getting list of transactions for user
router.post('/transactions', userAuthenticated, async (req, res) => {
    const transactions = []
    const user = await prisma.user.findFirst({
        where: {
            email: req.session.user.email
        }
    })
    const transfers = await prisma.transfer.findMany({
        where: {
            OR: [
                {
                    sender: user.acctNo
                },
                {
                    reciever: user.acctNo
                },
            ],
        }
    });
    transactions.push(transfers)
    const selfTrans = await prisma.transaction.findMany({
        where: {
            acctNo: user.acctNo
        }
    });
    transactions.push(selfTrans);

    res.json(transactions);
})
module.exports = router;