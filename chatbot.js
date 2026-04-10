class BoisarTourismChatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.sessionId = null;
        this.userId = null;
        this.initializeElements();
        this.bindEvents();
        this.loadSavedMessages();
    }

    /* ── INIT ── */

    initializeElements() {
        this.toggle = document.getElementById('chatbotToggle');
        this.container = document.getElementById('chatbotContainer');
        this.msgArea = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendBtn = document.getElementById('chatbotSend');
        this.closeBtn = document.getElementById('chatbotClose');
        this.clearBtn = document.getElementById('chatbotClear');
        this.badge = document.getElementById('chatBadge');
    }

    bindEvents() {
        this.toggle.addEventListener('click', () => this.toggleChatbot());
        this.closeBtn.addEventListener('click', () => this.closeChatbot());
        this.clearBtn.addEventListener('click', () => this.clearChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Delegate quick-chip clicks
        this.msgArea.addEventListener('click', (e) => {
            const chip = e.target.closest('.quick-chip');
            if (chip) {
                this.input.value = chip.dataset.query;
                this.sendMessage();
            }
        });
    }

    loadSavedMessages() {
        try {
            const saved = localStorage.getItem('chatbotMessages');
            if (saved) {
                this.messages = JSON.parse(saved).map(m => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                this.messages.forEach(m => this.renderMessage(m));
                this.scrollToBottom();
            }
        } catch (e) {
            console.warn('Could not restore chat history:', e);
        }
    }

    /* ── OPEN / CLOSE ── */

    toggleChatbot() {
        this.isOpen ? this.closeChatbot() : this.openChatbot();
    }

    openChatbot() {
        this.isOpen = true;

        // Update toggle icon + colour
        this.toggle.classList.add('active');
        this.toggle.querySelector('i').className = 'fas fa-times';

        // Step 1: add to layout (display:flex)
        this.container.classList.add('open');

        // Step 2: one frame later, trigger CSS transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.container.classList.add('visible');
            });
        });

        this.hideBadge();
        setTimeout(() => this.input.focus(), 350);
    }

    closeChatbot() {
        this.isOpen = false;

        this.toggle.classList.remove('active');
        this.toggle.querySelector('i').className = 'fas fa-comments';

        // Animate out, then hide
        this.container.classList.remove('visible');
        setTimeout(() => this.container.classList.remove('open'), 320);
    }

    /* ── WELCOME HTML ── */

    welcomeHTML() {
        return `
            <div class="welcome-message">
                <h4>Welcome to Boisar Tourism! 🌊</h4>
                <p>I'm your AI guide for 31+ destinations in Boisar & Palghar. Ask me anything about beaches, forts, waterfalls, culture, food, travel, and more!</p>
                <div class="quick-chips">
                    <span class="quick-chip" data-query="Best places to visit">📍 Best places</span>
                    <span class="quick-chip" data-query="Eco tourism destinations">🌿 Eco tourism</span>
                    <span class="quick-chip" data-query="Cultural experiences">🎭 Culture</span>
                    <span class="quick-chip" data-query="Best time to visit">📅 When to visit</span>
                    <span class="quick-chip" data-query="Accommodation options">🏨 Stay</span>
                    <span class="quick-chip" data-query="Transportation">🚗 Transport</span>
                </div>
            </div>
        `;
    }

    clearChat() {
        this.messages = [];
        localStorage.removeItem('chatbotMessages');
        this.msgArea.innerHTML = this.welcomeHTML();
    }

    /* ── MESSAGING ── */

    async sendMessage() {
        const text = this.input.value.trim();
        if (!text || this.isTyping) return;

        this.addMessage(text, 'user');
        this.input.value = '';
        this.sendBtn.disabled = true;
        this.showTypingIndicator();

        try {
            const response = await this.getBotResponse(text);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (err) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            console.error('Chatbot error:', err);
        }

        this.sendBtn.disabled = false;
    }

    async getBotResponse(message) {
        try {
            const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '');
            const res = await fetch(`${API_BASE}/api/chatbot/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    sessionId: this.sessionId || this.generateSessionId(),
                    userId: this.userId || null
                })
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            if (data.success) {
                this.sessionId = data.data.sessionId;
                return data.data.response;
            }
            throw new Error(data.message || 'Bad response');
        } catch {
            // Fallback: Ultra-enhanced local responses
            return this.generateResponse(message);
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /* ── ENHANCED LOCATION DATABASE & RESPONSE GENERATION ── */

    generateResponse(message) {
        const m = message.toLowerCase().trim();

        // COMPLETE DATABASE: 31+ Destinations
        const locations = {
            beaches: [
                { name: 'Kelva Beach', rating: 4.7, reviews: 210, fee: 'Free', time: 'Oct-Mar', desc: 'Silent, clean beach with sunset views', highlight: 'Sunset photography' },
                { name: 'Dahanu Beach', rating: 4.6, reviews: 180, fee: 'Free', time: 'Oct-Mar', desc: 'Famous for chikoo farms & calm environment', highlight: 'Orchard visits' },
                { name: 'Gholvad Beach', rating: 4.5, reviews: 95, fee: 'Free', time: 'Oct-Mar', desc: 'Serene, uncrowded beach with pristine shoreline', highlight: 'Water sports' },
                { name: 'Satpati Beach', rating: 4.3, reviews: 78, fee: 'Free', time: 'Oct-Mar', desc: 'Fishing villages with authentic seaside experience', highlight: 'Village tours' },
                { name: 'Shirgaon Beach', rating: 4.4, reviews: 88, fee: 'Free', time: 'Oct-Mar', desc: 'Scenic beach near Shirgaon fort', highlight: 'Fort trekking' },
                { name: 'Arnala Beach', rating: 4.2, reviews: 72, fee: 'Free', time: 'Oct-Mar', desc: 'Quiet beach with historical ruins', highlight: 'Historical tours' },
                { name: 'Bordi Beach', rating: 4.4, reviews: 105, fee: 'Free', time: 'Oct-Mar', desc: 'Long sandy beach with resort facilities', highlight: 'Resort amenities' },
                { name: 'Kalamb Beach', rating: 4.3, reviews: 68, fee: 'Free', time: 'Oct-Mar', desc: 'Secluded, peaceful beach away from crowds', highlight: 'Nature walks' }
            ],
            forts: [
                { name: 'Kaldurg Fort', rating: 4.8, reviews: 240, fee: 'Free', time: 'Jun-Feb', diff: 'Moderate', desc: 'Popular trekking destination with breathtaking views', highlight: 'Best trek' },
                { name: 'Tarapur Fort', rating: 4.4, reviews: 120, fee: 'Free', time: 'Oct-Mar', diff: 'Easy', desc: 'Historic coastal fort with sea views', highlight: 'Easy trek' },
                { name: 'Arnala Fort', rating: 4.3, reviews: 85, fee: '₹30', time: 'Oct-Mar', diff: 'Moderate', desc: 'Ancient fort with Portuguese & Mughal history', highlight: 'Historical' },
                { name: 'Asherigad Fort', rating: 4.6, reviews: 110, fee: 'Free', time: 'Jun-Feb', diff: 'Moderate', desc: 'Hilltop fort with panoramic views', highlight: 'Views' },
                { name: 'Tandulwadi Fort', rating: 4.4, reviews: 92, fee: 'Free', time: 'Jun-Feb', diff: 'Moderate', desc: 'Lesser-known hilltop fort with scenic monsoon views', highlight: 'Monsoon' },
                { name: 'Shirgaon Fort', rating: 4.5, reviews: 98, fee: '₹20', time: 'Oct-Mar', diff: 'Easy', desc: 'Historic coastal fort with sea views', highlight: 'Coastal' }
            ],
            waterfalls: [
                { name: 'Dabhosa Waterfall', rating: 4.5, reviews: 160, fee: '₹20', time: 'Jul-Sep', diff: 'Easy', desc: 'Beautiful seasonal waterfall, stunning in monsoon' },
                { name: 'Tandulwadi Waterfall', rating: 4.5, reviews: 98, fee: '₹15', time: 'Jul-Oct', diff: 'Moderate', desc: 'Breathtaking waterfall near Tandulwadi fort' },
                { name: 'Kalmandavi Waterfall', rating: 4.6, reviews: 112, fee: '₹20', time: 'Jun-Oct', diff: 'Moderate', desc: 'Hidden waterfall with pristine waters' }
            ],
            lakes_dams: [
                { name: 'Surya River Dam', rating: 4.2, reviews: 55, fee: 'Free', time: 'Jun-Mar', desc: 'Scenic dam with water activities' },
                { name: 'Vaitarna Lake', rating: 4.4, reviews: 78, fee: 'Free', time: 'Oct-Mar', desc: 'Peaceful lake ideal for bird watching' },
                { name: 'Jai Sagar Dam', rating: 4.5, reviews: 92, fee: 'Free', time: 'Oct-Mar', desc: 'Scenic dam surrounded by hills' },
                { name: 'Dhekale Dam', rating: 4.3, reviews: 75, fee: 'Free', time: 'Jun-Mar', desc: 'Scenic dam with recreational activities' }
            ],
            hills: [
                { name: 'Kohoj Hill', rating: 4.6, reviews: 130, fee: 'Free', time: 'Jun-Feb', diff: 'Moderate', desc: 'Scenic trekking with unique rock formations' }
            ],
            temples: [
                { name: 'Vajreshwari Temple', rating: 4.6, reviews: 135, fee: 'Free', time: 'Year-round', desc: 'Ancient pilgrimage temple with spiritual significance' }
            ],
            viewpoints: [
                { name: 'Shirpamal (Sunset Point)', rating: 4.8, reviews: 168, fee: 'Free', time: 'Year-round', desc: 'Stunning sunset viewpoint with panoramic views' },
                { name: 'Hanuman Point', rating: 4.6, reviews: 128, fee: 'Free', time: 'Year-round', desc: 'Scenic viewpoint near temple with panoramic views' }
            ],
            palaces: [
                { name: 'Jai Vilas Palace', rating: 4.5, reviews: 115, fee: '₹50', time: 'Oct-Mar', desc: 'Majestic palace with royal architecture & gardens' }
            ],
            wildlife: [
                { name: 'Tansa Wildlife Sanctuary', rating: 4.7, reviews: 155, fee: '₹50', time: 'Nov-Mar', desc: 'Rich wildlife sanctuary with diverse flora & fauna' }
            ],
            cultural: [
                { name: 'Warli Village Experience', rating: 4.7, reviews: 145, fee: '₹400-800', time: 'Oct-Mar', desc: 'Authentic tribal life, traditional art workshops, local cuisine' },
                { name: 'Tarpa Dance Performance', rating: 4.6, reviews: 120, fee: '₹300-600', time: 'Oct-Mar', desc: 'Traditional tribal dance performances celebrating nature & festivals' },
                { name: 'Warli Art & Handicrafts', rating: 4.8, reviews: 158, fee: '₹500-1000', time: 'Year-round', desc: 'Traditional Warli paintings & handmade tribal crafts workshop' }
            ]
        };

        // Helper functions
        const formatLocation = (loc, showDiff = false) => {
            let str = `• **${loc.name}** ⭐${loc.rating}/5 (${loc.reviews}) | 💰${loc.fee}`;
            if (showDiff && loc.diff) str += ` | 🥾${loc.diff}`;
            return str;
        };

        const topByRating = (arr, n=3) => [...arr].sort((a,b) => b.rating - a.rating).slice(0, n);

        const combine = (arr1, arr2, n=5) => {
            const combined = [...arr1, ...arr2].sort((a,b) => b.rating - a.rating);
            return combined.slice(0, n);
        };

        // GREETING - Warm welcome with intro
        if (/\bhello\b|\bhi\b|\bhey\b|\bgreetings\b|\bwassup\b|\bwelcome\b/.test(m))
            return "🌊 **Welcome to Boisar Tourism!** 👋\n\nI'm your AI guide for **31+ amazing destinations** in Boisar & Palghar! I can help with:\n✨ Beaches (8), Forts (6), Waterfalls (3), Lakes & Dams (4)\n✨ Temples, Palaces, Viewpoints, Wildlife, Cultural Sites\n✨ Trip planning, best times, food, accommodation, transport\n✨ Budget tips, photography spots, activities\n\n**What interests you?** Ask about beaches, forts, culture, planning, or just tell me your interests!";

        // TOP-RATED - Show best rated locations
        if (/top.*rate|best|highest rated|highly recommend|must visit|popular|famous/.test(m)) {
            const topAll = combine(locations.viewpoints, combine(locations.wildlife, topByRating(locations.beaches, 2)));
            const list = topAll.slice(0, 5).map(loc => formatLocation(loc)).join('\n');
            return `⭐ **Top-Rated Destinations in Boisar (31+ Locations):**\n\n${list}\n\n🎯 **All rated 4.5+/5** | Loved by travelers!\n💡 Tip: Oct-Mar is peak season for most!`;
        }

        // BEACHES - Show all 8 beaches with ratings
        if (/beach\s*(guide|list|info|places)?$|best.*beach|beaches|coastal|sea|swimming/.test(m)) {
            const beachList = locations.beaches.map(b => `• **${b.name}** ⭐${b.rating}/5 (${b.reviews}) – ${b.desc}`).join('\n');
            return `🏖️ **All 8 Beautiful Beaches of Boisar:**\n\n${beachList}\n\n💡 **Best Season:** October–February\n💰 **Entry:** ALL FREE!\n⏰ Avg visit: 2-4 hours per beach`;
        }

        // FORTS - Show all 6 forts with difficulty
        if (/fort|castle|historic|heritage|trek|climb|trekking|adventure/.test(m)) {
            const fortList = locations.forts.map(f => `• **${f.name}** ⭐${f.rating}/5 (${f.reviews}) | 🥾${f.diff} | 💰${f.fee}`).join('\n');
            return `🏰 **All 6 Historical Forts to Explore:**\n\n${fortList}\n\n🎯 **Difficulty:** Easy to Moderate treks\n⏰ **Time needed:** 2-5 hours per fort\n📸 Perfect for photography & adventure!`;
        }

        // WATERFALLS - All 3 waterfalls with seasonal info
        if (/waterfall|cascade|falls|monsoon|seasonal|water|rushing\.?water/.test(m)) {
            const fallList = locations.waterfalls.map(w => `• **${w.name}** ⭐${w.rating}/5 (${w.reviews}) | 🥾${w.diff} | 💰${w.fee}\n  🌧️ Best: ${w.time}`).join('\n');
            return `💧 **All 3 Stunning Waterfalls:**\n\n${fallList}\n\n🌧️ **Peak Season:** July–October (monsoon)\n⚠️ **Note:** Seasonal - Flow best during monsoons\n🎯 Activities: Photography, swimming, trekking`;
        }

        // LAKES/DAMS - All 4 water bodies
        if (/lake|dam|water body|reservoir|bird.*watch|scenic.*water/.test(m)) {
            const lakeList = locations.lakes_dams.map(l => `• **${l.name}** ⭐${l.rating}/5 (${l.reviews}) | 💰${l.fee}\n  Best: ${l.time} | ${l.desc}`).join('\n');
            return `💙 **All 4 Lakes & Dams – Nature's Paradise:**\n\n${lakeList}\n\n🦆 **Best for:** Bird watching, photography, picnics\n🐦 **Peak Season:** October–March\n💡 All FREE entry! Perfect weekend getaway`;
        }

        // BUDGET TRAVEL - Free & cheap places
        if (/budget|cheap|free.*entry|affordable|low cost|money|inexpensive/.test(m)) {
            const free = locations.beaches.filter(b => b.fee === 'Free').slice(0, 3);
            const cheap = [locations.forts[1], ...locations.lakes_dams.slice(0, 2)];
            return `💰 **Budget-Friendly Destinations:**\n\n**COMPLETELY FREE:**\n${free.map(b => `✅ ${b.name} ⭐${b.rating}/5 – ${b.desc}`).join('\n')}\n✅ Most Forts (Free-₹30)\n✅ All Lakes & Dams (Free)\n✅ Temples & Viewpoints (Free)\n\n**Super Cheap:**\n💚 Waterfalls: ₹15-20/person\n💚 Fort entries: ₹20-30\n💚 Tansa Wildlife: ₹50\n\n💡 **Pro Tip:** Oct-Mar best season + MORE free events!\n🎒 Budget estimate: ₹1500-2500/person (2 days)`;
        }

        // PHOTOGRAPHY - Best photo spots
        if (/photo|capture|instagram|scenic|view|sunset|sunrise|picture|snap/.test(m)) {
            return `📸 **Best Photography Spots:**\n\n**🌅 SUNRISE/SUNSET:** (Nov-Mar best)\n• Shirpamal Sunset Point ⭐4.8 – MUST VISIT!\n• Kelva Beach ⭐4.7 – Golden hour magic\n• Dahanu Beach ⭐4.6 – Peaceful coastal shots\n\n**🏰 FORTS & RUINS:**\n• Kaldurg Fort ⭐4.8 – Hilltop vastness\n• Tarapur Fort ⭐4.4 – Coastal architecture\n• Arnala Fort ⭐4.3 – Ancient ruins\n\n**💧 WATER & NATURE:**\n• Waterfalls ⭐4.5-4.6 – Cascades & mist\n• Tansa Wildlife ⭐4.7 – Animal shots\n• Kohoj Hill ⭐4.6 – Rock formations\n\n**🎨 CULTURE & PEOPLE:**\n• Warli Village ⭐4.7 – Tribal life\n• Warli Handicrafts ⭐4.8 – Traditional art\n\n💡 **Peak months:** Oct-Mar | **Golden hours:** 6-8am, 4-6pm`;
        }

        // FAMILY-FRIENDLY - Safe for kids
        if (/family|kids|children|baby|parent|toddler|elderly\.?\s/i.test(m)) {
            return `👨‍👩‍👧‍👦 **Family-Friendly Destinations:**\n\n**🏖️ BEACHES (Safe & Easy):**\n✓ Kelva, Dahanu, Kalamb – Swimming, sand play\n✓ Bordi – Resort facilities, amenities\n✓ Family-friendly: No dangerous currents\n\n**🚶 EASY WALKS:**\n✓ Tarapur Fort ⭐4.4 – 1-2 hour trek\n✓ Shirpamal Point ⭐4.8 – 30-min walk, sunset viewing\n✓ Hanuman Point ⭐4.6 – Temple visit + views\n\n**🎭 CULTURE & FUN:**\n✓ Warli Village Tour – Learn tribal life, fun for kids\n✓ Art Workshops – Kids paint Warli art!\n✓ Tarpa Dance ⭐4.6 – Music, entertainment\n\n**🦆 NATURE & ANIMALS:**\n✓ Vaitarna Lake – Bird watching, picnics\n✓ Tansa Wildlife – Safari adventure\n✓ Kohoj Hill – Rock formations, easy trek\n\n💡 **Best season:** Oct-Mar (cool, comfortable)\n🎒 **Budget:** ₹2000-3500/person (2 days)`;
        }

        // CULTURAL EXPERIENCES - Warli, Tarpa, etc.
        if (/culture|tribal|warli|tarpa|art|handicraft|tradition|experience|local|community/.test(m)) {
            return `🎭 **Rich Cultural Experiences – 3 Unique Options:**\n\n**1. WARLI VILLAGE EXPERIENCE** ⭐4.7/5 (145 reviews)\n💰 ₹400-800/person | Season: Oct-Mar\n🏠 Stay with tribal families, learn traditions\n🍲 Cook & eat traditional meals\n🎨 Warli art learning & exchange\n✨ Most authentic, immersive experience!\n\n**2. TARPA DANCE PERFORMANCE** ⭐4.6/5 (120 reviews)\n💰 ₹300-600/person | Season: Oct-Mar\n🎵 Live traditional tribal dance shows\n🎶 Ancient music & rhythms\n📸 Photography opportunity\n✨ Cultural & entertainment value!\n\n**3. WARLI ART & HANDICRAFTS** ⭐4.8/5 (158 reviews)\n💰 ₹500-1000/workshop | Year-round!\n🎨 Learn traditional Warli painting techniques\n✋ Make your own tribal art\n🛍️ Buy authentic artisan crafts\n✨ Best crafts & souvenirs!\n\n🎯 **Book all 3 for complete tribal immersion!**`;
        }

        // BEST TIME TO VISIT - Seasonal info
        if (/best time|when to visit|season|climate|weather|month|temperature|rain|monsoon/.test(m)) {
            return `📅 **Best Time to Visit Boisar:**\n\n**⭐ OCT-FEB (PEAK SEASON) ✅ HIGHLY RECOMMENDED**\n🌤️ Weather: 18–28°C (Perfect!)\n☀️ Sunny, clear skies\n🏖️ Best for: Beaches, forts, trekking, all activities\n🎉 Festival season, cultural events\n📸 Best visibility & photography\n✅ Most locations accessible\n\n**☔ JUN-SEP (MONSOON)**\n🌧️ Heavy rainfall, humidity\n💚 Lush green, nature at its best\n💧 Waterfalls in FULL FLOW ⭐\n⚠️ Some activities suspended\n✓ Cheap rates, fewer tourists\n✓ Best for: Waterfall photography, nature lovers\n\n**🔥 MAR-MAY (SUMMER)**\n🌡️ Hot & humid (30–38°C)\n☀️ Long sunny days\n🏖️ Beach evenings pleasant\n💧 Waterfalls mostly dry\n💰 Cheapest season\n⚠️ Not ideal for daytime trekking\n\n**🎯 My Recommendation: OCT-FEB is BEST overall!**`;
        }

        // ACCOMMODATION - Where to stay
        if (/accommodation|hotel|stay|lodge|homestay|resort|room|booking|where.*stay/.test(m)) {
            return `🏨 **Where to Stay in Boisar:**\n\n**🏡 TRIBAL HOMESTAYS** (Best Experience!)\n💰 ₹600–1200/night\n🏠 Authentic village living with local families\n🍲 Traditional meals included\n🎭 Learn tribal culture firsthand\n✅ Most recommended experience!\n\n**🏖️ BEACH RESORTS**\n💰 ₹1500–4000/night\n🏊 Water sports, beach access\n🍽️ Full amenities, dining\n📍 Kelva & Dahanu area\n\n**🏨 BUDGET HOTELS**\n💰 ₹500–1500/night\n🚂 Near Boisar station & town\n✓ Basic amenities, local vibe\n✓ Good for quick stays\n\n**🌿 ECO LODGES**\n💰 ₹1000–2500/night\n🌳 Near Tansa Wildlife\n🦅 Nature-focused experience\n\n**💡 BOOKING TIPS:**\n• Book homestays 1-2 weeks in advance (Oct-Feb peak)\n• Weekends have higher rates\n• Ask for group discounts\n• Verify amenities before booking`;
        }

        // TRANSPORTATION - How to reach
        if (/transport|reach|travel|train|bus|car|drive|how.*get|direction|road|commute/.test(m)) {
            return `🚗 **How to Reach Boisar:**\n\n**✈️ BY AIR**\nMumbai Airport (110 km)\n⏰ 2.5–3 hours via taxi/cab\n💰 ₹2000–2500 cab fare\n\n**🚂 BY TRAIN (RECOMMENDED)** ⭐\nWestern Railway line (Mumbai–Gandhinagar)\n📍 Boisar station on main route\n⏰ ~2.5 hrs from Mumbai Central\n⏰ ~1.5 hrs from Ahmedabad\n💰 ₹50–300 (depending on class)\n✅ Most scenic & convenient!\n\n**🚌 BY ROAD**\nNH48 highway (via Borivali)\n🚌 State buses from Mumbai (Borivali)\n🚕 Private cabs & rentals\n⏰ 2.5–3.5 hours from Mumbai\n💰 ₹200–500/person (shared)\n\n**🏍️ LOCAL TRANSPORT**\n🏍️ Auto-rickshaws: ₹10-50\n🚐 Shared jeeps: Budget-friendly\n🛴 Bike rentals: ₹200-400/day\n🚴 Scooter rentals: ₹150-300/day\n🧑‍🦯 Guide-arranged tours: Recommended!\n\n💡 Train is BEST: reliable, scenic, economical`;
        }

        // FOOD & CUISINE
        if (/food|eat|cuisine|restaurant|dine|seafood|dish|meal|taste|dining|chikoo|bombil|fish/.test(m)) {
            return `🍽️ **Boisar's Delicious Food:**\n\n**🦐 MUST-TRY SEAFOOD:**\n• Fresh Bombil fry (signature dish!)\n• Crab & prawn curries (spicy)\n• Kolambi rice (prawn fried rice)\n• Fish tandoori (tandoor-baked)\n• Coastal fish preparations\n\n**🌰 LOCAL SPECIALTIES:**\n• Chikoo fruit (Dahanu region famous!)\n• Koli cuisine (spicy fish curries)\n• Warli dal-bhaat (tribal traditional)\n• Poha & Jalebi (breakfast)\n• Fresh coconut preparations\n\n**🍴 WHERE TO EAT:**\n🔸 Local dhabas (₹100-200) – AUTHENTIC\n🔸 Beachside shacks (₹100-300) – Scenic\n🔸 Tribal homestays (₹200-400) – Best experience\n🔸 Small restaurants in Boisar town\n🔸 Fish markets for fresh seafood\n\n💡 **Pro Tip:** Eat at homestays for real tribal food\n🌶️ Most food is spicy - request mild if needed\n💰 Budget: ₹100–300 per meal (local eateries)`;
        }

        // TRIP PLANNING - Custom itineraries
        if (/plan|itinerary|trip|days|schedule|create|organize|suggest.*trip|what.*do/.test(m)) {
            return `🗺️ **Let's Plan Your Perfect Trip!**\n\n**📍 2-DAY ITINERARY (Classic)**\nDay 1: Kelva Beach → Tarapur Fort → Shirpamal Sunset\nDay 2: Warli village tour → Dahanu Beach → Return\n💰 ₹1500-2500/person\n\n**📍 3-DAY ITINERARY (Ideal)**\nDay 1: Beach hopping (Kelva, Satpati, Gholvad)\nDay 2: Fort trekking (Kaldurg or Tandulwadi) + sunset\nDay 3: Culture (Warli village) + Handicrafts + Return\n💰 ₹2000-3500/person\n\n**📍 4-DAY ADVENTURE (Complete)**\nDay 1: Coastal (Beaches + Tarapur Fort)\nDay 2: Trekking (Kaldurg, Kohoj Hill)\nDay 3: Waterfalls & nature (Dabhosa, Vaitarna Lake)\nDay 4: Culture & tribal homestay + Return\n💰 ₹3500-5000/person\n\n**⭐ TOP MUST-VISIT PICKS:**\n✅ Kelva Beach (iconic sunset)\n✅ Kaldurg Fort (best trek)\n✅ Warli Village (tribal immersion)\n✅ Shirpamal Sunset Point (photography)\n✅ Tansa Wildlife (safari)\n\n**Tell me:**\n• Days available?\n• Main interests? (beach/trek/culture/food)\n• Budget range?\n• Group size?`;
        }

        // ACTIVITIES - Things to do
        if (/activity|thing.*do|activities|sport|play|adventure|fun|what.*can|can i\.?\s|action/.test(m)) {
            return `🎯 **31+ Things to Do in Boisar:**\n\n**🏖️ BEACH ACTIVITIES:**\n• Swimming, sunbathing, beach volleyball\n• Photography (sunset & sunrise)\n• Sunset walks on shoreline\n• Seafood tasting at shacks\n• Beach picnicking\n\n**🥾 ADVENTURE & TREKKING:**\n• Fort trekking (4-5 hours)\n• Rock climbing & scrambling\n• Monsoon waterfall hiking\n• Nature exploration\n• Camping (arrange locally)\n\n**📸 PHOTOGRAPHY:**\n• Beach sunsets ⭐ Shirpamal Point!\n• Fort architecture & vistas\n• Waterfall cascades & mist\n• Tribal life & art\n• Wildlife & bird photography\n\n**🎭 CULTURAL ACTIVITIES:**\n• Warli art workshops\n• Tarpa dance performances\n• Tribal village tours\n• Village market visits\n• Handicraft shopping\n\n**🍽️ FOOD EXPERIENCES:**\n• Seafood tastings\n• Orchard visits (Dahanu chikoo)\n• Tribal meal experiences\n• Local market exploration\n• Cooking with local families\n\n**🦅 NATURE & WILDLIFE:**\n• Bird watching (Vaitarna Lake)\n• Wildlife safari (Tansa)\n• Forest walks\n• Photography nature shots\n• Nature meditation\n\n✨ **Something for everyone!**`;
        }

        // PRICING/BUDGET breakdown
        if (/price|cost|budget|fee|charge|afford|expensive|how.*much/.test(m)) {
            return `💰 **Complete Budget Breakdown:**\n\n**ACCOMMODATION (per night):**\n🏠 Tribal Homestays: ₹600–1200\n🏨 Budget Hotels: ₹500–1000\n🏖️ Mid-range: ₹1000–2500\n🌟 Resorts: ₹2500+\n\n**FOOD:**\n🍴 Local meals: ₹100–300\n🍽️ Restaurants: ₹300–800\n🦐 Seafood: ₹200–600\n🍟 Street food: ₹30–100\n\n**ENTRY FEES:**\n🏖️ Beaches: FREE\n🏰 Most forts: FREE–₹30\n💧 Waterfalls: ₹15–20\n🦁 Tansa Wildlife: ₹50\n🏛️ Jai Vilas Palace: ₹50\n🎨 Warli workshops: ₹500–1000\n\n**ACTIVITIES:**\n🥾 Guided trek: ₹300–800/person\n🚤 Boat rides: ₹200–500\n🏍️ Bike rental: ₹200–400/day\n\n**TRANSPORT:**\n🚗 Local travel: ₹50–100/trip\n🚕 Taxi to site: ₹100–300\n🚂 Train from Mumbai: ₹50–300\n\n**💡 BUDGET ESTIMATES:**\n🎒 Budget (2 days): ₹1500–2500/person\n🎒 Comfort (2 days): ₹2500–4500/person\n🎒 Luxury (2 days): ₹5000+/person\n\n✅ Oct-Feb prices higher (peak season)`;
        }

        // HELP/SUPPORT
        if (/help|support|contact|phone|email|assistance|question|problem|issue|can i ask/.test(m)) {
            return `🤝 **I Can Help With Everything:**\n\n✨ **Information:**\n  • 31+ destination details & ratings\n  • Activity recommendations\n  • Best times & seasons\n  • Photo location suggestions\n\n✨ **Planning:**\n  • Custom trip itineraries\n  • Budget estimation\n  • Activity suggestions\n  • Accommodation guidance\n\n✨ **Practical:**\n  • Transportation & directions\n  • Food recommendations\n  • Local tips & hacks\n  • Cultural etiquette\n\n**📞 DIRECT CONTACT:**\n📧 Email: info@boisartourism.com\n☎️ Phone: +91 [Boisar Tourism Office]\n🌐 Website: boisartourism.com\n📱 WhatsApp: Available for booking\n\n**❓ POPULAR QUESTIONS I ANSWER:**\n• "Best beaches?" • "Top-rated places?"\n• "Trekking spots?" • "Cultural experiences?"\n• "Budget travel?" • "Photography spots?"\n• "Family-friendly?" • "When to visit?"\n\n💬 **What else would you like to know?**`;
        }

        // DEFAULT - Smart suggestion based on content
        return `🌟 **I Have Info on 31+ Destinations!**\n\n🏖️ **BEACHES** (8) – Kelva, Dahanu, Gholvad, Satpati, Shirgaon, Arnala, Bordi, Kalamb\n🏰 **FORTS** (6) – Kaldurg, Tarapur, Arnala, Asherigad, Tandulwadi, Shirgaon\n💧 **WATERFALLS** (3) – Dabhosa, Tandulwadi, Kalmandavi\n💙 **LAKES & DAMS** (4) – Surya River Dam, Vaitarna Lake, Jai Sagar Dam, Dhekale Dam\n⛰️ **HILLS** (1) – Kohoj Hill\n🏛️ **TEMPLES** (1) – Vajreshwari Temple\n👀 **VIEWPOINTS** (2) – Shirpamal, Hanuman Point\n👑 **PALACES** (1) – Jai Vilas Palace\n🦁 **WILDLIFE** (1) – Tansa Wildlife Sanctuary\n🎭 **CULTURAL** (3) – Warli Village, Tarpa Dance, Warli Handicrafts\n\n**TRY ASKING:**\n"Best beaches?" • "Top-rated places?" • "Budget travel?"\n"Forts & trekking?" • "Culture?" • "Photography spots?"\n"Plan my 3-day trip" • "When to visit?" • "Food?" • "Transport?"\n"Family-friendly?" • "Prices?" • "Accommodation?"\n\n✨ **Or just tell me what interests you!**`;
    }

    /* ── RENDER ── */

    addMessage(content, sender) {
        const msg = { content, sender, timestamp: new Date() };
        this.messages.push(msg);
        this.renderMessage(msg);
        this.saveMessages();
        this.scrollToBottom();
        if (sender === 'bot' && !this.isOpen) this.showBadge();
    }

    renderMessage(msg) {
        const wrap = document.createElement('div');
        wrap.className = `message ${msg.sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = msg.sender === 'bot'
            ? '<i class="fas fa-robot"></i>'
            : '<i class="fas fa-user"></i>';

        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = 'message-bubble-wrap';

        const bubble = document.createElement('div');
        bubble.className = 'message-content';
        bubble.innerHTML = this.formatMessage(msg.content);

        const time = document.createElement('div');
        time.className = 'message-time';
        const ts = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
        time.textContent = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        bubbleWrap.appendChild(bubble);
        bubbleWrap.appendChild(time);
        wrap.appendChild(avatar);
        wrap.appendChild(bubbleWrap);
        this.msgArea.appendChild(wrap);
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '&bull;');
    }

    showTypingIndicator() {
        this.isTyping = true;
        const wrap = document.createElement('div');
        wrap.className = 'typing-wrap';
        wrap.id = 'typingIndicator';
        wrap.innerHTML = `
            <div class="message-avatar" style="width:28px;height:28px;border-radius:50%;background:#e8f5e8;color:#2d5a27;border:1px solid #c8dfc8;display:flex;align-items:center;justify-content:center;font-size:0.75rem;flex-shrink:0;">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-bubbles">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        this.msgArea.appendChild(wrap);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    scrollToBottom() {
        this.msgArea.scrollTop = this.msgArea.scrollHeight;
    }

    /* ── BADGE ── */

    showBadge() { this.badge.style.display = 'flex'; }
    hideBadge() { this.badge.style.display = 'none'; }

    /* ── STORAGE ── */

    saveMessages() {
        try {
            localStorage.setItem('chatbotMessages', JSON.stringify(this.messages));
        } catch (e) {
            console.warn('Could not save chat history:', e);
        }
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    new BoisarTourismChatbot();
});
