// file faker.js ini adalah sebuah root untuk menentukan kita ingin menjalankan faker yang mana
import { connection } from './connection.js'

// connect to mongodb
connection()

const args = process.argv

// cek data args ini berupa array
// console.log(args)

// untuk kita menuliskan parameter limit data di terminal, kalau tidak ada parameter index ke-3, maka default limitnya 10
const limit = args[3] || 10

const fakerFile = args[2]
const faker = await import(`./faker/${fakerFile}`)

faker.run(limit)

// jadi tinggal nulis diconsole => node faker 'user.js'