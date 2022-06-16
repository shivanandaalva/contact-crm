
const express = require('express')
const app = express()
const path = require('path')
const port = 3000
let ejs = require('ejs')
const bodyparser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./crm.db');


//View Engine Setup
app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs');

// Body-parser middleware
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())


app.get('/', (req, res) => {


  res.render('index')
  
})

app.get('/register/:email/:password', (req, res) => {

   
    db.serialize(() => {
      let email = req.params.email;
      let password = req.params.password;
   console.log(email);
   console.log(password);
       db.run(`INSERT INTO users ('email','password') VALUES (?,?)`,[email,password]);

      db.each("SELECT email, password FROM users", (err, row) => {
          console.log(row.email + ": " + row.password);
      });
  });
  
 
  res.send('User Registered Successfully')

 
})
app.get('/login/:email/:password', (req, res) => {
    db.serialize(() => {
      let email = req.params.email;
      let password = req.params.password;
 
      db.each(`SELECT * FROM users where email=? AND password=?`,[email,password], (err, row) => {
      if(row.email==email && row.password==password){

        res.render('info',{userid:row.userid,name:row.name,email:row.email,phone:row.phone,address:row.address,gst:row.gstno,freq:row.frequency})
        
      }
      else{
        res.send('Invalid Credentials');
      }

      });  
  });
})


app.get('/add', (req, res) => {
  console.log(req.query);
  db.serialize(() => {
  db.run(`INSERT INTO users ('name','email','phone','address','gstno','frequency') VALUES (?,?,?,?,?,?)`,[req.query.name,req.query.email,req.query.phone,req.query.address,req.query.gst,req.query.freq]);
});
  res.send("Data Inserted Successfully")

})

app.get('/update', (req, res) => {
  console.log(req.query);
  var id=req.query.id;
  var name=req.query.name;
  var email=req.query.email;
  var phone=req.query.phone;
  var address=req.query.address;
  var gst=req.query.gst;
  var freq=req.query.freq;

  db.serialize(() => {
    db.run(`UPDATE users SET name=?,email=?,phone=?,address=?,gstno=?,frequency=? where userid=?`,[name,email,phone,address,gst,freq,id]);
  });
  res.send("Data Updated Successfully");
})

app.get('/delete/:userid', (req, res) => {

  console.log(req.params.userid)
  var id=req.params.userid;
  db.serialize(() => {
    db.run(`DELETE FROM users where userid=${id}`);
  });
    res.send("Data Deleted Successfully")
})

app.get('/crm/:userid', (req, res) => {
  let userid = req.params.userid;
  let arr=[];
  let time=[]
  db.serialize(() => {

   
    db.all(`SELECT * FROM crm where userid=?`,[userid], (err, row) => {
// console.log(row.message+":"+row.timestamp+":"+row.userid)
Object.keys(row).forEach(el => {
  // console.log(el, row[el]);
  arr.push(row[el].message);
  time.push(row[el].timestamp);
});

// for(var i=0;i<5;i++){
// store('messagesdata', {data: row.message});
// }
console.log(arr);
// console.log(store('messagesdata'));
res.render('crm',{userid:userid,messages:arr,timestamp:time})

  });

}); 


})

app.get('/addcrm/:message/:userid', (req, res) => {
  let message= req.params.message;
  let ts = Date.now();
  let userid = req.params.userid;

  db.serialize(() => {
    db.run(`INSERT INTO crm ('message','timestamp','userid') VALUES (?,?,?)`,[message,ts,userid]);
  });
    res.send("Data Inserted Successfully")
   

})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
