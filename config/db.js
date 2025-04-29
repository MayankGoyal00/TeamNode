const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const config = require("./config.json");
const errorHandler = require("../utils").errorHandler;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.use('/generatedForms', express.static(path.join(__dirname, 'generatedForms')));

// MongoDB Connection
mongoose
    .connect(
        "mongodb+srv://admin:JGokxCnVi560ZzkG@valtech.qob8mle.mongodb.net/nodeDB?retryWrites=true&w=majority&appName=Valtech"
    )
    .then(() => console.log("Database Connected !!"))
    .catch((err) => console.log("Error when connecting database :", err));

// Schema & ObjectId
const schema = mongoose.Schema;
const ObjectId = schema.ObjectId;

// Models
const User = mongoose.model("User", new schema({
    id: ObjectId,
    firstName: String,
    lastName: String,
    password: String,
    email: String,
}));

const Admin = mongoose.model("Admin", new schema({
    id: ObjectId,
    username: String,
    password: String,
    email: String,
}));

const Form = mongoose.model("Form", new schema({
    id: ObjectId,
    formName: { type: String, required: true },
    formType: { type: String, required: true },
    fields: [
        {
            questionId: String,
            question: String,
            fieldType: String,
            validations: [{}]
        }
    ],
    createdBy: { type: ObjectId, ref: "Admin" }
}));

const FormResponse = mongoose.model("FormResponse", new schema({
    id: ObjectId,
    formId: { type: ObjectId, ref: "Form" },
    userId: { type: ObjectId, ref: "User" },   
    responses: [{
        questionId: String,
        answer: schema.Types.Mixed
    }]
}));



async function createDefaultAdmin() {
    try {
        const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
        if (!existingAdmin) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash("admin123", saltRounds); // Default admin password

            const admin = new Admin({
                username: "Admin",
                email: "admin@example.com",
                password: hashedPassword,
            });

            await admin.save();
            console.log("Default admin user created with email: admin@example.com and password: admin123");
        } else {
            console.log("Admin user already exists.");
        }
    } catch (err) {
        console.error("Error creating default admin:", err);
    }
}

createDefaultAdmin();


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;


        const admin = await Admin.findOne({ email });
        if (admin) {
            const isMatch = await bcrypt.compare(password, admin.password);
            if (isMatch) {
                return res.status(200).send({ role: "admin", user: admin });
            }
        }

 
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return res.status(200).send({ role: "user", user });
            }
        }

        res.status(401).send({ message: "Invalid email or password." });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send({ message: "Internal server error." });
    }
});


app.post("/data", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;


        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

   
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        const savedUser = await user.save();
        res.status(200).send({ message: "User added", user: savedUser });
    } catch (err) {
        console.error("Error during user registration:", err);
        res.status(500).send({ message: "Internal server error." });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/register.html"));
});

app.get("/formCreation.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/formCreation.html"));
});

app.post("/generateForm", async (req, res) => {
    try {
        const { formName, formType, fields } = req.body;

        if (!formName || !formType || !fields || !Array.isArray(fields)) {
            return res.status(400).send("Invalid form data.");
        }

      
        const admin = await Admin.findOne();
        if (!admin) return res.status(400).send("Admin not found.");

        const newForm = new Form({
            formName,
            formType,
            fields,
            createdBy: admin._id
        });

        const savedForm = await newForm.save();
        console.log("Form Saved in DB:", savedForm);

        res.send(`
            <h2>Form Saved Successfully in Database!</h2>
            <p><a href="/">Create Another Form</a></p>
        `);
    } catch (err) {
        console.error("Error generating form:", err);
        res.status(500).send("Something went wrong.");
    }
});

app.get("/getUser/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).send("User not found");
      res.json({ firstName: user.firstName });
    } catch (err) {
      res.status(500).send("Server error");
    }
  });
  


app.get("/data", (req, res) => {
    User.find()
        .then((users) => res.json(users))
        .catch((err) => errorHandler(err));
});

