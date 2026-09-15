/* ============================================
   Navigation

   Not mine - this comes with CodeStitch stitch #1722.
   https://codestitch.app/app/dashboard/stitches/1722
   Handles the mobile menu button and hiding the top bar on scroll.
   There is dropdown code in here that this site never uses. I left it
   alone rather than picking it apart and breaking something.
   ============================================ */

(() => {
	// Configuration
	const CONFIG = {
		BREAKPOINTS: {
			MOBILE: 1023.5,
		},
		SELECTORS: {
			body: "body",
			navigation: "#cs-navigation",
			hamburger: "#cs-navigation .cs-toggle",
			menuWrapper: "#cs-ul-wrapper",
			dropdownToggle: ".cs-dropdown-toggle",
			dropdown: ".cs-dropdown",
			dropdownMenu: ".cs-drop-ul",
			topBar: ".cs-top-bar",
		},
		CLASSES: {
			active: "cs-active",
			menuOpen: "cs-open",
			scroll: "scroll",
		},
	};

	// DOM Elements
	const elements = {
		body: document.querySelector(CONFIG.SELECTORS.body),
		navigation: document.querySelector(CONFIG.SELECTORS.navigation),
		hamburger: document.querySelector(CONFIG.SELECTORS.hamburger),
		menuWrapper: document.querySelector(CONFIG.SELECTORS.menuWrapper),
		topBar: document.querySelector(CONFIG.SELECTORS.topBar),
	};

	// Utilities
	const isMobile = () => window.matchMedia(`(max-width: ${CONFIG.BREAKPOINTS.MOBILE}px)`).matches;

	const toggleAttribute = (element, attribute, value1 = "true", value2 = "false") => {
		if (!element) return;
		const current = element.getAttribute(attribute);
		element.setAttribute(attribute, current === value1 ? value2 : value1);
	};

	const toggleInert = (element) => element && (element.inert = !element.inert);

	// Dropdown Management
	const dropdownManager = {
		close(dropdown, shouldFocus = false) {
			if (!dropdown || !dropdown.classList.contains(CONFIG.CLASSES.active)) return false;

			dropdown.classList.remove(CONFIG.CLASSES.active);
			const button = dropdown.querySelector(CONFIG.SELECTORS.dropdownToggle);
			const menu = dropdown.querySelector(CONFIG.SELECTORS.dropdownMenu);

			if (button) {
				button.setAttribute("aria-expanded", "false");
				shouldFocus && button.focus();
			}

			if (menu) {
				menu.inert = true;
			}

			return true;
		},

		toggle(element) {
			element.classList.toggle(CONFIG.CLASSES.active);
			const button = element.querySelector(CONFIG.SELECTORS.dropdownToggle);
			const menu = element.querySelector(CONFIG.SELECTORS.dropdownMenu);

			button && toggleAttribute(button, "aria-expanded");
			menu && toggleInert(menu);
		},

		closeAll() {
			if (!elements.navigation) return false;
			let closed = false;

			elements.navigation.querySelectorAll(`${CONFIG.SELECTORS.dropdown}.${CONFIG.CLASSES.active}`).forEach((dropdown) => {
				this.close(dropdown, true);
				closed = true;
			});

			return closed;
		},
	};

	// Menu Management
	const menuManager = {
		toggle() {
			if (!elements.hamburger || !elements.navigation) return;

			const isClosing = elements.navigation.classList.contains(CONFIG.CLASSES.active);

			[elements.hamburger, elements.navigation].forEach((el) => el.classList.toggle(CONFIG.CLASSES.active));
			elements.body.classList.toggle(CONFIG.CLASSES.menuOpen);
			toggleAttribute(elements.hamburger, "aria-expanded");

			if (elements.menuWrapper && isMobile()) {
				toggleInert(elements.menuWrapper);
			}

			isClosing && dropdownManager.closeAll();
		},
	};

	// Keyboard Management
	const keyboardManager = {
		handleEscape() {
			if (!elements.navigation) return;

			const dropdownsClosed = dropdownManager.closeAll();
			if (dropdownsClosed) return;

			if (elements.hamburger && elements.hamburger.classList.contains(CONFIG.CLASSES.active)) {
				menuManager.toggle();
				elements.hamburger.focus();
			}
		},
	};

	// Event Management
	const eventManager = {
		handleDropdownClick(event) {
			if (!isMobile()) return;

			const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
			if (!button) return;

			event.preventDefault();
			const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
			if (dropdown) {
				dropdownManager.toggle(dropdown);
			}
		},

		handleDropdownKeydown(event) {
			if (event.key !== "Enter" && event.key !== " ") return;

			const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
			if (!button) return;

			event.preventDefault();
			const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
			if (dropdown) {
				dropdownManager.toggle(dropdown);
			}
		},

		handleFocusOut(event) {
			setTimeout(() => {
				if (!event.relatedTarget) return;

				const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
				if (dropdown?.classList.contains(CONFIG.CLASSES.active) && !dropdown.contains(event.relatedTarget)) {
					dropdownManager.close(dropdown);
				}
			}, 10);
		},

		handleMobileFocus(event) {
			if (!isMobile() || !elements.navigation.classList.contains(CONFIG.CLASSES.active)) return;
			if (elements.menuWrapper.contains(event.target) || elements.hamburger.contains(event.target)) return;

			menuManager.toggle();
		},

		handleDropdownHover(event) {
			if (isMobile()) return;

			const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
			if (!dropdown) return;

			const menu = dropdown.querySelector(CONFIG.SELECTORS.dropdownMenu);
			if (!menu) return;

			if (event.type === "mouseenter") {
				menu.inert = false;
			} else if (event.type === "mouseleave") {
				setTimeout(() => {
					if (!dropdown.matches(':hover')) {
						menu.inert = true;
					}
				}, 1);
			}
		},
	};

	// Scroll Effects Management
	const scrollManager = {
		handleScrollEffects() {
			const scrollPosition = document.documentElement.scrollTop;
			const isScrolled = scrollPosition >= 100;

			elements.body.classList.toggle(CONFIG.CLASSES.scroll, isScrolled);

			if (elements.topBar) elements.topBar.inert = isScrolled;
		},
	};

	// Initialization & Setup
	const init = {
		inertState() {
			if (!elements.menuWrapper) return;

			elements.menuWrapper.inert = isMobile();

			if (elements.navigation) {
				const dropdownMenus = elements.navigation.querySelectorAll(CONFIG.SELECTORS.dropdownMenu);
				dropdownMenus.forEach((dropdown) => {
					dropdown.inert = true;
				});
			}
		},

		eventListeners() {
			if (!elements.hamburger || !elements.navigation) return;

			elements.hamburger.addEventListener("click", menuManager.toggle);
			elements.navigation.addEventListener("click", (e) => {
				if (e.target === elements.navigation && elements.navigation.classList.contains(CONFIG.CLASSES.active)) {
					menuManager.toggle();
				}
			});

			elements.navigation.addEventListener("click", eventManager.handleDropdownClick);
			elements.navigation.addEventListener("keydown", eventManager.handleDropdownKeydown);
			elements.navigation.addEventListener("focusout", eventManager.handleFocusOut);

			elements.navigation.addEventListener("mouseenter", eventManager.handleDropdownHover, true);
			elements.navigation.addEventListener("mouseleave", eventManager.handleDropdownHover, true);

			document.addEventListener("keydown", (e) => e.key === "Escape" && keyboardManager.handleEscape());
			document.addEventListener("focusin", eventManager.handleMobileFocus);
			document.addEventListener("scroll", () => scrollManager.handleScrollEffects());

			window.addEventListener("resize", () => {
				this.inertState();
				if (!isMobile() && elements.navigation.classList.contains(CONFIG.CLASSES.active)) {
					menuManager.toggle();
				}
			});
		},
	};

	init.inertState();
	init.eventListeners();
})();


