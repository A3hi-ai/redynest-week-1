app.post("/signup", async (req,res)=>{

    const {username,email,password}=req.body;

    const hashedPassword =
        await bcrypt.hash(password,10);

    await User.create({
        username,
        email,
        password:hashedPassword
    });

    res.json({
        success:true
    });
});