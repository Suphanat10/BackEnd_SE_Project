const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// function  addLog(user_id,log_descriptio,timestamp,ip_address) {
//     prisma.logs.create({
//         data: {
//             user_id: user_id,
//             log_description: log_descriptio,
//             timestamp: timestamp,
//             ip_address: ip_address
//         }
//     })
//     .then(data => {
//         return data;
//     })
//     .catch(err => {
//         return err;
//     });

// }

