// tidak usah import connection karena sudah ada diroot kita (sudah ada di faker.js)
import user from '../models/User.js';
import { faker } from '@faker-js/faker';

// buat data baru
const run = async (limit) => {
    try {
        // buat 100 data di dalam array, simpan hanya sekali, daripada simpan 100 kali, mungkin array lebih ringan dengan sekali simpan
        var data = []
        for (var i = 0; i < limit; i++) {
            data.push({
                fullname: faker.name.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            })
        }

        const fakeData = await user.insertMany(data)

        if (fakeData) {
            console.log(fakeData)
            // console.table(fakeData)
            console.log('Total data : ' + fakeData.length)

            // biar terminalnya otomatis mati, tidak harus di ctrl + c lagi
            process.exit()
        }
    } catch (err) {
        console.log(err);
        process.exit()
    }
}

export { run };

// tinggal buka project back-end kita, lalu ketikan di terminal => node faker 'user.js', lalu cek mongodb field user
// kita bisa kasih limit, contoh => node faker 'user.js' 50
// maka 50 data akan dibuat, tapi kalau tidak ditulis apapun, default limit dari faker.js adalah 10 data