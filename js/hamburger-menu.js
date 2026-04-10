(function () {
    function getPathPrefix() {
        return window.location.pathname.toLowerCase().indexOf('/features/') !== -1 ? '../' : '';
    }

    function isLoggedIn() {
        return !!(localStorage.getItem('authToken') && localStorage.getItem('userData'));
    }

    function updateExistingSidebarTripPlannerVisibility() {
        var sidebarMenu = document.getElementById('sidebarMenu');
        if (!sidebarMenu) return;

        var tripLink = sidebarMenu.querySelector('a[href*="trip-planner.html"]');
        if (!tripLink) return;

        var tripItem = tripLink.closest('li') || tripLink;
        tripItem.style.display = isLoggedIn() ? '' : 'none';
    }

    function injectSidebarIfMissing() {
        if (document.getElementById('sidebarMenu') || document.getElementById('siteWideHamburgerBtn')) {
            return;
        }

        var button = document.createElement('button');
        button.id = 'siteWideHamburgerBtn';
        button.setAttribute('aria-label', 'Open menu');
        button.innerHTML = '<span></span><span></span><span></span>';
        button.style.cssText = [
            'position:fixed',
            'top:18px',
            'right:18px',
            'z-index:10000',
            'display:flex',
            'flex-direction:column',
            'align-items:center',
            'justify-content:center',
            'gap:4px',
            'width:42px',
            'height:42px',
            'border:none',
            'border-radius:10px',
            'background:rgba(255,255,255,0.95)',
            'box-shadow:0 8px 20px rgba(0,0,0,0.14)',
            'cursor:pointer'
        ].join(';');

        Array.from(button.children).forEach(function (bar) {
            bar.style.cssText = 'display:block;width:22px;height:3px;background:#2d5a27;border-radius:2px;';
        });

        var overlay = document.createElement('div');
        overlay.id = 'siteWideSidebarOverlay';
        overlay.style.cssText = [
            'display:none',
            'position:fixed',
            'inset:0',
            'background:rgba(0,0,0,0.45)',
            'z-index:9998'
        ].join(';');

        var sidebar = document.createElement('nav');
        sidebar.id = 'sidebarMenu';
        sidebar.style.cssText = [
            'position:fixed',
            'top:0',
            'right:-320px',
            'width:300px',
            'height:100%',
            'background:#fff',
            'z-index:9999',
            'box-shadow:-4px 0 24px rgba(0,0,0,0.18)',
            'transition:right 0.32s cubic-bezier(0.22,1,0.36,1)',
            'overflow-y:auto',
            'display:flex',
            'flex-direction:column'
        ].join(';');

        var prefix = getPathPrefix();

        sidebar.innerHTML = '' +
            '<div style="background:linear-gradient(135deg,#2d5a27,#4a7c59);padding:24px 20px 20px;color:white;">' +
            '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '    <div style="display:flex;align-items:center;gap:10px;font-size:1.15rem;font-weight:700;"><i class="fas fa-mountain"></i> Boisar Tourism</div>' +
            '    <button id="siteWideCloseSidebar" style="background:rgba(255,255,255,0.15);border:none;color:white;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;">' +
            '      <i class="fas fa-times"></i>' +
            '    </button>' +
            '  </div>' +
            '  <p style="font-size:0.78rem;opacity:0.75;margin:0;">Explore Boisar\'s best experiences</p>' +
            '</div>' +
            '<ul style="list-style:none;padding:12px 0;margin:0;flex:1;">' +
            '  <li><a href="' + prefix + 'index.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-home" style="width:18px;color:#4a7c59;"></i> Home</a></li>' +
            '  <li><a href="' + prefix + 'all-locations.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-compass" style="width:18px;color:#4a7c59;"></i> All Locations</a></li>' +
            '  <li><a href="' + prefix + 'accommodations.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-bed" style="width:18px;color:#4a7c59;"></i> Accommodations</a></li>' +
            '  <li><a href="' + prefix + 'activities.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-hiking" style="width:18px;color:#4a7c59;"></i> Activities</a></li>' +
            '  <li><a href="' + prefix + 'transportation.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-bus" style="width:18px;color:#4a7c59;"></i> Transportation</a></li>' +
            '  <li><a href="' + prefix + 'verified-guides.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-user-check" style="width:18px;color:#4a7c59;"></i> Verified Guides</a></li>' +
            '  <li id="siteWideTripPlannerItem"><a href="' + prefix + 'features/trip-planner.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-map-marked-alt" style="width:18px;color:#4a7c59;"></i> Trip Planner</a></li>' +
            '  <li id="siteWideLoggedInLinks" style="border-top:1px solid #eee;margin-top:4px;padding-top:4px;display:none;">' +
            '    <a href="' + prefix + 'dashboard.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-tachometer-alt" style="width:18px;color:#4a7c59;"></i> Dashboard</a>' +
            '    <a href="' + prefix + 'profile.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-user-edit" style="width:18px;color:#4a7c59;"></i> My Profile</a>' +
            '    <a href="#" id="siteWideLogoutLink" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#c0392b;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-sign-out-alt" style="width:18px;"></i> Logout</a>' +
            '  </li>' +
            '  <li id="siteWideGuestLinks" style="border-top:1px solid #eee;margin-top:4px;padding-top:4px;display:block;">' +
            '    <a href="' + prefix + 'login.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-sign-in-alt" style="width:18px;color:#4a7c59;"></i> Login</a>' +
            '    <a href="' + prefix + 'register.html" style="display:flex;align-items:center;gap:12px;padding:13px 22px;color:#2d5a27;text-decoration:none;font-weight:500;font-size:0.93rem;"><i class="fas fa-user-plus" style="width:18px;color:#4a7c59;"></i> Sign Up</a>' +
            '  </li>' +
            '</ul>' +
            '<div style="padding:16px 20px;border-top:1px solid #eee;font-size:0.75rem;color:#aaa;text-align:center;">© 2026 Boisar Tourism</div>';

        document.body.appendChild(button);
        document.body.appendChild(overlay);
        document.body.appendChild(sidebar);

        function openSidebar() {
            sidebar.style.right = '0';
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.style.right = '-320px';
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }

        button.addEventListener('click', openSidebar);
        overlay.addEventListener('click', closeSidebar);
        var closeButton = document.getElementById('siteWideCloseSidebar');
        if (closeButton) closeButton.addEventListener('click', closeSidebar);

        var logoutLink = document.getElementById('siteWideLogoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', function (event) {
                event.preventDefault();
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.href = getPathPrefix() + 'index.html';
            });
        }
    }

    function updateInjectedSidebarVisibility() {
        var loggedIn = isLoggedIn();

        var tripPlannerItem = document.getElementById('siteWideTripPlannerItem');
        if (tripPlannerItem) {
            tripPlannerItem.style.display = loggedIn ? 'block' : 'none';
        }

        var loggedInLinks = document.getElementById('siteWideLoggedInLinks');
        var guestLinks = document.getElementById('siteWideGuestLinks');

        if (loggedInLinks) loggedInLinks.style.display = loggedIn ? 'block' : 'none';
        if (guestLinks) guestLinks.style.display = loggedIn ? 'none' : 'block';
    }

    function initHamburgerMenu() {
        injectSidebarIfMissing();
        updateExistingSidebarTripPlannerVisibility();
        updateInjectedSidebarVisibility();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHamburgerMenu);
    } else {
        initHamburgerMenu();
    }

    window.addEventListener('storage', function () {
        updateExistingSidebarTripPlannerVisibility();
        updateInjectedSidebarVisibility();
    });
})();
