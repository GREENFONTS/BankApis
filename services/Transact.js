const Transact = async (req, res, acctNo, amount, operator, action) => {
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
  }

module.exports = Transact;