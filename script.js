document.addEventListener("DOMContentLoaded", () => {
    // Načtení validačních pravidel z JSON souboru
    let validations;
    fetch('validate.json')
        .then(response => response.ok ? response.json() : Promise.reject('Failed to load validation rules.'))
        .then(data => {
            validations = data;
            console.log('Validation rules successfully loaded:', validations);
            initializeFormValidation(validations);
        })
        .catch(error => console.error('Error loading validation rules:', error));

    // Funkce pro zobrazení nebo skrytí pole pro dodatečné daně podle vybrané země
    function handleExtraTaxField(country) {
        const extraTaxField = document.querySelector('.extra-tax-field');
        if (country === 'SK') {
            extraTaxField.style.display = 'block';
        } else {
            extraTaxField.style.display = 'none';
        }
    }

    // Inicializace validace formuláře
    function initializeFormValidation(validations) {
        const countrySelect = document.getElementById('input-country');
        
        // Funkce pro získání validačního regulárního výrazu podle země a typu pole
        const getValidationRegex = (validations, country, field) => {
            return validations?.[country]?.[field] ?? null;
        };
        
        // Validace vstupního pole
        const validateInputField = (input, country, fieldType) => {
            const value = input.value.trim().replace(/\s+/g, '');
            const regex = getValidationRegex(validations, country, fieldType);
            if (regex && !new RegExp(regex).test(value)) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                console.log(`${fieldType} for country ${country} is invalid.`);
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                console.log(`${fieldType} for country ${country} is valid.`);
            }
        };

        // Specifická validace pro dodatečné daně pro Slovensko
        document.querySelectorAll('input.extra-tax-element').forEach(input => {
            input.addEventListener('blur', () => {
                const country = countrySelect.selectedOptions[0].getAttribute('data-country-iso');
                validateInputField(input, country, 'extraTaxId');
            });
        });

        // Nasazení validace pro jednotlivé typy polí
        const setUpInputValidation = (selector, fieldType) => {
            document.querySelectorAll(selector).forEach(input => {
                input.addEventListener('blur', () => {
                    const country = countrySelect.selectedOptions[0].getAttribute('data-country-iso');
                    validateInputField(input, country, fieldType);
                });
            });
        };

        setUpInputValidation('input[data-type="postal"]', 'postalCode');
        setUpInputValidation('input[data-type="company-id"]', 'taxId');
        setUpInputValidation('input[data-type="tax-identity"]', 'vatId');

        // Validace pro dodatečné daně pro Slovensko
        setUpInputValidation('input[data-type="extraTaxId"]', 'extraTaxId');

        // Reakce na změnu vybrané země
        countrySelect.addEventListener('change', () => {
            const country = countrySelect.selectedOptions[0].getAttribute('data-country-iso');
            console.log(`Selected country: ${country}`);
            handleExtraTaxField(country); // Zobrazení nebo skrytí pole pro dodatečné daně podle vybrané země

            // Validace formuláře podle vybrané země
            document.querySelectorAll('[data-validate-if]').forEach(field => {
                const targetSelector = field.getAttribute('data-validate-if');
                const target = document.querySelector(targetSelector);
                if (target.checked || !targetSelector.includes(':checked')) {
                    field.dispatchEvent(new Event('blur'));
                }
            });
        });

        // Odstranění formátování před validací
        document.querySelectorAll('input[data-format]').forEach(input => {
            input.addEventListener('blur', () => {
                input.value = input.value.trim().replace(/\s+/g, '');
            });
        });

        // Počáteční zavolání pro zobrazení pole pro dodatečné daně při načtení stránky
        const initialCountry = countrySelect.selectedOptions[0].getAttribute('data-country-iso');
        handleExtraTaxField(initialCountry);
    }
});
