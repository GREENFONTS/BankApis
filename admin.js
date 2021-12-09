const { PrismaClient } = require("@prisma/client");
const express = require("express");
const prisma = new PrismaClient();
const router = express.Router();
const jwt = require("jsonwebtoken");
const { adminAuthenticated } = require("./config/auth");
const { v4: uuidv4 } = require("uuid");


//acctNo generator
const randomGenerator = () => {
  return Math.ceil(Math.random() * 10000000000)
}

//admin signup
router.post("/register", (req, res) => {
  try {
    async function addAdmin() {
      const { Email, password, role } = req.body;

      let user = await prisma.admin.findFirst({
        where: {
          email: Email,
          password: password,
        },
      });
      console.log(user, req.body)

      if (user != null) {
        error.push({
          msg: "Admin already exists found",
        });
      } else {
        await prisma.admin.create({
          data: {
            email: Email,
            password: password,
            role: role,
            id: uuidv4(),
          },
        });
      }
      res.send("admin registration successful");
    }
    addAdmin(req, res)
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

//admin login
router.post("/", (req, res) => {
  try {
    async function adminPost() {
      const { Email, password } = req.body;

      let user = await prisma.admin.findUnique({
        where: {
          email: Email,
        },
      });
      if (user == null) {
          res.send('Admin not found')
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
        res.redirect("/dashboard");
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

//dashboard
router.get("/dashboard", adminAuthenticated, (req, res) => {
    res.send("Welcome to admin dashboard")
})

//add users 
router.post("/addUser", adminAuthenticated, async (req, res) => {
  const { firstName, lastName, email, Tel, balance, role, password } = req.body;
  let acctNo = randomGenerator()
  let checkUser = await prisma.user.findFirst({
    where: {
      acctNo: acctNo
    }
  })

  while (checkUser != null) {
    acctNo = randomGenerator();
    checkUser = await prisma.user.findUnique({
      where: {
        acctNo: acctNo
      }
    });
  }
    
  let user = await prisma.user.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: role,
      password: password,
      Tel: Tel,
      balance: parseInt(balance),
      status: "active",
      acctNo: acctNo,

      id: uuidv4(),
    },
  });
  res.json(user)
  
});

//delete users
router.post('/deleteUser', adminAuthenticated, async(req, res) => {
  const { acctNo } = req.body;
    
    console.log(acctNo)
    try {
      await prisma.user.deleteMany({
        where: {
          acctNo: parseInt(acctNo)
        },
      });
    }
    catch (err) {
      throw err
  }
  res.send(`User with account Number ${acctNo} deleted`); 
  })

//reverse transaction
router.post('/reverse', adminAuthenticated, async (req, res) => {
  const { acctNo } = req.body
  const id = uuidv4();
  
  let failedTrans = await prisma.transfer.findFirst({
    where: {
      status: "failed",
      sender: parseInt(acctNo)
    }
  });
  let failedTransSender = await prisma.user.findFirst({
    where: {
      acctNo : parseInt(acctNo)
    }
  })
  
  if (failedTrans != null) {
    try {
      await prisma.transaction.create({
        data: {
          acctNo: failedTrans.sender,
          date: new Date(),
          amount: failedTrans.amount,
          status: "",
          id: id
        }
      });

      await prisma.user.updateMany({
        where: {
          acctNo: failedTrans.sender
        },
        data: {
          balance: (failedTransSender.balance + failedTrans.amount)
        }
      })
    }
    catch (err) {
      throw err
    }
  }
  await prisma.transfer.update({
    where: {
      id: failedTrans.id
    },
    data: {
      status: "reverted"
    }
  });

  await prisma.transaction.update({
    where: {
      id: id,
    },
    data: {
      status: "success",
    },
  });
   res.send("reversed succesfully")
 });

//disable users
router.get('/disableUser/', adminAuthenticated, async (req, res) => {
  const id = req.params.id
  try {
    await prisma.user.update({
      where: {
        id: id
      },
      data: {
        status: "inactive"
      }
    });
  }
  catch (err) {
    throw err
  }

  res.send(`User ${id} disabled` )
});


module.exports = router;
