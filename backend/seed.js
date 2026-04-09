/* seed.js — Seeds initial data into MongoDB */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Hospital = require('./models/Hospital');
const Camp = require('./models/Camp');
const Lab = require('./models/Lab');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed Superadmin
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const admin = new Admin({
        username: 'admin',
        email: 'admin@bloodlinks.in',
        password: 'bloodlinks@2024',
        role: 'superadmin',
      });
      await admin.save();
      console.log('✅ Superadmin created (username: admin, password: bloodlinks@2024)');
    } else {
      console.log('ℹ️  Superadmin already exists, skipping.');
    }

    // Seed Hospitals
    const hospCount = await Hospital.countDocuments();
    if (hospCount === 0) {
      const hospitals = [
        { name: 'Civil Hospital Ahmedabad', location: 'Ahmedabad, Gujarat', phone: '079-22683721', type: 'Government', bloodBank: true, desc: 'Largest government hospital in Gujarat with full blood bank and transfusion unit.' },
        { name: 'Sunshine Global Hospitals', location: 'Surat, Gujarat', phone: '0261-6663366', type: 'Private', bloodBank: true, desc: 'Multi-specialty private hospital with 24/7 blood bank services.' },
        { name: 'Sterling Hospital', location: 'Vadodara, Gujarat', phone: '0265-3988000', type: 'Private', bloodBank: true, desc: 'Leading private hospital with modern blood transfusion department.' },
        { name: 'Sir T. General Hospital', location: 'Bhavnagar, Gujarat', phone: '0278-2427550', type: 'Government', bloodBank: true, desc: 'Government referral hospital with comprehensive blood services.' },
        { name: 'Apollo Hospitals Navi Mumbai', location: 'Mumbai, Maharashtra', phone: '022-42697777', type: 'Private', bloodBank: true, desc: 'Apollo Hospitals with full-service blood bank and pathology.' },
        { name: 'KEM Hospital', location: 'Mumbai, Maharashtra', phone: '022-24136051', type: 'Government', bloodBank: true, desc: 'Municipal hospital with one of the largest blood banks in Maharashtra.' },
      ];
      for (const h of hospitals) { await new Hospital(h).save(); }
      console.log('✅ 6 hospitals seeded');
    } else {
      console.log('ℹ️  Hospitals already exist (' + hospCount + '), skipping.');
    }

    // Seed Camps
    const campCount = await Camp.countDocuments();
    if (campCount === 0) {
      const camps = [
        { name: 'Lions Club Blood Camp', location: 'Ahmedabad, Gujarat', date: '2024-04-20', time: '9:00 AM - 5:00 PM', org: 'Lions Club International', phone: '9876543210', desc: 'Annual mega blood donation drive.', type: 'Club' },
        { name: 'IIM Ahmedabad Student Drive', location: 'Ahmedabad, Gujarat', date: '2024-04-25', time: '10:00 AM - 4:00 PM', org: 'IIMA Student Council', phone: '9123456789', desc: 'Campus blood donation camp.', type: 'Educational Institution' },
        { name: 'Rotary Club Blood Camp', location: 'Vadodara, Gujarat', date: '2024-05-02', time: '8:00 AM - 6:00 PM', org: 'Rotary Club Vadodara', phone: '9234567890', desc: 'Community blood camp.', type: 'Club' },
        { name: 'Surat Youth Blood Drive', location: 'Surat, Gujarat', date: '2024-05-10', time: '9:00 AM - 3:00 PM', org: 'Youth Foundation Surat', phone: '9345678901', desc: 'Youth-led blood donation initiative.', type: 'NGO' },
        { name: 'NSS National Camp', location: 'Mumbai, Maharashtra', date: '2024-05-15', time: '9:00 AM - 5:00 PM', org: 'NSS Unit, Mumbai University', phone: '9456789012', desc: 'NSS blood donation camp.', type: 'Educational Institution' },
        { name: 'Rajkot Corporate Blood Drive', location: 'Rajkot, Gujarat', date: '2024-05-22', time: '10:00 AM - 4:00 PM', org: 'FICCI Rajkot Chapter', phone: '9567890123', desc: 'CSR blood camp.', type: 'Corporate' },
      ];
      for (const c of camps) { await new Camp(c).save(); }
      console.log('✅ 6 camps seeded');
    } else {
      console.log('ℹ️  Camps already exist (' + campCount + '), skipping.');
    }

    // Seed Labs
    const labCount = await Lab.countDocuments();
    if (labCount === 0) {
      const labs = [
        { name: 'SRL Diagnostics', location: 'Ahmedabad, Gujarat', phone: '1800-102-0805', type: 'Private', nabl: true, hours: '6:00 AM - 10:00 PM', services: 'CBC, Blood Group, Cross-matching, HbA1c', desc: 'Comprehensive blood and urine testing.' },
        { name: 'Dr. Lal Path Labs', location: 'Surat, Gujarat', phone: '1800-11-2222', type: 'Private', nabl: true, hours: '7:00 AM - 9:00 PM', services: 'Full blood panel, Hemogram, Special tests', desc: 'NABL-accredited lab.' },
        { name: 'Thyrocare', location: 'Vadodara, Gujarat', phone: '9999-879-879', type: 'Private', nabl: false, hours: '7:00 AM - 8:00 PM', services: 'CBC, Thyroid, Diabetes, Metabolic', desc: 'Budget-friendly diagnostic lab.' },
        { name: 'Metropolis Healthcare', location: 'Mumbai, Maharashtra', phone: '1800-212-4242', type: 'Private', nabl: true, hours: '24 Hours', services: 'Complete blood count, Coagulation, 4000+ tests', desc: 'ISO-certified lab.' },
        { name: 'Gujarat Government Lab', location: 'Gandhinagar, Gujarat', phone: '079-23253001', type: 'Government', nabl: true, hours: '8:00 AM - 6:00 PM', services: 'Basic blood tests, Blood group, Government subsidised', desc: 'State-run accredited pathology lab.' },
        { name: 'Neuberg Diagnostics', location: 'Rajkot, Gujarat', phone: '0281-2467111', type: 'Private', nabl: true, hours: '7:00 AM - 9:00 PM', services: 'CBC, Viral markers, Biochemistry', desc: 'Modern diagnostics lab.' },
      ];
      for (const l of labs) { await new Lab(l).save(); }
      console.log('✅ 6 labs seeded');
    } else {
      console.log('ℹ️  Labs already exist (' + labCount + '), skipping.');
    }

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
