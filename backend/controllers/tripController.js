const Trip = require('../models/Trip');
const Destination = require('../models/Destination');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all trips for user
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let filter = { user: req.user.id, isActive: true };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('destinations.destination', 'name images location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Trip.countDocuments(filter);

    res.json({
      success: true,
      count: trips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: trips
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    })
      .populate('destinations.destination', 'name images location description activities')
      .populate('itinerary.activities.bookingId', 'confirmationCode status')
      .populate('itinerary.accommodation.bookingId', 'confirmationCode status')
      .populate('itinerary.transport.bookingId', 'confirmationCode status');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res, next) => {
  try {
    const {
      title,
      description,
      duration,
      groupSize,
      budget,
      interests,
      accommodation,
      destinations,
      notes
    } = req.body;

    // Validate destinations exist
    if (destinations && destinations.length > 0) {
      const destinationIds = destinations.map(d => d.destination);
      const existingDestinations = await Destination.find({
        _id: { $in: destinationIds },
        isActive: true
      });

      if (existingDestinations.length !== destinationIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more destinations not found'
        });
      }
    }

    const tripData = {
      user: req.user.id,
      title,
      description,
      duration,
      groupSize,
      budget,
      interests,
      accommodation,
      destinations,
      notes
    };

    const trip = await Trip.create(tripData);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'title', 'description', 'duration', 'groupSize', 'budget',
      'interests', 'accommodation', 'destinations', 'itinerary',
      'estimatedCost', 'status', 'isPublic', 'notes', 'tags'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, isActive: true },
      updates,
      { new: true, runValidators: true }
    )
      .populate('destinations.destination', 'name images location');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate itinerary
