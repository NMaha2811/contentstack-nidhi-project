// build.js
require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');

// FIX: Correctly import Contentstack SDK to avoid "Cannot call a class as a function" error
const Contentstack = require('contentstack').default; 
// If the above line fails, try: const Contentstack = require('contentstack');

// --- Configuration ---
const BUILD_DIR = 'dist';
const HOMEPAGE_TEMPLATE = 'index.html';
const LOGIN_TEMPLATE = 'Login.html'; 

// 1. Initialize Contentstack Stack
const Stack = Contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT
});

// Helper function to render the ROI Blocks field (fixes the list generation issue)
function renderKpis(kpisArray) {
    // kpiBlock is an entry from the 'roi' array/block field
    return kpisArray.map(kpiBlock => {
        const metric = kpiBlock.roi_metric || '';
        const description = kpiBlock.roi_description || '';
        
        // Ensure the ROI block UID is checked if multiple block types were used, 
        // but based on your schema, it's just 'kpi_block'
        if (kpiBlock.uid === 'kpi_block') {
             return `<li><strong>${metric}</strong><span>${description}</span></li>`;
        }
        return ''; // Return empty string if block is unrecognized
    }).join('');
}

async function fetchAndBuild() {
  try {
    console.log('Starting build process...');
    
    // Clean up previous build and create new 'dist' directory
    await fs.remove(BUILD_DIR);
    await fs.ensureDir(BUILD_DIR);
    
    // --- FETCH DATA ---
    const response = await Stack.ContentType('homepage')
                                 .Entry(process.env.HOMEPAGE_ENTRY_UID)
                                 .fetch();
    const data = response.toJSON();
    
    console.log(`Successfully fetched homepage content entry: ${data.entry.uid}`);

    // --- BUILD INDEX.HTML ---
    let htmlTemplate = fs.readFileSync(HOMEPAGE_TEMPLATE, 'utf8');

    // 2. Simple Content Mappings (Requires you to add the placeholders in index.html)
    // ANNOUNCEMENT BAR MAPPING
    htmlTemplate = htmlTemplate.replace('[[ANNOUNCEMENT_MESSAGE]]', data.entry.announcement.announcement_message);
    // You would also need placeholders for the link text and URL here.

    // HERO SECTION MAPPING
    htmlTemplate = htmlTemplate.replace('[[HERO_TITLE]]', data.entry.hero.hero_title);
    htmlTemplate = htmlTemplate.replace('[[HERO_DESCRIPTION]]', data.entry.hero.hero_description);

    // 3. Complex Block Field Mapping (ROI Section Fix)
    // NOTE: In Contentstack API responses, the content of a Blocks field is nested under its UID property.
    const kpisHTML = renderKpis(data.entry.roi);
    htmlTemplate = htmlTemplate.replace('[[KPI_LIST_PLACEHOLDER]]', kpisHTML);

    // 4. Save the generated HTML
    fs.writeFileSync(path.join(BUILD_DIR, HOMEPAGE_TEMPLATE), htmlTemplate);
    
    // --- COPY STATIC ASSETS ---
    // Copy Login page and assets as they may not be fully dynamic yet
    await fs.copy('assets', path.join(BUILD_DIR, 'assets'));
    await fs.copy(LOGIN_TEMPLATE, path.join(BUILD_DIR, LOGIN_TEMPLATE));

    console.log(`✅ Build successful! Files saved to ${BUILD_DIR}/`);

  } catch (error) {
    console.error('❌ Build failed! Details below:');
    if (error.status) {
        console.error(`Contentstack API Error Status: ${error.status}`);
    }
    console.error(`Error message: ${error.message}`);
  }
}

fetchAndBuild();
