
const addAdmin =  async (req, res, firstName, lastName, userName, Email, password) => {
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
                firstName: firstName,
                lastName : lastName,
                userName: userName,
                email: Email,
                password: password,
                role: "admin",
                id: uuidv4(),
            },
        });
    }
}

module.exports = addAdmin;