// @route   POST /api/trips/generate-itinerary
// @access  Private
exports.generateItinerary = async (req, res, next) => {
  try {
    const {
      duration,
      interests,
      budget,
      accommodation,
      destinations,
      groupSize,
      email,
      title
    } = req.body;

    if (!destinations || destinations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one destination is required'
      });
    }

    // Get destination details
    const destinationIds = destinations.map(d => d.destination);
    const destinationDocs = await Destination.find({
      _id: { $in: destinationIds },
      isActive: true
    });

    if (destinationDocs.length !== destinationIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more destinations not found'
      });
    }

    // Generate itinerary based on interests and destinations
    const itinerary = generateItineraryData(
      duration,
      interests,
      budget,
      accommodation,
      destinationDocs,
      groupSize
    );

    const estimatedCost = calculateEstimatedCost(itinerary, budget);

    // Create trip record
    const tripData = {
      user: req.user?.id || null,
      title: title || 'Generated Itinerary',
      description: `Trip to ${destinationDocs.map(d => d.name).join(', ')}`,
      duration,
      groupSize,
      budget,
      interests,
      accommodation,
      destinations: destinations.map(d => ({
        destination: d.destination,
        days: d.days || 1,
        order: d.order || 1
      })),
      itinerary,
      estimatedCost,
      status: 'planned'
    };

    const trip = await Trip.create(tripData);

    // Send email with itinerary if email provided
    if (email) {
      try {
        const emailHtml = generateItineraryEmail(trip, itinerary, estimatedCost);
        
        await sendEmail({
          email,
          subject: `Your Boisar Tourism Itinerary - ${trip.title}`,
          message: emailHtml
        });

        console.log(`Itinerary email sent to ${email}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      message: email ? 'Itinerary generated and sent to your email!' : 'Itinerary generated successfully!',
      data: {
        trip,
        itinerary,
        estimatedCost
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip recommendations
// @route   GET /api/trips/recommendations
// @access  Private
exports.getTripRecommendations = async (req, res, next) => {
  try {
    const { interests, budget, duration } = req.query;

    let filter = { isActive: true, isFeatured: true };
    
    if (interests) {
      const interestArray = interests.split(',');
      filter.tags = { $in: interestArray };
    }

    const destinations = await Destination.find(filter)
      .select('name images location type category ratings')
      .sort({ 'ratings.average': -1 })
      .limit(6);

    // Generate trip recommendations based on user preferences
    const recommendations = destinations.map(dest => ({
      destination: dest,
      suggestedDuration: getSuggestedDuration(dest.type),
      estimatedCost: getEstimatedCost(dest, budget),
      activities: getSuggestedActivities(dest, interests)
    }));

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share trip
// @route   POST /api/trips/:id/share
// @access  Private
exports.shareTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Generate share code if not exists
    if (!trip.shareCode) {
      trip.shareCode = trip.generateShareCode();
    }

    trip.isPublic = true;
    await trip.save();

    res.json({
      success: true,
      message: 'Trip shared successfully',
      data: {
        shareCode: trip.shareCode,
        shareUrl: `${process.env.FRONTEND_URL}/trip/${trip.shareCode}`
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate itinerary data
function generateItineraryData(duration, interests, budget, accommodation, destinations, groupSize) {
  const itinerary = [];
  const totalDays = duration.days;

  for (let day = 1; day <= totalDays; day++) {
    const dayDate = new Date(duration.startDate);
    dayDate.setDate(dayDate.getDate() + day - 1);

    const dayItinerary = {
      day,
      date: dayDate,
      activities: [],
      meals: [],
      accommodation: null,
      transport: [],
      notes: ''
    };

    // Add morning activity
    if (interests.includes('wildlife')) {
      dayItinerary.activities.push({
        time: '08:00',
        activity: 'Wildlife Safari',
        location: destinations[0]?.name || 'National Park',
        duration: '3 hours',
        description: 'Early morning wildlife spotting',
        cost: 500,
        bookingRequired: true
      });
    } else if (interests.includes('trekking')) {
      dayItinerary.activities.push({
        time: '07:00',
        activity: 'Nature Trek',
        location: destinations[0]?.name || 'Hill Station',
        duration: '4 hours',
        description: 'Scenic trekking trail',
        cost: 300,
        bookingRequired: false
      });
    } else {
      dayItinerary.activities.push({
        time: '09:00',
        activity: 'Sightseeing',
        location: destinations[0]?.name || 'Tourist Spot',
        duration: '2 hours',
        description: 'Explore local attractions',
        cost: 200,
        bookingRequired: false
      });
    }

    // Add lunch
    dayItinerary.meals.push({
      type: 'lunch',
      time: '13:00',
      location: 'Local Restaurant',
      description: 'Traditional Boisar cuisine',
      cost: 300
    });

    // Add afternoon activity
    if (interests.includes('cultural')) {
      dayItinerary.activities.push({
        time: '15:00',
        activity: 'Cultural Experience',
        location: 'Tribal Village',
        duration: '2 hours',
        description: 'Traditional dance and handicrafts',
        cost: 400,
        bookingRequired: true
      });
    } else {
      dayItinerary.activities.push({
        time: '15:00',
        activity: 'Photography Session',
        location: 'Scenic Viewpoint',
        duration: '2 hours',
        description: 'Capture beautiful landscapes',
        cost: 100,
        bookingRequired: false
      });
    }

    // Add dinner
    dayItinerary.meals.push({
      type: 'dinner',
      time: '20:00',
      location: 'Hotel Restaurant',
      description: 'Local specialties',
      cost: 400
    });

    // Add accommodation
    dayItinerary.accommodation = {
      name: `${accommodation} Stay`,
      location: destinations[0]?.name || 'Destination',
      type: accommodation,
      cost: getAccommodationCost(accommodation, budget)
    };

    itinerary.push(dayItinerary);
  }

  return itinerary;
}

// Helper function to calculate estimated cost
function calculateEstimatedCost(itinerary, budget) {
  let totalCost = 0;
  let accommodationCost = 0;
  let activityCost = 0;
  let mealCost = 0;

  itinerary.forEach(day => {
    // Accommodation cost
    if (day.accommodation) {
      accommodationCost += day.accommodation.cost || 0;
    }

    // Activity costs
    day.activities.forEach(activity => {
      activityCost += activity.cost || 0;
    });

    // Meal costs
    day.meals.forEach(meal => {
      mealCost += meal.cost || 0;
    });
  });

  totalCost = accommodationCost + activityCost + mealCost;

  return {
    accommodation: accommodationCost,
    activities: activityCost,
    meals: mealCost,
    transport: 0,
    miscellaneous: totalCost * 0.1, // 10% buffer
    total: totalCost * 1.1
  };
}

// Helper function to get suggested duration
function getSuggestedDuration(type) {
  const durationMap = {
    'eco-tourism': '2-3 days',
    'cultural': '1-2 days',
    'adventure': '3-5 days',
    'religious': '1 day',
    'historical': '1-2 days'
  };
  return durationMap[type] || '2-3 days';
}

// Helper function to get estimated cost
function getEstimatedCost(destination, budget) {
  const baseCost = destination.pricing?.entryFee?.adult || 100;
  const budgetMultiplier = {
    'low': 1,
    'medium': 2,
    'high': 3
  };
  return baseCost * (budgetMultiplier[budget] || 1);
}

// Helper function to get suggested activities
function getSuggestedActivities(destination, interests) {
  const activities = [];
  
  if (interests.includes('wildlife')) {
    activities.push('Wildlife Safari', 'Bird Watching');
  }
  if (interests.includes('trekking')) {
    activities.push('Nature Trek', 'Hiking');
  }
  if (interests.includes('photography')) {
    activities.push('Photography Tour', 'Sunrise/Sunset Photography');
  }
  if (interests.includes('cultural')) {
    activities.push('Tribal Village Visit', 'Traditional Dance');
  }

  return activities.slice(0, 3); // Return top 3 activities
}

// Helper function to get accommodation cost
function getAccommodationCost(type, budget) {
  const costs = {
    'homestay': { low: 500, medium: 800, high: 1200 },
    'hotel': { low: 1000, medium: 2000, high: 3500 },
    'resort': { low: 2000, medium: 4000, high: 6000 },
    'camping': { low: 300, medium: 500, high: 800 }
  };
  return costs[type]?.[budget] || 1000;
}

// Helper function to generate email HTML
function generateItineraryEmail(trip, itinerary, estimatedCost) {
  const destinations = trip.destinations.map(d => d.destination).join(', ');
  
  let itineraryHtml = '';
  itinerary.forEach(day => {
    itineraryHtml += `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h3 style="color: #2d5a27; margin-bottom: 10px;">Day ${day.day} - ${day.date.toDateString()}</h3>
        <div style="margin-bottom: 10px;">
          <h4 style="color: #333; margin-bottom: 5px;">Activities:</h4>
          ${day.activities.map(activity => `
            <div style="margin-bottom: 5px; padding: 5px; background: #f8f9fa; border-radius: 4px;">
              <strong>${activity.time}</strong> - ${activity.activity} at ${activity.location}
              <br><small>${activity.description} (Duration: ${activity.duration}, Cost: ₹${activity.cost})</small>
            </div>
          `).join('')}
        </div>
        <div style="margin-bottom: 10px;">
          <h4 style="color: #333; margin-bottom: 5px;">Meals:</h4>
          ${day.meals.map(meal => `
            <div style="margin-bottom: 5px; padding: 5px; background: #f8f9fa; border-radius: 4px;">
              <strong>${meal.time}</strong> - ${meal.type} at ${meal.location}
              <br><small>${meal.description} (Cost: ₹${meal.cost})</small>
            </div>
          `).join('')}
        </div>
        ${day.accommodation ? `
          <div>
            <h4 style="color: #333; margin-bottom: 5px;">Accommodation:</h4>
            <div style="padding: 5px; background: #f8f9fa; border-radius: 4px;">
              ${day.accommodation.name} (${day.accommodation.type}) - ₹${day.accommodation.cost}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Your Boisar Tourism Itinerary</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #2d5a27, #4a7c59); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .cost-summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #2d5a27; color: white; padding: 15px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏔️ Your Boisar Tourism Itinerary</h1>
        <h2>${trip.title}</h2>
        <p>Destinations: ${destinations}</p>
        <p>Duration: ${trip.duration.days} days | Group Size: ${trip.groupSize} | Budget: ${trip.budget}</p>
      </div>
      
      <div class="content">
        <h2>📅 Detailed Itinerary</h2>
        ${itineraryHtml}
        
        <div class="cost-summary">
          <h3>💰 Estimated Cost Breakdown</h3>
          <p><strong>Accommodation:</strong> ₹${estimatedCost.accommodation}</p>
          <p><strong>Activities:</strong> ₹${estimatedCost.activities}</p>
          <p><strong>Meals:</strong> ₹${estimatedCost.meals}</p>
          <p><strong>Transport:</strong> ₹${estimatedCost.transport}</p>
          <p><strong>Miscellaneous:</strong> ₹${estimatedCost.miscellaneous}</p>
          <hr>
          <p><strong>Total Estimated Cost:</strong> ₹${estimatedCost.total}</p>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
          <h3>📝 Important Notes:</h3>
          <ul>
            <li>All costs are estimates and may vary</li>
            <li>Book accommodations and activities in advance</li>
            <li>Carry necessary permits for wildlife areas</li>
            <li>Check weather conditions before travel</li>
            <li>Keep emergency contacts handy</li>
          </ul>
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing Boisar Tourism!</p>
        <p>For support, contact us at info@boisartourism.com</p>
        <p>Visit our website: <a href="${process.env.FRONTEND_URL}" style="color: #fff;">${process.env.FRONTEND_URL}</a></p>
      </div>
    </body>
    </html>
  `;
}
