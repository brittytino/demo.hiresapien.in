const fs = require('fs');
const path = require('path');
const jsonPath = path.join('lib', 'simulation-data.json');
let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const m2 = data.assessment.missions.find(m => m.id === 'mission-2');
if (m2 && !m2.dashboardData) {
  m2.dashboardData = {
    columns: ['Metric', 'Q1 (Previous)', 'Q2 (Current)', 'Trend'],
    rows: [
      ['Revenue', '$1,200,000', '$850,000', '▼ -29%'],
      ['Website Visits', '450,000', '440,000', '▼ -2%'],
      ['Orders', '24,000', '17,000', '▼ -29%'],
      ['Conversion Rate', '5.3%', '3.8%', '▼ -28%']
    ]
  };
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log('Updated simulation-data.json with dashboardData');
}
const dirs = ['workingstyle', 'skills', 'degree', 'confidence', 'career', 'about'];
dirs.forEach(dir => {
  const p = path.join('app', 'sonascaledtatscientist', dir, 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/\{isSubmitting \? \"Saving\.\.\.\" : \"Continue\"\}/g, '\"Continue\"');
    content = content.replace(/\{isSubmitting \? \'Saving\.\.\.\' : \'Continue\'\}/g, '\"Continue\"');
    content = content.replace(/\{isSubmitting \? \`Saving\.\.\.\` : \`Continue\`\}/g, '\"Continue\"');
    fs.writeFileSync(p, content);
    console.log('Updated', p);
  }
});
