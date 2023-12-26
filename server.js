const express = require("express");
const jwt = require("jsonwebtoken");
const app= express();
const port = 2999;
const fs = require("fs");
app.use(express.json());

const secretKeyAdmin = "sause";
const secretKeyUser = "sausage";


const generateAdminJwt = (user) => {
    const payload = {username  :user.username};
    return jwt.sign(payload ,secretKeyAdmin,{expiresIn :'4h'})
}

const generateUserJwt = (user) => {
    const payload = {username  :user.username};
    return jwt.sign(payload ,secretKeyUser,{expiresIn :'4h'})
}

const authenticateAdminJwt = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, secretKeyAdmin, (err, user) => {
            if (err) {
              return res.sendStatus(403);
            }
            next();
          });
        // jwt.verify(token,secretKey).then((err,data)=> promise is not defined in the signature of jwt.verify
    }
    else{
        res.sendStatus(401);
    }
}
const authenticateUserJwt = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, secretKeyUser, (err, user) => {
            if (err) {
              return res.sendStatus(403);
            }
            next();
          });
    }
    else{
        res.sendStatus(401);
    }

}
//Creates a new admin account
// how to tackle duplicacy?
app.post('/admin/signup',(req,res)=>{

    var newAdmin = {
        username : req.body.username,
        password : req.body.password,
        id :Math.floor(Math.random()*1000000)
    }
    fs.readFile(__dirname+"/admin.json",(err,data)=>{

        var adminList = JSON.parse(data);
        var checkDuplicate = adminList.find((admin)=>{
            if(admin.username == newAdmin.username){
                res.status(400).send("username needs to be unique");
                return admin;
            }
        })
        if( checkDuplicate == undefined){
            adminList.push(newAdmin);
            fs.writeFile(__dirname +"/admin.json", JSON.stringify(adminList) ,(err)=>{
                if(err){
                    console.log(err);
                    res.status(500).send("error creating admin")
                }
                else{
                    res.status(200).send("Admin created succesfully");
                }
            });
        }
    })
})
//Authenticates an admin.
app.post('/admin/login' , (req,res)=>{
    var {username , password } = req.headers;
    fs.readFile(__dirname+"/admin.json",(err,data)=>{
        var adminList = JSON.parse(data);

        var checkAdmin = adminList.find((admin)=>{
            if(admin.username == username && admin.password== password){
                const token  = generateAdminJwt(username);
                res.json({message : "admin logged in " , token});
                return admin;
            }
        })
        console.log(checkAdmin);
        if(checkAdmin == undefined){
            res.status(403).send("invalid credentials");
        }
    })

})
//Creates a new course
app.post('/admin/courses', authenticateAdminJwt, (req,res)=>{
    const course = req.body;
    course.id =  Math.floor(Math.random()*1000);
                // var newCourse = {
                //     title: req.body.title,
                //     description: req.body.description,
                //     price: req.body.price,
                //     imagelink: req.body.imagelink,
                //     published: req.body.published,
                //     courseid: Math.floor(Math.random()*1000),
                //     adminid : admin.id
                // }

    var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
    courseList.push(course);
    fs.writeFileSync(__dirname+"/courses.json",JSON.stringify(courseList));
    console.log(courseList);
    res.send("course created successfuly");
    return admin;


})

//Edits an existing course
app.put("/admin/course/:courseid",authenticateAdminJwt,(req,res)=>{
    var courseid = parseInt(req.params.courseid);
    var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
    var index = courseList.findIndex(c => c.id === courseid);
    console.log(index);
    if(index!= -1){
        var updatedCourse = { ...courseList[index],...req.body};
        courseList[index] = updatedCourse;
        //Object.assign(checkCourse , req.body);
        fs.writeFileSync(__dirname+"/courses.json",JSON.stringify(courseList));
        res.send("course updated successfuly");
    }
    else{
        res.status(400).send("invalid courseid");
    }             
            
})

//Returns all the courses
app.get("/admin/courses",authenticateAdminJwt ,(req,res)=>{

    var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
    res.send(courseList);        

})
//USER
//creates a user
app.post('/user/signup',(req,res)=>{

    var newUser = {
        username : req.body.username,
        password : req.body.password,
        id :Math.floor(Math.random()*1000000),
        purchasedCourses: []
    }
    fs.readFile(__dirname+"/users.json",(err,data)=>{

        var userList = JSON.parse(data);
        var checkDuplicate = userList.find((user)=>{
            if(user.username == newUser.username){
                res.status(400).send("username needs to be unique");
                return user;
            }
        })
        if( !checkDuplicate ){
            userList.push(newUser);
            fs.writeFile(__dirname +"/users.json", JSON.stringify(userList) ,(err)=>{
                if(err){
                    console.log(err);
                    res.status(500).send("error creating user")
                }
                else{
                    res.status(200).send("user created succesfully");
                }
            });
        }
    })
})
//Authenticates an user.
app.post('/user/login' , (req,res)=>{
    var username = req.headers.username;
    var password = req.headers.password;
    fs.readFile(__dirname+"/users.json",(err,data)=>{
        var userList = JSON.parse(data);

        var checkUser = userList.find((user)=>{
            if(user.username == username && user.password== password){
                const token  = generateUserJwt(username);
                res.json({message : "user logged in " , token});
                return user;
            }
        })
        if(!checkUser){
            res.status(401).send("invalid credentials");
        }
    })

})
//get all the courses for valid users
app.get("/user/courses", authenticateUserJwt ,(req,res)=>{
    var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
    res.send(courseList.filter(c=>c.published ==true));
})

//purchase a course
app.post("/user/course/:courseid" ,authenticateUserJwt , (req,res)=>{
    var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
    const courseId = Number(req.params.courseid);
    const course = courseList.find(c => c.id === courseId && c.published);
    if (course) {
        const username = req.headers.username;
        const users = JSON.parse(fs.readFileSync(__dirname+"/users.json"));
        const user = users.find(c=>c.username == username);

        user.purchasedCourses.push(course);
        fs.writeFileSync(__dirname+"/users.json",JSON.stringify(users));
        res.json({ message: 'Course purchased successfully' });
      } else {
        res.status(404).json({ message: 'Course not found or not available' });
      }
})
//get all purchased courses
app.get("/user/purchasedCourses",authenticateUserJwt,(req,res)=>{
    const users = JSON.parse(fs.readFileSync(__dirname+"/users.json"));
    const user = users.find(u => u.username == req.headers.username);
    if(user){
        res.json({purchasedCourses : user.purchasedCourses || []});
    }
    else{
        res.status(403).json({ message: 'User not found' });
    }
})

app.listen(port ,()=>{
    console.log(`server is listenting , send you shit @ ${port}`);
})