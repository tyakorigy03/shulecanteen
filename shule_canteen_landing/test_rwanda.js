const { Provinces, Districts, Sectors } = require('rwanda');

try {
    console.log('Provinces:', Provinces());
    const province = Provinces()[1]; // Kigali
    console.log(`Districts in ${province}:`, Districts(province));
    const district = Districts(province)[0]; // Gasabo
    console.log(`Sectors in ${province} / ${district}:`, Sectors(province, district));
} catch (e) {
    console.error('Error:', e.message);
}
