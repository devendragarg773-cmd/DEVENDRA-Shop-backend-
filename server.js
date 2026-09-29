require("dotenv").config();
const express=require("express"),cors=require("cors"),fs=require("fs"),path=require("path"),multer=require("multer");
const app=express(),PORT=Number(process.env.PORT||5000),DATA=path.join(__dirname,"data"),FILE=path.join(DATA,"store.json"),UPLOADS=path.join(__dirname,"uploads");
fs.mkdirSync(DATA,{recursive:true});fs.mkdirSync(UPLOADS,{recursive:true});
if(!fs.existsSync(FILE))fs.writeFileSync(FILE,JSON.stringify({products:[],orders:[]},null,2));
app.use(cors({origin:true}));app.use(express.json({limit:"2mb"}));app.use("/uploads",express.static(UPLOADS));
const storage=multer.diskStorage({destination:(req,file,cb)=>cb(null,UPLOADS),filename:(req,file,cb)=>{const ext=path.extname(file.originalname).toLowerCase()||".jpg";cb(null,Date.now()+"-"+Math.random().toString(36).slice(2)+ext)}});
const upload=multer({storage,limits:{fileSize:8*1024*1024},fileFilter:(req,file,cb)=>{if(/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype))cb(null,true);else cb(new Error("Only image files are allowed"))}});
function read(){return JSON.parse(fs.readFileSync(FILE,"utf8"))} function write(d){fs.writeFileSync(FILE,JSON.stringify(d,null,2))}
function admin(req,res,next){if(req.headers["x-admin-key"]!==process.env.ADMIN_KEY)return res.status(401).json({error:"Wrong admin key"});next()}
app.get("/",(req,res)=>res.json({ok:true,service:"Urban Fashion Upload API"}));
app.get("/api/products",(req,res)=>res.json(read().products));
app.post("/api/products",admin,upload.single("image"),(req,res)=>{
 if(!req.file)return res.status(400).json({error:"Image is required"});
 const d=read(),p={id:Date.now(),name:req.body.name||"New Product",price:Number(req.body.price||0),mrp:Number(req.body.mrp||0),rating:Number(req.body.rating||4.5),image:`${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`};
 d.products.push(p);write(d);res.status(201).json(p);
});
app.delete("/api/products/:id",admin,(req,res)=>{const d=read(),p=d.products.find(x=>x.id==req.params.id);if(!p)return res.status(404).json({error:"Product not found"});if(p.image?.includes("/uploads/")){const f=path.join(UPLOADS,path.basename(p.image));if(fs.existsSync(f))fs.unlinkSync(f)}d.products=d.products.filter(x=>x.id!=req.params.id);write(d);res.json({ok:true})});
app.post("/api/orders",(req,res)=>{const {name,mobile,items,total}=req.body;if(!name||!mobile||!items?.length)return res.status(400).json({error:"Missing order details"});const d=read(),order={id:"ORD"+Date.now(),name,mobile,items,total,status:"Pending",createdAt:new Date().toISOString()};d.orders.push(order);write(d);res.status(201).json(order)});
app.get("/api/orders",admin,(req,res)=>res.json(read().orders));
app.use((err,req,res,next)=>res.status(400).json({error:err.message||"Upload error"}));
app.listen(PORT,()=>console.log("Urban Fashion API running on "+PORT));
