import { Provinces, Districts, Sectors } from 'rwanda';

try {
    console.log('Provinces:', Provinces());
    const kigali = 'Kigali';
    console.log(`Districts in ${kigali}:`, Districts(kigali));
    console.log(`Districts in ${kigali.toLowerCase()}:`, Districts(kigali.toLowerCase()));

    const gasabo = 'Gasabo';
    console.log(`Sectors in ${kigali} / ${gasabo}:`, Sectors(kigali, gasabo));
    console.log(`Sectors in ${kigali.toLowerCase()} / ${gasabo.toLowerCase()}:`, Sectors(kigali.toLowerCase(), gasabo.toLowerCase()));
} catch (e) {
    console.error('Error:', e.message);
}
