const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;
const uri = "mongodb+srv://sanketpattanshetti17:IqB5Sss95a3YAWdH@cluster0.snlgaa6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let collection;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));


async function connectDB() {
    try {
        await client.connect();
        const db = client.db('hospital');
        collection = db.collection('patients');
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    }
}

connectDB();
//
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const users = client.db('hospital').collection('users');
const JWT_SECRET = 'your-secret-key';

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const exists = await users.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  await users.insertOne({ email, password: hash });
  res.json({ message: 'Signup successful' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await users.findOne({ email });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid password' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

//
// GET all patients
app.get('/patients', async (req, res) => {
    try {
        const patients = await collection.find().toArray();
        res.json(patients);
    } catch (err) {
        console.error("Error fetching patients:", err);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
});

// POST a new patient
app.post('/patients', async (req, res) => {
    try {
        const newPatient = { ...req.body, prescriptions: [] }; // Initialize prescriptions array
        const result = await collection.insertOne(newPatient);
        res.json(result);
    } catch (err) {
        console.error("Error inserting patient:", err);
        res.status(500).json({ error: "Failed to insert patient" });
    }
});

// PUT update a patient
app.put('/patients/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(result);
    } catch (err) {
        console.error("Error updating patient:", err);
        res.status(500).json({ error: "Failed to update patient" });
    }
});

// DELETE a patient
app.delete('/patients/:id', async (req, res) => {
    try {
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
    } catch (err) {
        console.error("Error deleting patient:", err);
        res.status(500).json({ error: "Failed to delete patient" });
    }
});

// GET all prescriptions for a patient
app.get('/patients/:id/prescriptions', async (req, res) => {
    try {
        const patient = await collection.findOne({ _id: new ObjectId(req.params.id) });
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(patient.prescriptions || []);
    } catch (err) {
        console.error("Error fetching prescriptions:", err);
        res.status(500).json({ error: "Failed to fetch prescriptions" });
    }
});

// POST a new prescription for a patient
app.post('/patients/:id/prescriptions', async (req, res) => {
    try {
        const newPrescription = req.body;
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { prescriptions: newPrescription } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(result);
    } catch (err) {
        console.error("Error adding prescription:", err);
        res.status(500).json({ error: "Failed to add prescription" });
    }
});

// PUT update a prescription for a patient
app.put('/patients/:patientId/prescriptions/:prescriptionId', async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const prescriptionId = req.params.prescriptionId;
        const updatedPrescription = req.body;

        const result = await collection.updateOne(
            { _id: new ObjectId(patientId), "prescriptions._id": prescriptionId },
            { $set: { "prescriptions.$": updatedPrescription } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Patient or prescription not found" });
        }

        res.json(result);
    } catch (err) {
        console.error("Error updating prescription:", err);
        res.status(500).json({ error: "Failed to update prescription" });
    }
});

// DELETE a prescription for a patient
app.delete('/patients/:patientId/prescriptions/:prescriptionId', async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const prescriptionId = req.params.prescriptionId;

        const result = await collection.updateOne(
            { _id: new ObjectId(patientId) },
            { $pull: { prescriptions: { _id: prescriptionId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Patient or prescription not found" });
        }

        res.json({ message: "Prescription deleted successfully" });
    } catch (err) {
        console.error("Error deleting prescription:", err);
        res.status(500).json({ error: "Failed to delete prescription" });
    }
});

app.listen(port,"0.0.0.0", () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
