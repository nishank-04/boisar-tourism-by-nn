const mongoose = require('mongoose');
const User = require('../models/User');
const Destination = require('../models/Destination');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boisar_tourism', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting Boisar Tourism database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Destination.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@boisartourism.com',
      password: 'admin123',
      phone: '9876543210',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      address: {
        street: 'Station Road',
        city: 'Boisar',
        state: 'Maharashtra',
        country: 'India',
        pincode: '401501'
      }
    });
    console.log('👤 Created admin user: admin@boisartourism.com / admin123');

    // Create sample users
    await User.create([
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'user',
        isEmailVerified: true,
        preferences: {
          interests: ['trekking', 'photography', 'wildlife'],
          budget: 'medium',
          accommodation: 'hotel'
        }
      },
      {
        name: 'Priya Patil',
        email: 'priya@example.com',
        password: 'password123',
        phone: '9876543212',
        role: 'user',
        isEmailVerified: true,
        preferences: {
          interests: ['tribal', 'handicrafts', 'cuisine'],
          budget: 'high',
          accommodation: 'resort'
        }
      }
    ]);
    console.log('👥 Created sample users');

    // Create Boisar destinations
    const destinations = await Destination.create([
      {
        name: 'Kelva Beach',
        type: 'eco-tourism',
        category: 'Beach',
        description: 'Beautiful and serene beach known for its black sand, coconut trees, and peaceful environment. One of the most picturesque beaches near Boisar with the historic Kelva Fort nearby.',
        shortDescription: 'Serene black-sand beach with coconut groves and a historic fort nearby.',
        location: {
          address: 'Kelva, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.6140, lng: 72.7097 },
          region: 'coastal'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            alt: 'Kelva Beach with coconut trees',
            isPrimary: true
          }
        ],
        highlights: ['Black Sand Beach', 'Coconut Groves', 'Kelva Fort', 'Photography Spot', 'Peaceful Environment'],
        activities: [
          { name: 'Beach Walk', description: 'Leisurely walk along the shoreline', duration: '1 hour', difficulty: 'easy', price: 0, isAvailable: true },
          { name: 'Photography Tour', description: 'Guided photography session', duration: '2 hours', difficulty: 'easy', price: 200, isAvailable: true }
        ],
        facilities: ['parking', 'restroom', 'food-stalls'],
        timings: {
          open: '06:00',
          close: '20:00',
          days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
        },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: {
          months: ['october','november','december','january','february','march'],
          season: 'winter',
          description: 'Best from October to March. Monsoon season (June–September) brings lush greenery.'
        },
        contact: { phone: '+91-9876500001', email: 'info@boisartourism.com' },
        ratings: { average: 4.5, count: 312 },
        tags: ['beach', 'black-sand', 'peaceful', 'photography', 'fort'],
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Kaldurg Fort',
        type: 'eco-tourism',
        category: 'Fort',
        description: 'A popular trekking destination offering breathtaking views, especially during the monsoon season. The fort sits atop a hill surrounded by dense forests and is a favourite among trekkers.',
        shortDescription: 'Monsoon trekking hotspot with breathtaking hilltop views.',
        location: {
          address: 'Kaldurg, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7800, lng: 73.3200 },
          region: 'inland'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
            alt: 'Kaldurg Fort Trek',
            isPrimary: true
          }
        ],
        highlights: ['Panoramic Views', 'Monsoon Trekking', 'Dense Forest', 'Historic Fort', 'Sunrise Views'],
        activities: [
          { name: 'Trekking', description: 'Guided trek to the fort summit', duration: '3 hours', difficulty: 'medium', price: 300, isAvailable: true },
          { name: 'Sunrise Trek', description: 'Early morning trek for sunrise views', duration: '4 hours', difficulty: 'medium', price: 400, isAvailable: true }
        ],
        facilities: ['parking', 'guide', 'first-aid'],
        timings: { open: '05:00', close: '17:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 50, child: 25, senior: 25, foreigner: 200 } },
        bestTimeToVisit: {
          months: ['june','july','august','september','october','november'],
          season: 'monsoon',
          description: 'Best during monsoon (June–September) when the fort and forests are lush green.'
        },
        contact: { phone: '+91-9876500002', email: 'info@boisartourism.com' },
        ratings: { average: 4.7, count: 189 },
        tags: ['trekking', 'fort', 'monsoon', 'adventure', 'heritage'],
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Dahanu Beach',
        type: 'eco-tourism',
        category: 'Beach',
        description: 'A clean and peaceful beach famous for chikoo (sapota) orchards and relaxing coastal vibes. Dahanu is also known for its Parsee heritage and organic farming.',
        shortDescription: 'Peaceful beach town famous for chikoo orchards and Parsee culture.',
        location: {
          address: 'Dahanu, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.9665, lng: 72.7131 },
          region: 'coastal'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            alt: 'Dahanu Beach',
            isPrimary: true
          }
        ],
        highlights: ['Chikoo Orchards', 'Clean Beach', 'Parsee Heritage', 'Organic Farms', 'Scenic Sunsets'],
        activities: [
          { name: 'Orchard Visit', description: 'Tour of Dahanu chikoo orchards', duration: '2 hours', difficulty: 'easy', price: 150, isAvailable: true },
          { name: 'Beach Activities', description: 'Swimming and beach games', duration: '3 hours', difficulty: 'easy', price: 0, isAvailable: true }
        ],
        facilities: ['parking', 'restroom', 'restaurant', 'accommodation'],
        timings: { open: '06:00', close: '20:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: {
          months: ['october','november','december','january','february'],
          season: 'winter',
          description: 'Best during winter (October–February) for beaches and orchard visits.'
        },
        contact: { phone: '+91-9876500003', email: 'info@boisartourism.com' },
        ratings: { average: 4.4, count: 241 },
        tags: ['beach', 'chikoo', 'peaceful', 'culture', 'orchard'],
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Tarapur Fort',
        type: 'cultural',
        category: 'Heritage Site',
        description: 'A historic seaside fort offering scenic ocean views and a glimpse into the maritime history of the Palghar coast. The fort was built by the Portuguese and later used by the Marathas.',
        shortDescription: 'Historic Portuguese fort with scenic ocean views on the Palghar coast.',
        location: {
          address: 'Tarapur, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.8596, lng: 72.6852 },
          region: 'coastal'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            alt: 'Tarapur Fort Ocean View',
            isPrimary: true
          }
        ],
        highlights: ['Portuguese Architecture', 'Ocean Views', 'Maritime History', 'Sunset Point', 'Heritage Site'],
        activities: [
          { name: 'Heritage Walk', description: 'Guided tour of the fort ruins', duration: '1.5 hours', difficulty: 'easy', price: 100, isAvailable: true },
          { name: 'Sunset Photography', description: 'Sunset photography at the fort', duration: '1 hour', difficulty: 'easy', price: 0, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '07:00', close: '19:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 30, child: 15, senior: 15, foreigner: 100 } },
        bestTimeToVisit: {
          months: ['october','november','december','january','february','march'],
          season: 'winter',
          description: 'Best October to March. Sunset views are spectacular year-round.'
        },
        contact: { phone: '+91-9876500004', email: 'info@boisartourism.com' },
        ratings: { average: 4.2, count: 156 },
        tags: ['heritage', 'fort', 'portuguese', 'ocean', 'history'],
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Warli Tribal Villages',
        type: 'cultural',
        category: 'Village Tourism',
        description: 'Experience authentic Warli tribal life, traditions, and the famous Warli art form in traditional villages around the Palghar district. Learn to paint, cook tribal food, and explore forest life.',
        shortDescription: 'Immersive tribal village experience with Warli art, culture, and cuisine.',
        location: {
          address: 'Warli Villages, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7000, lng: 73.0000 },
          region: 'inland'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578657284485-08ac2e00b32a?w=800',
            alt: 'Warli Art Paintings',
            isPrimary: true
          }
        ],
        highlights: ['Warli Painting', 'Tribal Life', 'Forest Walks', 'Local Cuisine', 'Cultural Exchange'],
        activities: [
          { name: 'Warli Painting Workshop', description: 'Learn traditional Warli art from local artists', duration: '2 hours', difficulty: 'easy', price: 350, isAvailable: true },
          { name: 'Village Homestay', description: 'Overnight stay in a tribal village', duration: '24 hours', difficulty: 'easy', price: 1200, isAvailable: true },
          { name: 'Forest Walk', description: 'Guided walk through tribal forest', duration: '2 hours', difficulty: 'easy', price: 200, isAvailable: true }
        ],
        facilities: ['guide', 'accommodation', 'food'],
        timings: { open: '08:00', close: '20:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: {
          months: ['october','november','december','january','february','march'],
          season: 'winter',
          description: 'Best October to March. Tribal festivals happen during various months — check local calendar.'
        },
        contact: { phone: '+91-9876500005', email: 'info@boisartourism.com' },
        ratings: { average: 4.8, count: 98 },
        tags: ['tribal', 'warli', 'culture', 'homestay', 'art'],
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Kohoj Hill',
        type: 'eco-tourism',
        category: 'Trek',
        description: 'A scenic trekking spot with lush greenery and panoramic views, perfect for adventure seekers. Kohoj Hill offers one of the most rewarding treks in the Palghar district.',
        shortDescription: 'Rewarding trek with panoramic views over the Western Ghats foothills.',
        location: {
          address: 'Kohoj, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7500, lng: 73.2000 },
          region: 'inland'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
            alt: 'Kohoj Hill Trek',
            isPrimary: true
          }
        ],
        highlights: ['Panoramic Views', 'Dense Forests', 'Rock Climbing', 'Wildlife Spotting', 'Sunrise Views'],
        activities: [
          { name: 'Trekking', description: 'Guided trek to Kohoj summit', duration: '4 hours', difficulty: 'hard', price: 400, isAvailable: true },
          { name: 'Nature Walk', description: 'Easy nature walk at the foothills', duration: '1.5 hours', difficulty: 'easy', price: 150, isAvailable: true }
        ],
        facilities: ['parking', 'guide', 'first-aid'],
        timings: { open: '05:30', close: '16:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 50, child: 25, senior: 25, foreigner: 200 } },
        bestTimeToVisit: {
          months: ['october','november','december','january','february','march'],
          season: 'winter',
          description: 'Best October to February. Avoid peak summer; monsoon is green but slippery.'
        },
        contact: { phone: '+91-9876500006', email: 'info@boisartourism.com' },
        ratings: { average: 4.6, count: 143 },
        tags: ['trekking', 'adventure', 'nature', 'hills', 'panoramic'],
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Gholvad Beach',
        type: 'eco-tourism',
        category: 'Beach',
        description: 'A serene and uncrowded beach with pristine shoreline, perfect for swimming and water activities.',
        shortDescription: 'Uncrowded beach with clean waters and sunrise views.',
        location: {
          address: 'Gholvad, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.8800, lng: 72.7200 },
          region: 'coastal'
        },
        highlights: ['Clean Waters', 'Pristine Shoreline', 'Water Sports', 'Sunrise Views'],
        activities: [
          { name: 'Swimming', description: 'Safe swimming in clean waters', duration: '2 hours', difficulty: 'easy', price: 0, isAvailable: true }
        ],
        facilities: ['parking', 'restroom'],
        timings: { open: '06:00', close: '19:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.5, count: 95 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Satpati Beach',
        type: 'eco-tourism',
        category: 'Beach',
        description: 'A beautiful coastal beach with fishing villages, offering authentic seaside village experience.',
        shortDescription: 'Fishing village beach with authentic coastal culture.',
        location: {
          address: 'Satpati, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.9200, lng: 72.6500 },
          region: 'coastal'
        },
        highlights: ['Fishing Villages', 'Coastal Life', 'Authentic Experience', 'Sea Activities'],
        activities: [
          { name: 'Village Tour', description: 'Guided tour of fishing villages', duration: '2 hours', difficulty: 'easy', price: 150, isAvailable: true }
        ],
        facilities: ['parking', 'food-stalls'],
        timings: { open: '06:00', close: '19:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.3, count: 78 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Shirgaon Beach',
        type: 'eco-tourism',
        category: 'Beach',
        description: 'A scenic beach near Shirgaon fort with beautiful coastal views and adventure opportunities.',
        shortDescription: 'Scenic beach with nearby fort and adventure sports.',
        location: {
          address: 'Shirgaon, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7500, lng: 72.5800 },
          region: 'coastal'
        },
        highlights: ['Scenic Views', 'Fort Nearby', 'Adventure Sports', 'Coastal Beauty'],
        activities: [
          { name: 'Beach Adventure', description: 'Water sports and beach activities', duration: '3 hours', difficulty: 'medium', price: 250, isAvailable: true }
        ],
        facilities: ['parking', 'restroom', 'guide'],
        timings: { open: '06:00', close: '20:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.4, count: 88 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Arnala Beach',
        type: 'eco-tourism',
        category: 'Beach',
        description: 'A quiet beach with historical significance, known for its calm waters and beachside ruins.',
        shortDescription: 'Peaceful beach with historical ruins and calm waters.',
        location: {
          address: 'Arnala, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.8500, lng: 72.5200 },
          region: 'coastal'
        },
        highlights: ['Historical Ruins', 'Calm Waters', 'Quiet Atmosphere', 'Photography Spot'],
        activities: [
          { name: 'Historical Tour', description: 'Guided historical tour of ruins', duration: '2 hours', difficulty: 'easy', price: 200, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:00', close: '19:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.2, count: 72 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Arnala Fort',
        type: 'historical',
        category: 'Fort',
        description: 'An ancient coastal fort with Portuguese and Mughal history, offering panoramic sea views.',
        shortDescription: 'Historic coastal fort with sea views and ancient architecture.',
        location: {
          address: 'Arnala, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.8520, lng: 72.5180 },
          region: 'coastal'
        },
        highlights: ['Historic Architecture', 'Sea Views', 'Ancient Ruins', 'Photography Location'],
        activities: [
          { name: 'Fort Exploration', description: 'Self-guided exploration of the fort', duration: '1.5 hours', difficulty: 'easy', price: 30, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:00', close: '18:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 30, child: 15, senior: 15, foreigner: 100 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.3, count: 85 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Asherigad Fort',
        type: 'historical',
        category: 'Fort',
        description: 'A hilltop fort with breathtaking views and historical significance in Palghar region.',
        shortDescription: 'Hilltop fort with panoramic views and nature trails.',
        location: {
          address: 'Asherigad, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.6100, lng: 73.2300 },
          region: 'inland'
        },
        highlights: ['Hilltop Location', 'Panoramic Views', 'Historical Ruins', 'Nature Trails'],
        activities: [
          { name: 'Trekking', description: 'Trek to hilltop fort', duration: '3 hours', difficulty: 'medium', price: 200, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '6:00', close: '17:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 50 } },
        bestTimeToVisit: { months: ['june','july','august','september','october','november'], season: 'monsoon' },
        ratings: { average: 4.6, count: 110 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Tandulwadi Fort',
        type: 'historical',
        category: 'Fort',
        description: 'A lesser-known hilltop fort surrounded by greenery and offering scenic monsoon views.',
        shortDescription: 'Monsoon fort trek with lush green surroundings.',
        location: {
          address: 'Tandulwadi, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.5800, lng: 73.1500 },
          region: 'inland'
        },
        highlights: ['Hill Fort', 'Monsoon Views', 'Lush Greenery', 'Adventure Trekking'],
        activities: [
          { name: 'Monsoon Trek', description: 'Trek during monsoon season', duration: '4 hours', difficulty: 'hard', price: 300, isAvailable: true }
        ],
        facilities: ['parking', 'guide', 'first-aid'],
        timings: { open: '05:30', close: '17:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 50 } },
        bestTimeToVisit: { months: ['june','july','august','september','october','november'], season: 'monsoon' },
        ratings: { average: 4.4, count: 92 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Shirgaon Fort',
        type: 'historical',
        category: 'Fort',
        description: 'A historic coastal fort with sea views, perfect for trekking and photography.',
        shortDescription: 'Coastal fort with trekking trail and scenic seascape.',
        location: {
          address: 'Shirgaon, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7520, lng: 72.5750 },
          region: 'coastal'
        },
        highlights: ['Coastal Fort', 'Sea Views', 'Trekking Trail', 'Historical Site'],
        activities: [
          { name: 'Fort Trek', description: 'Trek to the coastal fort', duration: '2.5 hours', difficulty: 'medium', price: 250, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:00', close: '18:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 20, child: 10, senior: 10, foreigner: 80 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.5, count: 98 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Bordi Beach',
        type: 'eco-tourism',
        category: 'Beach',
        description: 'A long sandy beach ideal for relaxation, with nearby resorts and recreational facilities.',
        shortDescription: 'Family-friendly beach with resort facilities and water sports.',
        location: {
          address: 'Bordi, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.9800, lng: 72.6800 },
          region: 'coastal'
        },
        highlights: ['Sandy Beach', 'Resort Facilities', 'Water Sports', 'Sunset Views'],
        activities: [
          { name: 'Beach Resort Stay', description: 'Relax at beach resorts', duration: 'varies', difficulty: 'easy', price: 500, isAvailable: true }
        ],
        facilities: ['parking', 'restroom', 'food-stalls', 'accommodation'],
        timings: { open: '06:00', close: '21:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.4, count: 105 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Kalamb Beach',
        type: 'eco-tourism',
        category: 'Beach',
        description: 'A secluded beach with peaceful environment, far from crowds, perfect for nature lovers.',
        shortDescription: 'Secluded beach perfect for quiet getaway.',
        location: {
          address: 'Kalamb, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.9400, lng: 72.5500 },
          region: 'coastal'
        },
        highlights: ['Secluded Beach', 'Peaceful Environment', 'Nature Walks', 'Photography Opportunity'],
        activities: [
          { name: 'Beach Meditation', description: 'Peaceful beach meditation', duration: '1 hour', difficulty: 'easy', price: 100, isAvailable: true }
        ],
        facilities: ['parking'],
        timings: { open: '06:00', close: '18:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.3, count: 68 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Surya River Dam',
        type: 'eco-tourism',
        category: 'Lake',
        description: 'A scenic dam with water activities and peaceful riverside trails for nature enthusiasts.',
        shortDescription: 'Scenic dam with water activities and nature trails.',
        location: {
          address: 'Surya River Dam, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7000, lng: 73.0500 },
          region: 'inland'
        },
        highlights: ['Water Activities', 'Scenic Trails', 'River Beauty', 'Nature Experience'],
        activities: [
          { name: 'River Rafting', description: 'Guided river rafting', duration: '3 hours', difficulty: 'medium', price: 400, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:00', close: '18:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['june','july','august','september','october','november'], season: 'monsoon' },
        ratings: { average: 4.2, count: 55 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Vaitarna Lake',
        type: 'eco-tourism',
        category: 'Lake',
        description: 'A peaceful lake surrounded by hills and forests, ideal for bird watching and nature photography.',
        shortDescription: 'Serene lake perfect for bird watching and nature photography.',
        location: {
          address: 'Vaitarna Lake, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.5500, lng: 73.0800 },
          region: 'inland'
        },
        highlights: ['Bird Watching', 'Lake Scenery', 'Hill Views', 'Nature Photography'],
        activities: [
          { name: 'Bird Watching Tour', description: 'Guided bird watching', duration: '3 hours', difficulty: 'easy', price: 200, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:30', close: '17:30', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 50 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.4, count: 78 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Jai Vilas Palace',
        type: 'historical',
        category: 'Heritage Site',
        description: 'A majestic palace in Jawhar showcasing royal architecture and surrounding gardens.',
        shortDescription: 'Majestic palace with royal architecture and beautiful gardens.',
        location: {
          address: 'Jawhar, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7850, lng: 73.2550 },
          region: 'inland'
        },
        highlights: ['Royal Architecture', 'Historical Significance', 'Beautiful Gardens', 'Photography Spot'],
        activities: [
          { name: 'Palace Tour', description: 'Guided palace tour', duration: '1.5 hours', difficulty: 'easy', price: 50, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '09:00', close: '17:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday'] },
        pricing: { entryFee: { adult: 50, child: 25, senior: 25, foreigner: 150 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.5, count: 115 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Shirpamal Sunset Point',
        type: 'eco-tourism',
        category: 'Hill Station',
        description: 'A stunning sunset viewpoint in Jawhar with panoramic views of the surrounding landscape.',
        shortDescription: 'Best sunset viewpoint with panoramic landscape views.',
        location: {
          address: 'Jawhar, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7900, lng: 73.2600 },
          region: 'inland'
        },
        highlights: ['Sunset Views', 'Panoramic Landscape', 'Photography Location', 'Romantic Spot'],
        activities: [
          { name: 'Sunset Viewing', description: 'Watch sunset from viewpoint', duration: '1.5 hours', difficulty: 'easy', price: 0, isAvailable: true }
        ],
        facilities: ['parking'],
        timings: { open: '16:00', close: '20:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['september','october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.8, count: 168 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Hanuman Point',
        type: 'eco-tourism',
        category: 'Hill Station',
        description: 'A scenic viewpoint near a Hanuman temple offering panoramic views and spiritual experience.',
        shortDescription: 'Scenic viewpoint with temple and spiritual atmosphere.',
        location: {
          address: 'Jawhar, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.7750, lng: 73.2400 },
          region: 'inland'
        },
        highlights: ['Viewpoint', 'Temple Visit', 'Spiritual Spot', 'Scenic Beauty'],
        activities: [
          { name: 'Temple Visit', description: 'Visit Hanuman temple and meditate', duration: '1 hour', difficulty: 'easy', price: 0, isAvailable: true }
        ],
        facilities: ['parking'],
        timings: { open: '06:00', close: '18:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['january','february','march','april','may','june','july','august','september','october','november','december'], season: 'spring' },
        ratings: { average: 4.6, count: 128 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Jai Sagar Dam',
        type: 'eco-tourism',
        category: 'Lake',
        description: 'A scenic dam in Jawhar surrounded by hills, perfect for bird watching and nature photography.',
        shortDescription: 'Scenic dam in hills with bird watching opportunities.',
        location: {
          address: 'Jawhar, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.8000, lng: 73.2700 },
          region: 'inland'
        },
        highlights: ['Bird Watching', 'Lake Views', 'Hill Surroundings', 'Nature Photography'],
        activities: [
          { name: 'Bird Watching', description: 'Guided bird watching tour', duration: '2.5 hours', difficulty: 'easy', price: 150, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:30', close: '17:30', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['october','november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.5, count: 92 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Vajreshwari Temple',
        type: 'cultural',
        category: 'Temple',
        description: 'An ancient temple dedicated to Goddess Vajreshwari, an important pilgrimage site in Palghar.',
        shortDescription: 'Ancient pilgrimage temple with spiritual significance.',
        location: {
          address: 'Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.6500, lng: 73.1200 },
          region: 'inland'
        },
        highlights: ['Ancient Temple', 'Religious Significance', 'Sacred Wells', 'Spiritual Experience'],
        activities: [
          { name: 'Temple Darshan', description: 'Visit temple and offer prayers', duration: '1.5 hours', difficulty: 'easy', price: 0, isAvailable: true }
        ],
        facilities: ['parking', 'food-stalls'],
        timings: { open: '05:00', close: '21:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['january','february','march','october','november','december'], season: 'winter' },
        ratings: { average: 4.6, count: 135 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Tansa Wildlife Sanctuary',
        type: 'eco-tourism',
        category: 'Wildlife Sanctuary',
        description: 'A rich wildlife sanctuary with diverse flora and fauna, ideal for nature and wildlife enthusiasts.',
        shortDescription: 'Wildlife sanctuary with diverse fauna and bird species.',
        location: {
          address: 'Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.4800, lng: 73.0000 },
          region: 'inland'
        },
        highlights: ['Wildlife Spotting', 'Bird Watching', 'Forest Trails', 'Biodiversity'],
        activities: [
          { name: 'Wildlife Safari', description: 'Guided wildlife safari tour', duration: '4 hours', difficulty: 'medium', price: 500, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:00', close: '17:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 50, child: 25, senior: 25, foreigner: 200 } },
        bestTimeToVisit: { months: ['november','december','january','february','march'], season: 'winter' },
        ratings: { average: 4.7, count: 155 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Dhekale Dam',
        type: 'eco-tourism',
        category: 'Lake',
        description: 'A scenic dam surrounded by greenery and hills, offering beautiful views and recreational activities.',
        shortDescription: 'Scenic dam with greenery and recreational activities.',
        location: {
          address: 'Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.5200, lng: 73.1500 },
          region: 'inland'
        },
        highlights: ['Dam Views', 'Scenic Landscape', 'Picnic Spot', 'Photography Location'],
        activities: [
          { name: 'Picnicking', description: 'Picnic by the dam', duration: 'varies', difficulty: 'easy', price: 0, isAvailable: true },
          { name: 'Boating', description: 'Boat ride on the dam', duration: '1.5 hours', difficulty: 'easy', price: 300, isAvailable: true }
        ],
        facilities: ['parking', 'food-stalls'],
        timings: { open: '06:00', close: '18:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 0, child: 0, senior: 0, foreigner: 0 } },
        bestTimeToVisit: { months: ['june','july','august','september','october','november'], season: 'monsoon' },
        ratings: { average: 4.3, count: 75 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Tandulwadi Waterfall',
        type: 'eco-tourism',
        category: 'Waterfall',
        description: 'A breathtaking seasonal waterfall near Tandulwadi fort surrounded by dense forests and rocky terrain.',
        shortDescription: 'Seasonal waterfall with scenic rocky terrain and forest surroundings.',
        location: {
          address: 'Tandulwadi, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.5850, lng: 73.1520 },
          region: 'inland'
        },
        highlights: ['Seasonal Beauty', 'Rocky Terrain', 'Forest Surroundings', 'Adventure Spot', 'Photography Location'],
        activities: [
          { name: 'Waterfall Trek', description: 'Trek to the seasonal waterfall', duration: '3 hours', difficulty: 'medium', price: 200, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:00', close: '17:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 15, child: 8, senior: 8, foreigner: 50 } },
        bestTimeToVisit: { months: ['july','august','september','october'], season: 'monsoon' },
        ratings: { average: 4.5, count: 98 },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Kalmandavi Waterfall',
        type: 'eco-tourism',
        category: 'Waterfall',
        description: 'A stunning hidden waterfall nestled in the Palghar hills, known for its pristine waters and lush green surroundings.',
        shortDescription: 'Hidden waterfall with pristine waters and lush surroundings.',
        location: {
          address: 'Kalmandavi, Palghar District, Maharashtra',
          district: 'Palghar',
          state: 'Maharashtra',
          coordinates: { lat: 19.5650, lng: 73.2000 },
          region: 'inland'
        },
        highlights: ['Hidden Waterfall', 'Pristine Waters', 'Lush Green Surroundings', 'Photography Spot', 'Nature Paradise'],
        activities: [
          { name: 'Waterfall Swimming', description: 'Swim in pristine waterfall pool', duration: '2 hours', difficulty: 'easy', price: 100, isAvailable: true }
        ],
        facilities: ['parking', 'guide'],
        timings: { open: '06:00', close: '18:00', days: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
        pricing: { entryFee: { adult: 20, child: 10, senior: 10, foreigner: 75 } },
        bestTimeToVisit: { months: ['june','july','august','september','october'], season: 'monsoon' },
        ratings: { average: 4.6, count: 112 },
        isActive: true,
        isFeatured: false
      }
    ]);

    console.log('🏖️  Created Boisar destinations');
    console.log('✅ Database seeding completed successfully!');
    console.log(`👤 Admin: admin@boisartourism.com / admin123`);
    console.log(`👥 Sample users: rahul@example.com / password123, priya@example.com / password123`);
    console.log(`🏖️  Created ${destinations.length} Boisar destinations`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
