// build.js
require('dotenv').config();
const Contentstack = require('contentstack');
const fs = require('fs-extra');
const path = require('path');

// 1. Initialize Contentstack Stack
const Stack = Contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT
});

const BUILD_DIR = 'dist';

async function fetchAndBuild() {
  try {
    await fs.ensureDir(BUILD_DIR);

    // 2. Fetch the Homepage Entry
    const response = await Stack.ContentType('homepage')
                                 .Entry(process.env.HOMEPAGE_ENTRY_UID)
                                 .fetch();
    const data = response.toJSON();

    // 3. Load the static HTML template
    let htmlTemplate = fs.readFileSync('index.html', 'utf8');

    // --- Content Replacement MAPPING ---
    // (You will need to expand this based on the homepage schema)

    // a) Announcement Bar
    htmlTemplate = htmlTemplate.replace(
      'Visit us in London for DXC Europe 2025.', 
      data.announcement.announcement_message // Assuming "announcement" is a group field
    );
    htmlTemplate = htmlTemplate.replace('Register now</a>', `${data.announcement.announcement_link}</a>`);

    // b) Hero Section
    htmlTemplate = htmlTemplate.replace(
      'Personalized digital <br/>experiences in <em>real time</em>',
      data.hero.hero_title
    );
    htmlTemplate = htmlTemplate.replace(
      'Compose content once, deliver it to any personalized experience, everywhere — with performance, security, and scale baked in.',
      data.hero.hero_description
    );

    // c) Build Dynamic Features (Blocks field)
    // This is complex and requires looping, for a simple start, we skip blocks or map a fixed number
    // For example, mapping only the ROI KPIs as a list:
    const kpisHTML = data.roi.map(kpiBlock => 
      `<li><strong>${kpiBlock.roi_metric}</strong><span>${kpiBlock.roi_description}</span></li>`
    ).join('');

    // Find the ROI list placeholder in your index.html and replace it
    // You would need to temporarily hardcode a known value in index.html to serve as a placeholder
    // e.g. <ul class="kpis">[[KPI_LIST_PLACEHOLDER]]</ul>
    // htmlTemplate = htmlTemplate.replace('[[KPI_LIST_PLACEHOLDER]]', kpisHTML);

    // 4. Save the final file to the build directory
    fs.writeFileSync(path.join(BUILD_DIR, 'index.html'), htmlTemplate);

    // Copy static assets
    await fs.copy('assets', path.join(BUILD_DIR, 'assets'));
    await fs.copy('Login.html', path.join(BUILD_DIR, 'Login.html'));

    console.log(`✅ Build successful! Files saved to ${BUILD_DIR}/`);

  } catch (error) {
    console.error('❌ Build failed:', error);
  }
}

fetchAndBuild();