/* ============================================
   Takumi Circle

   This part is mine. The signup form checks the name, phone number and
   email address before it accepts them, and tells you what is wrong if
   it does not like one of them.
   ============================================ */

(() => {
    const form    = document.querySelector("#circle-form");
    const name    = document.querySelector("#circle-name");
    const phone   = document.querySelector("#circle-phone");
    const email   = document.querySelector("#circle-email");
    const message = document.querySelector("#circle-message");

    // bail out if the section is not on the page
    if (!form || !name || !phone || !email || !message) return;

    const fields = [name, phone, email];

    /* Drops a message under the form and marks the offending input, if
       any, as invalid. A red border tells a sighted person something is
       wrong and tells a screen reader user nothing, so aria-invalid does
       that job. Everything else is marked valid again so an old error
       does not linger on a field that is fine now. */
    function setMessage(text, type, invalidField) {
        message.textContent = text;
        message.className = "cs-message" + (type ? " cs-" + type : "");
        fields.forEach((field) => {
            field.setAttribute("aria-invalid", field === invalidField ? "true" : "false");
        });
    }

    /* Letters, spaces, hyphens and apostrophes only, so "Mary-Jane" and
       "O'Brien" still work. No digits, no other symbols. */
    const NAME_PATTERN = /^[A-Za-z\s'-]+$/;
    function isValidName(value) {
        return NAME_PATTERN.test(value);
    }

    /* Wants a domain with an actual dot in it, so "aa@com" gets rejected
       just as much as "someone@" does - a bare word isn't a domain, it's
       missing the .com/.co.uk/etc part. Worth saying this only checks the
       shape of it. You cannot tell an address actually works without
       sending mail to it. */
    function isValidEmail(value) {
        if (/\s/.test(value)) return false;           // no spaces anywhere
        const at = value.indexOf("@");
        if (at === -1) return false;                  // no @ at all
        if (at !== value.lastIndexOf("@")) return false; // more than one @

        const before = value.slice(0, at);
        const after  = value.slice(at + 1);
        if (before.length === 0 || after.length === 0) return false;

        // the domain needs a dot that isn't the first or last character,
        // e.g. "yahoo.com" or "yahoo.co.pk" - "com" alone doesn't count
        const lastDot = after.lastIndexOf(".");
        if (lastDot <= 0 || lastDot === after.length - 1) return false;

        // and whatever comes after that final dot should look like a real
        // TLD: letters only, at least two of them
        const tld = after.slice(lastDot + 1);
        return /^[A-Za-z]{2,}$/.test(tld);
    }

    /* Digits only, 6-15 of them. That range covers a normal local number
       up to a full international one, without accepting something that
       is obviously not a phone number. */
    function isValidPhone(value) {
        return /^[0-9]{6,15}$/.test(value);
    }

    /* Strips out anything that should not be there as the person types,
       rather than letting it in and complaining later. A number physically
       cannot end up in the name field, and a letter cannot end up in the
       phone field. */
    function filterInput(field, allowedPattern) {
        field.addEventListener("input", () => {
            const cleaned = field.value.replace(allowedPattern, "");
            if (cleaned !== field.value) field.value = cleaned;
            if (message.classList.contains("cs-error")) setMessage("", null);
        });
    }

    filterInput(name, /[^A-Za-z\s'-]/g);
    filterInput(phone, /[^0-9]/g);

    /* Clear the error as soon as they start fixing it. Leaving the
       complaint up while someone retypes is just irritating. */
    email.addEventListener("input", () => {
        if (message.classList.contains("cs-error")) setMessage("", null);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameValue  = name.value.trim();
        const phoneValue = phone.value.trim();
        const emailValue = email.value.trim();

        if (nameValue === "") {
            setMessage("Please enter your name to join.", "error", name);
            name.focus();
            return;
        }

        if (!isValidName(nameValue)) {
            setMessage("Please enter your name using letters only.", "error", name);
            name.focus();
            return;
        }

        if (phoneValue === "") {
            setMessage("Please enter your phone number to join.", "error", phone);
            phone.focus();
            return;
        }

        if (!isValidPhone(phoneValue)) {
            setMessage(
                "Please enter a valid phone number using numbers only.",
                "error", phone
            );
            phone.focus();
            return;
        }

        if (emailValue === "") {
            setMessage("Please enter your email address to join.", "error", email);
            email.focus();
            return;
        }

        if (!isValidEmail(emailValue)) {
            setMessage(
                "That does not look like a complete email address. Please " +
                "include the full domain, for example you@example.com.",
                "error", email
            );
            email.focus();
            return;
        }

        setMessage(
            "Thank you. We will be in touch shortly with your Takumi Circle " +
            "membership details.",
            "success"
        );
        form.reset();
    });
})();
