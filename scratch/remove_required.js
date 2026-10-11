const fs = require('fs');
const file = 'src/renderer/src/components/views/JournalEntryForm.vue';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/\s+required\s+class="w-full bg-white border/g, '\n                    class="w-full bg-white border');
fs.writeFileSync(file, data);
console.log('done');
