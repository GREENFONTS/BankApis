
const Login = async (req, res, Email, password, data) => {
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
    res.send({token : token})
    };
    
}

module.exports = Login;