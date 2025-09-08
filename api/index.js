require("dotenv").config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

//const expense = require('./expense');
//const routes = require('./routes')

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public'), {index: false}));
app.use(express.json());
app.use(cors({ origin: '*' }));

const uri = process.env.MONGO_URL;

let db, expensesCollection, usersCollection;
MongoClient.connect(uri)
.then(client => {
    console.log('Connected to Mongodb');
    db = client.db('appliancesApp');
    expensesCollection = db.collection('expenses');
    usersCollection = db.collection('users');
})
.catch(error => console.error(error));

const SECRET_KEY = process.env.JWT_SECRET;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
}) ; 

//New registration 
app.post('/register', async(req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email ||!password) {
        return res.status(400).json({message:'All fields are required'});
    }
    try{
        const existingUser = await usersCollection.findOne({email});
        if(existingUser){
            return res.status(400).json({message:'Email already registered'});
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = {name, email, password:hashedPassword };

        const result = await usersCollection.insertOne(newUser);
        if(result.insertedId){
            const token = jwt.sign(
                {userId: result.insertedId},
                SECRET_KEY,
                {expiresIn: '1h'}
            );
            res.status(201).json({message:'Registration successful', token,});
        }
    }catch (error) {
        console.error(error);
        res.status(500).json({message:'Internal server error'});
    }
});

//Get the users name in select field
/*app.get('/get-users', async (req, res) => {
    try {
        const users = await db.collection('users').find({}, { projection: { _id: 0, name: 1 } }).toArray();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});*/

//Login user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find the user in the database
        const user = await usersCollection.findOne({ email});
        if (!user) {
            return res.status(400).json({ message: 'Invalid email and password' });
        }

        // Compare the password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({userId: user._id, email: user.email}, SECRET_KEY, {expiresIn: '1h'});

        // Send success response
        res.status(200).json({ message: 'Login successful',token,  user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const verifyToken = (req, res, next) =>{
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token) {
        return res.redirect('/login.html');
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if(err) {
            return res.redirect('/login.html');
        }
        req.userId = decoded.userId;
        next();
    });
};

app.get('/index.html', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/expenses.html', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'expenses.html'));
});

app.get('/edit-profile.html', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'edit-profile.html'));
});

//Change password
app.post('/change-password', async(req, res) => {
    const { email, password} = req.body;
    if(!email || !password) {
        return res.status(400).json({message:'Email and Password are required'});
    }
    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const result = await usersCollection.updateOne(
            {email: email},
            {$set: {password: hashedPassword}}
        );

        if(result.modifiedCount === 0) {
            return res.status(400).json({message: 'email not found or password not updated'});
        }
        res.json({message: 'Password changed successfully'});
    }catch(error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
});

//Get user profile for updation
app.get('/get-user', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if(!token) {
        return res.status(401).json({message:'Unauthorized: No token provided'});
    }
    try{
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await usersCollection.findOne(
            {_id: new ObjectId(decoded.userId)}
        );
        if(!user) {
            return res.status(404).json({message:'user not found'});
        }
        res.json(user);
    } catch (error){
        console.error("JWT verification error:", error);
        res.status(401).json({message:'invalid or expired token'});
    }
});

//Update user profile
const bcrypt = require('bcryptjs');

app.put('/api/update-user', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        
        console.log("Received Data:", req.body); // Log incoming request

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let updatedFields = { name };

        if (password) {
            const isSamePassword = await bcrypt.compare(password, user.password);
            if (isSamePassword) {
                return res.status(400).json({ success: false, message: "New password must be different from the old password" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            updatedFields.password = hashedPassword;
        }

        const result = await usersCollection.updateOne(
            { email: email },
            { $set: updatedFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ success: false, message: "No changes detected" });
        }

        res.json({ success: true, message: "Profile updated successfully! Please log in with your new password." });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post('/add-expense', async(req,res) =>{
    try{
        const{appliances, expense, date, debit, options} = req.body;

        if(!appliances || !expense || !debit ) {
            return res.status(400).json({message: "appliances expense and debit can't be empty"});
        }
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const expenseDate = date ? new Date(date) : new Date();
        const result = await expensesCollection.insertOne
        ({appliances,
            expense,
            debit, 
            options,
            date: expenseDate});
        res.json ({message: 'Expense added successfully!',
        insertedId: result.insertedId
    });
     }catch (error) {
        console.error('Error saving expense:', error);
        res.status(500).json({message: 'Error saving expense'});
    }
});
// Get Data from/to date and drop-down
app.get('/api/expenses', async (req, res) => {
    try {
        const { type, fromDate, toDate } = req.query; 
        let filter = {};
        //console.log('Received fromDate:', fromDate, 'toDate:', toDate);
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        filter.userId = decoded.userId; 

        if(type && type !== 'all') {
            filter.debit = type;
        }
        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            //end.setDate(end.getDate() +1);
            to.setHours(23, 59, 59, 999) 

            filter.date= {
                    $gte: from,
                    $lte: to,
                };
        }

        const expenses = await expensesCollection.find(filter).toArray();
        res.status(200).json({
            success: true,
            message: 'Expenses fetched successfully!',
            data: expenses,
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expenses',
        });
    }
}); 

app.put('/api/expenses/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const {appliances, expense, debit, date, options} = req.body;

        const updatedField = {
            appliances,
            options,
            expense,
            debit
        };
        if(date) {
            updatedField.date = new Date(date);
        }
        const result = await expensesCollection.updateOne(
            {_id: new ObjectId(id)}, 
            { $set: updatedField }              
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({success: true, message:'Expense updated successfully!'});
        }else {
            res.status(404).json({success: false, message: 'Expense not found'});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Received delete request for ID: ${id}`);
        
        if(!ObjectId.isValid(id)) {
            console.error('invalid id format');
            return res.status(400).send('InValid ID');
        }
        const result = await expensesCollection.deleteOne(
            { _id: new ObjectId(id) } 
        );

        if (result.deletedCount === 1) {
            console.log('Document deleted successfully');
            res.status(200).send('Document deleted successfully');
        } else {
            console.warn('Document not found')
            res.status(404).send('Document not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/expenses/:id', async (req, res) =>{
    const id = req.params.id;
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' }) 
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const expense = await expensesCollection.findOne({
            _id: new ObjectId(id),
            userId: decoded.userId
        });
    
    if(expense) {
        console.log('Expense data:', expense);
        res.json({success: true, data: expense});
    }else {
        res.status(404).json({success: false, message: 'Expense not found'});
    }
    }catch(error){
        console.error('Error fetching expense:', error);
        res.status(500).json({success: false, message: 'Server error'})
    }
}); 

//Pending amount
app.get('/api/expense', async(req, res) => {
    try{
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const expenses = await expensesCollection.find({userId: decoded.userId}).toArray();

        const totalIncome = expenses
        .filter(item =>item.debit === 'Income')
        .reduce((sum, item) => sum + parseFloat(item.expense || 0), 0);

        const totalExpense = expenses
        .filter(item =>item.debit === 'Expense')
        .reduce((sum, item) =>sum + parseFloat(item.expense || 0), 0);

        const pendingAmount = totalIncome - totalExpense;

        res.status(200).json({
            success: true,
            message: 'Data fetched successfully1',
            data: {
                totalIncome,
                totalExpense,
                pendingAmount,
            },
        });
    }catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({success: false, message: 'Error fetching data'});
    }
});

app.use((req, res) => {
    res.redirect('/login.html');
});

app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
});

//GET(GET THE DATA)
//POST(READ THE DATA)
//PUT(UPDATE THE DATA)
//DELETE (DELETE THE DATA)