app.put("/edit/:uid", (req, res) => {
    User.findById({ _id: req.params.uid })
        .then((user) => res.send(user))
        .catch((err) => errorHandler(err));
});

app.put("/update/:uid", (req, res) => {
    User.findByIdAndUpdate(
        { _id: req.params.uid },
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        }
    )
        .then((dbres) => res.send({ message: "User updated", name: dbres.firstName }))
        .catch((err) => errorHandler(err));
});

app.delete("/edit/:uid", (req, res) => {
    User.findByIdAndDelete({ _id: req.params.uid })
        .then((dbres) => res.send({ message: "User deleted", name: dbres.firstName }))
        .catch((err) => errorHandler(err));
});


app.get("/viewForms", async (req, res) => {
    try {
        const forms = await Form.find();
        res.json(forms);
    } catch (err) {
        res.status(500).send("Error fetching forms");
    }
});

app.get("/fillForm/:formId", async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) return res.status(404).send("Form not found");
        res.json(form);
    } catch (err) {
        res.status(500).send("Error loading form");
    }
});



app.post("/submitForm/:formId", async (req, res) => {
    try {
      const { formId } = req.params;
      const { userId, ...answers } = req.body;  

      const form = await Form.findById(formId);
  
      if (!form) return res.status(404).send("Form not found");
  
      let responses = [];

      form.fields.forEach(field => {
        const answer = answers[field.questionId];
        if (answer !== undefined) {   
            responses.push({
              questionId: field.questionId,
              answer: answer
            });
        } else {
            responses.push({
              questionId: field.questionId,
              answer: ""
            });
        }
      });
  
      const formResponse = new FormResponse({
        formId: formId,
        userId: userId,            
        responses: responses
      });
  
      await formResponse.save();
  
      res.redirect("/thankyou.html");
  
    } catch (err) {
        console.error("Form submission error:", err);
        res.status(500).send("Error submitting form");
    }
});


app.get("/getAllResponses", async (req, res) => {
    try {
      const formResponses = await FormResponse.find().populate('formId').populate('userId');
  
      const formattedResponses = formResponses.map(fr => {
        if (!fr.formId) {
          console.warn(`Missing formId for FormResponse with ID: ${fr._id}`);
          return null;
        }
  
        const questions = fr.formId.fields || [];
        const responses = fr.responses.map(r => {
          const questionObj = questions.find(q => q.questionId === r.questionId);
          return {
            question: questionObj ? questionObj.question : r.questionId,
            answer: r.answer
          };
        });
  
        return {
          _id: fr._id,
          formId: fr.formId._id,
          formName: fr.formId.formName,
          formType: fr.formId.formType,
          userId: fr.userId?._id || null,
          userName: fr.userId?.firstName || "Unknown",  
          responses: responses
        };
      }).filter(response => response !== null);
  
      res.json(formattedResponses);
    } catch (error) {
      console.error("Error fetching form responses:", error);
      res.status(500).send("Failed to fetch responses");
    }
  });
  
  

app.delete("/deleteForm/:id", async (req, res) => {
    try {
      const formId = req.params.id;
      await Form.findByIdAndDelete(formId); 
      res.status(200).send({ message: "Form deleted successfully." });
    } catch (error) {
      console.error("Error deleting form:", error);
      res.status(500).send({ message: "Failed to delete the form." });
    }
  });
  app.delete("/deleteFormResponse/:id", async (req, res) => {
    try {
      const responseId = req.params.id;
      await FormResponse.findByIdAndDelete(responseId);
      res.status(200).send({ message: "Form response deleted successfully." });
    } catch (error) {
      console.error("Error deleting form response:", error);
      res.status(500).send({ message: "Failed to delete form response." });
    }
  });
  
  
  


console.log(`Port: ${config.port}, Host: ${config.host}`);
app.listen(config.port, config.host, () => {
    console.log(`🚀 Server running at http://${config.host}:${config.port}`);
});