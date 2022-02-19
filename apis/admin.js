const { PrismaClient } = require("@prisma/client");
const express = require("express");
const prisma = new PrismaClient();
const router = express.Router();
const jwt = require("jsonwebtoken");
const { adminAuthenticated } = require("../auth/auth");
const { v4: uuidv4 } = require("uuid");
const { randomGenerator} = require('../services/randomGenerator');
const { addAdmin } = require('../services/addAdmin');
const { Login } = require('../services/login');

router.get('/', (req, res) => {
  res.status(200).send('Welcome to our standard bank Apis')
})

//admin signup
router.post("/register", (req, res) => {
  const { firstName, lastName, userName, Email, password } = req.body;
  try {    
    addAdmin(req, res, firstName, lastName, userName, Email, password, )
      .catch((err) => {
        throw err;
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  } catch (err) {
    console.log(err);
  } 
   res.send("Registration successful");
});

//admin login
router.post("/login", (req, res) => {
  const { Email, password } = req.body;
  try {   
    Login(req, res, Email, password, "admin")
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

//add users 
router.post("/addUser", adminAuthenticated, async (req, res) => {
  const { firstName, lastName, email, tel, balance, role, password } = req.body;
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
      Tel: tel,
      balance: parseInt(balance),
      status: "active",
      acctNo: acctNo,

      id: uuidv4(),
    },
  });
  res.json(user)
  
});

//get all users
router.get('/users', adminAuthenticated, async(req, res) => {
  try{
    let users = await prisma.user.find({})
    res.status(200).send({users: users})
  }
  catch(err){
    res.status(500).send(err)
  }
})

//delete users
router.post('/deleteUser', adminAuthenticated, async(req, res) => {
  const { acctNo } = req.body;
    
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
   res.send(`Transaction with transaction id ${id} reversed successfully `)
 });

//disable users
router.get('/disableUser/:id', adminAuthenticated, async (req, res) => {
  const id = req.params.id
  try {
    await prisma.user.updateMany({
      where: {
        acctNo: parseInt(id)
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


router.get('/enableUser/:id', adminAuthenticated, async (req, res) => {
  const id = req.params.id
  const user = await prisma.user.findFirst({where: {
    id : id
  }})
  if(user.status == 'active'){
    res.send('User is already active')
  }
  else{
  try {
    await prisma.user.updateMany({
      where: {
        acctNo: parseInt(id)
      },
      data: {
        status: "active"
      }
    });
  }
  catch (err) {
    throw err
  }

  res.send(`User ${id} enabled` )
}
});

module.exports = router;
