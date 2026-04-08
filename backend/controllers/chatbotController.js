const ChatbotSession = require('../models/ChatbotSession');
const Destination = require('../models/Destination');

// @desc    Process chatbot message
// @route   POST /api/chatbot/message
// @access  Public
exports.processMessage = async (req, res, next) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Generate response using AI logic
    const response = await generateAIResponse(message, userId);

    // Save session if provided
    if (sessionId) {
      await saveMessageToSession(sessionId, message, response, userId);
    }

    res.json({
      success: true,
      data: {
        response,
        sessionId: sessionId || generateSessionId(),
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quick replies - SYNCED WITH FRONTEND (6 main items)
// @route   GET /api/chatbot/quick-replies
// @access  Public
exports.getQuickReplies = async (req, res, next) => {
  try {
    // SYNCED WITH FRONTEND chatbot.html quick-chips
    const quickReplies = [
      { id: 'best-places', text: 'Best places to visit', query: 'Best places to visit', emoji: '📍' },
      { id: 'eco-tourism', text: 'Eco tourism destinations', query: 'Eco tourism destinations', emoji: '🌿' },
      { id: 'cultural', text: 'Cultural experiences', query: 'Cultural experiences', emoji: '🎭' },
      { id: 'best-time', text: 'Best time to visit', query: 'Best time to visit', emoji: '📅' },
      { id: 'accommodation', text: 'Accommodation options', query: 'Accommodation options', emoji: '🏨' },
      { id: 'transport', text: 'Transportation', query: 'Transportation', emoji: '🚗' }
    ];

    res.json({ success: true, data: quickReplies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chatbot analytics
// @route   GET /api/chatbot/analytics
// @access  Private/Admin
exports.getChatbotAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {
      $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate ? new Date(endDate) : new Date()
    };

    const analytics = await ChatbotSession.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMessages: { $sum: '$messageCount' },
          averageMessagesPerSession: { $avg: '$messageCount' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          totalSessions: 1,
          totalMessages: 1,
          averageMessagesPerSession: { $round: ['$averageMessagesPerSession', 2] },
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ]);

    const popularTopics = await ChatbotSession.aggregate([
      { $match: { createdAt: dateFilter, 'messages.intent': { $exists: true } } },
      { $unwind: '$messages' },
      { $group: { _id: '$messages.intent', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: analytics[0] || {
          totalSessions: 0,
          totalMessages: 0,
          averageMessagesPerSession: 0,
          uniqueUsers: 0
        },
        popularTopics
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save chatbot session
// @route   POST /api/chatbot/session
// @access  Public
exports.saveChatbotSession = async (req, res, next) => {
  try {
    const { sessionId, userId, messages } = req.body;

    const sessionData = {
      sessionId: sessionId || generateSessionId(),
      userId: userId || null,
      messages: messages || [],
      messageCount: messages ? messages.length : 0,
      isActive: true
    };

    const session = await ChatbotSession.create(sessionData);

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        message: 'Session saved successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── AI Response Engine ───────────────────────────────────────────────────────

async function generateAIResponse(message, userId) {
  const lowerMessage = message.toLowerCase();
  const intent = classifyIntent(lowerMessage);

  // All Boisar & Palghar Locations Database with ratings and details - SYNCED WITH FRONTEND
  const locations = {
    beaches: [
      { name: 'Kelva Beach', desc: 'Silent, clean beach with sunset views', rating: 4.7, reviews: 210, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Dahanu Beach', desc: 'Famous for chikoo farms & calm coastal environment', rating: 4.6, reviews: 180, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Gholvad Beach', desc: 'Serene, uncrowded beach with pristine shoreline', rating: 4.5, reviews: 95, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Satpati Beach', desc: 'Fishing villages with authentic seaside experience', rating: 4.3, reviews: 78, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Shirgaon Beach', desc: 'Scenic beach near Shirgaon fort', rating: 4.4, reviews: 88, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Arnala Beach', desc: 'Quiet beach with historical ruins', rating: 4.2, reviews: 72, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Bordi Beach', desc: 'Long sandy beach with resort facilities', rating: 4.4, reviews: 105, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Kalamb Beach', desc: 'Secluded, peaceful beach away from crowds', rating: 4.3, reviews: 68, fee: 'Free', time: 'Oct-Mar' }
    ],
    forts: [
      { name: 'Kaldurg Fort', desc: 'Popular trekking destination with breathtaking views', rating: 4.8, reviews: 240, fee: 'Free', time: 'Jun-Feb', difficulty: 'Moderate' },
      { name: 'Tarapur Fort', desc: 'Historic coastal fort with sea views', rating: 4.4, reviews: 120, fee: 'Free', time: 'Oct-Mar', difficulty: 'Easy' },
      { name: 'Arnala Fort', desc: 'Ancient fort with Portuguese & Mughal history', rating: 4.3, reviews: 85, fee: '₹30', time: 'Oct-Mar', difficulty: 'Moderate' },
      { name: 'Asherigad Fort', desc: 'Hilltop fort with panoramic views', rating: 4.6, reviews: 110, fee: 'Free', time: 'Jun-Feb', difficulty: 'Moderate' },
      { name: 'Tandulwadi Fort', desc: 'Lesser-known hilltop fort with scenic monsoon views', rating: 4.4, reviews: 92, fee: 'Free', time: 'Jun-Feb', difficulty: 'Moderate' },
      { name: 'Shirgaon Fort', desc: 'Historic coastal fort with sea views', rating: 4.5, reviews: 98, fee: '₹20', time: 'Oct-Mar', difficulty: 'Easy' }
    ],
    waterfalls: [
      { name: 'Dabhosa Waterfall', desc: 'Beautiful seasonal waterfall, stunning in monsoon', rating: 4.5, reviews: 160, fee: '₹20', time: 'Jul-Sep', difficulty: 'Easy' },
      { name: 'Tandulwadi Waterfall', desc: 'Breathtaking waterfall near Tandulwadi fort', rating: 4.5, reviews: 98, fee: '₹15', time: 'Jul-Oct', difficulty: 'Moderate' },
      { name: 'Kalmandavi Waterfall', desc: 'Hidden waterfall with pristine waters', rating: 4.6, reviews: 112, fee: '₹20', time: 'Jun-Oct', difficulty: 'Moderate' }
    ],
    lakes_dams: [
      { name: 'Surya River Dam', desc: 'Scenic dam with water activities', rating: 4.2, reviews: 55, fee: 'Free', time: 'Jun-Mar' },
      { name: 'Vaitarna Lake', desc: 'Peaceful lake ideal for bird watching', rating: 4.4, reviews: 78, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Jai Sagar Dam', desc: 'Scenic dam surrounded by hills', rating: 4.5, reviews: 92, fee: 'Free', time: 'Oct-Mar' },
      { name: 'Dhekale Dam', desc: 'Scenic dam with recreational activities', rating: 4.3, reviews: 75, fee: 'Free', time: 'Jun-Mar' }
    ],
    hills: [
      { name: 'Kohoj Hill', desc: 'Scenic trekking destination with unique rock formations', rating: 4.6, reviews: 130, fee: 'Free', time: 'Jun-Feb', difficulty: 'Moderate' }
    ],
    temples: [
      { name: 'Vajreshwari Temple', desc: 'Ancient pilgrimage temple with spiritual significance', rating: 4.6, reviews: 135, fee: 'Free', time: 'Year-round' }
    ],
    viewpoints: [
      { name: 'Shirpamal (Sunset Point)', desc: 'Stunning sunset viewpoint with panoramic views', rating: 4.8, reviews: 168, fee: 'Free', time: 'Year-round', highlight: 'Photography' },
      { name: 'Hanuman Point', desc: 'Scenic viewpoint near temple with panoramic views', rating: 4.6, reviews: 128, fee: 'Free', time: 'Year-round', highlight: 'Photography' }
    ],
    palaces: [
      { name: 'Jai Vilas Palace', desc: 'Majestic palace with royal architecture & gardens', rating: 4.5, reviews: 115, fee: '₹50', time: 'Oct-Mar', highlight: 'Historical' }
    ],
    wildlife: [
      { name: 'Tansa Wildlife Sanctuary', desc: 'Rich wildlife sanctuary with diverse flora & fauna', rating: 4.7, reviews: 155, fee: '₹50', time: 'Nov-Mar', highlight: 'Wildlife' }
    ],
    cultural: [
      { name: 'Warli Village Experience', desc: 'Authentic tribal life, traditional art workshops, local cuisine & homestays', rating: 4.7, reviews: 145, fee: '₹400-800/person', time: 'Oct-Mar', type: 'village' },
      { name: 'Tarpa Dance Performance', desc: 'Traditional tribal dance performances celebrating nature & festivals', rating: 4.6, reviews: 120, fee: '₹300-600/person', time: 'Oct-Mar', type: 'performance' },
      { name: 'Warli Art & Handicrafts', desc: 'Traditional Warli paintings & handmade tribal crafts workshop', rating: 4.8, reviews: 158, fee: '₹500-1000/workshop', time: 'Year-round', type: 'workshop' }
    ]
  };

  switch (intent) {
    case 'greeting':
      return "🌊 Welcome to Boisar Tourism! Hello there! 👋\n\nI'm your AI tour guide for Boisar & Palghar region. I can help you with:\n✨ Destination recommendations (beaches, forts, waterfalls)\n✨ Trip planning & itineraries\n✨ Activity suggestions\n✨ Best times to visit\n✨ Local accommodation\n\nWhat would you like to explore?";

    case 'beaches':
      const beachList = locations.beaches.map(b => `• **${b.name}** ⭐${b.rating}/5 (${b.reviews}) – ${b.desc}`).join('\n');
      return `🏖️ **Beautiful Beaches of Boisar:**\n\n${beachList}\n\n💡 **Best Time:** October–February (perfect weather)\n💰 **Entry:** All free!\n✨ **Activities:** Swimming, photography, picnicking, relaxation`;

    case 'forts':
      const fortList = locations.forts.map(f => `• **${f.name}** ⭐${f.rating}/5 (${f.reviews}) – ${f.desc} [${f.difficulty}]`).join('\n');
      return `🏰 **Historical Forts to Explore:**\n\n${fortList}\n\n📸 All perfect for photography & adventure!\n💰 **Entry Fees:** Free - ₹30\n🥾 **Difficulty:** Easy to Moderate\n⏰ **Best months:** June–February`;

    case 'waterfalls':
      const fallList = locations.waterfalls.map(w => `• **${w.name}** ⭐${w.rating}/5 (${w.reviews}) – ${w.desc} [${w.difficulty}]`).join('\n');
      return `💧 **Stunning Waterfalls:**\n\n${fallList}\n\n🌧️ **Best time:** July–October (monsoon season)\n💰 **Entry:** ₹15-20 per person\n⚠️ **Note:** Seasonal, flow best during monsoons\n🥾 **Activities:** Sightseeing, photography, swimming, trekking`;

    case 'lakes':
      const lakeList = locations.lakes_dams.map(l => `• **${l.name}** ⭐${l.rating}/5 (${l.reviews}) – ${l.desc}`).join('\n');
      return `💙 **Lakes & Dams to Visit:**\n\n${lakeList}\n\n🦆 Great for bird watching & peaceful retreats!\n🐦 **Best for bird watching:** October–March\n💰 **Entry:** All FREE\n📸 **Perfect for:** Photography, nature walks, picnicking`;

    case 'eco_tourism':
      return `🌿 **Nature & Wildlife Options:**\n\n**🦁 WILDLIFE:**\n• **Tansa Wildlife Sanctuary** ⭐4.7/5 (155 reviews)\n  💰 ₹50 entry | 🦅 Wildlife safari & bird watching\n  ✨ Rich biodiversity, leopard & deer sightings possible\n  📅 Best: November–March\n\n**🐦 BIRD WATCHING:**\n• **Vaitarna Lake** ⭐4.4/5 – Paradise for bird watchers\n• **Tansa Wildlife** ⭐4.7/5 – Diverse bird species\n• **Kohoj Hill** ⭐4.6/5 – Unique rock formations\n\n**🌳 NATURE SPOTS:**\n• **Dabhosa Waterfall** ⭐4.5/5 – Forest trekking\n• **Tandulwadi Fort** ⭐4.4/5 – Lush greenery\n• **Kalamb Beach** ⭐4.3/5 – Nature walks\n\n🎯 **Activities:** Safari, bird watching, photography, forest walks\n📅 **Best season:** November–March (cool & dry)\n💰 **Entry:** Free-₹50`;

    case 'trekking':
      return `🥾 **Best Trekking & Adventure Spots:**\n\n**MODERATE DIFFICULTY:**\n🏔️ **Kaldurg Fort** ⭐4.8/5 – Most popular, breathtaking views\n🏔️ **Tandulwadi Fort** ⭐4.4/5 – Monsoon beauty, lush greenery\n🏔️ **Asherigad Fort** ⭐4.6/5 – Panoramic hilltop views\n🏔️ **Kohoj Hill** ⭐4.6/5 – Unique rock formations\n🏔️ **Tandulwadi Waterfall** ⭐4.5/5 – Waterfall trek\n\n**EASY DIFFICULTY:**\n⛰️ **Tarapur Fort** ⭐4.4/5 – Short, scenic\n⛰️ **Dabhosa Waterfall** ⭐4.5/5 – Family-friendly monsoon trek\n\n💪 **When to trek:** June–February\n👟 **What to bring:** Water, snacks, good shoes\n💰 **Cost:** Free-₹20 entry\n🎒 **Time needed:** 2-5 hours depending on location`;

    case 'cultural':
      return `🎭 **Rich Cultural Heritage – Distinct Experiences:**\n\n**1. WARLI VILLAGE EXPERIENCE** ⭐4.7/5 (145 reviews)\n   💰 ₹400-800/person | ⏰ Oct-Mar\n   🏠 Authentic tribal village stay with local family\n   ✨ Learn tribal traditions, cook with locals, eat traditional food\n   🎯 Activities: Village walks, meal co-cooking, cultural exchange\n\n**2. TARPA DANCE PERFORMANCE** ⭐4.6/5 (120 reviews)\n   💰 ₹300-600/person | ⏰ Oct-Mar\n   🎵 Traditional tribal dance performances\n   ✨ Watch energetic dances celebrating nature & festivals\n   🎯 Cultural learning, music appreciation, photography\n\n**3. WARLI ART & HANDICRAFTS WORKSHOP** ⭐4.8/5 (158 reviews)\n   💰 ₹500-1000/workshop | ⏰ Year-round\n   🎨 Learn traditional Warli painting & tribal crafts\n   ✨ Create your own art, buy authentic handicrafts\n   🎯 Activities: Painting lessons, craft shopping, artist interaction\n\n🎭 **Book ahead!** Cultural experiences fill up Oct-Mar.`;

    case 'destinations':
      return `🌟 **Top Recommendations for Boisar:**\n\n**MUST-VISIT (Top 5):**\n✅ **Kelva Beach** ⭐4.7/5 – Iconic sunset views | Free\n✅ **Kaldurg Fort** ⭐4.8/5 – Adventure trekking | Free\n✅ **Shirpamal Sunset Point** ⭐4.8/5 – Photography paradise | Free\n✅ **Warli Village Experience** ⭐4.7/5 – Tribal culture | ₹400-800\n✅ **Tansa Wildlife** ⭐4.7/5 – Wildlife safari | ₹50\n\n**Based on Your Interests:**\n• 🏖️ Beach lover? → Kelva, Dahanu, Gholvad\n• 🥾 Adventure seeker? → Kaldurg, Tandulwadi Fort, Kohoj Hill\n• 🎭 Culture enthusiast? → Warli villages, Tarpa dance\n• 📷 Photographer? → Shirpamal, Kaldurg Fort, Waterfalls\n• 🦅 Nature lover? → Tansa Wildlife, Vaitarna Lake\n• ✨ Romantic? → Shirpamal sunset, Kelva beach\n\n📍 **Quick question:** What interests you most?`;

    case 'planning':
      return generatePlanningResponse(lowerMessage);

    case 'booking':
      return `🗺️ **Let's Plan Your Trip!**\n\n**📍 2-DAY ITINERARY:**\nDay 1: Kelva Beach → Tarapur Fort → Sunset at Shirpamal → Local seafood dinner\nDay 2: Warli village tour → Dahanu Beach → Return\n💰 Budget: ₹1500-2500/person | ⏰ Best: Oct-Mar\n\n**📍 3-DAY ITINERARY:**\nDay 1: Beach exploration (Kelva, Satpati, Gholvad)\nDay 2: Fort trekking (Kaldurg or Tandulwadi) + Sunset Point\nDay 3: Culture (Warli villages) + Handicrafts workshop + Return\n💰 Budget: ₹2000-3500/person\n\n**📍 4-DAY ADVENTURE:**\nDay 1: Coastal (Beaches + Tarapur Fort)\nDay 2: Trekking (Kaldurg Fort, Kohoj Hill)\nDay 3: Waterfalls & nature (Dabhosa, Vaitarna Lake)\nDay 4: Culture & tribal homestay experience + Return\n💰 Budget: ₹3500-5000/person\n\n💬 **Tell me:**\n• How many days do you have?\n• What interests you most? (beach/trek/culture/food/wildlife)\n• What's your budget?\n• Group size?`;

    case 'support':
      return `🤝 **How Can I Help?**\n\nI can assist with:\n✨ Destination information & ratings\n✨ Trip planning & itineraries\n✨ Activity recommendations\n✨ Accommodation guidance\n✨ Budget estimates\n✨ Transportation info\n✨ Food recommendations\n\n**📞 Direct Contact:**\n📧 Email: info@boisartourism.com\n☎️ Phone: +91 [Boisar Tourism Office]\n🌐 Website: boisartourism.com\n📱 WhatsApp: Available for booking\n\n**💬 What else would you like to know?**`;

    default:
      return `🌟 **I can help with:**\n\n🏖️ **Beaches** – 8 beautiful coastal options\n🏰 **Forts** – 6 historic trekking destinations  \n💧 **Waterfalls** – Seasonal cascades & monsoon beauty\n🌿 **Nature** – Wildlife & eco-tourism\n🎭 **Culture** – Tribal villages, art & dances\n📅 **Planning** – Custom itineraries\n🍽️ **Food** – Local seafood & cuisine\n🏨 **Stay** – Hotels & tribal homestays\n🚗 **Travel** – How to reach & transport\n📸 **Photography** – Best spots & tips\n💰 **Budget** – Cost estimation\n\n**TRY ASKING:**\n"Best beaches?" • "Top-rated places?" • "Trekking spots?"\n"Cultural experiences?" • "Plan my 3-day trip" • "Photography spots?"\n"Family-friendly destinations?" • "Cheap places to visit?"\n\n✨ **Need recommendations? Just ask!**`;
  }
}

function classifyIntent(message) {
  // SYNCED WITH FRONTEND PATTERNS

  // Greeting - includes welcome
  if (/\bhello\b|\bhi\b|\bhey\b|\bgreetings\b|\bwassup\b|\bwelcome\b/.test(message))
    return 'greeting';

  // Beaches - specific beach queries
  if (/beach\s*(guide|list|info|places)?$|best.*beach|beaches|coastal/.test(message))
    return 'beaches';

  // Forts - specific fort queries
  if (/fort|castle|historic|heritage|trek|climb/.test(message))
    return 'forts';

  // Waterfalls - specific waterfall queries
  if (/waterfall|cascade|falls|monsoon|seasonal/.test(message))
    return 'waterfalls';

  // Lakes/Dams - specific water body queries
  if (/lake|dam|water body|reservoir|bird.*watch/.test(message))
    return 'lakes';

  // Trekking/Adventure
  if (/trek|hike|climb|adventure|mountain|active/.test(message))
    return 'trekking';

  // Eco-tourism/Wildlife/Nature
  if (/wildlife|nature|jungle|forest|bird|ecology|eco.*tourism|safari/.test(message))
    return 'eco_tourism';

  // Cultural experiences - distinct handling
  if (/culture|tribal|warli|tarpa|art|handicraft|tradition|experience/.test(message))
    return 'cultural';

  // Top-rated/Best places
  if (/top.*rate|best.*place|highly.*rate|rating|4\.[5-9]|highly recommend|best place|places to visit|destination|recommend|suggest/.test(message))
    return 'destinations';

  // Trip planning queries
  if (/plan|itinerary|trip|days|schedule|create|organize/.test(message))
    return 'booking';

  // Planning - covers accommodation, food, transport, budget, activities
  if (/best time|when to visit|season|climate|weather|month|temperature|accommodation|hotel|stay|lodge|homestay|resort|transport|reach|travel|train|bus|car|drive|how.*get|direction|road|food|eat|cuisine|restaurant|dine|seafood|dish|meal|taste|dining|price|cost|budget|fee|charge|afford|expensive|activity|thing.*do|activities|sport|play|adventure|fun|what.*can|can i/.test(message))
    return 'planning';

  // Support/Help
  if (/help|support|contact|phone|email|assistance|question|problem|issue/.test(message))
    return 'support';

  return 'general';
}

async function getDestinationsFromDB(message) {
  try {
    let filter = { isActive: true };
    if (/eco|wildlife|nature|beach|waterfall|trek/.test(message)) {
      filter.type = 'eco-tourism';
    } else if (/cultural|tribal|warli/.test(message)) {
      filter.type = 'cultural';
    }
    return await Destination.find(filter)
      .select('name description location ratings highlights')
      .limit(5)
      .sort({ 'ratings.average': -1 });
  } catch (err) {
    return [];
  }
}

function formatDestinationsResponse(destinations) {
  if (!destinations || destinations.length === 0) {
    return "Here are some must-visit places around Boisar! 🏖️\n\n**Top Destinations:**\n• **Kelva Beach** – Serene coastline with black sand and coconut trees\n• **Dahanu Beach** – Famous chikoo orchards and peaceful sands\n• **Kaldurg Fort** – Trekking with breathtaking monsoon views\n• **Tarapur Fort** – Historic seaside fort with ocean views\n• **Dabhosa Waterfall** – Stunning fall near Jawhar\n• **Kohoj Hill** – Scenic trek with panoramic views\n\nWould you like details about any of these?";
  }

  let response = "Here are some amazing destinations near Boisar! 🌊\n\n";
  destinations.forEach((dest, i) => {
    response += `**${i + 1}. ${dest.name}**\n`;
    if (dest.description) response += `${dest.description.substring(0, 100)}...\n`;
    if (dest.location) response += `📍 ${dest.location.district || dest.location.address || ''}\n`;
    if (dest.ratings) response += `⭐ ${dest.ratings.average}/5 (${dest.ratings.count} reviews)\n`;
    response += '\n';
  });
  response += "Would you like more details about any of these destinations?";
  return response;
}

function generatePlanningResponse(message) {
  if (/time|season|when|weather|climate|temperature/.test(message)) {
    return `📅 **Best Time to Visit Boisar:**\n\n**⭐ OCTOBER – FEBRUARY (Peak Season)**\n🌤️ Perfect weather (18–28°C)\n☀️ Sunny days, cool evenings\n🏖️ Ideal for beaches & sightseeing\n🎉 Festival season\n✅ **RECOMMENDED!**\n\n**☔ JUNE – SEPTEMBER (Monsoon)**\n🌧️ Heavy rainfall\n💚 Lush green landscapes\n💧 Waterfalls at their best\n🚫 Limited outdoor activities\n\n**🔥 MARCH – MAY (Summer)**\n🌡️ Hot & humid (30–38°C)\n🏖️ Beach evenings are pleasant\n🥵 Not ideal for daytime activities`;
  }

  if (/accommodation|hotel|stay|lodge|homestay|resort/.test(message)) {
    return `🏨 **Where to Stay in Boisar:**\n\n**Budget Hotels** (₹500–1500/night)\n• Boisar town & near railway station\n• Basic amenities, local vibe\n\n**Beach Resorts** (₹1500–4000/night)\n• Kelva Beach area\n• Amenities & water sports\n\n**Tribal Homestays** (₹600–1200/night)\n• Authentic village experience\n• Traditional meals included\n• ⭐ **Most unique option!**\n\n**Eco Lodges** (₹1000–2500/night)\n• Near wildlife sanctuary\n• Nature-focused experience\n\n💡 **Tip:** Book homestays in advance (Oct–Feb)!`;
  }

  if (/transport|travel|train|bus|car|drive|reach|how.*get/.test(message)) {
    return `🚗 **How to Reach Boisar:**\n\n**✈️ By Air:**\nMumbai Airport (110 km) → Taxi/Cab to Boisar (2.5–3 hrs)\n\n**🚂 By Train:**\n• Western Railway line (Mumbai–Gandhinagar)\n• Boisar station on main route\n• ~2.5 hours from Mumbai Central\n• ~1.5 hours from Ahmedabad\n\n**🚌 By Road:**\n• NH48 highway via Borivali\n• State buses from Mumbai (Borivali)\n• Private cabs & rentals\n• Scenic drive with viewpoints\n\n**🏍️ Local Transport:**\n• Auto-rickshaws (cheap, local)\n• Shared jeeps (budget-friendly)\n• Bike rentals (explore at your pace)\n• Guide-arranged tours (recommended)\n\n💳 **Budget:** ₹50–150 for local travel`;
  }

  if (/food|eat|cuisine|restaurant|dine|seafood|dish|meal/.test(message)) {
    return `🍽️ **Boisar's Delicious Food:**\n\n**🦐 Must-Try Seafood:**\n• Fresh Bombil fry\n• Crab & prawn curries\n• Kolambi rice (prawn rice)\n• Fish tandoori\n\n**🌰 Local Specialties:**\n• Chikoo fruit (Dahanu famous)\n• Koli cuisine (spicy fish curries)\n• Warli dal-bhaat (tribal meals)\n• Coastal fish preparations\n\n**🍴 Where to Eat:**\n• Local dhabas near station (authentic)\n• Beachside shacks (casual, scenic)\n• Tribal homestays (best experience)\n• Small restaurants in Boisar\n\n💰 **Budget:** ₹100–300 per meal`;
  }

  if (/activity|thing.*do|activities|sport|play|adventure|fun/.test(message)) {
    return `🎯 **Things to Do in Boisar:**\n\n**🏖️ Beach Activities:**\n• Swimming & sunbathing\n• Beach volleyball\n• Photography\n• Sunset walks\n\n**🥾 Adventure:**\n• Trekking to forts\n• Rock climbing\n• Monsoon hiking\n• Nature exploration\n\n**📸 Photography:**\n• Beach sunsets\n• Fort architecture\n• Waterfall cascades\n• Tribal life & art\n\n**🎭 Cultural:**\n• Warli art workshops\n• Tarpa dance shows\n• Village tours\n• Local market visits\n\n**🍽️ Food Tours:**\n• Seafood tastings\n• Orchard visits\n• Tribal meal experiences\n• Local market exploration`;
  }

  if (/price|cost|budget|fee|charge|afford/.test(message)) {
    return `💰 **Budget for Boisar:**\n\n**Accommodation (per night):**\n• Budget: ₹500–1000\n• Mid-range: ₹1000–2500\n• Luxury: ₹2500+\n\n**Food:**\n• Local meals: ₹100–300\n• Restaurants: ₹300–800\n• Seafood: ₹200–600\n\n**Activities:**\n• Fort entries: Free–₹50\n• Guided tours: ₹300–800/person\n• Boat rides: ₹200–500\n• Art workshops: ₹500–1000\n\n**Transport:**\n• Local travel: ₹50–100/trip\n• Taxi to site: ₹100–300\n• Bike rental: ₹200–400/day\n\n**💡 Budget estimate (2 days):**\nBudget: ₹2000–3500/person\nComfort: ₹3500–7000/person`;
  }

  return `🗺️ **I can help with:**\n\n📅 Best time to visit\n🏨 Accommodation options\n🚗 Transportation info\n🍽️ Food & cuisine\n💰 Budget planning\n🎭 Activities & things to do\n\n**What would you like to know more about?**`;
}

async function saveMessageToSession(sessionId, userMessage, botResponse, userId) {
  try {
    await ChatbotSession.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: {
            userMessage,
            botResponse,
            intent: classifyIntent(userMessage.toLowerCase()),
            timestamp: new Date()
          }
        },
        $inc: { messageCount: 1 },
        $set: { lastActivity: new Date() }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving message to session:', error);
  }
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
