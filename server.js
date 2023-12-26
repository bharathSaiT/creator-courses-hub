const express = require("express");

const app= express();
const port = 2999;
const fs = require("fs");
app.use(express.json());




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
    var username = req.headers.username;
    var password = req.headers.password;
    fs.readFile(__dirname+"/admin.json",(err,data)=>{
        var adminList = JSON.parse(data);

        var checkAdmin = adminList.find((admin)=>{
            if(admin.username == username && admin.password== password){
                res.send("admin logged in");
                return admin;
            }
        })
        console.log(checkAdmin);
        if(checkAdmin == undefined){
            res.status(401).send("invalid credentials");
        }
    })

})
//Creates a new course
app.post('/admin/courses',(req,res)=>{
    var username = req.headers.username;
    var password = req.headers.password;
    fs.readFile(__dirname+"/admin.json",(err,data)=>{
        var adminList = JSON.parse(data);

        var checkAdmin = adminList.find((admin)=>{
            if(admin.username == username && admin.password== password){
                var newCourse = {
                    title: req.body.title,
                    description: req.body.description,
                    price: req.body.price,
                    imagelink: req.body.imagelink,
                    published: req.body.published,
                    courseid: Math.floor(Math.random()*1000),
                    adminid : admin.id
                }

                var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
                courseList.push(newCourse);
                fs.writeFileSync(__dirname+"/courses.json",JSON.stringify(courseList));
                console.log(courseList);
                res.send("course created successfuly");
                return admin;
            }
        })
        
        if(checkAdmin == undefined){
            res.status(401).send("invalid credentials");
        }
    })

})

//Edits an existing course
app.put("/admin/course/:courseid",(req,res)=>{
    var courseid = req.params.courseid;
    var username = req.headers.username;
    var password = req.headers.password;

    fs.readFile(__dirname+"/admin.json",(err,data)=>{
        var adminList = JSON.parse(data);
        var checkAdmin = adminList.find((admin)=>{
            if(admin.username == username && admin.password== password){
                var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
                var updatedCourse = {
                    title: req.body.title,
                    description: req.body.description,
                    price: req.body.price,
                    imagelink: req.body.imagelink,
                    published: req.body.published,
                    courseid: Math.floor(Math.random()*1000),
                    adminid : admin.id
                }
                var checkCourse = -1;
                for(var i =0;i< courseList.length;i++){
                    if(courseList[i].courseid == courseid){
                        checkCourse =i;
                        break;
                    }
                }
                if(checkCourse != -1){
                    if(courseList[checkCourse].adminid == admin.id){
                        courseList[checkCourse] = updatedCourse;

                        fs.writeFileSync(__dirname+"/courses.json",JSON.stringify(courseList));
                        console.log(courseList);
                        res.send("course updated successfuly");
                    }
                    else{
                        res.send("you dont have access to update this course");
                    }
                }
                else{
                    res.status(400).send("invalid courseid");
                }

                
                return admin;
            }
        })
        
        if(checkAdmin == undefined){
            res.status(401).send("invalid credentials");
        }
    })
    


})

//Returns all the courses
app.get("/admin/courses",(req,res)=>{
    var username = req.headers.username;
    var password = req.headers.password;
    fs.readFile(__dirname+"/admin.json",(err,data)=>{
        var adminList = JSON.parse(data);

        var checkAdmin = adminList.find((admin)=>{
            if(admin.username == username && admin.password== password){
                var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
                res.send(courseList);
                return admin;
            }
        })
        console.log(checkAdmin);
        if(checkAdmin == undefined){
            res.status(401).send("invalid credentials");
        }
    })
})
//USER
//creates a user
app.post('/user/signup',(req,res)=>{

    var newUser = {
        username : req.body.username,
        password : req.body.password,
        id :Math.floor(Math.random()*1000000)
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
                res.send("user logged in");
                return user;
            }
        })
        if(!checkUser){
            res.status(401).send("invalid credentials");
        }
    })

})
//get all the courses for valid users
app.get("/user/courses",(req,res)=>{
    var username = req.headers.username;
    var password = req.headers.password;
    fs.readFile(__dirname+"/users.json",(err,data)=>{
        var userList = JSON.parse(data);

        var checkUser = userList.find((user)=>{
            if(user.username == username && user.password== password){
                var courseList = JSON.parse(fs.readFileSync(__dirname+"/courses.json"));
                res.send(courseList);
                return user;
            }
        })
        if(checkUser == undefined){
            res.status(401).send("invalid credentials");
        }
    })
})

//purchase a course

//get all purchased courses



app.listen(port ,()=>{
    console.log(`server is listenting , send you shit @ ${port}`);
})