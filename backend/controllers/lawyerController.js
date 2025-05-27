const Lawyer = require('../models/Lawyer');
const mongoose = require('mongoose');

// Get all lawyers
const getAllLawyers = async (req, res) => {
  try {
    console.log('=== GET ALL LAWYERS ===');
    
    const lawyers = await Lawyer.find({})
      .select('-personalInfo.password')
      .sort({ 'personalInfo.fullName': 1 });
    
    console.log(`✅ Found ${lawyers.length} lawyers`);
    
    res.json({
      success: true,
      lawyers,
      count: lawyers.length
    });

  } catch (error) {
    console.error('❌ Get all lawyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lawyers'
    });
  }
};

// Get lawyer by ID
const getLawyerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== GET LAWYER BY ID ===');
    console.log('Lawyer ID:', id);
    
    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      console.log('❌ Invalid lawyer ID provided:', id);
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID is required and cannot be undefined'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid ObjectId format:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID format'
      });
    }

    const lawyer = await Lawyer.findById(id).select('-personalInfo.password');
    
    if (!lawyer) {
      console.log('❌ Lawyer not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    console.log('✅ Lawyer found:', lawyer.personalInfo.fullName);
    
    res.json({
      success: true,
      lawyer
    });

  } catch (error) {
    console.error('❌ Get lawyer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lawyer',
      error: error.message
    });
  }
};

// Register new lawyer
const registerLawyer = async (req, res) => {
  try {
    console.log('=== REGISTER LAWYER ===');
    
    const lawyerData = req.body;
    
    // Check if lawyer already exists
    const existingLawyer = await Lawyer.findOne({
      'personalInfo.email': lawyerData.personalInfo.email
    });

    if (existingLawyer) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer already exists with this email'
      });
    }

    const lawyer = new Lawyer(lawyerData);
    await lawyer.save();

    console.log('✅ Lawyer registered:', lawyer.personalInfo.fullName);

    res.status(201).json({
      success: true,
      lawyer: {
        ...lawyer.toObject(),
        personalInfo: {
          ...lawyer.personalInfo,
          password: undefined
        }
      },
      message: 'Lawyer registered successfully'
    });

  } catch (error) {
    console.error('❌ Register lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during lawyer registration',
      error: error.message
    });
  }
};

// Update lawyer
const updateLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== UPDATE LAWYER ===');
    console.log('Lawyer ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID format'
      });
    }

    const updatedLawyer = await Lawyer.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).select('-personalInfo.password');

    if (!updatedLawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    console.log('✅ Lawyer updated:', updatedLawyer.personalInfo.fullName);

    res.json({
      success: true,
      lawyer: updatedLawyer,
      message: 'Lawyer updated successfully'
    });

  } catch (error) {
    console.error('❌ Update lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating lawyer',
      error: error.message
    });
  }
};

// Delete lawyer
const deleteLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETE LAWYER ===');
    console.log('Lawyer ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID format'
      });
    }

    const deletedLawyer = await Lawyer.findByIdAndDelete(id);

    if (!deletedLawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    console.log('✅ Lawyer deleted:', deletedLawyer.personalInfo.fullName);

    res.json({
      success: true,
      message: 'Lawyer deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lawyer',
      error: error.message
    });
  }
};

// Search lawyers
const searchLawyers = async (req, res) => {
  try {
    const { specialization, location, experience } = req.query;
    
    console.log('=== SEARCH LAWYERS ===');
    console.log('Search params:', { specialization, location, experience });

    let query = {};

    if (specialization) {
      query['credentials.specializations'] = { $in: [new RegExp(specialization, 'i')] };
    }

    if (location) {
      query['personalInfo.city'] = new RegExp(location, 'i');
    }

    if (experience) {
      query['credentials.experience'] = { $gte: parseInt(experience) };
    }

    const lawyers = await Lawyer.find(query)
      .select('-personalInfo.password')
      .sort({ 'credentials.experience': -1 });

    console.log(`✅ Found ${lawyers.length} lawyers matching criteria`);

    res.json({
      success: true,
      lawyers,
      count: lawyers.length
    });

  } catch (error) {
    console.error('❌ Search lawyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching lawyers',
      error: error.message
    });
  }
};

module.exports = {
  getAllLawyers,
  getLawyerById,
  registerLawyer,
  updateLawyer,
  deleteLawyer,
  searchLawyers
};
